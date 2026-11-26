import { redirect } from "next/navigation";

import { ReviewHome } from "@/components/manager/review/ReviewHome";
import { getSessionProfile } from "@/lib/auth";
import { listReviewQueues } from "@/lib/manager/review";

import { loadApplicants } from "./market/actions";

/* Review home: everything waiting on the campaign manager, mirroring the
   mobile Review tab's lanes (posts, creators, music, accounts). The layout gate
   has already verified the campaign manager role. */
export default async function ManagerReviewPage() {
  const { profile } = await getSessionProfile();
  if (!profile?.active_company_id) redirect("/login?next=/manager");

  const [queues, applicants] = await Promise.all([listReviewQueues(profile.active_company_id), loadApplicants()]);
  return (
    <ReviewHome
      posts={queues.posts}
      music={queues.music}
      accounts={queues.accounts}
      applicants={applicants.rows}
      wanted={applicants.wanted}
    />
  );
}
