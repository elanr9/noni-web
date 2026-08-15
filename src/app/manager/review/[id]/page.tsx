import { redirect } from "next/navigation";

import { PostReviewView } from "@/components/manager/review/PostReviewView";
import { getSessionProfile } from "@/lib/auth";
import { getPostReviewDetail } from "@/lib/manager/review";

/* Post review detail, ported from the mobile review screen
   (app/(admin)/review/[id].tsx): the finished 9:16 edit, the brief context,
   Approve and Request changes with notes per spoken section. */
export default async function PostReviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { profile } = await getSessionProfile();
  if (!profile?.company_id) redirect("/login?next=/manager");

  const detail = await getPostReviewDetail(profile.company_id, id);
  return <PostReviewView detail={detail} />;
}
