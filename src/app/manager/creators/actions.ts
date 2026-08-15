"use server";

import { revalidatePath } from "next/cache";

import { getSessionProfile, isCampaignManager } from "@/lib/auth";
import { callEdgeFunction, type InviteResponse } from "@/lib/edge";
import { getManagerContext } from "@/lib/manager/context";
import { signedMediaUrl } from "@/lib/manager/storage";
import { createServiceClient } from "@/lib/supabase/service";

export type CreatorActionResult = { ok: true } | { ok: false; error: string };

/* Sends a creator invite through the same edge function the admin Team page
   uses (src/app/admin/team/actions.ts sendTeamInvite): the function writes
   the company_invites row with role + company, which pre-binds the email so
   signing in with it lands the invitee as a creator with zero setup. Gated
   on the company's inviteCreators manager access flag. */
export async function sendCreatorInvite(input: {
  name: string;
  email: string;
}): Promise<CreatorActionResult> {
  const email = input.email.trim();
  const name = input.name.trim();
  if (!name) return { ok: false, error: "Name is required." };
  if (!email) return { ok: false, error: "Email is required." };

  const { profile } = await getSessionProfile();
  if (!isCampaignManager(profile)) {
    return { ok: false, error: "Campaign managers only." };
  }
  const companyId = profile?.company_id;
  if (!companyId) return { ok: false, error: "No company on this account." };

  const { access } = await getManagerContext(companyId);
  if (!access.inviteCreators) {
    return { ok: false, error: "Creator invites are off for managers." };
  }

  const { data, error } = await callEdgeFunction<InviteResponse>(
    "invite-campaign-manager",
    {
      action: "invite",
      company_id: companyId,
      email,
      role: "creator",
    },
  );
  if (error !== null) return { ok: false, error };

  /* The invite edge function keys on email only, so the typed name is
     stored here; roster rows read it (same as the admin Team page). */
  await createServiceClient()
    .from("company_invites")
    .update({ invited_name: name })
    .eq("id", data.invite.id);

  revalidatePath("/manager/creators");
  return { ok: true };
}

/* Chat media lives in the private videos bucket. The thread runs client
   side, so bubbles ask the server to sign each path; the session is
   re-checked here before the service client signs anything. */
export async function signChatMedia(path: string): Promise<string | null> {
  if (!path) return null;
  const { profile } = await getSessionProfile();
  if (!isCampaignManager(profile) || !profile?.company_id) return null;
  /* Chat media paths are minted as {companyId}/chat/{creatorId}/... by the
     apps; refuse to sign anything outside this manager's company. */
  if (!path.startsWith(`${profile.company_id}/`)) return null;
  return signedMediaUrl("videos", path);
}
