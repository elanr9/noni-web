"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

import {
  activateSubscription,
  getStripe,
  PLAN_PRICING,
  planRenewalIso,
  readBillingRow,
  STRIPE_NOT_CONFIGURED,
  stripePriceIdForPlan,
  stripeSimulated,
  writeBilling,
} from "@/lib/admin/billing";
import type { SubscriptionPlan } from "@/lib/admin/types";
import { getSessionProfile, isCompanyAdmin } from "@/lib/auth";
import { isStaleCompany, STALE_COMPANY_ERROR } from "@/lib/stale-company";
import { createServiceClient } from "@/lib/supabase/service";

export type StartResult = { ok: true; redirectUrl?: string } | { ok: false; error: string };

/** Starts the plan agreed on the call (company_billing.offer_plan, set by
    ops) in Stripe Checkout. The company cannot pick another plan here; the
    checkout webhook activates it, saves the card for the monthly creator
    budget and starts the budget cycle. */
export async function startPlanCheckout(renderedFor: string): Promise<StartResult> {
  const { userId, profile } = await getSessionProfile();
  const companyId = profile?.active_company_id;
  if (!userId || !companyId || !isCompanyAdmin(profile)) return { ok: false, error: "Company admins only." };
  if (isStaleCompany(companyId, renderedFor)) return { ok: false, error: STALE_COMPANY_ERROR };

  const row = await readBillingRow(companyId);
  const plan = typeof row?.offer_plan === "string" && row.offer_plan in PLAN_PRICING ? (row.offer_plan as SubscriptionPlan) : null;
  if (!plan) return { ok: false, error: "Your plan is not ready yet." };
  const status = typeof row?.subscription_status === "string" ? row.subscription_status : "none";
  if (status !== "none") return { ok: true, redirectUrl: "/admin" };

  if (stripeSimulated() || row?.billing_simulated === true) {
    const error =
      (await activateSubscription(companyId, {
        plan,
        renewsAtIso: planRenewalIso(plan),
        cardBrand: "Visa",
        cardLast4: "4242",
        stripeCustomerId: "cus_simulated_dev",
        stripeSubscriptionId: "sub_simulated_dev",
      })) ?? (await writeBilling(companyId, { offer_plan: null }));
    if (error) return { ok: false, error };
    revalidatePath("/admin", "layout");
    return { ok: true, redirectUrl: "/start?checkout=success" };
  }

  const stripe = getStripe();
  if (!stripe) return { ok: false, error: STRIPE_NOT_CONFIGURED };
  const priceId = await stripePriceIdForPlan(stripe, plan);
  if (!priceId) return { ok: false, error: "This plan has no Stripe price yet." };

  const h = await headers();
  const origin = h.get("origin") ?? process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const customerId =
    typeof row?.stripe_customer_id === "string" && row.stripe_customer_id.startsWith("cus_") ? row.stripe_customer_id : null;
  const email = customerId ? null : ((await createServiceClient().auth.admin.getUserById(userId)).data.user?.email ?? null);

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    line_items: [{ price: priceId, quantity: 1 }],
    allow_promotion_codes: true,
    payment_method_collection: "if_required",
    success_url: `${origin}/start?checkout=success`,
    cancel_url: `${origin}/start`,
    metadata: { company_id: companyId },
    subscription_data: { metadata: { company_id: companyId, plan } },
    ...(customerId ? { customer: customerId } : email ? { customer_email: email } : {}),
  });
  if (!session.url) return { ok: false, error: "Stripe did not return a checkout link." };
  return { ok: true, redirectUrl: session.url };
}

/** Calendly said the call is booked (its embed's event_scheduled message):
    the "Do it for me" screen shows the booking from now on. */
export async function markCallBooked(renderedFor: string): Promise<StartResult> {
  const { userId, profile } = await getSessionProfile();
  const companyId = profile?.active_company_id;
  if (!userId || !companyId || !isCompanyAdmin(profile)) return { ok: false, error: "Company admins only." };
  if (isStaleCompany(companyId, renderedFor)) return { ok: false, error: STALE_COMPANY_ERROR };
  const db = createServiceClient();
  const { data } = await db.from("companies").select("intake").eq("id", companyId).maybeSingle();
  const intake = (data?.intake as Record<string, unknown> | null) ?? {};
  const { error } = await db
    .from("companies")
    .update({ intake: { ...intake, call_booked_at: new Date().toISOString() } })
    .eq("id", companyId);
  return error ? { ok: false, error: error.message } : { ok: true };
}
