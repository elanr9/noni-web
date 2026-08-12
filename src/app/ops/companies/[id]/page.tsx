import { notFound } from "next/navigation";

import { CompanyDetail } from "@/components/ops/company/CompanyDetail";
import { SEED_COMPANIES } from "@/lib/ops/mock-data";

export default async function OpsCompanyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const company = SEED_COMPANIES.find((c) => c.id === id);
  if (!company) notFound();
  return <CompanyDetail company={company} />;
}
