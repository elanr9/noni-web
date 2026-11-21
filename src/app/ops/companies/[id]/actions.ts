"use server";

/* Company detail server actions. */

import { revalidatePath } from "next/cache";

import {
  getStripe,
  PLAN_PRICING,
  readBillingRow,
  STRIPE_NOT_CONFIGURED,
  writeBilling,
} from "@/lib/admin/billing";
import { getSessionProfile, isPlatformAdmin } from "@/lib/auth";
import type { SubscriptionPlan } from "@/lib/admin/types";
import { createServiceClient } from "@/lib/supabase/service";

export type CompanyActionResult = { ok: true } | { ok: false; error: string };

async function requirePlatformAdmin(): Promise<string | null> {
  const { userId, profile } = await getSessionProfile();
  if (!userId || !isPlatformAdmin(profile)) {
    return "Platform ops only.";
  }
  return null;
}

/* Every file under the company's folder, in every bucket. Storage has no
   recursive delete, so folders are walked; a folder entry has a null id. */
async function removeCompanyFiles(
  service: ReturnType<typeof createServiceClient>,
  companyId: string,
): Promise<void> {
  const { data: buckets } = await service.storage.listBuckets();
  for (const bucket of buckets ?? []) {
    const folders = [companyId];
    const files: string[] = [];
    while (folders.length > 0) {
      const folder = folders.pop()!;
      for (let offset = 0; ; offset += 1000) {
        const { data } = await service.storage
          .from(bucket.id)
          .list(folder, { limit: 1000, offset });
        for (const entry of data ?? []) {
          const path = `${folder}/${entry.name}`;
          if (entry.id === null) folders.push(path);
          else files.push(path);
        }
        if (!data || data.length < 1000) break;
      }
    }
    for (let i = 0; i < files.length; i += 100) {
      await service.storage.from(bucket.id).remove(files.slice(i, i + 100));
    }
  }
}

/** Removes the company and everything scoped to it. `companies` has no
    delete policy, so this goes through ops_delete_company with the service
    role after the platform admin gate. People keep their accounts; only
    their membership of this company goes. */
export async function removeCompany(input: {
  companyId: string;
}): Promise<CompanyActionResult> {
  const denied = await requirePlatformAdmin();
  if (denied) return { ok: false, error: denied };
  if (!input.companyId) return { ok: false, error: "Company id is required." };

  const service = createServiceClient();
  const { data, error } = await service.rpc("ops_delete_company", {
    p_company_id: input.companyId,
  });
  if (error) return { ok: false, error: error.message };
  if (data !== true) return { ok: false, error: "That company no longer exists." };

  /* The rows are gone either way; a leftover file is not worth failing on. */
  try {
    await removeCompanyFiles(service, input.companyId);
  } catch {
    /* ignored */
  }

  revalidatePath("/ops/companies");
  revalidatePath("/ops/invites");
  revalidatePath("/ops/users");
  revalidatePath("/ops");
  return { ok: true };
}

/* ── Creator budget ──
   The creator payout budget is agreed with the client on a call. Ops records
   it here and invoices the client; the company never sets it or pays for it
   from its own Billing tab. */

const MAX_BUDGET_DOLLARS = 100_000;

function wholeDollars(value: number): boolean {
  return Number.isInteger(value) && value >= 0 && value <= MAX_BUDGET_DOLLARS;
}

/** Records the monthly creator budget agreed on the call. 0 clears it. */
export async function setCreatorBudget(input: {
  companyId: string;
  dollars: number;
}): Promise<CompanyActionResult> {
  const denied = await requirePlatformAdmin();
  if (denied) return { ok: false, error: denied };
  if (!input.companyId) return { ok: false, error: "Company id is required." };
  if (!wholeDollars(input.dollars)) {
    return { ok: false, error: "Enter a whole dollar amount up to $100,000." };
  }
  const error = await writeBilling(input.companyId, {
    monthly_budget_cents: input.dollars * 100,
  });
  if (error) return { ok: false, error };
  revalidatePath(`/ops/companies/${input.companyId}`);
  revalidatePath("/admin", "layout");
  return { ok: true };
}

/** Emails the company admin a Stripe invoice. A creator budget invoice
    (metadata kind "budget") adds its amount to the company's balance when
    the invoice.paid webhook sees it paid; a plan invoice (kind "plan") only
    bills the plan. Nothing is charged automatically. */
