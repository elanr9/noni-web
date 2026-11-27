"use server";

import { revalidatePath } from "next/cache";

import { creatorInviteBlock } from "@/lib/admin/billing";
import { MOCK_DATASET } from "@/lib/admin/mock-data";
import {
  managerAccessPayload,
  parseManagerAccess,
  type ManagerAccess,
  type MemberRole,
} from "@/lib/admin/types";
import { getSessionProfile, isCompanyAdmin, isPlatformAdmin } from "@/lib/auth";
import { callEdgeFunction, type InviteResponse } from "@/lib/edge";
import {
  PERMISSION_DEFS,
  type PermissionKey,
  type Permissions,
} from "@/lib/permissions";
import { isStaleCompany, STALE_COMPANY_ERROR } from "@/lib/stale-company";
import type { Json } from "@/lib/supabase/database.types";
import { createServiceClient } from "@/lib/supabase/service";

export type TeamActionResult =
  | { ok: true }
  | { ok: false; error: string; upgrade?: boolean };

/* Mock mode (dev + ADMIN_QA_MOCK=1): reads come from MOCK_DATASET, so the
   invite writes it in place too, same pattern as @/lib/admin/billing. */
function mockMode(): boolean {
  return (
    process.env.NODE_ENV === "development" && process.env.ADMIN_QA_MOCK === "1"
  );
}

/* Sends the role-bound invite email through the same edge function the ops
   console uses (src/app/ops/actions.ts). The function writes the
   company_invites row with role + company, which is what pre-binds the
   email: signing in with it lands the invitee in the right role with zero
   setup. The name is display-only until the function persists one; Team
   rows derive names from the email.

   Every action here takes the company id its page was rendered for and
   refuses when the caller has since moved to another company (another tab
   or the app switched it), so a stale page never writes to the wrong one. */
export async function sendTeamInvite(input: {
  companyId: string;
  role: MemberRole;
  name: string;
  email: string;
}): Promise<TeamActionResult> {
  const email = input.email.trim();
  const name = input.name.trim();
  if (!name) return { ok: false, error: "Name is required." };
  if (!email) return { ok: false, error: "Email is required." };

  if (mockMode()) {
    const id = `invite-mock-${Date.now()}`;
    MOCK_DATASET.invites.unshift({
      id,
      name,
      email,
      role: input.role,
      sent: "Just now",
      status: "Pending",
    });
    const row = {
      id,
      role: input.role,
      name,
      email,
      status: "Invite sent" as const,
      joined: "Just now",
    };
    if (input.role === "Campaign manager") MOCK_DATASET.managers.push(row);
    else MOCK_DATASET.creators.push(row);
    revalidatePath("/admin", "layout");
    return { ok: true };
  }

  const { profile } = await getSessionProfile();
  if (!isCompanyAdmin(profile) && !isPlatformAdmin(profile)) {
    return { ok: false, error: "Company admins only." };
  }
  const companyId = profile?.active_company_id;
  if (!companyId) return { ok: false, error: "No company on this account." };
  if (isStaleCompany(companyId, input.companyId)) {
    return { ok: false, error: STALE_COMPANY_ERROR };
  }

  /* Paywall and creator cap (design_handoff_pricing_plans): creators need
     an active plan with room under its cap. Managers do not count. */
  if (input.role === "Creator") {
    const block = await creatorInviteBlock(
      companyId,
      isCompanyAdmin(profile) ? "admin" : "ops",
    );
    if (block) return { ok: false, error: block.error, upgrade: true };
  }

  const { data, error } = await callEdgeFunction<InviteResponse>(
    "invite-campaign-manager",
    {
      action: "invite",
      company_id: companyId,
      email,
      role: input.role === "Campaign manager" ? "campaign_manager" : "creator",
    },
  );
  if (error !== null) {
    if (/already a member/i.test(error)) {
      return { ok: false, error: `${email} is already part of this company.` };
    }
    return { ok: false, error };
  }

  /* The invite edge function keys on email only, so the typed name is
     stored here; Team rows and onboarding read it (same as ops-side). */
  await createServiceClient()
    .from("company_invites")
    .update({ invited_name: name })
    .eq("id", data.invite.id);

  /* Team rows, the setup to-do and the nav badge all shift with an invite. */
  revalidatePath("/admin", "layout");
  return { ok: true };
}

