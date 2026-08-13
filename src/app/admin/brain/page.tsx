import { BrainView } from "@/components/admin/brain/BrainView";
import { getAdminData } from "@/lib/admin/data";
import { getSessionProfile } from "@/lib/auth";

export default async function AdminBrainPage() {
  const { profile } = await getSessionProfile();
  const data = await getAdminData(profile?.company_id ?? "");

  return (
    <BrainView
      docs={data.brainDocs}
      accounts={data.inspirationAccounts}
      features={data.features}
      templates={data.briefTemplates}
    />
  );
}
