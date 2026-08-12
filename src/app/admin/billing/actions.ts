"use server";

/* Billing tab server actions (Agent C). Each one resolves the caller's
   company, routes to mock, simulated or live Stripe mode (see
   @/lib/admin/billing) and revalidates /admin so the setup to-do badge in
   the layout updates alongside the page. */

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

import {
  activateSubscription,
  applyStripeSubscription,
  chargeSavedCard,
  clearSubscription,
  getBillingContext,
  getStripe,
  mockActivateSubscription,
  mockBilling,
  mockTopUp,
  PLAN_PRICING,
  planRenewalIso,
  readBillingRow,
  recordTopUp,
  runAutoTopUpCheck,
  signConnectState,
  STRIPE_NOT_CONFIGURED,
  stripeSimulated,
  writeBilling,
} from "@/lib/admin/billing";
import { MOCK_STRIPE_ACCOUNT_ID } from "@/lib/admin/mock-data";
import type { SubscriptionPlan } from "@/lib/admin/types";

export type BillingActionResult =
  | { ok: true; redirectUrl?: string }
  | { ok: false; error: string };

const NOT_ALLOWED = "Only the company admin can change billing.";

function refresh(): void {
  revalidatePath("/admin", "layout");
}

async function siteOrigin(): Promise<string> {
  const h = await headers();
  return (
    h.get("origin") ??
    process.env.NEXT_PUBLIC_SITE_URL ??
    "http://localhost:3000"
  );
}

/** Plan modal CTA. Live mode returns a Stripe Checkout URL to redirect to;
    mock and simulated modes activate the plan directly. */
