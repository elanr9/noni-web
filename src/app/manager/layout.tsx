import Link from "next/link";
import { redirect } from "next/navigation";

import { ManagerShell } from "@/components/manager/ManagerShell";
import {
  getSessionProfile,
  isCampaignManager,
  isCompanyAdmin,
  isPlatformAdmin,
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
  if (isCompanyAdmin(profile)) redirect("/admin");
  if (!isCampaignManager(profile) || !profile?.company_id) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-soft px-5">
        <div className="max-w-md rounded-[28px] border border-line bg-white p-8 text-center shadow-sm">
          <h1 className="display text-3xl font-semibold text-ink">
            Campaign managers only
          </h1>
          <p className="mt-3 text-[15px] text-muted">
            This account is signed in but is not a campaign manager. Creators
            run their work from the Noni app. If you should have access, ask
            your company admin for an invite.
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

  const [context, people, reviewCount] = await Promise.all([
    getManagerContext(profile.company_id),
    listCompanyCreators(profile.company_id),
    countReviewQueue(profile.company_id),
  ]);

  return (
    <ManagerShell
      companyName={context.companyName}
      name={profile.full_name}
      people={people}
      reviewCount={reviewCount}
    >
      {children}
    </ManagerShell>
  );
}
