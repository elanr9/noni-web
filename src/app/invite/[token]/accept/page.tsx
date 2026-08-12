import { redirect } from "next/navigation";
import { getSessionProfile } from "@/lib/auth";
import { createServiceClient } from "@/lib/supabase/service";
import { AcceptInvite } from "../AcceptInvite";

type PageProps = {
  params: Promise<{ token: string }>;
};

// Web acceptance. First-time sign-ins are handled by the invite-aware signup
// trigger, which consumes the invite during Google sign-up; in that case the
// profile already matches and we route straight to the right place. Existing
// accounts accept explicitly below.
export default async function InviteAcceptPage({ params }: PageProps) {
  const { token } = await params;
  const { userId, profile } = await getSessionProfile();
  if (!userId) redirect(`/login?next=/invite/${token}/accept`);

  const service = createServiceClient();
  const { data: invite } = await service
    .from("company_invites")
    .select("company_id, role, accepted_at")
    .eq("token", token)
    .maybeSingle();

  if (
    invite &&
    profile &&
    profile.company_id === invite.company_id &&
    profile.role === invite.role
  ) {
    if (invite.role === "company_admin") {
      redirect(profile.onboarded ? "/admin" : "/onboarding");
    }
    redirect("/invite/" + token);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-soft px-5">
      <div className="w-full max-w-md rounded-[28px] border border-line bg-white p-8 shadow-sm">
        <AcceptInvite
          token={token}
          email={profile?.email ?? "your account"}
          role={invite?.role === "company_admin" ? "company_admin" : "campaign_manager"}
        />
      </div>
    </div>
  );
}