export async function startCheckout(
  plan: SubscriptionPlan,
): Promise<BillingActionResult> {
  const ctx = await getBillingContext();
  if (!ctx) return { ok: false, error: NOT_ALLOWED };

  if (ctx.mock) {
    mockActivateSubscription(plan);
    refresh();
    return { ok: true };
  }

  if (stripeSimulated()) {
    const error = await activateSubscription(ctx.companyId, {
      plan,
      renewsAtIso: planRenewalIso(plan),
      cardBrand: "Visa",
      cardLast4: "4242",
      stripeCustomerId: "cus_simulated_dev",
      stripeSubscriptionId: "sub_simulated_dev",
    });
    if (error) return { ok: false, error };
    refresh();
    return { ok: true };
  }

  const stripe = getStripe();
  if (!stripe) return { ok: false, error: STRIPE_NOT_CONFIGURED };
  const priceId = process.env[PLAN_PRICING[plan].priceEnv];
  if (!priceId) {
    return { ok: false, error: `${PLAN_PRICING[plan].priceEnv} is not set.` };
  }

  const origin = await siteOrigin();
  const row = await readBillingRow(ctx.companyId);
  const customerId = row?.stripe_customer_id;
  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${origin}/admin/billing?checkout=success`,
    cancel_url: `${origin}/admin/billing?checkout=cancelled`,
    metadata: { company_id: ctx.companyId },
    subscription_data: { metadata: { company_id: ctx.companyId } },
    ...(typeof customerId === "string" && customerId.startsWith("cus_")
      ? { customer: customerId }
      : {}),
  });
  if (!session.url) {
    return { ok: false, error: "Stripe did not return a checkout link." };
  }
  return { ok: true, redirectUrl: session.url };
}

/** Manage plan: switch the active subscription to the other plan. Live mode
    swaps the subscription item's price with prorations; the webhook then
    confirms the state this writes optimistically. */
export async function switchPlan(
  plan: SubscriptionPlan,
): Promise<BillingActionResult> {
  const ctx = await getBillingContext();
  if (!ctx) return { ok: false, error: NOT_ALLOWED };

  if (ctx.mock) {
    mockActivateSubscription(plan);
    refresh();
    return { ok: true };
  }

  if (!stripeSimulated()) {
    const stripe = getStripe();
    if (!stripe) return { ok: false, error: STRIPE_NOT_CONFIGURED };
    const priceId = process.env[PLAN_PRICING[plan].priceEnv];
    if (!priceId) {
      return { ok: false, error: `${PLAN_PRICING[plan].priceEnv} is not set.` };
    }
    const row = await readBillingRow(ctx.companyId);
    const subscriptionId = row?.stripe_subscription_id;
    if (typeof subscriptionId !== "string" || !subscriptionId.startsWith("sub_")) {
      return { ok: false, error: "No active Stripe subscription to switch." };
    }
    const current = await stripe.subscriptions.retrieve(subscriptionId);
    const item = current.items.data[0];
    if (!item) return { ok: false, error: "The subscription has no plan item." };
    const updated = await stripe.subscriptions.update(subscriptionId, {
      items: [{ id: item.id, price: priceId }],
      proration_behavior: "create_prorations",
    });
    const error = await applyStripeSubscription(ctx.companyId, updated);
    if (error) return { ok: false, error };
    refresh();
    return { ok: true };
  }

  const row = await readBillingRow(ctx.companyId);
  const error = await activateSubscription(ctx.companyId, {
    plan,
    renewsAtIso: planRenewalIso(plan),
    cardBrand: typeof row?.card_brand === "string" ? row.card_brand : "Visa",
    cardLast4: typeof row?.card_last4 === "string" ? row.card_last4 : "4242",
  });
  if (error) return { ok: false, error };
  refresh();
  return { ok: true };
}

/** Manage plan: cancel. Live mode cancels at Stripe immediately and clears
    state; the customer.subscription.deleted webhook confirms it. */
export async function cancelPlan(): Promise<BillingActionResult> {
  const ctx = await getBillingContext();
  if (!ctx) return { ok: false, error: NOT_ALLOWED };

  if (ctx.mock) {
    mockBilling().subscription = { status: "none" };
    refresh();
    return { ok: true };
  }

  if (!stripeSimulated()) {
    const stripe = getStripe();
    if (!stripe) return { ok: false, error: STRIPE_NOT_CONFIGURED };
    const row = await readBillingRow(ctx.companyId);
    const subscriptionId = row?.stripe_subscription_id;
    if (typeof subscriptionId === "string" && subscriptionId.startsWith("sub_")) {
      await stripe.subscriptions.cancel(subscriptionId);
    }
  }

  const error = await clearSubscription(ctx.companyId);
  if (error) return { ok: false, error };
  refresh();
  return { ok: true };
}

/** Set limit modal: writes the monthly spend limit in whole dollars. */
export async function setSpendLimit(dollars: number): Promise<BillingActionResult> {
  const ctx = await getBillingContext();
  if (!ctx) return { ok: false, error: NOT_ALLOWED };
  if (!Number.isInteger(dollars) || dollars <= 0) {
    return { ok: false, error: "The limit must be a positive dollar amount." };
  }

  if (ctx.mock) {
    mockBilling().monthlySpendLimit = dollars;
    refresh();
    return { ok: true };
  }

  const error = await writeBilling(ctx.companyId, {
    monthly_budget_cents: dollars * 100,
  });
  if (error) return { ok: false, error };
  refresh();
  return { ok: true };
}

/** Top up modal: one-off credit. Live mode charges the saved subscription
    card off session (PaymentIntents) before recording the credit. */
export async function topUpCredit(dollars: number): Promise<BillingActionResult> {
  const ctx = await getBillingContext();
  if (!ctx) return { ok: false, error: NOT_ALLOWED };
  if (!Number.isInteger(dollars) || dollars <= 0) {
    return { ok: false, error: "The top-up must be a positive dollar amount." };
  }
  const amountCents = dollars * 100;

  if (ctx.mock) {
    mockTopUp(amountCents);
    refresh();
    return { ok: true };
  }

  if (!stripeSimulated()) {
    const chargeError = await chargeSavedCard(ctx.companyId, amountCents);
    if (chargeError) return { ok: false, error: chargeError };
  }

  const error = await recordTopUp(ctx.companyId, amountCents);
  if (error) return { ok: false, error };
  refresh();
  return { ok: true };
}

/** Inline auto top-up toggle. Turning it on runs the refill check right
    away, so a low balance refills without waiting for the next page read. */
export async function setAutoTopUp(on: boolean): Promise<BillingActionResult> {
  const ctx = await getBillingContext();
  if (!ctx) return { ok: false, error: NOT_ALLOWED };

  if (ctx.mock) {
    mockBilling().autoTopUp = on;
  } else {
    const error = await writeBilling(ctx.companyId, { auto_top_up: on });
    if (error) return { ok: false, error };
  }

  if (on) await runAutoTopUpCheck(ctx);
  refresh();
  return { ok: true };
}

/** Stripe card CTA. Live mode returns the Connect OAuth authorize URL with
    a read-only scope; /api/stripe/connect handles the callback. */
export async function startStripeConnect(): Promise<BillingActionResult> {
  const ctx = await getBillingContext();
  if (!ctx) return { ok: false, error: NOT_ALLOWED };

  if (ctx.mock) {
    mockBilling().stripeConnected = true;
    mockBilling().stripeAccountId = MOCK_STRIPE_ACCOUNT_ID;
    refresh();
    return { ok: true };
  }

  if (stripeSimulated()) {
    const error = await writeBilling(ctx.companyId, {
      stripe_connected: true,
      stripe_account_id: "acct_simulated_dev",
    });
    if (error) return { ok: false, error };
    refresh();
    return { ok: true };
  }

  const clientId = process.env.STRIPE_CONNECT_CLIENT_ID;
  if (!clientId) {
    return { ok: false, error: "STRIPE_CONNECT_CLIENT_ID is not set." };
  }
  const origin = await siteOrigin();
  const params = new URLSearchParams({
    response_type: "code",
    client_id: clientId,
    scope: "read_only",
    redirect_uri: `${origin}/api/stripe/connect`,
    state: signConnectState(ctx.companyId),
  });
  return {
    ok: true,
    redirectUrl: `https://connect.stripe.com/oauth/authorize?${params.toString()}`,
  };
}
