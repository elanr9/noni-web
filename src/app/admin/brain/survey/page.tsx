import { getBrainSurvey, listBrainFacts } from "@/app/admin/brain/knowledge-actions";
import { BrainSurveyPage } from "@/components/admin/brain/BrainSurveyPage";

export const metadata = { title: "Founder questions · Noni" };

/* The same review and founder questions onboarding ends with, for companies
   that onboarded before them or want to revise an answer. Gated by the
   /admin layout (company admins) and again by each action. */
export default async function AdminBrainSurveyPage() {
  const [survey, facts] = await Promise.all([getBrainSurvey(), listBrainFacts()]);
  return <BrainSurveyPage survey={survey} facts={facts} />;
}
