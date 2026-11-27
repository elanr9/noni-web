import { peekBrainIngest, peekBrainSnapshot } from "@/app/admin/brain/knowledge-actions";
import { BrainHome } from "@/components/admin/brain/BrainHome";
import { getAdminData } from "@/lib/admin/data";
import { getSessionProfile, isPlatformAdmin } from "@/lib/auth";

export default async function AdminBrainPage() {
  const { profile } = await getSessionProfile();
  const [data, snapshot, ingest] = await Promise.all([
    getAdminData(profile?.active_company_id ?? ""),
    peekBrainSnapshot(),
    peekBrainIngest(),
  ]);

  return (
    <BrainHome
      companyName={data.company.name}
      logoPath={data.company.logoPath}
      website={data.company.website}
      snapshot={snapshot}
      ingest={ingest}
      staff={isPlatformAdmin(profile)}
    />
  );
}
