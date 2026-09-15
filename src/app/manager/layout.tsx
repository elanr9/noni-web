import { redirect } from "next/navigation";

import { ManagerShell } from "@/components/manager/ManagerShell";
import { SwitchCompanyGate } from "@/components/SwitchCompanyGate";
import {
  getSessionProfile,
  isCampaignManager,
  isCompanyAdmin,
  isPlatformAdmin,
  listCompanySummaries,
} from "@/lib/auth";
import {
  countReviewQueue,
  getManagerContext,
  listCompanyCreators,
} from "@/lib/manager/context";

export default async function ManagerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId, profile } = await getSessionProfile();
  if (!userId) redirect("/login?next=/manager");
  if (isPlatformAdmin(profile)) redirect("/ops");
  const adminViewer = isCompanyAdmin(profile);
  const companies = await listCompanySummaries();
  if (
    !profile?.active_company_id ||
    (!adminViewer && !isCampaignManager(profile))
  ) {
    const canSwitch = companies.some(
      (c) => c.role === "campaign_manager" || c.role === "company_admin",
    );
    return (
      <SwitchCompanyGate
        title="Campaign managers only"
        body={
          canSwitch
            ? "This company has you as a creator, which runs from the Noni app. Pick one of your other companies to manage it here."
            : "This account is signed in but is not a campaign manager. Creators run their work from the Noni app. If you should have access, ask your company admin for an invite."
        }
        companies={canSwitch ? companies : []}
        wanted={["campaign_manager", "company_admin"]}
      />
    );
  }

  const [context, people, reviewCount] = await Promise.all([
    getManagerContext(profile.active_company_id),
    listCompanyCreators(profile.active_company_id),
    countReviewQueue(profile.active_company_id),
  ]);

  /* A company admin works this dashboard only when onboarding said they
     also run campaigns themselves; they switch versions from the sidebar
     footer. Other admins belong on /admin. */
  if (adminViewer && !context.selfIsManager) redirect("/admin");

  return (
    <ManagerShell
      companyName={context.companyName}
      name={profile.full_name}
      people={people}
      reviewCount={reviewCount}
      roleLabel={adminViewer ? "Company admin" : "Campaign manager"}
      dualRole={adminViewer && context.selfIsManager}
      companies={companies}
    >
      {children}
    </ManagerShell>
  );
}
