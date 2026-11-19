import { listBrainFacts, peekBrainIngest } from "@/app/admin/brain/knowledge-actions";
import { getCompanyResearch, getReferenceLearning } from "@/app/admin/brain/research-actions";
import { BrainView } from "@/components/admin/brain/BrainView";
import { getAdminData } from "@/lib/admin/data";
import { getSessionProfile } from "@/lib/auth";

export default async function AdminBrainPage() {
  const { profile } = await getSessionProfile();
  const [data, research, learning, knowledge, ingest] = await Promise.all([
    getAdminData(profile?.active_company_id ?? ""),
    getCompanyResearch(),
    getReferenceLearning(),
    listBrainFacts(),
    peekBrainIngest(),
  ]);

  return (
    <BrainView
      docs={data.brainDocs}
      accounts={data.inspirationAccounts}
      features={data.features}
      templates={data.briefTemplates}
      logoPath={data.company.logoPath}
      website={data.company.website}
      research={research.ok ? research.research : null}
      learning={learning.ok ? learning.learning : null}
      knowledge={knowledge}
      ingest={ingest}
    />
  );
}
