"use server";

import { getSessionProfile } from "@/lib/auth";
import { callEdgeFunction, type AcceptInviteResponse } from "@/lib/edge";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { inviteDestination } from "./destination";

export type AcceptResult =
  | {
      ok: true;
      /** Where the web goes next; null for a seat that only runs in the app. */
      destination: string | null;
      /** False when the membership was added but the switch into the
          company did not go through; the company menu still offers it. */
      switched: boolean;
    }
  | { ok: false; error: string };

export async function acceptInvite(token: string): Promise<AcceptResult> {
  const { userId } = await getSessionProfile();
  if (!userId) return { ok: false, error: "You need to sign in first." };

  const service = createServiceClient();
  const { data, error } = await callEdgeFunction<AcceptInviteResponse>(
    "invite-campaign-manager",
    { action: "accept", token },
  );

  let companyId: string;
  if (error === null) {
    companyId = data.company_id;
  } else {
    /* A second attempt (a retry, a reload, or the link opened again) finds
       the invite already used. When this account is the one holding the
       seat, carry on and land them in the company instead of failing. */
    if (error !== "invite already accepted") return { ok: false, error };
    const { data: invite } = await service
      .from("company_invites")
      .select("company_id")
      .eq("token", token)
      .maybeSingle();
    if (!invite) return { ok: false, error };
    companyId = invite.company_id;
  }

  /* Route by the seat this account now holds there, not by the invite: a
     manager invited as a creator keeps managing. */
  const { data: seat } = await service
    .from("company_members")
    .select("role, companies(onboarded_at)")
    .eq("company_id", companyId)
    .eq("profile_id", userId)
    .is("removed_at", null)
    .maybeSingle();
  const member = seat as
    | { role: string | null; companies: { onboarded_at: string | null } | null }
    | null;
  if (!member) {
    return { ok: false, error: error ?? "invite could not be applied" };
  }

  /* Accepting lands the account in the invited company, even when it was
     already working somewhere else: the active company is one value shared
     with the app, and apply_invite_membership only sets it when empty. */
  const supabase = await createClient();
  const { error: switchError } = await supabase.rpc("set_active_company", {
    p_company_id: companyId,
  });

  return {
    ok: true,
    destination: switchError
      ? "/dash"
      : inviteDestination(member.role, Boolean(member.companies?.onboarded_at)),
    switched: !switchError,
  };
}
