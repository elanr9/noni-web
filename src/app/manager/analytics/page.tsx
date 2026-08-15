import { ManagerAnalyticsView } from "@/components/manager/analytics/ManagerAnalyticsView";
import { getSessionProfile } from "@/lib/auth";
import { getManagerAnalytics } from "@/lib/manager/analytics";
import { getManagerContext } from "@/lib/manager/context";

/* The layout gate guarantees a campaign manager with a company; company
   scope always comes from the session profile, never from the client. */
export default async function ManagerAnalyticsPage() {
  const { profile } = await getSessionProfile();
  const companyId = profile?.company_id ?? "";
  const [data, context] = await Promise.all([
    getManagerAnalytics(companyId),
    getManagerContext(companyId),
  ]);

  return <ManagerAnalyticsView data={data} access={context.access} />;
}
