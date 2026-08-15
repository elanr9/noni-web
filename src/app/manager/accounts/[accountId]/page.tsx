import { redirect } from "next/navigation";

import { AccountApprovalView } from "@/components/manager/review/AccountApprovalView";
import { getSessionProfile } from "@/lib/auth";
import { getAccountApprovalDetail } from "@/lib/manager/review";

/* Account approval detail, ported from the mobile account approval screen
   (app/(admin)/account-approval/[accountId].tsx): the five evidence cards
   with signed media, Approve and link or Send back with reasons. */
export default async function AccountApprovalPage({
  params,
}: {
  params: Promise<{ accountId: string }>;
}) {
  const { accountId } = await params;
  const { profile } = await getSessionProfile();
  if (!profile?.company_id) redirect("/login?next=/manager");

  const detail = await getAccountApprovalDetail(profile.company_id, accountId);
  return <AccountApprovalView detail={detail} />;
}
