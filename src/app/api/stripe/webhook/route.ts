/* Stripe webhook endpoint (Agent C). Point the Stripe dashboard (or
   `stripe listen --forward-to localhost:3000/api/stripe/webhook`) here with
   these events enabled:
   - checkout.session.completed: subscription purchased, writes plan, price,
     renewal, card on file and the Stripe customer/subscription ids.
   - customer.subscription.updated: plan switches and renewals.
   - customer.subscription.deleted: cancellation, clears subscription state.
   - invoice.paid: a monthly budget subscription charge (metadata kind
     "budget") converts into credits on the company's balance.
   The company is resolved from metadata.company_id, which the checkout
   action stamps on both the session and the subscription. Budget
   subscriptions carry metadata kind "budget" so the plan handlers skip
   them instead of overwriting the plan state. */

import { revalidatePath } from "next/cache";
import type Stripe from "stripe";

import {
  applyStripeSubscription,
  cancelStripeBudgetSubscription,
  clearSubscription,
  getStripe,
  recordCredit,
  writeBilling,
} from "@/lib/admin/billing";

async function subscriptionCard(
  stripe: Stripe,
  subscription: Stripe.Subscription,
): Promise<{ brand: string; last4: string } | null> {
  const pmId =
    typeof subscription.default_payment_method === "string"
      ? subscription.default_payment_method
      : subscription.default_payment_method?.id;
  if (!pmId) return null;
  const pm = await stripe.paymentMethods.retrieve(pmId);
  if (!pm.card) return null;
  const brand = pm.card.display_brand ?? pm.card.brand;
  return {
    brand: brand.charAt(0).toUpperCase() + brand.slice(1),
    last4: pm.card.last4,
  };
}

export async function POST(request: Request): Promise<Response> {
  const stripe = getStripe();
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!stripe || !secret) {
    return new Response(
      "Stripe is not configured. Set STRIPE_SECRET_KEY and STRIPE_WEBHOOK_SECRET.",
      { status: 503 },
    );
  }

  const payload = await request.text();
  const signature = request.headers.get("stripe-signature") ?? "";
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(payload, signature, secret);
  } catch {
    return new Response("Invalid signature.", { status: 400 });
  }

  let error: string | null = null;

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const companyId = session.metadata?.company_id;
      const subscriptionId =
        typeof session.subscription === "string"
          ? session.subscription
          : session.subscription?.id;
      if (session.mode === "subscription" && companyId && subscriptionId) {
        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        const card = await subscriptionCard(stripe, subscription);
        error = await applyStripeSubscription(companyId, subscription, card);
      }
      break;
    }
    case "customer.subscription.updated": {
      const subscription = event.data.object as Stripe.Subscription;
      const companyId = subscription.metadata?.company_id;
      if (companyId && subscription.metadata?.kind !== "budget") {
        const card = await subscriptionCard(stripe, subscription);
        error = await applyStripeSubscription(companyId, subscription, card);
      }
      break;
    }
    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      const companyId = subscription.metadata?.company_id;
      if (!companyId) break;
      if (subscription.metadata?.kind === "budget") {
        error = await writeBilling(companyId, {
          stripe_budget_subscription_id: null,
          monthly_budget_cents: null,
        });
      } else {
        /* The plan is gone, so the budget subscription must not keep
           charging a company that can no longer run creators. */
        await cancelStripeBudgetSubscription(companyId);
        error = await clearSubscription(companyId);
      }
      break;
    }
    case "invoice.paid": {
      const invoice = event.data.object as Stripe.Invoice;
      const details = invoice.parent?.subscription_details;
      const companyId = details?.metadata?.company_id;
      if (
        details?.metadata?.kind === "budget" &&
        companyId &&
        invoice.amount_paid > 0
      ) {
        error = await recordCredit(
          companyId,
          invoice.amount_paid,
          "budget",
          invoice.id,
        );
      }
      break;
    }
    default:
      break;
  }

  /* 500 makes Stripe retry, which is what we want for transient DB errors. */
  if (error) return new Response(error, { status: 500 });

  revalidatePath("/admin", "layout");
  return Response.json({ received: true });
}
