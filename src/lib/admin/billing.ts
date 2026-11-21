/* Server helpers for the /admin Billing tab (Agent C). Everything Stripe
   flows through here: the client, plan pricing, the simulated dev mode that
   runs when no STRIPE_SECRET_KEY is set, the company_billing writers shared
   by the server actions and the webhook, and the auto top-up check.

   Three modes, decided per call:
   - Mock (dev + ADMIN_QA_MOCK=1): getAdminData serves MOCK_DATASET, so
     mutations write MOCK_DATASET.billing in place. In-memory, QA only.
   - Simulated (dev, no STRIPE_SECRET_KEY): every flow writes the same
     company_billing columns it would after a real Stripe event, so the full
     UI including the setup step completing is testable without keys.
   - Live (STRIPE_SECRET_KEY set): real Checkout, PaymentIntents, Connect
     OAuth and webhooks. Production without a key fails with a clear error. */

import { createHmac, timingSafeEqual } from "node:crypto";

import Stripe from "stripe";

import { getSessionProfile, isCompanyAdmin } from "@/lib/auth";
import { createServiceClient } from "@/lib/supabase/service";

import {
  capUpgradeHint,
  PLAN_CREATOR_CAP,
  PLAN_PRICING,
  PLAN_TIER_LABEL,
} from "@/lib/plans";

import { MOCK_DATASET } from "./mock-data";
import type {
  AdminBilling,
  BillingCadence,
  PlanTier,
  SubscriptionPlan,
  SubscriptionStatus,
} from "./types";

/* ── Plan pricing (design_handoff_pricing_plans) ──
   The catalog lives in @/lib/plans so the plan picker, /pricing and these
   server checks share one source of truth. Re-exported for callers. */

export { PLAN_CREATOR_CAP, PLAN_PRICING, PLAN_TIER_LABEL };

/** Maps a stored subscription_plan value to tier and cadence. Legacy rows
    from the single-plan era ("monthly"/"annual") are grandfathered as
    Premium so nobody loses creators. */
export function parseStoredPlan(
  value: string | null,
): { tier: PlanTier; cadence: BillingCadence } {
  if (value && value in PLAN_PRICING) {
    const { tier, cadence } = PLAN_PRICING[value as SubscriptionPlan];
    return { tier, cadence };
  }
  if (value === "enterprise") return { tier: "enterprise", cadence: "annual" };
  return { tier: "premium", cadence: value === "annual" ? "annual" : "monthly" };
}

/* Refill $1,000 whenever the balance falls under $200 with auto top-up on. */
export const AUTO_TOP_UP_THRESHOLD_CENTS = 20000;
export const AUTO_TOP_UP_AMOUNT_CENTS = 100000;

export const STRIPE_NOT_CONFIGURED =
  "Stripe is not configured. Set STRIPE_SECRET_KEY to enable billing.";

/* ── Mode detection ── */

export function getStripe(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY;
  return key ? new Stripe(key) : null;
}

/** True when billing should pretend Stripe succeeded: dev without keys. */
export function stripeSimulated(): boolean {
  return !process.env.STRIPE_SECRET_KEY && process.env.NODE_ENV !== "production";
}

function mockMode(): boolean {
  return (
    process.env.NODE_ENV === "development" && process.env.ADMIN_QA_MOCK === "1"
  );
}

/* ── Caller context ── */

export interface BillingContext {
  companyId: string;
  /** True routes every write to MOCK_DATASET.billing instead of the DB. */
  mock: boolean;
  /** True when billing must pretend Stripe succeeded: dev without keys, or
      a pilot company with company_billing.billing_simulated set. */
  simulated: boolean;
}

/** The signed-in company admin's company, or the mock company in QA mock
    mode. Null means the caller may not touch billing. */
export async function getBillingContext(): Promise<BillingContext | null> {
  if (mockMode()) {
    return { companyId: MOCK_DATASET.company.id, mock: true, simulated: true };
  }
  const { profile } = await getSessionProfile();
  if (!isCompanyAdmin(profile) || !profile?.active_company_id) return null;
  const simulated =
    stripeSimulated() ||
    rowBool(await readBillingRow(profile.active_company_id), "billing_simulated");
  return { companyId: profile.active_company_id, mock: false, simulated };
}

/* ── Formatting ── */

const MONTH_SHORT = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

