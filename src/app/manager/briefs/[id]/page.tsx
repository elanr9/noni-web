import { notFound, redirect } from "next/navigation";

import { BriefEditor } from "@/components/manager/briefs/BriefEditor";
import { getSessionProfile } from "@/lib/auth";
import {
  briefCampaignLink,
  getBrief,
  getHashtagBank,
  listBriefSegments,
  listLibraryMediaOptions,
  listPostTypes,
  segmentScreenshotUrls,
  weekNumberOf,
} from "@/lib/manager/briefs";

/* Brief detail and editor, ported from the mobile post editor. All fields
   on one page at web fidelity: title and type, search phrase, hook options,
   CTA, talking points, caption and hashtags, text overlay, and the derived
   clips (brief_segments). AI assist is on demand, never on open. */
export default async function BriefDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { profile } = await getSessionProfile();
  if (!profile?.company_id) redirect("/login?next=/manager");
  const companyId = profile.company_id;

  const brief = await getBrief(companyId, id);
  if (!brief) notFound();

  const [postTypes, segments, hashtagBank, link, mediaLibrary] = await Promise.all([
    listPostTypes(companyId),
    listBriefSegments(companyId, id),
    getHashtagBank(companyId),
    briefCampaignLink(companyId, id),
    listLibraryMediaOptions(companyId),
  ]);
  const [screenshotUrls, weekNumber] = await Promise.all([
    segmentScreenshotUrls(segments),
    link ? weekNumberOf(companyId, link.campaignId) : Promise.resolve(null),
  ]);

  return (
    <BriefEditor
      brief={brief}
      postTypes={postTypes}
      initialSegments={segments}
      initialScreenshotUrls={screenshotUrls}
      hashtagBank={hashtagBank}
      mediaLibrary={mediaLibrary}
      campaignId={link?.campaignId ?? null}
      postNumber={link && link.position !== null ? link.position + 1 : null}
      weekNumber={weekNumber}
    />
  );
}
