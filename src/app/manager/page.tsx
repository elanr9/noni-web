import { redirect } from "next/navigation";

import { ReviewHome } from "@/components/manager/review/ReviewHome";
import { getSessionProfile } from "@/lib/auth";
import { listReviewQueues } from "@/lib/manager/review";

/* Review home: everything waiting on the campaign manager, mirroring the
   mobile Review tab's three lanes (posts, music, accounts). The layout gate
   has already verified the campaign manager role. */
export default async function ManagerReviewPage() {
  const { profile } = await getSessionProfile();
  if (!profile?.company_id) redirect("/login?next=/manager");

  const queues = await listReviewQueues(profile.company_id);
  return (
    <ReviewHome
      posts={queues.posts}
      music={queues.music}
      accounts={queues.accounts}
    />
  );
}
