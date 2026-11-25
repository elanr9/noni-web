"use server";

/* The company pipeline in ops (/ops/leads). After the call, one action turns
   a Get started lead into a company: the company is made with the chat's
   answers (so its admin skips the onboarding chat), the agreed plan and
   monthly creator budget are saved, and one email goes out whose button is
   the admin invite. Opening it signs them in (no Google, no password) and
   lands on Start subscription. */

import { revalidatePath } from "next/cache";

import { PLAN_PRICING, stripeChargeForPlan, writeBilling } from "@/lib/admin/billing";
import type { SubscriptionPlan } from "@/lib/admin/types";
import { getSessionProfile, isPlatformAdmin } from "@/lib/auth";
import { callEdgeFunction, type CreateCompanyResponse } from "@/lib/edge";
import { planOfferLines } from "@/lib/plans";
import { createServiceClient } from "@/lib/supabase/service";

export type LeadActionResult = { ok: true; email?: string } | { ok: false; error: string };

async function platformAdmin(): Promise<string | null> {
  const { userId, profile } = await getSessionProfile();
  return userId && isPlatformAdmin(profile) ? userId : null;
}

type LeadRow = {
  id: string;
  name: string | null;
  email: string | null;
  company: string | null;
  website: string | null;
  role: string | null;
  answers: Record<string, unknown> | null;
  status: string;
  call_booked_at: string | null;
  company_id: string | null;
};

async function sendInviteEmail(lead: LeadRow, companyId: string, token: string, plan: SubscriptionPlan, budgetCents: number) {
  const lines = planOfferLines(plan, budgetCents, await stripeChargeForPlan(plan));
  return callEdgeFunction<{ ok: boolean; email?: string }>("budget-billing", {
    action: "send_offer",
    company_id: companyId,
    to: lead.email,
    name: lead.name ?? "",
    invite_token: token,
    lines: [lines.plan, lines.budget].filter(Boolean),
  });
}

export async function inviteLead(input: {
  leadId: string;
  plan: SubscriptionPlan;
  budgetDollars: number;
  runBy: "me" | "noni";
  email?: string;
}): Promise<LeadActionResult> {
  const me = await platformAdmin();
  if (!me) return { ok: false, error: "Platform ops only." };
  if (!(input.plan in PLAN_PRICING)) return { ok: false, error: "Pick a plan." };
  if (!Number.isInteger(input.budgetDollars) || input.budgetDollars < 0 || input.budgetDollars > 100_000) {
    return { ok: false, error: "Enter the monthly creator budget in whole dollars." };
  }

  const db = createServiceClient();
  const { data } = await db.from("company_leads").select("*").eq("id", input.leadId).maybeSingle();
  const lead = data as LeadRow | null;
  if (!lead) return { ok: false, error: "That lead no longer exists." };
  if (lead.company_id) return { ok: false, error: "This lead is already a company. Use Resend." };

  const email = (input.email ?? lead.email ?? "").trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { ok: false, error: "The lead needs a valid email." };
  const name = (lead.company ?? "").trim();
  if (name.length < 2) return { ok: false, error: "The lead has no company name." };

  const created = await callEdgeFunction<CreateCompanyResponse>("ops-create-company", {
    action: "create",
    name,
    ...(lead.website ? { website: lead.website } : {}),
  });
  if (created.error !== null) return { ok: false, error: created.error };
  const companyId = created.data.company.id;

  const a = lead.answers ?? {};
  const self = input.runBy === "me";
  const { error: companyError } = await db
    .from("companies")
    .update({
      intake: {
        ...a,
        role: lead.role,
        campaigns_run_by: input.runBy,
        source: "lead",
        lead_id: lead.id,
        call_requested_at: lead.call_booked_at ?? new Date().toISOString(),
        call_booked_at: lead.call_booked_at,
      },
      onboarded_at: new Date().toISOString(),
      manager_count: self ? 1 : 0,
      self_is_manager: self,
    })
    .eq("id", companyId);
  if (companyError) return { ok: false, error: `Company made, but its details did not save: ${companyError.message}` };

  const billed = await writeBilling(companyId, { monthly_budget_cents: input.budgetDollars * 100, offer_plan: input.plan });
  if (billed) return { ok: false, error: billed };

  const { data: invite, error: inviteError } = await db
    .from("company_invites")
    .insert({ company_id: companyId, email, role: "company_admin", invited_name: lead.name, invited_by: me })
    .select("token")
    .single();
  if (inviteError || !invite) return { ok: false, error: `Company made, but the invite failed: ${inviteError?.message}` };

  await db
    .from("company_leads")
    .update({ status: "invited", invited_at: new Date().toISOString(), company_id: companyId, email, updated_at: new Date().toISOString() })
    .eq("id", lead.id);

  const sent = await sendInviteEmail({ ...lead, email }, companyId, invite.token as string, input.plan, input.budgetDollars * 100);
  await db.from("company_billing").update({ offer_sent_at: new Date().toISOString() }).eq("company_id", companyId);
  revalidatePath("/ops/leads");
  revalidatePath("/ops/companies");
  if (sent.error !== null) return { ok: false, error: `Company made, but the email did not send: ${sent.error}. Use Resend.` };
  return { ok: true, email };
}

