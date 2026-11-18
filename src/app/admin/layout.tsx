import { redirect } from "next/navigation";

import { AchievementHost } from "@/components/admin/achievements/AchievementHost";
import { AdminShell, type AdminSearchPerson } from "@/components/admin/AdminShell";
import { TourHost } from "@/components/admin/tour/TourHost";
import { SwitchCompanyGate } from "@/components/SwitchCompanyGate";
import {
  canUseWebDashboard,
  getSessionProfile,
  isCampaignManager,
  isCompanyAdmin,
  isPlatformAdmin,
  listCompanySummaries,
} from "@/lib/auth";
import { companyPlanAccess } from "@/lib/admin/billing";
import { getAdminData } from "@/lib/admin/data";
import { deriveSetupStatus } from "@/lib/admin/setup";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId, profile } = await getSessionProfile();
  if (!userId) redirect("/login?next=/admin");
  const companies = await listCompanySummaries();
  /* The noni platform account runs the ops console, not the company
     dashboard. It has no company here, so /admin is always wrong for it. */
  if (isPlatformAdmin(profile)) redirect("/ops");
  /* Campaign managers get their own dashboard. */
  if (isCampaignManager(profile)) redirect("/manager");
  /* Company admins run this dashboard; everyone else gets a friendly gate. */
  if (!canUseWebDashboard(profile)) {
    const canSwitch = companies.some((c) => c.role === "company_admin");
    return (
      <SwitchCompanyGate
        title="Company admins only"
        body={
          canSwitch
            ? "This company does not have you as its admin. Pick a company you run to open its dashboard."
            : "This account is signed in but is not a company admin. Creators run their work from the Noni app. If you should have admin access, ask your company admin for an invite."
        }
        companies={canSwitch ? companies : []}
        wanted={["company_admin"]}
      />
    );
  }
  /* Agent B owns the onboarding question flow. */
  if (isCompanyAdmin(profile) && !profile?.onboarded) redirect("/onboarding");

  const data = await getAdminData(profile?.active_company_id ?? "");
  const setup = deriveSetupStatus(data);
  /* Paywall strip (design_handoff_pricing_plans): no plan and not an
     ops-run pilot, or a renewal Stripe could not charge. */
  const sub = data.billing.subscription;
  const planBanner =
    sub.status === "past_due" || sub.status === "unpaid"
      ? ("payment_failed" as const)
      : sub.status === "none" && !(await companyPlanAccess(data.company.id)).pilot
        ? ("paywall" as const)
        : null;
  const people: AdminSearchPerson[] = [...data.managers, ...data.creators].map(
    (m) => ({ id: m.id, name: m.name, role: m.role, status: m.status }),
  );

  return (
    <AdminShell
      companyName={data.company.name}
      name={profile?.full_name}
      people={people}
      setupRemaining={setup.remaining}
      setupComplete={setup.complete}
      dualRole={data.company.onboarding.selfIsManager}
      companies={companies}
      planBanner={planBanner}
    >
      {children}
      <TourHost />
      <AchievementHost
        companyId={data.company.id}
        companyName={data.company.name}
        steps={setup.steps.map(({ key, done, title }) => ({ key, done, title }))}
        complete={setup.complete}
      />
    </AdminShell>
  );
}
