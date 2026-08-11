import { redirect } from "next/navigation";
import { getSessionProfile } from "@/lib/auth";
import { AcceptInvite } from "../AcceptInvite";

type PageProps = {
  params: Promise<{ token: string }>;
};

// Web fallback for invitees who already have a Noni account. New invitees
// are handled automatically by the invite-aware signup trigger when they
// sign in on the app.
export default async function InviteAcceptPage({ params }: PageProps) {
  const { token } = await params;
  const { userId, profile } = await getSessionProfile();
  if (!userId) redirect(`/login?next=/invite/${token}/accept`);

  return (
    <div className="flex min-h-screen items-center justify-center bg-soft px-5">
      <div className="w-full max-w-md rounded-[28px] border border-line bg-white p-8 shadow-sm">
        <AcceptInvite token={token} email={profile?.email ?? "your account"} />
      </div>
    </div>
  );
}
