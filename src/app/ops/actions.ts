"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSessionProfile, isPlatformAdmin } from "@/lib/auth";
import {
  callEdgeFunction,
  type CreateCompanyResponse,
  type InviteResponse,
} from "@/lib/edge";
import { createClient } from "@/lib/supabase/server";

export type OpsActionResult = { ok: true } | { ok: false; error: string };

async function requirePlatformAdmin(): Promise<string | null> {
  const { userId, profile } = await getSessionProfile();
  if (!userId || !isPlatformAdmin(profile)) {
    return "Platform ops only.";
  }
  return null;
}

export async function createCompany(input: {
  name: string;
  website: string | null;
}): Promise<OpsActionResult> {
  const denied = await requirePlatformAdmin();
  if (denied) return { ok: false, error: denied };

  const name = input.name.trim();
  if (!name) return { ok: false, error: "Company name is required." };

  const { data, error } = await callEdgeFunction<CreateCompanyResponse>(
    "ops-create-company",
    {
      action: "create",
      name,
      ...(input.website?.trim() ? { website: input.website.trim() } : {}),
    },
  );
  if (error !== null) return { ok: false, error };

  revalidatePath("/ops");
  revalidatePath("/ops/companies");
  redirect(`/ops/companies/${data.company.id}`);
}

export async function inviteCampaignManager(input: {
  companyId: string;
  email: string;
}): Promise<OpsActionResult> {
  const denied = await requirePlatformAdmin();
  if (denied) return { ok: false, error: denied };

  const email = input.email.trim();
  if (!email) return { ok: false, error: "Email is required." };

  const { error } = await callEdgeFunction<InviteResponse>(
    "invite-campaign-manager",
    { action: "invite", company_id: input.companyId, email },
  );
  if (error) return { ok: false, error };

  revalidatePath(`/ops/companies/${input.companyId}`);
  revalidatePath("/ops/invites");
  revalidatePath("/ops");
  return { ok: true };
}

export async function regenerateJoinCode(input: {
  companyId: string;
}): Promise<OpsActionResult> {
  const denied = await requirePlatformAdmin();
  if (denied) return { ok: false, error: denied };

  const supabase = await createClient();
  const { error } = await supabase.rpc("regenerate_company_join_code", {
    p_company_id: input.companyId,
  });
  if (error) return { ok: false, error: error.message };

  revalidatePath("/ops/companies");
  revalidatePath(`/ops/companies/${input.companyId}`);
  return { ok: true };
}

export async function resendInvite(input: {
  inviteId: string;
}): Promise<OpsActionResult> {
  const denied = await requirePlatformAdmin();
  if (denied) return { ok: false, error: denied };

  const { error } = await callEdgeFunction<InviteResponse>(
    "invite-campaign-manager",
    { action: "resend", invite_id: input.inviteId },
  );
  if (error) return { ok: false, error };

  revalidatePath("/ops/invites");
  return { ok: true };
}
