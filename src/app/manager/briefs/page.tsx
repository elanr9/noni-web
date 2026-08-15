import { BriefsIndexView } from "@/components/manager/briefs/BriefsIndexView";
import { getSessionProfile } from "@/lib/auth";
import { listBriefWeeks, listCampaignManagers } from "@/lib/manager/briefs";
import { getManagerContext } from "@/lib/manager/context";

/* The Briefs tab: week list plus calendar view, ported from the mobile
   calendar screen. The layout gate already verified the campaign manager
   role; reads run on the service client scoped by the session company. */
export default async function ManagerBriefsPage() {
  const { profile } = await getSessionProfile();
  const companyId = profile?.company_id ?? "";
  const [context, weeks, managers] = await Promise.all([
    getManagerContext(companyId),
    listBriefWeeks(companyId),
    listCampaignManagers(companyId),
  ]);

  return (
    <BriefsIndexView
      weeks={weeks}
      managers={managers}
      meId={profile?.id ?? ""}
      showSales={context.access.viewFinancials}
    />
  );
}
