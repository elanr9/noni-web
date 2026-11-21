import { AnalyticsView } from "@/components/admin/analytics/AnalyticsView";
import { getAdminData } from "@/lib/admin/data";
import { getInsights } from "@/lib/admin/insights-data";
import { getSessionProfile } from "@/lib/auth";

export default async function AdminAnalyticsPage() {
  const { profile } = await getSessionProfile();
  const companyId = profile?.active_company_id ?? "";
  const [data, insights] = await Promise.all([getAdminData(companyId), getInsights(companyId)]);

  return <AnalyticsView insights={insights} posts={data.posts} dayActivity={data.dayActivity} />;
}
