import { getBrainSurvey, listBrainFacts } from "@/app/admin/brain/knowledge-actions";
import { AdminShell } from "@/components/admin/AdminShell";
import { BrainSurveyPage } from "@/components/admin/brain/BrainSurveyPage";
import { MOCK_DATASET } from "@/lib/admin/mock-data";

/* Dev preview of the founder questions as reached from the Brain page (run
   with ADMIN_QA_MOCK=1). 404 in production through the /internal layout. */
export default async function BrainSurveyPreviewPage() {
  const [survey, facts] = await Promise.all([getBrainSurvey(), listBrainFacts()]);
  return (
    <AdminShell
      companyName={MOCK_DATASET.company.name}
      name="Riley Chen"
      people={[]}
      setupRemaining={2}
      setupComplete={false}
    >
      <BrainSurveyPage survey={survey} facts={facts} />
    </AdminShell>
  );
}
