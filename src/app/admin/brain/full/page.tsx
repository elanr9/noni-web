import { listBrainFacts, peekBrainIngest } from "@/app/admin/brain/knowledge-actions";
import { getCompanyResearch, getReferenceLearning } from "@/app/admin/brain/research-actions";
import { BrainView } from "@/components/admin/brain/BrainView";
import { getAdminData } from "@/lib/admin/data";
import { redirect } from "next/navigation";

import { getSessionProfile, isPlatformAdmin } from "@/lib/auth";

/* Every record, source and tool behind the brain. The Noni team works
   here; a company sees the short page at /admin/brain. */
export default async function AdminBrainFullPage() {
  const { profile } = await getSessionProfile();
  if (!isPlatformAdmin(profile)) redirect("/admin/brain");
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
