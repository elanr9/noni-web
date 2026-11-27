import { redirect } from "next/navigation";

import { AdminShell, type AdminSearchPerson } from "@/components/admin/AdminShell";
import { TourHost } from "@/components/admin/tour/TourHost";
import { SwitchCompanyGate } from "@/components/SwitchCompanyGate";
import {
  getSessionProfile,
  isCampaignManager,
  isCompanyAdmin,
  isPlatformAdmin,
  isPlatformOnly,
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
  /* The noni platform account runs the ops console. It opens a company
     dashboard only for a company it has joined. */
  if (isPlatformOnly(profile)) redirect("/ops");
  /* Campaign managers get their own dashboard. */
  if (isCampaignManager(profile)) redirect("/manager");
  /* Company admins run this dashboard; everyone else gets a friendly gate. */
  if (!isCompanyAdmin(profile)) {
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
  /* The onboarding chat comes first, then the call with the founders: the
     dashboard opens once the company has started the plan agreed on it
     (/start), or ops has put it on a plan or marked it a pilot. A renewal
     that failed keeps the dashboard open with the payment strip. */
  if (isCompanyAdmin(profile) && !profile?.onboarded) redirect("/onboarding");
  const access = await companyPlanAccess(profile?.active_company_id ?? "");
  if (!access.entitled && access.status !== "past_due" && access.status !== "unpaid") redirect("/start");

  const data = await getAdminData(profile?.active_company_id ?? "");
  const setup = deriveSetupStatus(data);
  /* A renewal Stripe could not charge. */
  const sub = data.billing.subscription;
  const planBanner = sub.status === "past_due" || sub.status === "unpaid" ? ("payment_failed" as const) : null;
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
      platform={isPlatformAdmin(profile)}
      companies={companies}
      planBanner={planBanner}
    >
      {children}
      <TourHost />
    </AdminShell>
  );
}
