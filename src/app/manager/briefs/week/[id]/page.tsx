import { notFound } from "next/navigation";

import { briefWeekStatus } from "@/components/manager/briefs/lib";
import { WeekDetailView } from "@/components/manager/briefs/WeekDetailView";
import { getSessionProfile } from "@/lib/auth";
import {
  getCampaign,
  listCampaignBriefs,
  listWeekPosts,
  weekNumberOf,
  weekStatsFor,
} from "@/lib/manager/briefs";
import { getManagerContext } from "@/lib/manager/context";

/* One week's detail, ported from the mobile week screen. Next week is the
   planning entry: an empty state until week setup stamps the grid, then
   lanes, split chips and the stamped rows. Done weeks open the past-brief
   archive with the day drill-in. */
export default async function WeekDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { profile } = await getSessionProfile();
  const companyId = profile?.company_id ?? "";

  const campaign = await getCampaign(companyId, id);
  if (!campaign) notFound();

  const isDone = briefWeekStatus(campaign).status === "done";
  const [context, weekNumber, items, posts, stats] = await Promise.all([
    getManagerContext(companyId),
    weekNumberOf(companyId, campaign.id),
    listCampaignBriefs(companyId, campaign.id),
    isDone ? listWeekPosts(companyId, campaign.id) : Promise.resolve(null),
    isDone ? weekStatsFor(companyId, campaign) : Promise.resolve(null),
  ]);

  return (
    <WeekDetailView
      campaign={campaign}
      weekNumber={weekNumber}
      items={items}
      posts={posts}
      stats={stats}
      showSales={context.access.viewFinancials}
    />
  );
}
