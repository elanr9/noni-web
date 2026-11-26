"use server";

import { revalidatePath } from "next/cache";

import { setCreatorBudget } from "@/app/ops/companies/[id]/actions";
import { getSessionProfile, isPlatformAdmin } from "@/lib/auth";
import { callEdgeFunction } from "@/lib/edge";

export type SendResult =
  | { ok: true; status: "paid" | "open" | "skipped"; amountCents: number }
  | { ok: false; error: string };

/** Sends one company its creator budget invoice for a month ("YYYY-MM").
    A budget typed on the row is saved first, so Send is the only press. */
export async function sendMonthInvoice(input: {
  companyId: string;
  month: string;
  budgetDollars?: number;
}): Promise<SendResult> {
  const { userId, profile } = await getSessionProfile();
  if (!userId || !isPlatformAdmin(profile)) return { ok: false, error: "Platform ops only." };
  if (!input.companyId || !/^\d{4}-\d{2}$/.test(input.month)) return { ok: false, error: "Pick a company and a month." };

  if (input.budgetDollars !== undefined) {
    const saved = await setCreatorBudget({ companyId: input.companyId, dollars: input.budgetDollars });
    if (!saved.ok) return saved;
  }

  const { data, error } = await callEdgeFunction<{
    ok: boolean;
    result?: { status: string; amount_cents?: number };
  }>("budget-billing", { action: "send_month", company_id: input.companyId, period: `${input.month}-01` });
  revalidatePath("/ops/invoices");
  revalidatePath(`/ops/companies/${input.companyId}`);
  revalidatePath("/admin", "layout");
  if (error) return { ok: false, error };
  const status = data?.result?.status ?? "";
  const amountCents = data?.result?.amount_cents ?? 0;
  if (status === "paid" || status === "open" || status === "skipped") return { ok: true, status, amountCents };
  if (status.startsWith("already")) return { ok: false, error: "Already sent this month." };
  return { ok: false, error: "The invoice did not send." };
}

/** Saves the budget agreed on the call without sending anything. */
export async function saveBudget(input: { companyId: string; dollars: number }) {
  const result = await setCreatorBudget(input);
  revalidatePath("/ops/invoices");
  return result;
}
