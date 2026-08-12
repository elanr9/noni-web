import { notFound } from "next/navigation";

import { MemberProfile } from "@/components/admin/team/MemberProfile";
import { getAdminData } from "@/lib/admin/data";
import { getSessionProfile } from "@/lib/auth";

/* Member profile: always a full page, never a modal (ProfilePage in
   AdminAnalytics.jsx). Invite-sent rows resolve too; their ids are the
   invite-prefixed Member ids from the dataset. */
export default async function MemberProfilePage({
  params,
}: {
  params: Promise<{ memberId: string }>;
}) {
  const { memberId } = await params;
  const { profile } = await getSessionProfile();
  const data = await getAdminData(profile?.company_id ?? "");

  const member = [...data.managers, ...data.creators].find(
    (m) => m.id === memberId,
  );
  if (!member) notFound();

  const posts = data.posts
    .filter((p) => p.creator === member.name)
    .sort((a, b) => b.viewsN - a.viewsN);

  return (
    <MemberProfile
      member={member}
      companyName={data.company.name}
      posts={posts}
      briefs={data.briefs}
    />
  );
}
