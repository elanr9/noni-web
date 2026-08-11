import Link from "next/link";
import { redirect } from "next/navigation";
import { OpsShell } from "@/components/ops/OpsShell";
import { getSessionProfile, isPlatformAdmin } from "@/lib/auth";

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
            This account is signed in but is not the Noni platform ops account. Sign in
            with the ops account to continue.
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

  return <OpsShell name={profile?.full_name}>{children}</OpsShell>;
}
