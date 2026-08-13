import Link from "next/link";
import { redirect } from "next/navigation";

import { AchievementHost } from "@/components/admin/achievements/AchievementHost";
import { AdminShell, type AdminSearchPerson } from "@/components/admin/AdminShell";
import { TourHost } from "@/components/admin/tour/TourHost";
import {
  canUseWebDashboard,
  getSessionProfile,
  isCompanyAdmin,
  isPlatformAdmin,
} from "@/lib/auth";
import { getAdminData } from "@/lib/admin/data";
import { deriveSetupStatus } from "@/lib/admin/setup";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  /* TEMPORARY QA BYPASS — visual QA only. Remove before finishing. */
  const qaBypass =
    process.env.NODE_ENV === "development" &&
    process.env.ADMIN_QA_BYPASS === "1";
  const { userId, profile } = qaBypass
    ? { userId: "qa-bypass", profile: null }
    : await getSessionProfile();
  if (!userId) redirect("/login?next=/admin");
  if (!qaBypass) {
    /* The noni platform account runs the ops console, not the company
       dashboard. It has no company here, so /admin is always wrong for it. */
    if (isPlatformAdmin(profile)) redirect("/ops");
    /* Company admins run this dashboard; everyone else gets a friendly gate. */
    if (!canUseWebDashboard(profile)) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-soft px-5">
          <div className="max-w-md rounded-[28px] border border-line bg-white p-8 text-center shadow-sm">
            <h1 className="display text-3xl font-semibold text-ink">
              Company admins only
            </h1>
            <p className="mt-3 text-[15px] text-muted">
              This account is signed in but is not a company admin. Campaign
              managers and creators run their work from the Noni app. If you
              should have admin access, ask your company admin for an invite.
            </p>
            <Link
              href="/"
              className="mt-6 inline-flex rounded-full bg-ink px-5 py-3 text-sm font-bold text-white"
            >
              Back home
            </Link>
          </div>
        </div>
      );
    }
    /* Agent B owns the onboarding question flow. */
    if (isCompanyAdmin(profile) && !profile?.onboarded) redirect("/onboarding");
  }

  const data = await getAdminData(profile?.company_id ?? "");
  const setup = deriveSetupStatus(data);
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
