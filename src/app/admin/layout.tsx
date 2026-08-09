import { redirect } from "next/navigation";
import { AdminShell } from "@/components/admin/AdminShell";
import { getSessionProfile, isAdmin } from "@/lib/auth";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId, profile } = await getSessionProfile();
  if (!userId) redirect("/login?next=/admin");
  if (!isAdmin(profile)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-soft px-5">
        <div className="max-w-md rounded-[28px] border border-line bg-white p-8 text-center shadow-sm">
          <h1 className="display text-3xl font-semibold text-ink">Admin only</h1>
          <p className="mt-3 text-[15px] text-muted">
            This account is signed in but is not an admin. Use the Noni mobile app as a
            creator, or sign in with an admin account.
          </p>
          <a
            href="/"
            className="mt-6 inline-flex rounded-full bg-ink px-5 py-3 text-sm font-bold text-white"
          >
            Back home
          </a>
        </div>
      </div>
    );
  }

  return <AdminShell name={profile?.full_name}>{children}</AdminShell>;
}