function fmtLongDate(iso: string): string {
  const d = new Date(iso);
  return `${MONTH_SHORT[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

/** First renewal for a plan started now, as an ISO timestamp. */
export function planRenewalIso(plan: SubscriptionPlan): string {
  const d = new Date();
  if (PLAN_PRICING[plan].cadence === "annual") d.setFullYear(d.getFullYear() + 1);
  else d.setMonth(d.getMonth() + 1);
  return d.toISOString();
}

/* ── company_billing readers and writers ── */

type BillingRow = Record<string, unknown>;
type BillingPatch = Record<string, string | number | boolean | null>;

function rowStr(row: BillingRow | null, key: string): string | null {
  const v = row?.[key];
  return typeof v === "string" ? v : null;
}

function rowNum(row: BillingRow | null, key: string): number {
  const v = row?.[key];
  return typeof v === "number" && Number.isFinite(v) ? v : 0;
}

function rowBool(row: BillingRow | null, key: string): boolean {
  return row?.[key] === true;
}

export async function readBillingRow(companyId: string): Promise<BillingRow | null> {
  const supabase = createServiceClient();
  const { data } = await supabase
    .from("company_billing")
    .select("*")
    .eq("company_id", companyId)
    .maybeSingle();
  return (data ?? null) as BillingRow | null;
}

/** Upserts billing columns. Returns an error message, or null on success.
    A missing-column error means the supabase/migrations have not been
    applied yet, so say so instead of leaking SQL. */
export async function writeBilling(
  companyId: string,
  patch: BillingPatch,
): Promise<string | null> {
  const supabase = createServiceClient();
  const { error } = await supabase
    .from("company_billing")
    .upsert({ company_id: companyId, ...patch }, { onConflict: "company_id" });
  if (!error) return null;
  if (error.message.includes("column")) {
    return "Billing columns are missing. Apply the supabase/migrations first.";
  }
  return `Billing could not be saved: ${error.message}`;
}

export interface SubscriptionWrite {
  plan: SubscriptionPlan;
  renewsAtIso: string;
  cardBrand: string | null;
  cardLast4: string | null;
  stripeCustomerId?: string | null;
  stripeSubscriptionId?: string | null;
}

export async function activateSubscription(
  companyId: string,
  sub: SubscriptionWrite,
  status: SubscriptionStatus = "active",
): Promise<string | null> {
  const patch: BillingPatch = {
    subscription_status: status,
    subscription_plan: sub.plan,
    subscription_price_cents: PLAN_PRICING[sub.plan].monthlyPriceCents,
    subscription_renews_at: sub.renewsAtIso,
  };
  if (sub.cardBrand) patch.card_brand = sub.cardBrand;
  if (sub.cardLast4) patch.card_last4 = sub.cardLast4;
  if (sub.stripeCustomerId !== undefined) patch.stripe_customer_id = sub.stripeCustomerId;
  if (sub.stripeSubscriptionId !== undefined) {
    patch.stripe_subscription_id = sub.stripeSubscriptionId;
  }
  return writeBilling(companyId, patch);
}

export async function clearSubscription(companyId: string): Promise<string | null> {
  return writeBilling(companyId, {
    subscription_status: "none",
    subscription_plan: null,
    subscription_price_cents: null,
    subscription_renews_at: null,
    stripe_subscription_id: null,
    stripe_budget_subscription_id: null,
    monthly_budget_cents: null,
  });
}

/** Ledger entry (kind topup or budget, feeds the credit history) plus
    balance increment. Budget credits from the invoice.paid webhook pass the
    invoice id, whose unique constraint makes Stripe retries a no-op. */
export async function recordCredit(
  companyId: string,
  amountCents: number,
  kind: "topup" | "budget",
  stripeInvoiceId?: string,
): Promise<string | null> {
  const supabase = createServiceClient();
  const { error } = await supabase.from("company_credit_ledger").insert({
    company_id: companyId,
    kind,
    amount_cents: amountCents,
    ...(stripeInvoiceId ? { stripe_invoice_id: stripeInvoiceId } : {}),
  });
  if (error?.code === "23505") return null;
  if (error) return `The credit could not be recorded: ${error.message}`;

  const row = await readBillingRow(companyId);
  return writeBilling(companyId, {
    credit_balance_cents: rowNum(row, "credit_balance_cents") + amountCents,
  });
}

/* ── Plan access: the paywall and the creator cap ──
   design_handoff_pricing_plans: a company with no plan sees the plan picker,
   and every plan caps creators per campaign. Every place this repo adds
   creators (admin Team invites, manager creator invites, ops invites) or
   sends a campaign to creators (manager Publish week) asks these helpers
   first. */

/** Statuses that keep a company running. past_due is Stripe's retry window
    after a failed renewal: work continues while Billing asks for a new card. */
const ENTITLED_STATUSES: ReadonlySet<string> = new Set([
  "active",
  "trialing",
  "past_due",
]);

export interface PlanAccess {
  /** True when the company may invite creators and publish campaigns. */
  entitled: boolean;
  /** Stored subscription_status ("none" with no plan). */
  status: string;
  /** Plan tier, null with no plan (pilot companies included). */
  tier: PlanTier | null;
  /** Creators per campaign; null is unlimited (Enterprise and pilots). */
  cap: number | null;
  /** In-house or ops-flagged pilot company running without a plan. */
  pilot: boolean;
}

export async function companyPlanAccess(companyId: string): Promise<PlanAccess> {
  const row = await readBillingRow(companyId);
  const status = rowStr(row, "subscription_status") ?? "none";
  const hasPlan = status !== "none" && rowStr(row, "subscription_plan") !== null;
  if (hasPlan) {
    const { tier } = parseStoredPlan(rowStr(row, "subscription_plan"));
    return {
      entitled: ENTITLED_STATUSES.has(status),
      status,
      tier,
      cap: PLAN_CREATOR_CAP[tier],
      pilot: false,
    };
  }
  /* Pilots ops runs by hand (the in-house testing company, or any company
     with company_billing.billing_simulated set) keep working without a plan
     so existing pilots are not cut off. Everyone else hits the paywall. */
  const pilot = companyId === IN_HOUSE_COMPANY_ID || rowBool(row, "billing_simulated");
  return { entitled: pilot, status, tier: null, cap: null, pilot };
}

/** The company's current plan tier, or null with no entitled plan. */
export async function companyPlanTier(companyId: string): Promise<PlanTier | null> {
  const access = await companyPlanAccess(companyId);
  return access.entitled ? access.tier : null;
}

/** Who is being told about a block: admins can fix it in Billing, managers
    and ops need to hand it to the company admin. */
export type GateAudience = "admin" | "manager" | "ops";

export interface PlanBlock {
  error: string;
  /** True when the fix is on /admin/billing (picker, upgrade or card). */
  upgrade: true;
}

function paywallMessage(access: PlanAccess, action: string, audience: GateAudience): string {
  if (access.status === "unpaid") {
    return audience === "admin"
      ? `Your last payment failed, so ${action} is paused. Update your card in Billing to pick up where you left off.`
      : `The company's last Noni payment failed, so ${action} is paused until the company admin updates the card in Billing.`;
  }
  return audience === "admin"
    ? `Pick a plan in Billing to start ${action}. Every plan includes campaigns, briefs, approvals and payouts; plans differ only in how many creators run on a campaign.`
    : `This company needs a Noni plan before ${action}. Ask the company admin to pick one in Billing.`;
}