/** Sends the plan email again with a fresh invite (the old link stops working). */
export async function resendLeadInvite(leadId: string): Promise<LeadActionResult> {
  const me = await platformAdmin();
  if (!me) return { ok: false, error: "Platform ops only." };
  const db = createServiceClient();
  const { data } = await db.from("company_leads").select("*").eq("id", leadId).maybeSingle();
  const lead = data as LeadRow | null;
  if (!lead?.company_id || !lead.email) return { ok: false, error: "Invite this lead first." };

  const { data: billing } = await db
    .from("company_billing")
    .select("offer_plan, monthly_budget_cents, subscription_status")
    .eq("company_id", lead.company_id)
    .maybeSingle();
  if (billing?.subscription_status && billing.subscription_status !== "none") return { ok: false, error: "They already started their plan." };
  const plan = billing?.offer_plan as SubscriptionPlan | null;
  if (!plan || !(plan in PLAN_PRICING)) return { ok: false, error: "No plan saved for this company." };

  await db
    .from("company_invites")
    .update({ expires_at: new Date().toISOString() })
    .eq("company_id", lead.company_id)
    .eq("role", "company_admin")
    .is("accepted_at", null);
  const { data: invite, error } = await db
    .from("company_invites")
    .insert({ company_id: lead.company_id, email: lead.email, role: "company_admin", invited_name: lead.name, invited_by: me })
    .select("token")
    .single();
  if (error || !invite) return { ok: false, error: error?.message ?? "The invite did not save." };

  const sent = await sendInviteEmail(lead, lead.company_id, invite.token as string, plan, billing?.monthly_budget_cents ?? 0);
  revalidatePath("/ops/leads");
  if (sent.error !== null) return { ok: false, error: sent.error };
  return { ok: true, email: lead.email };
}

export async function setLeadLost(leadId: string, lost: boolean): Promise<LeadActionResult> {
  if (!(await platformAdmin())) return { ok: false, error: "Platform ops only." };
  const db = createServiceClient();
  const { data } = await db.from("company_leads").select("status, call_booked_at").eq("id", leadId).maybeSingle();
  if (!data) return { ok: false, error: "That lead no longer exists." };
  if (data.status === "invited" || data.status === "subscribed") return { ok: false, error: "This lead is already a company." };
  await db
    .from("company_leads")
    .update({ status: lost ? "lost" : data.call_booked_at ? "call_booked" : "new", updated_at: new Date().toISOString() })
    .eq("id", leadId);
  revalidatePath("/ops/leads");
  return { ok: true };
}
