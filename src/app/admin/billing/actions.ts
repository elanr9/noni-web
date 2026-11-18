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
  campaignsOverCap,
  cancelStripeBudgetSubscription,
  chargeSavedCard,
  clearSubscription,
  companyCreatorCount,
  ensureBudgetProduct,
  getBillingContext,
  getStripe,
  IN_HOUSE_COMPANY_ID,
  mockActivateSubscription,
  mockBilling,
  mockTopUp,
  PLAN_CREATOR_CAP,
  PLAN_PRICING,
  PLAN_TIER_LABEL,
  planRenewalIso,
  readBillingRow,
  recordCredit,
  runAutoTopUpCheck,
  signConnectState,
  STRIPE_NOT_CONFIGURED,
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

  if (ctx.simulated) {
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
  /* A failed renewal keeps the Stripe subscription alive; a second
     Checkout would double bill. Fix the card in the portal instead. */
  if (row?.subscription_status === "past_due" || row?.subscription_status === "unpaid") {
    return {
      ok: false,
      error: "Your subscription is waiting on a card update. Use Update card to fix the payment.",
    };
  }
  const customerId = row?.stripe_customer_id;
  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    line_items: [{ price: priceId, quantity: 1 }],
    allow_promotion_codes: true,
    payment_method_collection: "if_required",
    success_url: `${origin}/admin/billing?checkout=success`,
    cancel_url: `${origin}/admin/billing?checkout=cancelled`,
    metadata: { company_id: ctx.companyId },
    subscription_data: { metadata: { company_id: ctx.companyId, plan } },
    ...(typeof customerId === "string" && customerId.startsWith("cus_")
      ? { customer: customerId }
      : {}),
  });
  if (!session.url) {
    return { ok: false, error: "Stripe did not return a checkout link." };
  }
  return { ok: true, redirectUrl: session.url };
}

/** Manage plan: switch the active subscription to another plan. Live mode
    swaps the subscription item's price with prorations; the webhook then
    confirms the state this writes optimistically. Downgrades are blocked
    while the team runs more creators than the target plan allows. */
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

  /* Downgrade guard (design_handoff_pricing_plans): blocked while any
     running campaign has more creators than the target cap, naming those
     campaigns. Every publish reaches the whole creator roster, so a roster
     over the cap blocks too. */
  const cap = PLAN_CREATOR_CAP[PLAN_PRICING[plan].tier];
  if (cap !== null) {
    const label = PLAN_TIER_LABEL[PLAN_PRICING[plan].tier];
    const [over, creators] = await Promise.all([
      campaignsOverCap(ctx.companyId, cap),
      companyCreatorCount(ctx.companyId),
    ]);
    if (over.length > 0) {
      const shown = over.slice(0, 3).map((c) => `${c.name} (${c.creators} creators)`);
      const more = over.length > 3 ? ` and ${over.length - 3} more` : "";
      return {
        ok: false,
        error: `${label} allows ${cap} creators per campaign. ${over.length === 1 ? "This campaign runs" : "These campaigns run"} more: ${shown.join(", ")}${more}. Switch after ${over.length === 1 ? "it ends" : "they end"}, or remove creators on the Team tab first.`,
      };
    }
    if (creators > cap) {
      return {
        ok: false,
        error: `${label} allows ${cap} creators per campaign and every campaign goes to your whole team of ${creators}, counting pending invites. Remove creators on the Team tab before switching.`,
      };
    }
  }

  if (!ctx.simulated) {
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

  if (!ctx.simulated) {
    const stripe = getStripe();
    if (!stripe) return { ok: false, error: STRIPE_NOT_CONFIGURED };
    const row = await readBillingRow(ctx.companyId);
    const subscriptionId = row?.stripe_subscription_id;
    if (typeof subscriptionId === "string" && subscriptionId.startsWith("sub_")) {
      await stripe.subscriptions.cancel(subscriptionId);
    }
    await cancelStripeBudgetSubscription(ctx.companyId);
  }

  const error = await clearSubscription(ctx.companyId);
  if (error) return { ok: false, error };
  refresh();
  return { ok: true };
}

/** Monthly budget modal: the company prepays its creator budget. Live mode
    creates (or resizes) a second Stripe subscription that charges $X every
    month; the invoice.paid webhook converts each charge into +$X of credits.
    Noni never fronts payouts. */