function capMessage(tier: PlanTier, audience: GateAudience, lead?: string): string {
  const hint = capUpgradeHint(tier);
  const who =
    audience === "admin" ? "" : " Ask the company admin to upgrade in Billing.";
  return `${lead ? `${lead} ` : ""}${hint}${who}`;
}

/** Null when one more creator invite is allowed, else what blocks it. */
export async function creatorInviteBlock(
  companyId: string,
  audience: GateAudience,
): Promise<PlanBlock | null> {
  const access = await companyPlanAccess(companyId);
  if (!access.entitled) {
    return { error: paywallMessage(access, "inviting creators", audience), upgrade: true };
  }
  if (access.tier === null || access.cap === null) return null;
  const creators = await companyCreatorCount(companyId);
  if (creators < access.cap) return null;
  return {
    error: capMessage(
      access.tier,
      audience,
      `Your team already has ${creators} creators, counting pending invites.`,
    ),
    upgrade: true,
  };
}

/** Creators a published campaign reaches: roster creators plus members
    who can create, with an approved account (the publish-campaign edge
    function's exact audience). */
export async function publishAudienceCount(companyId: string): Promise<number> {
  const supabase = createServiceClient();
  const [roster, approved] = await Promise.all([
    supabase
      .from("company_roster")
      .select("id")
      .eq("company_id", companyId)
      .or("member_role.eq.creator,can_create.eq.true"),
    supabase
      .from("creator_accounts")
      .select("creator_id")
      .eq("company_id", companyId)
      .eq("status", "approved"),
  ]);
  const approvedIds = new Set(
    ((approved.data ?? []) as { creator_id: string | null }[]).map((a) => a.creator_id),
  );
  return ((roster.data ?? []) as { id: string | null }[]).filter(
    (r) => r.id !== null && approvedIds.has(r.id),
  ).length;
}