export async function sendBudgetInvoice(input: {
  companyId: string;
  dollars: number;
  /** "plan" bills the Noni plan itself and adds nothing to the balance. */
  kind?: "budget" | "plan";
}): Promise<CompanyActionResult & { email?: string }> {
  const kind = input.kind === "plan" ? "plan" : "budget";
  const denied = await requirePlatformAdmin();
  if (denied) return { ok: false, error: denied };
  if (!input.companyId) return { ok: false, error: "Company id is required." };
  if (!wholeDollars(input.dollars) || input.dollars === 0) {
    return { ok: false, error: "Enter a whole dollar amount up to $100,000." };
  }
  const stripe = getStripe();
  if (!stripe) return { ok: false, error: STRIPE_NOT_CONFIGURED };

  const service = createServiceClient();
  const [{ data: company }, { data: member }] = await Promise.all([
    service.from("companies").select("name").eq("id", input.companyId).maybeSingle(),
    service
      .from("company_members")
      .select("profile_id")
      .eq("company_id", input.companyId)
      .eq("role", "company_admin")
      .is("removed_at", null)
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle(),
  ]);
  if (!company) return { ok: false, error: "That company no longer exists." };
  const adminId = (member as { profile_id: string } | null)?.profile_id;
  const email = adminId
    ? ((await service.auth.admin.getUserById(adminId)).data.user?.email ?? null)
    : null;

  try {
    const row = await readBillingRow(input.companyId);
    let customerId =
      typeof row?.stripe_customer_id === "string" && row.stripe_customer_id.startsWith("cus_")
        ? row.stripe_customer_id
        : null;
    if (!customerId) {
      if (!email) {
        return { ok: false, error: "This company has no admin to send the invoice to yet." };
      }
      const customer = await stripe.customers.create({
        name: company.name,
        email,
        metadata: { company_id: input.companyId },
      });
      customerId = customer.id;
      const saved = await writeBilling(input.companyId, { stripe_customer_id: customerId });
      if (saved) return { ok: false, error: saved };
    }

    const metadata = { company_id: input.companyId, kind };
    const invoice = await stripe.invoices.create({
      customer: customerId,
      collection_method: "send_invoice",
      days_until_due: 7,
      auto_advance: false,
      description:
        kind === "plan"
          ? "Your Noni plan."
          : "Noni creator budget. Noni pays your creators from this.",
      metadata,
    });
    if (!invoice.id) return { ok: false, error: "Stripe did not create the invoice." };
    await stripe.invoiceItems.create({
      customer: customerId,
      invoice: invoice.id,
      amount: input.dollars * 100,
      currency: "usd",
      description: kind === "plan" ? "Noni plan" : "Creator budget",
      metadata,
    });
    await stripe.invoices.finalizeInvoice(invoice.id);
    const sent = await stripe.invoices.sendInvoice(invoice.id);
    revalidatePath(`/ops/companies/${input.companyId}`);
    return { ok: true, email: sent.customer_email ?? email ?? undefined };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Stripe did not answer.";
    return { ok: false, error: `The invoice could not be sent: ${message}` };
  }
}

/* ── Plan set by ops ──
   Enterprise and Done for you are sold on a call, and any plan can be given
   to a client that pays by invoice. Ops sets the plan here; it has no Stripe
   subscription behind it and is billed with sendPlanInvoice. A company that
   bought its plan by card in Billing is left to Stripe. */

export type OpsPlan = SubscriptionPlan | "enterprise" | "none";

export async function setCompanyPlan(input: {
  companyId: string;
  plan: OpsPlan;
}): Promise<CompanyActionResult> {
  const denied = await requirePlatformAdmin();
  if (denied) return { ok: false, error: denied };
  if (!input.companyId) return { ok: false, error: "Company id is required." };
  const known =
    input.plan === "none" || input.plan === "enterprise" || input.plan in PLAN_PRICING;
  if (!known) return { ok: false, error: "Unknown plan." };

  const row = await readBillingRow(input.companyId);
  const live = row?.stripe_subscription_id;
  if (typeof live === "string" && live.startsWith("sub_")) {
    return {
      ok: false,
      error:
        "This company pays for its plan by card through Stripe. Cancel that subscription first, then set the plan here.",
    };
  }

  const error =
    input.plan === "none"
      ? await writeBilling(input.companyId, {
          subscription_status: "none",
          subscription_plan: null,
          subscription_price_cents: null,
          subscription_renews_at: null,
        })
      : await writeBilling(input.companyId, {
          subscription_status: "active",
          subscription_plan: input.plan,
          subscription_price_cents:
            input.plan === "enterprise" ? 0 : PLAN_PRICING[input.plan].monthlyPriceCents,
          subscription_renews_at: null,
        });
  if (error) return { ok: false, error };
  revalidatePath(`/ops/companies/${input.companyId}`);
  revalidatePath("/admin", "layout");
  return { ok: true };
}
