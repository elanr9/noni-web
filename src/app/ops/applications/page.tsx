import { ApplicationsView } from "@/components/ops/applications/ApplicationsView";
import type { ReviewApplication } from "@/lib/applications";
import { callEdgeFunction } from "@/lib/edge";

export const dynamic = "force-dynamic";

/* Everyone who applied on /apply. The layout already limits /ops to the
   platform admin; the function checks again. */
export default async function OpsApplicationsPage() {
  const result = await callEdgeFunction<{ applications: ReviewApplication[] }>("apply-chat", { action: "list" });
  return (
    <ApplicationsView
      applications={result.error === null ? result.data.applications : []}
      loadError={result.error}
    />
  );
}
