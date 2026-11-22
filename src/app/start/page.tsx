import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { StartFlow, type StartStep } from "@/components/start/StartFlow";
import { getSessionProfile, isCompanyAdmin } from "@/lib/auth";
import { companyPlanAccess } from "@/lib/admin/billing";
import { getThemeColor } from "@/lib/media-library";
import { BOOKING_URL } from "@/lib/site-config";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";

export const metadata = { title: "Get started · Noni" };
export const dynamic = "force-dynamic";

/* Where every company without a plan lands (the dashboard sends it here):
   do it yourself (plans) or done for you (a call). A company with a plan
   never sees it. */
export default async function StartPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { userId, profile } = await getSessionProfile();
  if (!userId) redirect("/login?next=/start");
  const companyId = profile?.active_company_id;
  if (!companyId || !isCompanyAdmin(profile)) redirect("/admin");

  const access = await companyPlanAccess(companyId);
  if (access.entitled || access.status === "past_due" || access.status === "unpaid") redirect("/admin");

  const [{ data: company }, themeColor, { data: auth }] = await Promise.all([
    createServiceClient().from("companies").select("name, intake").eq("id", companyId).maybeSingle(),
    getThemeColor(companyId),
    (await createClient()).auth.getUser(),
  ]);
  const intake = (company?.intake as { campaigns_run_by?: unknown; call_booked_at?: unknown } | null) ?? {};
  const runBy = intake.campaigns_run_by;

  const sp = await searchParams;
  const initialStep: StartStep =
    sp.checkout === "success"
      ? "paid"
      : sp.step === "plans"
        ? "plans"
        : runBy === "noni"
          ? intake.call_booked_at
            ? "booked"
            : "call"
          : runBy === "me" || runBy === "team"
            ? "plans"
            : "choose";

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
    />
  );
}
