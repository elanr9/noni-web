import { redirect } from "next/navigation";

import { MusicApprovalView } from "@/components/manager/review/MusicApprovalView";
import { getSessionProfile } from "@/lib/auth";
import { getMusicApprovalDetail } from "@/lib/manager/review";

/* Music approval detail, ported from the mobile music screen
   (app/(admin)/music/[id].tsx): check the song on the live slideshow, then
   Accept Song or Request Changes with the multi select reasons. */
export default async function MusicApprovalPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { profile } = await getSessionProfile();
  if (!profile?.company_id) redirect("/login?next=/manager");

  const detail = await getMusicApprovalDetail(profile.company_id, id);
  return <MusicApprovalView detail={detail} />;
}
