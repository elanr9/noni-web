import { redirect } from "next/navigation";
import { getSessionProfile } from "@/lib/auth";
import { AcceptInvite } from "./AcceptInvite";

type PageProps = {
  params: Promise<{ token: string }>;
};

export default async function InvitePage({ params }: PageProps) {
  const { token } = await params;
  const { userId, profile } = await getSessionProfile();
  if (!userId) redirect(`/login?next=/invite/${token}`);

  return (
    <div className="flex min-h-screen items-center justify-center bg-soft px-5">
      <div className="w-full max-w-md rounded-[28px] border border-line bg-white p-8 shadow-sm">
        <AcceptInvite token={token} email={profile?.email ?? "your account"} />
      </div>
    </div>
  );
}
