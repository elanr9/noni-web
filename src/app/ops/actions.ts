"use server";

import { revalidatePath } from "next/cache";
import { getSessionProfile, isPlatformAdmin } from "@/lib/auth";
import {
  callEdgeFunction,
  type CreateCompanyResponse,
  type InviteResponse,
} from "@/lib/edge";
import { uploadCompanyLogo } from "@/lib/company-logo";
import { createServiceClient } from "@/lib/supabase/service";

export type OpsActionResult = { ok: true } | { ok: false; error: string };

export type CreateCompanyResult =
  | {
      ok: true;
      companyId: string;
      /** Companies the admin email already belongs to. Their new admin
          membership is added alongside; nothing existing is replaced. */
      existingCompanies: number;
    }
  | { ok: false; error: string };

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
}): Promise<CreateCompanyResult> {
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

  const { data: inviteData, error: inviteError } = await callEdgeFunction<InviteResponse>(
    "invite-campaign-manager",
    {
      action: "invite",
      company_id: data.company.id,
      email: adminEmail,
      role: "company_admin",
    },
  );
  if (inviteError !== null) {
    return {
      ok: false,
      error: `Company created, but the admin invite failed: ${inviteError}`,
    };
  }

  const service = createServiceClient();

  /* The invite edge function keys on email only, so the admin's name is
     stored here; onboarding prefills the greeting from it. */
  await service
    .from("company_invites")
    .update({ invited_name: input.adminName.trim() })
    .eq("id", inviteData.invite.id);

  /* Accepted invites for this email elsewhere mean the person already has
     memberships; accepting this one adds to them (apply_invite_membership). */
  const { count } = await service
    .from("company_invites")
    .select("id", { count: "exact", head: true })
    .ilike("email", adminEmail)
    .neq("company_id", data.company.id)
    .not("accepted_at", "is", null);

  revalidatePath("/ops");
  revalidatePath("/ops/companies");
  revalidatePath("/ops/invites");
  return { ok: true, companyId: data.company.id, existingCompanies: count ?? 0 };
}

/* Logo for a freshly provisioned company. Platform ops has no membership,
   so the storage policies do not apply; the service role writes the file
   after the platform admin gate. */
export async function setCompanyLogo(
  companyId: string,
  formData: FormData,
): Promise<OpsActionResult> {
  const denied = await requirePlatformAdmin();
  if (denied) return { ok: false, error: denied };
  if (!companyId) return { ok: false, error: "Company id is required." };
  const file = formData.get("logo");
  if (!(file instanceof File)) return { ok: false, error: "Pick an image first." };

  const result = await uploadCompanyLogo(createServiceClient(), companyId, file);
  if (!result.ok) return result;

  revalidatePath("/ops/companies");
  revalidatePath(`/ops/companies/${companyId}`);
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
