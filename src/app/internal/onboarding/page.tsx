import { OnboardingFlow } from "@/components/admin/onboarding/OnboardingFlow";
import { ONBOARDING_STEPS } from "@/lib/admin/onboarding-steps";
import { MOCK_DATASET } from "@/lib/admin/mock-data";

/* Dev preview of the onboarding flow on the mock brain (run with
   ADMIN_QA_MOCK=1; without it every save fails its gate, which shows the
   error states). 404 in production through the /internal layout.
   ?step=website opens on that step; ?scan=running|done|failed starts with a
   scan in that state (step=scan shows the questions under it). */
export default async function OnboardingPreviewPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const wanted = params.step;
  const scanState = typeof params.scan === "string" ? params.scan : null;
  const step = ONBOARDING_STEPS.find((s) => s === wanted) ?? "welcome";
  return (
    <OnboardingFlow
      companyId={MOCK_DATASET.company.id}
      companyName={MOCK_DATASET.company.name}
      defaultName="Riley Chen"
      defaultWebsite="fieldvision.ai"
      initialScan={
        scanState === "running" || scanState === "done" || scanState === "failed"
          ? {
              started: true,
              ingest: {
                status: scanState,
                phase: scanState === "running" ? "extract" : "done",
                progress: { done: ["website:https://fieldvision.ai/"], failed: [], notes: [] },
                error: scanState === "failed" ? "The site did not answer." : null,
              },
              summary: {
                sources: 9,
                sources_pending: scanState === "running" ? 6 : 0,
                facts: scanState === "running" ? 14 : 46,
                facts_confirmed: 0,
                conflicts_open: 0,
                coverage: 0.3,
                missing: [],
              },
            }
          : null
      }
      email="riley@fieldvision.ai"
      resume={{
        step,
        role: "Founder",
        doesUgc: null,
        creatorCount: 0,
        managerCount: 0,
        selfIsManager: null,
      }}
    />
  );
}
