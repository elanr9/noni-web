import { createServiceClient } from "@/lib/supabase/service";

/* The monthly creator budget invoices, one row per company per calendar
   month. The budget is agreed on a call; ops goes through the month and
   sends each company its invoice. Leftover carries over: the invoice is the
   budget minus what is still on the balance and minus earlier budget
   invoices not paid yet (budgetTopUp in the budget-billing edge function). */

export type InvoiceStatus = "todo" | "billing" | "open" | "paid" | "skipped" | "void" | "failed";

export interface InvoiceRow {
  companyId: string;
  name: string;
  /** The agreed monthly budget now, in cents. */
  budgetCents: number;
  /** What is on the balance now: carried into the next invoice. */
  balanceCents: number;
  /** Budget invoices from other months that are sent and not paid. */
  unpaidCents: number;
  status: InvoiceStatus;
  /** Sent rows: what was invoiced, the budget it was for and what was carried over. */
  amountCents: number;
  billedBudgetCents: number;
  carriedCents: number;
  error: string | null;
  /** The company has a running plan, so it can be invoiced. */
  planActive: boolean;
}

const ACTIVE = new Set(["active", "trialing"]);

/** "2026-11" for a date, in UTC like the edge function's months. */
export function monthKey(d: Date): string {
  return d.toISOString().slice(0, 7);
}

export function shiftMonth(key: string, by: number): string {
  const [y, m] = key.split("-").map(Number);
  return monthKey(new Date(Date.UTC(y, m - 1 + by, 1)));
}

/** This month's invoice for a budget, in cents. Mirrors budgetTopUp. */
export function invoiceFor(budgetCents: number, balanceCents: number, unpaidCents: number): number {
  return Math.max(0, budgetCents - Math.max(0, balanceCents) - Math.max(0, unpaidCents));
}

export async function getInvoiceMonth(month: string): Promise<InvoiceRow[]> {
  const supabase = createServiceClient();
  const from = `${month}-01`;
  const to = `${shiftMonth(month, 1)}-01`;
  const current = month === monthKey(new Date());

  const [{ data: billing }, { data: companies }, { data: sent }, { data: open }] = await Promise.all([
    supabase
      .from("company_billing")
      .select("company_id, monthly_budget_cents, credit_balance_cents, subscription_status, billing_simulated"),
    supabase.from("companies").select("id, name"),
    supabase
      .from("company_budget_invoices")
      .select("company_id, period_start, budget_cents, leftover_cents, amount_cents, status, error")
      .gte("period_start", from)
      .lt("period_start", to),
    supabase.from("company_budget_invoices").select("company_id, period_start, amount_cents").eq("status", "open"),
  ]);

  const names = new Map((companies ?? []).map((c) => [c.id as string, c.name as string]));
  const sentBy = new Map((sent ?? []).map((r) => [r.company_id as string, r]));
  const unpaidBy = new Map<string, number>();
  for (const r of open ?? []) {
    const day = String(r.period_start);
    if (day >= from && day < to) continue;
    unpaidBy.set(r.company_id, (unpaidBy.get(r.company_id) ?? 0) + (r.amount_cents ?? 0));
  }

  const rows: InvoiceRow[] = [];
  for (const b of billing ?? []) {
    const id = b.company_id as string;
    const name = names.get(id);
    if (!name) continue;
    const bill = sentBy.get(id);
    const planActive = ACTIVE.has(String(b.subscription_status ?? ""));
    const budgetCents = Number(b.monthly_budget_cents ?? 0);
    /* A past month lists only what was sent. This month lists every
       company with a plan or a budget; test mode companies are never billed. */
    if (!bill && (!current || b.billing_simulated || (!planActive && budgetCents <= 0))) continue;
    rows.push({
      companyId: id,
      name,
      budgetCents,
      balanceCents: Number(b.credit_balance_cents ?? 0),
      unpaidCents: unpaidBy.get(id) ?? 0,
      status: (bill?.status as InvoiceStatus | undefined) ?? "todo",
      amountCents: bill?.amount_cents ?? 0,
      billedBudgetCents: bill?.budget_cents ?? 0,
      carriedCents: bill?.leftover_cents ?? 0,
      error: bill?.error ?? null,
      planActive,
    });
  }
  return rows.sort((a, b) => a.name.localeCompare(b.name));
}