const INVITE_ID_PREFIX = "invite-";

/* Detaches a campaign manager or creator from this company, or cancels a
   pending invite. The company admin cannot remove themselves. A later invite to
   the same Google account reattaches via claim_pending_invite. */
export async function removeTeamMember(
  renderedFor: string,
  memberId: string,
): Promise<TeamActionResult> {
  if (!memberId) return { ok: false, error: "Missing member." };

  if (mockMode()) {
    MOCK_DATASET.managers = MOCK_DATASET.managers.filter((m) => m.id !== memberId);
    MOCK_DATASET.creators = MOCK_DATASET.creators.filter((m) => m.id !== memberId);
    MOCK_DATASET.invites = MOCK_DATASET.invites.filter(
      (i) => i.id !== memberId && `${INVITE_ID_PREFIX}${i.id}` !== memberId,
    );
    revalidatePath("/admin", "layout");
    return { ok: true };
  }

  const { userId, profile } = await getSessionProfile();
  if (!isCompanyAdmin(profile) && !isPlatformAdmin(profile)) {
    return { ok: false, error: "Company admins only." };
  }
  const companyId = profile?.active_company_id;
  if (!companyId) return { ok: false, error: "No company on this account." };
  if (isStaleCompany(companyId, renderedFor)) {
    return { ok: false, error: STALE_COMPANY_ERROR };
  }
  if (memberId === userId) {
    return { ok: false, error: "You cannot remove yourself." };
  }

  const service = createServiceClient();

  if (memberId.startsWith(INVITE_ID_PREFIX)) {
    const inviteId = memberId.slice(INVITE_ID_PREFIX.length);
    const { data: invite } = await service
      .from("company_invites")
      .select("id, company_id, accepted_at")
      .eq("id", inviteId)
      .maybeSingle();
    if (!invite || invite.company_id !== companyId) {
      return { ok: false, error: "Invite not found." };
    }
    if (invite.accepted_at) {
      return { ok: false, error: "That invite was already accepted." };
    }
    const { error } = await service
      .from("company_invites")
      .delete()
      .eq("id", inviteId)
      .eq("company_id", companyId);
    if (error) return { ok: false, error: error.message };
    revalidatePath("/admin", "layout");
    return { ok: true };
  }

  const { data: target } = await service
    .from("company_roster")
    .select("id, member_role")
    .eq("company_id", companyId)
    .eq("id", memberId)
    .maybeSingle();
  if (!target) return { ok: false, error: "Member not found." };
  if (target.member_role === "company_admin") {
    return { ok: false, error: "The company admin cannot be removed." };
  }
  if (target.member_role !== "campaign_manager" && target.member_role !== "creator") {
    return { ok: false, error: "Only campaign managers and creators can be removed here." };
  }

  /* Soft removal. A trigger moves their active company elsewhere when this
     was the one they were working in; other memberships are untouched. */
  const { error: memberError } = await service
    .from("company_members")
    .update({ removed_at: new Date().toISOString() })
    .eq("company_id", companyId)
    .eq("profile_id", memberId)
    .is("removed_at", null);
  if (memberError) return { ok: false, error: memberError.message };

  revalidatePath("/admin", "layout");
  return { ok: true };
}

/* Per-member permissions live on the membership row for this company, so a
   manager who also works elsewhere keeps separate toggles per company. */
