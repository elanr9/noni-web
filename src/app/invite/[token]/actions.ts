"use server";

import { getSessionProfile } from "@/lib/auth";
import { callEdgeFunction, type AcceptInviteResponse } from "@/lib/edge";

export type AcceptResult = { ok: true } | { ok: false; error: string };

export async function acceptInvite(token: string): Promise<AcceptResult> {
  const { userId } = await getSessionProfile();
  if (!userId) return { ok: false, error: "You need to sign in first." };

  const { error } = await callEdgeFunction<AcceptInviteResponse>(
    "invite-campaign-manager",
    { action: "accept", token },
  );
  if (error) return { ok: false, error };
  return { ok: true };
}
