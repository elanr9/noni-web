import { getSessionProfile } from "@/lib/auth";

export default async function SettingsPage() {
  const { profile } = await getSessionProfile();

  return (
    <div>
      <h1 className="display text-3xl font-semibold text-ink md:text-4xl">Settings</h1>
      <p className="mt-1 text-[15px] text-muted">Account and workspace details.</p>

      <div className="mt-8 max-w-xl rounded-[24px] border border-line bg-white p-6">
        <dl className="space-y-4 text-sm">
          <div>
            <dt className="font-semibold text-muted">Name</dt>
            <dd className="mt-1 text-ink">{profile?.full_name ?? "—"}</dd>
          </div>
          <div>
            <dt className="font-semibold text-muted">Role</dt>
            <dd className="mt-1 text-ink">{profile?.role ?? "—"}</dd>
          </div>
          <div>
            <dt className="font-semibold text-muted">Company</dt>
            <dd className="mt-1 break-all text-ink">{profile?.company_id ?? "—"}</dd>
          </div>
          <div>
            <dt className="font-semibold text-muted">Email</dt>
            <dd className="mt-1 text-ink">{profile?.email ?? "—"}</dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
