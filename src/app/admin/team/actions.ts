"use server";

import { revalidatePath } from "next/cache";

import {
  companyCreatorCount,
  companyPlanTier,
  PLAN_CREATOR_CAP,
  PLAN_TIER_LABEL,
} from "@/lib/admin/billing";
import { MOCK_DATASET } from "@/lib/admin/mock-data";
import type { MemberRole } from "@/lib/admin/types";
import { getSessionProfile, isCompanyAdmin, isPlatformAdmin } from "@/lib/auth";
import { callEdgeFunction, type InviteResponse } from "@/lib/edge";
import { createServiceClient } from "@/lib/supabase/service";

export type TeamActionResult = { ok: true } | { ok: false; error: string };

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
   rows derive names from the email. */
export async function sendTeamInvite(input: {
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
  const companyId = profile?.company_id;
  if (!companyId) return { ok: false, error: "No company on this account." };

  /* Plans differ only in how many creators a company can run, so the cap
     is enforced here, the one place creators get added. */
  if (input.role === "Creator") {
    const tier = await companyPlanTier(companyId);
    const cap = tier ? PLAN_CREATOR_CAP[tier] : null;
    if (tier && cap !== null) {
      const creators = await companyCreatorCount(companyId);
      if (creators >= cap) {
        const fix =
          tier === "starter"
            ? "Upgrade to Premium in Billing for 15."
            : "Contact us in Billing about Enterprise for unlimited creators.";
        return {
          ok: false,
          error: `${PLAN_TIER_LABEL[tier]} allows ${cap} creators. ${fix}`,
        };
      }
    }
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
  if (error !== null) return { ok: false, error };

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

/* Detaches a campaign manager from this company, or cancels a pending
   invite. The company admin cannot remove themselves. A later invite to
   the same Google account reattaches via claim_pending_invite. */
export async function removeTeamMember(
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
  const companyId = profile?.company_id;
  if (!companyId) return { ok: false, error: "No company on this account." };
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
    .from("profiles")
    .select("id, role, company_id")
    .eq("id", memberId)
    .maybeSingle();
  if (!target || target.company_id !== companyId) {
    return { ok: false, error: "Member not found." };
  }
  if (target.role === "company_admin") {
    return { ok: false, error: "The company admin cannot be removed." };
  }
  if (target.role !== "campaign_manager") {
    return { ok: false, error: "Only campaign managers can be removed here." };
  }

  const { error: memberError } = await service
    .from("company_members")
    .delete()
    .eq("company_id", companyId)
    .eq("profile_id", memberId);
  if (memberError) return { ok: false, error: memberError.message };

  const { error: profileError } = await service
    .from("profiles")
    .update({ company_id: null })
    .eq("id", memberId)
    .eq("company_id", companyId);
  if (profileError) return { ok: false, error: profileError.message };

  revalidatePath("/admin", "layout");
  return { ok: true };
}
