import { OverviewView } from "@/components/ops/OverviewView";
import { getOpsData } from "@/lib/ops/data";

export default async function OpsOverviewPage() {
  const data = await getOpsData();
  return (
    <OverviewView
      companies={data.companies}
      people={data.people}
      posts={data.posts}
      platformStats={data.platformStats}
    />
  );
}
