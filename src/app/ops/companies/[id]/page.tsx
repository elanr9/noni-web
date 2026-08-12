import { notFound } from "next/navigation";

import { CompanyDetail } from "@/components/ops/company/CompanyDetail";
import { getOpsData } from "@/lib/ops/data";

export default async function OpsCompanyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = await getOpsData();
  const company = data.companies.find((c) => c.id === id);
  if (!company) notFound();
  return (
    <CompanyDetail
      company={company}
      companies={data.companies}
      people={data.people}
      posts={data.posts}
      days={data.companyDays}
      billing={data.billing[company.id] ?? null}
      brainDocs={data.brainDocs[company.id] ?? []}
      brainAccounts={data.brainAccounts[company.id] ?? []}
    />
  );
}