export async function updateMemberPermissions(input: {
  companyId: string;
  memberId: string;
  patch: Permissions;
}): Promise<TeamActionResult> {
  const keys = Object.keys(input.patch) as PermissionKey[];
  if (
    keys.length === 0 ||
    keys.some((k) => !PERMISSION_DEFS.some((def) => def.key === k))
  ) {
    return { ok: false, error: "Unknown permission." };
  }
  if (keys.some((k) => typeof input.patch[k] !== "boolean")) {
    return { ok: false, error: "Each permission must be on or off." };
  }

  if (mockMode()) {
    const member = MOCK_DATASET.managers.find((m) => m.id === input.memberId);
    if (member) member.permissions = { ...member.permissions, ...input.patch };
    revalidatePath("/admin", "layout");
    return { ok: true };
  }

  const { profile } = await getSessionProfile();
  if (!isCompanyAdmin(profile) && !isPlatformAdmin(profile)) {
    return { ok: false, error: "Company admins only." };
  }
  const companyId = profile?.active_company_id;
  if (!companyId) return { ok: false, error: "No company on this account." };
  if (isStaleCompany(companyId, input.companyId)) {
    return { ok: false, error: STALE_COMPANY_ERROR };
  }

  const service = createServiceClient();
  const { data: row, error: readError } = await service
    .from("company_members")
    .select("role, permissions")
    .eq("company_id", companyId)
    .eq("profile_id", input.memberId)
    .is("removed_at", null)
    .maybeSingle();
  if (readError) return { ok: false, error: readError.message };
  if (!row) return { ok: false, error: "Member not found." };
  if (row.role !== "campaign_manager") {
    return { ok: false, error: "Only campaign managers have permission toggles." };
  }

  const current =
    row.permissions && typeof row.permissions === "object" && !Array.isArray(row.permissions)
      ? (row.permissions as Record<string, Json>)
      : {};
  const { error } = await service
    .from("company_members")
    .update({ permissions: { ...current, ...input.patch } })
    .eq("company_id", companyId)
    .eq("profile_id", input.memberId)
    .is("removed_at", null);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/admin", "layout");
  return { ok: true };
}

const ACCESS_KEYS = [
  "viewFinancials",
  "viewSignups",
  "inviteCreators",
] as const satisfies ReadonlyArray<keyof ManagerAccess>;

/* Company-wide campaign manager access in the app. Stored on
   companies.settings.manager_access so the iOS app can read the same flags. */
export async function updateManagerAccess(
  renderedFor: string,
  patch: Partial<ManagerAccess>,
): Promise<TeamActionResult> {
  const keys = Object.keys(patch) as Array<keyof ManagerAccess>;
  if (keys.length === 0 || keys.some((k) => !ACCESS_KEYS.includes(k))) {
    return { ok: false, error: "Unknown setting." };
  }
  if (keys.some((k) => typeof patch[k] !== "boolean")) {
    return { ok: false, error: "Each setting must be on or off." };
  }

  if (mockMode()) {
    MOCK_DATASET.company.managerAccess = {
      ...MOCK_DATASET.company.managerAccess,
      ...patch,
    };
    revalidatePath("/admin", "layout");
    return { ok: true };
  }

  const { profile } = await getSessionProfile();
  if (!isCompanyAdmin(profile) && !isPlatformAdmin(profile)) {
    return { ok: false, error: "Company admins only." };
  }
  const companyId = profile?.active_company_id;
  if (!companyId) return { ok: false, error: "No company on this account." };
  if (isStaleCompany(companyId, renderedFor)) {
    return { ok: false, error: STALE_COMPANY_ERROR };
  }

  const service = createServiceClient();
  const { data: row, error: readError } = await service
    .from("companies")
    .select("settings")
    .eq("id", companyId)
    .maybeSingle();
  if (readError) return { ok: false, error: readError.message };
  if (!row) return { ok: false, error: "Company not found." };

  const settings =
    row.settings && typeof row.settings === "object" && !Array.isArray(row.settings)
      ? { ...(row.settings as Record<string, unknown>) }
      : {};
  const next = { ...parseManagerAccess(settings), ...patch };
  settings.manager_access = managerAccessPayload(next);

  const { error } = await service
    .from("companies")
    .update({ settings })
    .eq("id", companyId);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/admin", "layout");
  return { ok: true };
}

/* The "I'll manage it" option on the campaign manager setup step: the admin
   runs the campaigns, so they show as an Active campaign manager on Team and
   the step is done with nobody to invite. */
export async function manageItMyself(renderedFor: string): Promise<TeamActionResult> {
  if (mockMode()) {
    MOCK_DATASET.company.onboarding.selfIsManager = true;
    revalidatePath("/admin", "layout");
    return { ok: true };
  }

  const { profile } = await getSessionProfile();
  if (!isCompanyAdmin(profile) && !isPlatformAdmin(profile)) {
    return { ok: false, error: "Company admins only." };
  }
  const companyId = profile?.active_company_id;
  if (!companyId) return { ok: false, error: "No company on this account." };
  if (isStaleCompany(companyId, renderedFor)) {
    return { ok: false, error: STALE_COMPANY_ERROR };
  }

  const { error } = await createServiceClient()
    .from("companies")
    .update({ self_is_manager: true })
    .eq("id", companyId);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/admin", "layout");
  return { ok: true };
}
