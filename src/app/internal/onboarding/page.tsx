import { OnboardingFlow } from "@/components/admin/onboarding/OnboardingFlow";
import { ONBOARDING_STEPS } from "@/lib/admin/onboarding-steps";
import { MOCK_DATASET } from "@/lib/admin/mock-data";

/* Dev preview of the onboarding flow on the mock brain (run with
   ADMIN_QA_MOCK=1; without it every save fails its gate, which shows the
   error states). 404 in production through the /internal layout.
   ?step=website opens on that step. */
export default async function OnboardingPreviewPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const wanted = (await searchParams).step;
  const step = ONBOARDING_STEPS.find((s) => s === wanted) ?? "welcome";
  return (
    <OnboardingFlow
      companyId={MOCK_DATASET.company.id}
      companyName={MOCK_DATASET.company.name}
      defaultName="Riley Chen"
      defaultWebsite="fieldvision.ai"
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