export async function setMonthlyBudget(dollars: number): Promise<BillingActionResult> {
  const ctx = await getBillingContext();
  if (!ctx) return { ok: false, error: NOT_ALLOWED };
  if (!Number.isInteger(dollars) || dollars <= 0) {
    return { ok: false, error: "The budget must be a positive dollar amount." };
  }
  const amountCents = dollars * 100;

  if (ctx.mock) {
    mockBilling().monthlySpendLimit = dollars;
    refresh();
    return { ok: true };
  }

  /* The in-house testing company runs on a seeded credit balance: record the
     budget number but never create a Stripe subscription or touch the
     balance. */
  if (ctx.companyId === IN_HOUSE_COMPANY_ID) {
    const error = await writeBilling(ctx.companyId, {
      monthly_budget_cents: amountCents,
    });
    if (error) return { ok: false, error };
    refresh();
    return { ok: true };
  }

  if (ctx.simulated) {
    const error =
      (await writeBilling(ctx.companyId, { monthly_budget_cents: amountCents })) ??
      (await recordCredit(ctx.companyId, amountCents, "budget"));
    if (error) return { ok: false, error };
    refresh();
    return { ok: true };
  }

  const stripe = getStripe();
  if (!stripe) return { ok: false, error: STRIPE_NOT_CONFIGURED };
  const row = await readBillingRow(ctx.companyId);
  const customerId = row?.stripe_customer_id;
  const planSubId = row?.stripe_subscription_id;
  if (
    (row?.subscription_status !== "active" &&
      row?.subscription_status !== "trialing") ||
    typeof customerId !== "string" ||
    typeof planSubId !== "string"
  ) {
    return {
      ok: false,
      error:
        "Pick a plan first. The monthly budget is charged to the same card as your subscription.",
    };
  }

  const budgetSubId = row.stripe_budget_subscription_id;
  let createdSubId: string | null = null;
  try {
    if (typeof budgetSubId === "string" && budgetSubId.startsWith("sub_")) {
      /* Resize the existing budget subscription. No proration: the new
         amount simply applies from the next monthly charge. */
      const budgetSub = await stripe.subscriptions.retrieve(budgetSubId);
      const item = budgetSub.items.data[0];
      if (!item) {
        return { ok: false, error: "The budget subscription has no item." };
      }
      await stripe.subscriptions.update(budgetSubId, {
        items: [{ id: item.id, quantity: dollars }],
        proration_behavior: "none",
      });
    } else {
      const planSub = await stripe.subscriptions.retrieve(planSubId);
      const paymentMethod =
        typeof planSub.default_payment_method === "string"
          ? planSub.default_payment_method
          : planSub.default_payment_method?.id;
      if (!paymentMethod) {
        return { ok: false, error: "No card on file for your subscription." };
      }
      const product = await ensureBudgetProduct(stripe);
      /* $1-per-unit price with quantity = dollars, so resizing the budget
         later is a quantity update instead of a new price. The creation
         invoice is the first month's charge; error_if_incomplete surfaces
         a declined card here instead of leaving a half-open subscription. */
      const created = await stripe.subscriptions.create({
        customer: customerId,
        default_payment_method: paymentMethod,
        payment_behavior: "error_if_incomplete",
        items: [
          {
            price_data: {
              currency: "usd",
              product,
              recurring: { interval: "month" },
              unit_amount: 100,
            },
            quantity: dollars,
          },
        ],
        metadata: { company_id: ctx.companyId, kind: "budget" },
      });
      createdSubId = created.id;
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : "The charge failed.";
    return { ok: false, error: `The budget could not be set: ${message}` };
  }

  const error = await writeBilling(ctx.companyId, {
    monthly_budget_cents: amountCents,
    ...(createdSubId ? { stripe_budget_subscription_id: createdSubId } : {}),
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

  if (!ctx.simulated) {
    const chargeError = await chargeSavedCard(ctx.companyId, amountCents);
    if (chargeError) return { ok: false, error: chargeError };
  }

  const error = await recordCredit(ctx.companyId, amountCents, "topup");
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

  if (ctx.simulated) {
    const error = await writeBilling(ctx.companyId, {
      stripe_connected: true,
      stripe_account_id: "acct_simulated_dev",
    });
    if (error) return { ok: false, error };
    refresh();
    return { ok: true };
  }

  /* Fail closed. Connect must go through Stripe's OAuth so the company
     links its own Stripe account. Never fall back to the account behind
     STRIPE_SECRET_KEY: that is Noni's own Stripe, and attaching it would
     show Noni's revenue in a customer's Analytics. */
  const clientId = process.env.STRIPE_CONNECT_CLIENT_ID?.trim();
  if (!clientId || !clientId.startsWith("ca_")) {
    console.error(
      "Stripe Connect is not configured: set STRIPE_CONNECT_CLIENT_ID (ca_...) from the Stripe Connect settings.",
    );
    return {
      ok: false,
      error:
        "Connecting Stripe is not available yet. Your plan and creator budget work without it; we will let you know when sales analytics can be connected.",
    };
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

/** "Update card" and "View invoices": opens the Stripe Billing Portal for
    the company's customer, returning to /admin/billing. Simulated mode has
    no portal, so it stands in for a successful card update instead. */
export async function openBillingPortal(): Promise<BillingActionResult> {
  const ctx = await getBillingContext();
  if (!ctx) return { ok: false, error: NOT_ALLOWED };

  if (ctx.mock) {
    const sub = mockBilling().subscription;
    if (sub.status !== "none") sub.status = "active";
    refresh();
    return { ok: true };
  }

  if (ctx.simulated) {
    const row = await readBillingRow(ctx.companyId);
    const status = row?.subscription_status;
    if (status === "past_due" || status === "unpaid") {
      const error = await writeBilling(ctx.companyId, { subscription_status: "active" });
      if (error) return { ok: false, error };
    }
    refresh();
    return { ok: true };
  }

  const stripe = getStripe();
  if (!stripe) return { ok: false, error: STRIPE_NOT_CONFIGURED };
  const row = await readBillingRow(ctx.companyId);
  const customerId = row?.stripe_customer_id;
  if (typeof customerId !== "string" || !customerId.startsWith("cus_")) {
    return {
      ok: false,
      error: "No Stripe customer yet. Pick a plan first and your card and invoices show up here.",
    };
  }
  const origin = await siteOrigin();
  try {
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${origin}/admin/billing?portal=returned`,
    });
    return { ok: true, redirectUrl: session.url };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Stripe did not answer.";
    return { ok: false, error: `The billing portal could not open: ${message}` };
  }
}
