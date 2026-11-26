import { InvoicesView } from "@/components/ops/invoices/InvoicesView";
import { getInvoiceMonth, monthKey } from "@/lib/ops/invoices";

export const dynamic = "force-dynamic";

/* The month's creator budget invoices, one row per company. The ops layout
   already limits /ops to the platform admin; the actions check again. */
export default async function OpsInvoicesPage({
  searchParams,
}: {
  searchParams: Promise<{ m?: string }>;
}) {
  const { m } = await searchParams;
  const now = monthKey(new Date());
  const month = m && /^\d{4}-\d{2}$/.test(m) && m <= now ? m : now;
  return <InvoicesView key={month} month={month} current={month === now} rows={await getInvoiceMonth(month)} />;
}
