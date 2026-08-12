import { CompaniesView } from "@/components/ops/companies/CompaniesView";
import { SEED_COMPANIES } from "@/lib/ops/mock-data";

/* Renders mock data for now; Agent F swaps in real Supabase rows. */
export default function OpsCompaniesPage() {
  return <CompaniesView companies={SEED_COMPANIES} />;
}
