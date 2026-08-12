import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getSessionProfile, isCompanyAdmin, isPlatformAdmin } from "@/lib/auth";
import type { Permissions } from "@/lib/permissions";
import { InviteManagerForm, InviteRowActions, MemberPermissions } from "./TeamPanels";

export const metadata = { title: "Team · Noni" };

type MemberRow = {
  profile_id: string;
  permissions: Permissions;
  created_at: string;
  profiles: { id: string; full_name: string | null; role: string } | null;
};

type InviteRow = {
  id: string;
  email: string;
  role: string;
  created_at: string;
  expires_at: string;
};

export default async function TeamPage() {
  const { userId, profile } = await getSessionProfile();
  if (!userId) redirect("/login?next=/admin/team");
  if (!isCompanyAdmin(profile) && !isPlatformAdmin(profile)) redirect("/admin");

  const supabase = await createClient();
  const [{ data: members }, { data: invites }] = await Promise.all([
    supabase
      .from("company_members")
      .select("profile_id, permissions, created_at, profiles:profile_id (id, full_name, role)")
      .eq("company_id", profile!.company_id!)
      .order("created_at", { ascending: true }),
    supabase
      .from("company_invites")
      .select("id, email, role, created_at, expires_at")
      .eq("company_id", profile!.company_id!)
      .is("accepted_at", null)
      .gt("expires_at", new Date().toISOString())
      .order("created_at", { ascending: false }),
  ]);

  const rows = (members ?? []) as unknown as MemberRow[];
  const managers = rows.filter((m) => m.profiles?.role === "campaign_manager");
  const pending = (invites ?? []) as InviteRow[];

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="display text-3xl font-semibold text-ink">Team</h1>
      <p className="mt-1 text-[15px] text-muted">
        Campaign managers work from the Noni app. Their toggles below control what
        they can change about the company; everything is enforced server side.
      </p>

      <section className="mt-8">
        <h2 className="display text-xl font-semibold text-ink">Campaign managers</h2>
        {managers.length === 0 ? (
          <div className="mt-3 rounded-2xl border border-dashed border-line bg-soft/50 p-8 text-center">
            <p className="text-[15px] font-semibold text-ink">No campaign managers yet</p>
            <p className="mt-1 text-[14px] text-muted">
              Invite one below. They download the Noni app, sign in with Google on the
              invited email, and land in your company automatically.
            </p>
          </div>
        ) : (
          <div className="mt-3 space-y-4">
            {managers.map((member) => (
              <div
                key={member.profile_id}
                className="rounded-2xl border border-line bg-white p-5"
              >
                <div className="flex items-baseline justify-between gap-3">
                  <div className="text-[15px] font-bold text-ink">
                    {member.profiles?.full_name ?? "Unnamed manager"}
                  </div>
                  <div className="text-[12px] text-muted">
                    joined {new Date(member.created_at).toLocaleDateString()}
                  </div>
                </div>
                <div className="mt-4">
                  <MemberPermissions
                    profileId={member.profile_id}
                    initial={member.permissions ?? {}}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="mt-10">
        <h2 className="display text-xl font-semibold text-ink">Pending invites</h2>
        {pending.length === 0 ? (
          <p className="mt-3 text-[14px] text-muted">No pending invites.</p>
        ) : (
          <div className="mt-3 divide-y divide-line rounded-2xl border border-line bg-white">
            {pending.map((invite) => (
              <div
                key={invite.id}
                className="flex flex-wrap items-center justify-between gap-3 px-5 py-4"
              >
                <div>
                  <div className="text-[14px] font-semibold text-ink">{invite.email}</div>
                  <div className="text-[12px] text-muted">
                    sent {new Date(invite.created_at).toLocaleDateString()} · expires{" "}
                    {new Date(invite.expires_at).toLocaleDateString()}
                  </div>
                </div>
                <InviteRowActions inviteId={invite.id} />
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="mt-10 rounded-2xl border border-line bg-white p-6">
        <h2 className="display text-xl font-semibold text-ink">
          Invite a campaign manager
        </h2>
        <div className="mt-4">
          <InviteManagerForm />
        </div>
      </section>
    </div>
  );
}
