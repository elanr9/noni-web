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

/** A company admin opening their invite is signed in from the link itself:
    the token was emailed to that address, so it proves the inbox, the same
    way a sign-in link does. Works only while the invite is unused and in
    date; after that they sign in from /login. Signs out any other account
    in this browser first. */
export async function continueInvite(token: string): Promise<{ ok: true } | { ok: false; error: string }> {
  const service = createServiceClient();
  const { data: invite } = await service
    .from("company_invites")
    .select("email, invited_name, role, accepted_at, expires_at")
    .eq("token", token)
    .maybeSingle();
  if (!invite || invite.role !== "company_admin") return { ok: false, error: "This invite link is not valid." };
  if (invite.accepted_at) return { ok: false, error: "This invite was already used. Sign in instead." };
  if (Date.parse(invite.expires_at) < Date.now()) return { ok: false, error: "This invite has expired. Ask your Noni contact for a new one." };

  const email = String(invite.email).trim().toLowerCase();
  const name = typeof invite.invited_name === "string" ? invite.invited_name.trim() : "";

  /* The account is made confirmed; an existing one (say from Google) is reused. */
  const created = await service.auth.admin.createUser({
    email,
    email_confirm: true,
    ...(name ? { user_metadata: { full_name: name } } : {}),
  });
  if (created.error && !/already|registered|exists/i.test(created.error.message)) {
    return { ok: false, error: created.error.message };
  }

  const { data: link, error: linkError } = await service.auth.admin.generateLink({ type: "magiclink", email });
  const hash = link?.properties?.hashed_token;
  if (linkError || !hash) return { ok: false, error: linkError?.message ?? "Sign in did not start. Try again." };

  const supabase = await createClient();
  await supabase.auth.signOut({ scope: "local" });
  const { error: verifyError } = await supabase.auth.verifyOtp({ type: "magiclink", token_hash: hash });
  if (verifyError) return { ok: false, error: verifyError.message };

  if (name) {
    const { data: me } = await supabase.auth.getUser();
    if (me.user) {
      await service.from("profiles").update({ full_name: name }).eq("id", me.user.id).or("full_name.is.null,full_name.eq.");
    }
  }
  return { ok: true };
}
