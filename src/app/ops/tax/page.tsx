import { TaxView } from "@/components/ops/tax/TaxView";
import { getTaxYear, reportingThresholdCents } from "@/lib/ops/tax";

export const dynamic = "force-dynamic";

/* The year's creator pay for 1099 filing. The ops layout already limits /ops
   to the platform admin. */
export default async function OpsTaxPage({ searchParams }: { searchParams: Promise<{ y?: string }> }) {
  const { y } = await searchParams;
  const now = new Date().getUTCFullYear();
  const year = y && /^\d{4}$/.test(y) && Number(y) <= now && Number(y) >= 2025 ? Number(y) : now;
  return (
    <TaxView
      key={year}
      year={year}
      current={year === now}
      thresholdCents={reportingThresholdCents(year)}
      rows={await getTaxYear(year)}
    />
  );
}
