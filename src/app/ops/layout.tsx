import Link from "next/link";
import { redirect } from "next/navigation";
import { OpsShell } from "@/components/ops/OpsShell";
import { ProfileModalHost } from "@/components/ops/users/ProfileModalHost";
import { getSessionProfile, isPlatformAdmin, listCompanySummaries } from "@/lib/auth";
import { getOpsData } from "@/lib/ops/data";

export default async function OpsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId, profile } = await getSessionProfile();
  if (!userId) redirect("/login?next=/ops");
  if (!isPlatformAdmin(profile)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-soft px-5">
        <div className="max-w-md rounded-[28px] border border-line bg-white p-8 text-center shadow-sm">
          <h1 className="display text-3xl font-semibold text-ink">
            Platform ops only
          </h1>
          <p className="mt-3 text-[15px] text-muted">
            This account is not a Noni platform admin. Sign in with a Google account
            that has platform admin access to continue.
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

  const [data, memberships] = await Promise.all([getOpsData(), listCompanySummaries()]);
  /* Companies the platform account has itself joined as admin or manager. */
  const workspaces = memberships.flatMap((m) =>
    m.role === "company_admin" || m.role === "campaign_manager"
      ? [
          {
            title: m.name,
            subtitle: m.role === "company_admin" ? "Company admin" : "Campaign manager",
            href: m.role === "company_admin" ? "/admin" : "/manager",
            companyId: m.company_id,
          },
        ]
      : [],
  );
  const companyNames = Object.fromEntries(
    data.companies.map((c) => [c.id, c.name]),
  );

  return (
    <OpsShell
      name={profile?.full_name}
      workspaces={workspaces}
      searchData={{
        companies: data.companies,
        people: data.people,
        invites: data.invites,
      }}
    >
      {children}
      <ProfileModalHost companyNames={companyNames} />
    </OpsShell>
  );
}
