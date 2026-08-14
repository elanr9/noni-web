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

import { MOCK_DATASET } from "./mock-data";
import type {
  AdminBilling,
  BillingCadence,
  PlanTier,
  SubscriptionPlan,
} from "./types";

/* ── Plan pricing (design_handoff_pricing_plans) ──
   Plans differ only in the creator cap. Starter and Premium are self-serve
   Stripe subscriptions in a monthly or annual cadence; Enterprise is
   sales-led (contact us) and gets written by ops, never by Checkout. */

export const PLAN_PRICING: Record<
  SubscriptionPlan,
  {
    tier: Exclude<PlanTier, "enterprise">;
    cadence: BillingCadence;
    /** Effective monthly price in cents. */
    monthlyPriceCents: number;
    priceEnv:
      | "STRIPE_PRICE_STARTER_MONTHLY"
      | "STRIPE_PRICE_STARTER_ANNUAL"
      | "STRIPE_PRICE_PREMIUM_MONTHLY"
      | "STRIPE_PRICE_PREMIUM_ANNUAL";
  }
> = {
  starter_monthly: {
    tier: "starter",
    cadence: "monthly",
    monthlyPriceCents: 10000,
    priceEnv: "STRIPE_PRICE_STARTER_MONTHLY",
  },
  starter_annual: {
    tier: "starter",
    cadence: "annual",
    monthlyPriceCents: 7500,
    priceEnv: "STRIPE_PRICE_STARTER_ANNUAL",
  },
  premium_monthly: {
    tier: "premium",
    cadence: "monthly",
    monthlyPriceCents: 25000,
    priceEnv: "STRIPE_PRICE_PREMIUM_MONTHLY",
  },
  premium_annual: {
    tier: "premium",
    cadence: "annual",
    monthlyPriceCents: 15000,
    priceEnv: "STRIPE_PRICE_PREMIUM_ANNUAL",
  },
};

/** Creators a company can run on Noni per plan. Null means unlimited. */
export const PLAN_CREATOR_CAP: Record<PlanTier, number | null> = {
  starter: 5,
  premium: 15,
  enterprise: null,
};

export const PLAN_TIER_LABEL: Record<PlanTier, string> = {
  starter: "Starter",
  premium: "Premium",
  enterprise: "Enterprise",
};

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
  if (!isCompanyAdmin(profile) || !profile?.company_id) return null;
  const simulated =
    stripeSimulated() ||
    rowBool(await readBillingRow(profile.company_id), "billing_simulated");
  return { companyId: profile.company_id, mock: false, simulated };
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
): Promise<string | null> {
  const patch: BillingPatch = {
    subscription_status: "active",
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

/* ── Creator cap enforcement ── */

/** The company's current plan tier, or null with no active subscription.
    No subscription means no cap: pilot and pre-checkout companies keep
    working, the cap bites once they are on a plan. */
export async function companyPlanTier(companyId: string): Promise<PlanTier | null> {
  const row = await readBillingRow(companyId);
  if (rowStr(row, "subscription_status") !== "active") return null;
  return parseStoredPlan(rowStr(row, "subscription_plan")).tier;
}

/** Creators the company is using: accepted creator profiles plus pending,
    unexpired creator invites (same counting as the Team tab). */
export async function companyCreatorCount(companyId: string): Promise<number> {
  const supabase = createServiceClient();
  const nowIso = new Date().toISOString();
  const [profiles, invites] = await Promise.all([
    supabase
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .eq("company_id", companyId)
      .eq("role", "creator"),
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

/** FieldVision, the in-house testing company. It runs on a seeded credit
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

/** Resolves a live Stripe subscription to one of our plans: by price id
    against the four STRIPE_PRICE_* envs, then by the plan metadata Checkout
    stamps on the subscription, then by billing interval as a last resort. */
function planForStripePrice(
  priceId: string | null,
  metadataPlan: string | null,
  interval: string | null,
): SubscriptionPlan {
  const plans = Object.keys(PLAN_PRICING) as SubscriptionPlan[];
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
  const active =
    subscription.status === "active" || subscription.status === "trialing";
  if (!active) return clearSubscription(companyId);

  const item = subscription.items.data[0];
  const plan = planForStripePrice(
    item?.price.id ?? null,
    subscription.metadata?.plan ?? null,
    item?.price.recurring?.interval ?? null,
  );
  const periodEnd = item?.current_period_end;
  return activateSubscription(companyId, {
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
  });
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
    rowStr(row, "subscription_status") === "active" &&
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
