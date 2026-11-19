"use server";

import { getSessionProfile } from "@/lib/auth";
import { callEdgeFunction, type AcceptInviteResponse } from "@/lib/edge";
import { createClient } from "@/lib/supabase/server";

export type AcceptResult = { ok: true } | { ok: false; error: string };

export async function acceptInvite(token: string): Promise<AcceptResult> {
  const { userId } = await getSessionProfile();
  if (!userId) return { ok: false, error: "You need to sign in first." };

  const { data, error } = await callEdgeFunction<AcceptInviteResponse>(
    "invite-campaign-manager",
    { action: "accept", token },
  );
  if (error !== null) return { ok: false, error };

  /* A new admin starts in the company they were just invited to run, even
     when their account was already working somewhere else. */
  if (data.role === "company_admin") {
    const supabase = await createClient();
    await supabase.rpc("set_active_company", { p_company_id: data.company_id });
  }
  return { ok: true };
}
