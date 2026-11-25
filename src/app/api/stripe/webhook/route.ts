/* Stripe webhook endpoint (Agent C). Point the Stripe dashboard (or
   `stripe listen --forward-to localhost:3000/api/stripe/webhook`) here with
   these events enabled:
   - checkout.session.completed: subscription purchased, writes plan, price,
     renewal, card on file and the Stripe customer/subscription ids.
   - customer.subscription.updated: plan switches and renewals.
   - customer.subscription.deleted: cancellation, clears subscription state.
   - invoice.paid: a creator budget invoice (metadata kind "budget": the
     monthly bill from the budget-billing edge function, or one ops sent by
     hand), or an older monthly budget subscription charge, converts into
     credits on the company's balance and marks the monthly bill paid.
   - invoice.voided, invoice.marked_uncollectible: a monthly budget bill
     that will never be paid stops counting as owed.
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
  scheduleFirstBudgetBill,
  writeBilling,
} from "@/lib/admin/billing";
import { createServiceClient } from "@/lib/supabase/service";

/** The monthly budget bill this invoice paid or closed, if it is one. */
async function markBudgetBill(invoiceId: string, status: "paid" | "void"): Promise<void> {
  await createServiceClient()
    .from("company_budget_invoices")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("stripe_invoice_id", invoiceId);
}

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
        if (!error) {
          /* The card saved for the plan also pays the monthly creator
             budget: make it the customer's default for invoices. */
          const pm =
            typeof subscription.default_payment_method === "string"
              ? subscription.default_payment_method
              : subscription.default_payment_method?.id;
          const customerId =
            typeof subscription.customer === "string" ? subscription.customer : subscription.customer.id;
          if (pm) {
            await stripe.customers.update(customerId, { invoice_settings: { default_payment_method: pm } });
          }
          error =
            (await writeBilling(companyId, { offer_plan: null })) ??
            (await scheduleFirstBudgetBill(companyId));
        }
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
      /* Two sources: a budget invoice ops sent from the ops console
         (metadata on the invoice itself), and the older monthly budget
         subscription (metadata on the subscription). */
      const details = invoice.parent?.subscription_details;
      const meta =
        invoice.metadata?.kind === "budget" ? invoice.metadata : details?.metadata;
      const companyId = meta?.company_id;
      if (meta?.kind === "budget" && companyId && invoice.amount_paid > 0) {
        error = await recordCredit(
          companyId,
          invoice.amount_paid,
          "budget",
          invoice.id,
        );
        if (!error && invoice.id) await markBudgetBill(invoice.id, "paid");
      }
      break;
    }
    case "invoice.voided":
    case "invoice.marked_uncollectible": {
      const invoice = event.data.object as Stripe.Invoice;
      if (invoice.metadata?.kind === "budget" && invoice.id) await markBudgetBill(invoice.id, "void");
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
