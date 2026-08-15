import { WeekSetupView } from "@/components/manager/briefs/WeekSetupView";
import { getSessionProfile } from "@/lib/auth";
import { listCampaigns } from "@/lib/manager/briefs";

/* Week setup: pick the start day and each lane's target, then the grid is
   stamped from the post types' default_week_count weights scaled to those
   targets. Ported from the mobile week-setup screen. */
export default async function WeekSetupPage() {
  const { profile } = await getSessionProfile();
  const companyId = profile?.company_id ?? "";
  const campaigns = await listCampaigns(companyId);

  return <WeekSetupView weekNumber={campaigns.length + 1} />;
}
