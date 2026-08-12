import Link from "next/link";
import { redirect } from "next/navigation";
import { AdminShell } from "@/components/admin/AdminShell";
import { canUseWebDashboard, getSessionProfile, isCompanyAdmin } from "@/lib/auth";

const APP_STORE_URL =
  process.env.NEXT_PUBLIC_APP_STORE_URL ?? "https://apps.apple.com";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId, profile } = await getSessionProfile();
  if (!userId) redirect("/login?next=/admin");

  if (!canUseWebDashboard(profile)) {
    const isManager = profile?.role === "campaign_manager";
    return (
      <div className="flex min-h-screen items-center justify-center bg-soft px-5">
        <div className="max-w-md rounded-[28px] border border-line bg-white p-8 text-center shadow-sm">
          <h1 className="display text-3xl font-semibold text-ink">
            {isManager ? "Noni lives in the app for you" : "Company admins only"}
          </h1>
          <p className="mt-3 text-[15px] text-muted">
            {isManager
              ? "Campaign managers run briefs, review, and creators from the Noni iOS app. Sign in there with this same Google account."
              : "This dashboard is for company admins. Creators and campaign managers use the Noni iOS app."}
          </p>
          <a
            href={APP_STORE_URL}
            className="mt-6 inline-flex rounded-full bg-ink px-5 py-3 text-sm font-bold text-white"
          >
            Get the app
          </a>
          <div className="mt-3">
            <Link href="/" className="text-sm font-semibold text-muted hover:text-ink">
              Back home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (isCompanyAdmin(profile) && !profile?.onboarded) {
    redirect("/onboarding");
  }

  return (
    <AdminShell name={profile?.full_name} role={profile?.role ?? null}>
      {children}
    </AdminShell>
  );
}
