import { ChatOnboarding } from "@/components/admin/onboarding/ChatOnboarding";
import { MOCK_DATASET } from "@/lib/admin/mock-data";

/* Dev preview of the onboarding conversation on a scripted Noni (run with
   ADMIN_QA_MOCK=1). 404 in production through the /internal layout. */
export default function OnboardingChatPreviewPage() {
  return <ChatOnboarding companyId={MOCK_DATASET.company.id} email="riley@fieldvision.ai" initialScan={null} />;
}
