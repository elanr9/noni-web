"use server";

import { revalidatePath } from "next/cache";
import { getSessionProfile, isPlatformAdmin } from "@/lib/auth";
import {
  callEdgeFunction,
  type CreateCompanyResponse,
  type InviteResponse,
} from "@/lib/edge";

export type OpsActionResult = { ok: true } | { ok: false; error: string };

async function requirePlatformAdmin(): Promise<string | null> {
  const { userId, profile } = await getSessionProfile();
  if (!userId || !isPlatformAdmin(profile)) {
    return "Platform ops only.";
  }
  return null;
}

/* Creates the company, then emails its one admin an invite. The company
   stays invite-pending (visible only on the Invites page) until the admin
   accepts, so no redirect to a detail page here. */
export async function createCompany(input: {
  name: string;
  website: string | null;
  adminName: string;
  adminEmail: string;
}): Promise<OpsActionResult> {
  const denied = await requirePlatformAdmin();
  if (denied) return { ok: false, error: denied };

  const name = input.name.trim();
  if (!name) return { ok: false, error: "Company name is required." };
  if (!input.adminName.trim()) {
    return { ok: false, error: "The company admin's name is required." };
  }
  const adminEmail = input.adminEmail.trim();
  if (!adminEmail) return { ok: false, error: "The company admin's email is required." };

  const { data, error } = await callEdgeFunction<CreateCompanyResponse>(
    "ops-create-company",
    {
      action: "create",
      name,
      ...(input.website?.trim() ? { website: input.website.trim() } : {}),
    },
  );
  if (error !== null) return { ok: false, error };

  /* The invite edge function keys on email only; adminName is display-only
     until the function persists a name. */
  const { error: inviteError } = await callEdgeFunction<InviteResponse>(
    "invite-campaign-manager",
    {
      action: "invite",
      company_id: data.company.id,
      email: adminEmail,
      role: "company_admin",
    },
  );
  if (inviteError) {
    return {
      ok: false,
      error: `Company created, but the admin invite failed: ${inviteError}`,
    };
  }

  revalidatePath("/ops");
  revalidatePath("/ops/companies");
  revalidatePath("/ops/invites");
  return { ok: true };
}

export async function inviteCampaignManager(input: {
  companyId: string;
  email: string;
  role?: "company_admin" | "campaign_manager";
}): Promise<OpsActionResult> {
  const denied = await requirePlatformAdmin();
  if (denied) return { ok: false, error: denied };

  const email = input.email.trim();
  if (!email) return { ok: false, error: "Email is required." };

  const { error } = await callEdgeFunction<InviteResponse>(
    "invite-campaign-manager",
    {
      action: "invite",
      company_id: input.companyId,
      email,
      role: input.role ?? "campaign_manager",
    },
  );
  if (error) return { ok: false, error };

  revalidatePath(`/ops/companies/${input.companyId}`);
  revalidatePath("/ops/invites");
  revalidatePath("/ops");
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
