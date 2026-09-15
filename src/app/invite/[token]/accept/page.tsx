import { redirect } from "next/navigation";

import { getSessionProfile } from "@/lib/auth";
import { createServiceClient } from "@/lib/supabase/service";
import { AcceptInvite } from "../AcceptInvite";
import { AdminInviteGate } from "../InviteAuth";

type PageProps = {
  params: Promise<{ token: string }>;
};

type InviteRole = "company_admin" | "campaign_manager" | "creator";

function toInviteRole(role: string | null): InviteRole {
  if (role === "company_admin" || role === "creator") return role;
  return "campaign_manager";
}

type AcceptInviteRow = {
  company_id: string;
  email: string;
  role: string | null;
  accepted_at: string | null;
  companies: { name: string } | null;
};

// Web acceptance. First-time sign-ins are handled by the invite-aware signup
// trigger, which consumes the invite during Google sign-up; in that case the
// profile already matches and we route straight to the right place. Admin
// invites accept automatically once the right Google account is signed in
// (wrong accounts get the switch screen); other roles accept explicitly.
export default async function InviteAcceptPage({ params }: PageProps) {
  const { token } = await params;
  const { userId, profile } = await getSessionProfile();

  const service = createServiceClient();
  const { data } = await service
    .from("company_invites")
    .select("company_id, email, role, accepted_at, companies(name)")
    .eq("token", token)
    .maybeSingle();
  const invite = data as AcceptInviteRow | null;

  if (!invite) redirect(`/invite/${token}`);

  const isAdminInvite = invite.role === "company_admin";

  if (!userId) {
    // The admin landing owns Google sign-in; other roles go through /login.
    if (isAdminInvite) redirect(`/invite/${token}`);
    redirect(`/login?next=/invite/${token}/accept`);
  }

  /* Membership, not the active company, decides whether this account already
     belongs here: someone working for two companies keeps both. */
  const { data: membership } = profile
    ? await service
        .from("company_roster")
        .select("member_role")
        .eq("company_id", invite.company_id)
        .eq("id", profile.id)
        .maybeSingle()
    : { data: null };

  if (profile && membership && membership.member_role === invite.role) {
    if (isAdminInvite) {
      redirect(profile.onboarded ? "/admin" : "/onboarding");
    }
    redirect("/invite/" + token);
  }

  const hasOtherCompany = Boolean(
    profile?.active_company_id && profile.active_company_id !== invite.company_id,
  );

  if (isAdminInvite) {
    // Consumed by someone else; the landing shows the already-used state.
    if (invite.accepted_at) redirect(`/invite/${token}`);
    return (
      <AdminInviteGate
        token={token}
        companyName={invite.companies?.name ?? "your company"}
        invitedEmail={invite.email}
        currentEmail={profile?.email ?? ""}
      />
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-soft px-5">
      <div className="w-full max-w-md rounded-[28px] border border-line bg-white p-8 shadow-sm">
        <AcceptInvite
          token={token}
          email={profile?.email ?? "your account"}
          invitedEmail={invite.email}
          role={toInviteRole(invite.role)}
          companyName={invite.companies?.name ?? "this company"}
          hasOtherCompany={hasOtherCompany}
        />
      </div>
    </div>
  );
}