/** Null when the company may publish a campaign, else what blocks it. */
export async function publishBlock(
  companyId: string,
  audience: GateAudience,
): Promise<PlanBlock | null> {
  const access = await companyPlanAccess(companyId);
  if (!access.entitled) {
    return { error: paywallMessage(access, "publishing campaigns", audience), upgrade: true };
  }
  if (access.tier === null || access.cap === null) return null;
  const reach = await publishAudienceCount(companyId);
  if (reach <= access.cap) return null;
  return {
    error: capMessage(
      access.tier,
      audience,
      `This campaign would go to ${reach} creators.`,
    ),
    upgrade: true,
  };
}

/** Running campaigns (assignments scheduled today or later) with more
    distinct creators than the cap, named for the downgrade guard. */
export async function campaignsOverCap(
  companyId: string,
  cap: number,
): Promise<{ name: string; creators: number }[]> {
  const supabase = createServiceClient();
  const today = new Date().toISOString().slice(0, 10);
  const { data } = await supabase
    .from("assignments")
    .select("campaign_id, creator_id")
    .eq("company_id", companyId)
    .gte("scheduled_date", today)
    .not("campaign_id", "is", null);
  const byCampaign = new Map<string, Set<string>>();
  for (const a of (data ?? []) as { campaign_id: string | null; creator_id: string }[]) {
    if (!a.campaign_id) continue;
    const set = byCampaign.get(a.campaign_id) ?? new Set<string>();
    set.add(a.creator_id);
    byCampaign.set(a.campaign_id, set);
  }
  const over = [...byCampaign].filter(([, set]) => set.size > cap);
  if (over.length === 0) return [];
  const { data: campaigns } = await supabase
    .from("campaigns")
    .select("id, name")
    .in("id", over.map(([id]) => id));
  const names = new Map(
    ((campaigns ?? []) as { id: string; name: string }[]).map((c) => [c.id, c.name]),
  );
  return over
    .map(([id, set]) => ({ name: names.get(id) ?? "Untitled campaign", creators: set.size }))
    .sort((a, b) => b.creators - a.creators);
}

/** Creators the company is using: accepted creator profiles plus pending,
    unexpired creator invites (same counting as the Team tab). */
export async function companyCreatorCount(companyId: string): Promise<number> {
  const supabase = createServiceClient();
  const nowIso = new Date().toISOString();
  const [profiles, invites] = await Promise.all([
    supabase
      .from("company_roster")
      .select("id", { count: "exact", head: true })
      .eq("company_id", companyId)
      .eq("member_role", "creator"),
    supabase
      .from("company_invites")
      .select("id", { count: "exact", head: true })
      .eq("company_id", companyId)
      .eq("role", "creator")
      .is("accepted_at", null)
      .or(`expires_at.is.null,expires_at.gt.${nowIso}`),
  ]);
  return (profiles.count ?? 0) + (invites.count ?? 0);
}

/* ── Mock mode writers (MOCK_DATASET.billing, in place) ── */

export function mockBilling(): AdminBilling {
  return MOCK_DATASET.billing;
}

export function mockActivateSubscription(plan: SubscriptionPlan): void {
  const prev = MOCK_DATASET.billing.subscription;
  MOCK_DATASET.billing.subscription = {
    status: "active",
    tier: PLAN_PRICING[plan].tier,
    cadence: PLAN_PRICING[plan].cadence,
    price: PLAN_PRICING[plan].monthlyPriceCents / 100,
    renewsAt: fmtLongDate(planRenewalIso(plan)),
    cardBrand: prev.status === "active" ? prev.cardBrand : "Visa",
    cardLast4: prev.status === "active" ? prev.cardLast4 : "4242",
  };
}

