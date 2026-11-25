import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { StartFlow, type StartStep } from "@/components/start/StartFlow";
import { getSessionProfile, isCompanyAdmin } from "@/lib/auth";
import { companyPlanAccess, PLAN_PRICING, readBillingRow, stripeChargeForPlan } from "@/lib/admin/billing";
import type { SubscriptionPlan } from "@/lib/admin/types";
import { planOfferLines } from "@/lib/plans";
import { getThemeColor } from "@/lib/media-library";
import { BOOKING_URL } from "@/lib/site-config";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";

export const metadata = { title: "Get started · Noni" };
export const dynamic = "force-dynamic";

/* Where a company without a plan lands (the dashboard sends it here): book
   the call, then start the plan agreed on it. A company with a plan never
   sees it. */
export default async function StartPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { userId, profile } = await getSessionProfile();
  if (!userId) redirect("/login?next=/start");
  const companyId = profile?.active_company_id;
  if (!companyId || !isCompanyAdmin(profile)) redirect("/admin");
  if (!profile?.onboarded) redirect("/onboarding");

  const access = await companyPlanAccess(companyId);
  if (access.entitled || access.status === "past_due" || access.status === "unpaid") redirect("/admin");

  const [{ data: company }, themeColor, { data: auth }, billing] = await Promise.all([
    createServiceClient().from("companies").select("name, intake").eq("id", companyId).maybeSingle(),
    getThemeColor(companyId),
    (await createClient()).auth.getUser(),
    readBillingRow(companyId),
  ]);
  const intake = (company?.intake as { call_booked_at?: unknown } | null) ?? {};
  const offerPlan =
    typeof billing?.offer_plan === "string" && billing.offer_plan in PLAN_PRICING
      ? (billing.offer_plan as SubscriptionPlan)
      : null;
  const budgetCents = typeof billing?.monthly_budget_cents === "number" ? billing.monthly_budget_cents : 0;

  const charge = offerPlan ? await stripeChargeForPlan(offerPlan) : null;

  const sp = await searchParams;
  const initialStep: StartStep =
    sp.checkout === "success" ? "paid" : offerPlan ? "offer" : intake.call_booked_at ? "booked" : "call";

  return (
    <StartFlow
      companyId={companyId}
      companyName={company?.name ?? "your company"}
      firstName={profile?.full_name?.trim().split(/\s+/)[0] ?? ""}
      fullName={profile?.full_name?.trim() ?? ""}
      host={(await headers()).get("host") ?? "usenoni.app"}
      email={auth.user?.email ?? ""}
      themeColor={themeColor}
      bookingUrl={BOOKING_URL}
      initialStep={initialStep}
      offer={offerPlan ? planOfferLines(offerPlan, budgetCents, charge) : null}
    />
  );
}
