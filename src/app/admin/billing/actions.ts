"use server";

import { revalidatePath } from "next/cache";
import { callEdgeFunction } from "@/lib/edge";

// Every action calls the company-billing edge function with the caller's
// access token; the function enforces manage_billing server side.

export type CompanyBillingStatus = {
  company_id: string;
  stripe_customer_id: string | null;
  stripe_payment_method_id: string | null;
  bank_last4: string | null;
  bank_name: string | null;
  payouts_enabled: boolean;
  weekly_budget_cents: number;
  monthly_budget_cents: number;
  credit_balance_cents: number;
  bank_connected: boolean;
  updated_at: string;
};

export type BillingResult<T> =
  | { ok: true; value: T }
  | { ok: false; error: string };

export async function saveMonthlyBudget(
  monthlyBudgetCents: number,
): Promise<BillingResult<{ warn: string | null }>> {
  const result = await callEdgeFunction<{ warn?: string | null }>(
    "company-billing",
    { action: "set_budget", monthly_budget_cents: monthlyBudgetCents },
  );
  if (result.error !== null) return { ok: false, error: result.error };

  revalidatePath("/admin/billing");
  return { ok: true, value: { warn: result.data.warn ?? null } };
}

export async function createTopUpUrl(
  amountCents: number,
): Promise<BillingResult<{ url: string }>> {
  const result = await callEdgeFunction<{ url?: string }>("company-billing", {
    action: "topup_url",
    amount_cents: amountCents,
  });
  if (result.error !== null) return { ok: false, error: result.error };
  if (!result.data.url) return { ok: false, error: "No top-up URL returned." };
  return { ok: true, value: { url: result.data.url } };
}

export async function createSetupUrl(): Promise<BillingResult<{ url: string }>> {
  const result = await callEdgeFunction<{ url?: string }>("company-billing", {
    action: "setup_url",
  });
  if (result.error !== null) return { ok: false, error: result.error };
  if (!result.data.url) return { ok: false, error: "No setup URL returned." };
  return { ok: true, value: { url: result.data.url } };
}