export function mockTopUp(
  amountCents: number,
  kind: "topup" | "budget" = "topup",
): void {
  MOCK_DATASET.billing.creditBalance += amountCents / 100;
  MOCK_DATASET.billing.topUpHistory.unshift({
    amt: amountCents / 100,
    date: "Just now",
    kind,
  });
}

/* ── Live Stripe helpers ── */

/** The in-house testing company. It runs on a seeded credit
    balance, so the monthly budget flow never creates a Stripe budget
    subscription or touches its balance. */
export const IN_HOUSE_COMPANY_ID = "59f83fa9-8c5b-44aa-814e-f7cc863eac3b";

/** Fixed-id Stripe product behind every monthly budget subscription.
    Subscription price_data needs a real product id, so create it once. */
export async function ensureBudgetProduct(stripe: Stripe): Promise<string> {
  const id = "noni_creator_budget";
  try {
    await stripe.products.retrieve(id);
  } catch {
    await stripe.products.create({ id, name: "Noni creator budget" });
  }
  return id;
}

/** Cancels the company's Stripe budget subscription if one exists. An
    already-cancelled subscription is fine, so Stripe errors are swallowed. */
export async function cancelStripeBudgetSubscription(
  companyId: string,
): Promise<void> {
  const stripe = getStripe();
  if (!stripe) return;
  const row = await readBillingRow(companyId);
  const budgetId = rowStr(row, "stripe_budget_subscription_id");
  if (!budgetId || !budgetId.startsWith("sub_")) return;
  try {
    await stripe.subscriptions.cancel(budgetId);
  } catch {
    /* Already cancelled or gone at Stripe; clearing our state is enough. */
  }
}

/** Charges the subscription's saved card off session (PaymentIntents).
    Returns an error message, or null when the charge succeeded. */
export async function chargeSavedCard(
  companyId: string,
  amountCents: number,
): Promise<string | null> {
  const stripe = getStripe();
  if (!stripe) return STRIPE_NOT_CONFIGURED;

  const row = await readBillingRow(companyId);
  const customerId = rowStr(row, "stripe_customer_id");
  const subscriptionId = rowStr(row, "stripe_subscription_id");
  if (!customerId || !subscriptionId) {
    return "No card on file yet. Purchase your subscription first.";
  }

  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  const paymentMethod =
    typeof subscription.default_payment_method === "string"
      ? subscription.default_payment_method
      : subscription.default_payment_method?.id;
  if (!paymentMethod) return "No card on file for this subscription.";

  try {
    await stripe.paymentIntents.create({
      amount: amountCents,
      currency: "usd",
      customer: customerId,
      payment_method: paymentMethod,
      off_session: true,
      confirm: true,
      description: "Noni creator budget top-up",
      metadata: { company_id: companyId, kind: "topup" },
    });
    return null;
  } catch (err) {
    const message = err instanceof Error ? err.message : "The card was declined.";
    return `The top-up charge failed: ${message}`;
  }
}

/** The Stripe price a plan is sold at today. Each plan's current price
    carries the plan name as its lookup key ("premium_annual"), so a price
    change is a new Stripe price with the key moved onto it and needs no
    deploy. The STRIPE_PRICE_* envs are the fallback. */
export async function stripePriceIdForPlan(
  stripe: Stripe,
  plan: SubscriptionPlan,
): Promise<string | null> {
  try {
    const found = await stripe.prices.list({ lookup_keys: [plan], active: true, limit: 1 });
    if (found.data[0]) return found.data[0].id;
  } catch {
    /* fall through to the env */
  }
  return process.env[PLAN_PRICING[plan].priceEnv] ?? null;
}

/** Resolves a live Stripe subscription to one of our plans: by price id
    against the four STRIPE_PRICE_* envs, then by the plan metadata Checkout
    stamps on the subscription, then by billing interval as a last resort. */
function planForStripePrice(
  priceId: string | null,
  lookupKey: string | null,
  metadataPlan: string | null,
  interval: string | null,
): SubscriptionPlan {
  const plans = Object.keys(PLAN_PRICING) as SubscriptionPlan[];
  /* The current price of each plan carries the plan name as its Stripe
     lookup key, so a switch is read correctly without env changes. */
  if (lookupKey && lookupKey in PLAN_PRICING) return lookupKey as SubscriptionPlan;
  if (priceId) {
    const byPrice = plans.find((p) => process.env[PLAN_PRICING[p].priceEnv] === priceId);
    if (byPrice) return byPrice;
  }
  if (metadataPlan && metadataPlan in PLAN_PRICING) {
    return metadataPlan as SubscriptionPlan;
  }
  return interval === "year" ? "premium_annual" : "premium_monthly";
}

