import { ContractsView } from "@/components/admin/contracts/ContractsView";
import { getCompanyContracts } from "@/lib/admin/contracts";
import { getSessionProfile } from "@/lib/auth";

export const dynamic = "force-dynamic";

/* Every creator agreement the company has. The /admin layout gates the page. */
export default async function AdminContractsPage() {
  const { profile } = await getSessionProfile();
  return <ContractsView rows={await getCompanyContracts(profile?.active_company_id ?? "")} />;
}
