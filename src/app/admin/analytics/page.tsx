import { AnalyticsView } from "@/components/admin/analytics/AnalyticsView";
import { getAdminData } from "@/lib/admin/data";
import { getSessionProfile } from "@/lib/auth";

export default async function AdminAnalyticsPage() {
  const { profile } = await getSessionProfile();
  const data = await getAdminData(profile?.company_id ?? "");

  return (
    <AnalyticsView
      statStrip={data.statStrip}
      posts={data.posts}
      creators={data.creators}
      dayActivity={data.dayActivity}
      weeklyViews={data.weeklyViews}
    />
  );
}