/** Shared by the webhook and the switch-plan action: writes a live Stripe
    subscription's state to company_billing. */
export async function applyStripeSubscription(
  companyId: string,
  subscription: Stripe.Subscription,
  card?: { brand: string; last4: string } | null,
): Promise<string | null> {
  /* Stripe statuses: active and trialing run; past_due (retrying a failed
     renewal) and unpaid (retries exhausted) keep the plan, the subscription
     id and the card so Billing can show "Payment failed, update your card"
     and the Billing Portal can fix it. incomplete is a first payment still
     in flight and has not bought a plan yet. Only a subscription that is
     really over clears state. */
  const status = storedStatus(subscription.status);
  if (status === null) {
    if (subscription.status === "incomplete") return null;
    return clearSubscription(companyId);
  }

  const item = subscription.items.data[0];
  const plan = planForStripePrice(
    item?.price.id ?? null,
    item?.price.lookup_key ?? null,
    subscription.metadata?.plan ?? null,
    item?.price.recurring?.interval ?? null,
  );
  const periodEnd = item?.current_period_end;
  return activateSubscription(
    companyId,
    {
    plan,
    renewsAtIso: periodEnd
      ? new Date(periodEnd * 1000).toISOString()
      : planRenewalIso(plan),
    cardBrand: card?.brand ?? null,
    cardLast4: card?.last4 ?? null,
    stripeCustomerId:
      typeof subscription.customer === "string"
        ? subscription.customer
        : subscription.customer.id,
    stripeSubscriptionId: subscription.id,
    },
    status,
  );
}

/** Maps a Stripe subscription status to what company_billing stores, or
    null when the subscription no longer represents a plan. */
function storedStatus(status: string): SubscriptionStatus | null {
  /* canceled, incomplete, incomplete_expired and paused map to null. */
  return status === "active" ||
    status === "trialing" ||
    status === "past_due" ||
    status === "unpaid"
    ? status
    : null;
}

/* ── Connect OAuth state (companyId, HMAC signed against CSRF) ── */

function connectStateSecret(): string {
  return process.env.STRIPE_SECRET_KEY ?? "noni-dev";
}

export function signConnectState(companyId: string): string {
  const sig = createHmac("sha256", connectStateSecret())
    .update(companyId)
    .digest("hex");
  return `${companyId}.${sig}`;
}

export function verifyConnectState(state: string): string | null {
  const dot = state.lastIndexOf(".");
  if (dot <= 0) return null;
  const companyId = state.slice(0, dot);
  const sig = Buffer.from(state.slice(dot + 1));
  const expected = Buffer.from(
    createHmac("sha256", connectStateSecret()).update(companyId).digest("hex"),
  );
  if (sig.length !== expected.length || !timingSafeEqual(sig, expected)) {
    return null;
  }
  return companyId;
}

/* ── Auto top-up ──
   Runs whenever billing state is read or mutated (the Billing page load and
   the mutating actions). In production a scheduled job that watches
   credit_balance_cents would replace this read-time check. */

export async function runAutoTopUpCheck(ctx: BillingContext): Promise<void> {
  if (ctx.mock) {
    const billing = MOCK_DATASET.billing;
    if (
      billing.autoTopUp &&
      billing.creditBalance < AUTO_TOP_UP_THRESHOLD_CENTS / 100
    ) {
      mockTopUp(AUTO_TOP_UP_AMOUNT_CENTS);
    }
    return;
  }

  const row = await readBillingRow(ctx.companyId);
  const due =
    rowBool(row, "auto_top_up") &&
    (rowStr(row, "subscription_status") === "active" ||
      rowStr(row, "subscription_status") === "trialing") &&
    rowNum(row, "credit_balance_cents") < AUTO_TOP_UP_THRESHOLD_CENTS;
  if (!due) return;

  if (!ctx.simulated) {
    const chargeError = await chargeSavedCard(ctx.companyId, AUTO_TOP_UP_AMOUNT_CENTS);
    /* A failed auto charge must not break reading the page; the balance
       simply stays low and the next check retries. */
    if (chargeError) return;
  }
  await recordCredit(ctx.companyId, AUTO_TOP_UP_AMOUNT_CENTS, "topup");
}
