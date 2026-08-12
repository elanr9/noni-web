"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getSessionProfile, isCompanyAdmin } from "@/lib/auth";
import { callEdgeFunction, type InviteResponse } from "@/lib/edge";
import type { Permissions } from "@/lib/permissions";

export type TeamActionResult = { ok: true } | { ok: false; error: string };

async function requireCompanyAdmin(): Promise<
  { companyId: string } | { error: string }
> {
  const { userId, profile } = await getSessionProfile();
  if (!userId || !isCompanyAdmin(profile) || !profile?.company_id) {
    return { error: "Company admins only." };
  }
  return { companyId: profile.company_id };
}

export async function setMemberPermissions(input: {
  profileId: string;
  permissions: Permissions;
}): Promise<TeamActionResult> {
  const gate = await requireCompanyAdmin();
  if ("error" in gate) return { ok: false, error: gate.error };

  const supabase = await createClient();
  const { error } = await supabase
    .from("company_members")
    .update({ permissions: input.permissions })
    .eq("company_id", gate.companyId)
    .eq("profile_id", input.profileId);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/admin/team");
  return { ok: true };
}

export async function inviteManager(input: {
  email: string;
  permissions: Permissions;
}): Promise<TeamActionResult> {
  const gate = await requireCompanyAdmin();
  if ("error" in gate) return { ok: false, error: gate.error };

  const email = input.email.trim();
  if (!email) return { ok: false, error: "Email is required." };

  const { error } = await callEdgeFunction<InviteResponse>(
    "invite-campaign-manager",
    {
      action: "invite",
      company_id: gate.companyId,
      email,
      role: "campaign_manager",
      permissions: input.permissions,
    },
  );
  if (error) return { ok: false, error };

  revalidatePath("/admin/team");
  return { ok: true };
}

export async function resendManagerInvite(input: {
  inviteId: string;
}): Promise<TeamActionResult> {
  const gate = await requireCompanyAdmin();
  if ("error" in gate) return { ok: false, error: gate.error };

  const { error } = await callEdgeFunction<InviteResponse>(
    "invite-campaign-manager",
    { action: "resend", invite_id: input.inviteId },
  );
  if (error) return { ok: false, error };

  revalidatePath("/admin/team");
  return { ok: true };
}

export async function revokeInvite(input: {
  inviteId: string;
}): Promise<TeamActionResult> {
  const gate = await requireCompanyAdmin();
  if ("error" in gate) return { ok: false, error: gate.error };

  const supabase = await createClient();
  const { error } = await supabase
    .from("company_invites")
    .delete()
    .eq("id", input.inviteId)
    .eq("company_id", gate.companyId);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/admin/team");
  return { ok: true };
}
