import { AdminShell } from "@/components/admin/AdminShell";
import { AnalyticsView } from "@/components/admin/analytics/AnalyticsView";
import { ANALYTICS_TABS, RANGES } from "@/lib/admin/insights";
import { emptyInsights, mockInsights } from "@/lib/admin/insights-mock";
import { MOCK_DATASET } from "@/lib/admin/mock-data";

/* Dev preview of Analytics on sample numbers. 404 in production through
   the /internal layout. ?empty=1 shows a company with nothing live and
   nothing connected; ?signups=0 hides sign-ups and revenue;
   ?tab= and ?range= pick where it opens. */
export default async function AnalyticsPreviewPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const insights = params.empty ? emptyInsights() : mockInsights();
  if (params.signups === "0") {
    insights.signupsOn = false;
    insights.salesOn = false;
  }
  return (
    <AdminShell
      companyName={MOCK_DATASET.company.name}
      name="Riley Chen"
      people={[]}
      setupRemaining={0}
      setupComplete
    >
      <AnalyticsView
        initialTab={ANALYTICS_TABS.find((t) => t === params.tab)}
        initialRange={RANGES.find((r) => r === params.range)}
        insights={insights}
        posts={MOCK_DATASET.posts}
        dayActivity={MOCK_DATASET.dayActivity}
      />
    </AdminShell>
  );
}
