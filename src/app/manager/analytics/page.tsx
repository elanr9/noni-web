import { redirect } from "next/navigation";
import { ManagerAnalyticsView } from "@/components/manager/analytics/ManagerAnalyticsView";
import { getSessionProfile } from "@/lib/auth";
import { getManagerAnalytics, listApprovedCreators } from "@/lib/manager/analytics";
import { getManagerContext } from "@/lib/manager/context";

/* The layout gate guarantees a campaign manager with a company; company
   scope always comes from the session profile, never from the client. */
export default async function ManagerAnalyticsPage() {
  const { profile } = await getSessionProfile();
  if (!profile?.company_id) redirect("/login?next=/manager");
  const companyId = profile.company_id;
  const [data, context, approvedCreators] = await Promise.all([
    getManagerAnalytics(companyId),
    getManagerContext(companyId),
    listApprovedCreators(companyId),
  ]);

  return (
    <ManagerAnalyticsView
      data={data}
      access={context.access}
      approvedCreators={approvedCreators}
    />
  );
}
