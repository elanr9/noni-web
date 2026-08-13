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
import type { AdminBilling, SubscriptionPlan } from "./types";

/* ── Plan pricing (fixed by the spec) ── */

export const PLAN_PRICING: Record<
  SubscriptionPlan,
  { monthlyPriceCents: number; priceEnv: "STRIPE_PRICE_MONTHLY" | "STRIPE_PRICE_ANNUAL" }
> = {
  monthly: { monthlyPriceCents: 20000, priceEnv: "STRIPE_PRICE_MONTHLY" },
  annual: { monthlyPriceCents: 10000, priceEnv: "STRIPE_PRICE_ANNUAL" },
};

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
  if (plan === "annual") d.setFullYear(d.getFullYear() + 1);
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
  });
}

/** Ledger entry (kind topup, feeds topUpHistory) plus balance increment. */
export async function recordTopUp(
  companyId: string,
  amountCents: number,
): Promise<string | null> {
  const supabase = createServiceClient();
  const { error } = await supabase
    .from("company_credit_ledger")
    .insert({ company_id: companyId, kind: "topup", amount_cents: amountCents });
  if (error) return `The top-up could not be recorded: ${error.message}`;

  const row = await readBillingRow(companyId);
  return writeBilling(companyId, {
    credit_balance_cents: rowNum(row, "credit_balance_cents") + amountCents,
  });
}

/* ── Mock mode writers (MOCK_DATASET.billing, in place) ── */

export function mockBilling(): AdminBilling {
  return MOCK_DATASET.billing;
}

export function mockActivateSubscription(plan: SubscriptionPlan): void {
  const prev = MOCK_DATASET.billing.subscription;
  MOCK_DATASET.billing.subscription = {
    status: "active",
    plan,
    price: PLAN_PRICING[plan].monthlyPriceCents / 100,
    renewsAt: fmtLongDate(planRenewalIso(plan)),
    cardBrand: prev.status === "active" ? prev.cardBrand : "Visa",
    cardLast4: prev.status === "active" ? prev.cardLast4 : "4242",
  };
}

export function mockTopUp(amountCents: number): void {
  MOCK_DATASET.billing.creditBalance += amountCents / 100;
  MOCK_DATASET.billing.topUpHistory.unshift({
    amt: amountCents / 100,
    date: "Just now",
  });
}

/* ── Live Stripe helpers ── */

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
  const plan: SubscriptionPlan =
    item?.price.recurring?.interval === "year" ? "annual" : "monthly";
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
  await recordTopUp(ctx.companyId, AUTO_TOP_UP_AMOUNT_CENTS);
}
