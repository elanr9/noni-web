import { CompaniesView } from "@/components/ops/companies/CompaniesView";
import { getOpsData } from "@/lib/ops/data";

export default async function OpsCompaniesPage() {
  const { companies } = await getOpsData();
  return <CompaniesView companies={companies} />;
}
