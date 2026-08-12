"use server";

import { revalidatePath } from "next/cache";

import { MOCK_DATASET } from "@/lib/admin/mock-data";
import type { MemberRole } from "@/lib/admin/types";
import { getSessionProfile, isCompanyAdmin, isPlatformAdmin } from "@/lib/auth";
import { callEdgeFunction, type InviteResponse } from "@/lib/edge";

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

  const { error } = await callEdgeFunction<InviteResponse>(
    "invite-campaign-manager",
    {
      action: "invite",
      company_id: companyId,
      email,
      role: input.role === "Campaign manager" ? "campaign_manager" : "creator",
    },
  );
  if (error) return { ok: false, error };

  /* Team rows, the setup to-do and the nav badge all shift with an invite. */
  revalidatePath("/admin", "layout");
  return { ok: true };
}
