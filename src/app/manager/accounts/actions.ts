"use server";

import { revalidatePath } from "next/cache";

import { getSessionProfile, isCampaignManager } from "@/lib/auth";
import { callEdgeFunction } from "@/lib/edge";
import { createServiceClient } from "@/lib/supabase/service";

export type AccountActionResult = { ok: true } | { ok: false; error: string };

/* The admin decision, stored as structured data (not free text) so the same
   checks can later run as an automated vision pass over the uploads
   (mobile lib/creator-accounts-api.ts AccountDecision). */
export type AccountDecision = {
  instagram_recording_ok: boolean;
  tiktok_recording_ok: boolean;
  feed_is_niche: boolean;
  profile_matches_template: boolean;
};

function sendNotify(body: Record<string, unknown>): void {
  void callEdgeFunction("notify", body).catch(() => undefined);
}

/* Approve or send back an account submission, ported from mobile
   lib/creator-accounts-api.ts decideAccount: status flips to approved or
   needs_changes (a reason is required when requesting changes), the
   structured decision plus decided_by / decided_at are stored, and the
   creator gets the account_decided notification. */
export async function decideAccountAction(input: {
  accountId: string;
  status: "approved" | "needs_changes";
  reason: string | null;
  decision: AccountDecision;
}): Promise<AccountActionResult> {
  if (input.status !== "approved" && input.status !== "needs_changes") {
    return { ok: false, error: "Unknown decision." };
  }
  if (input.status === "needs_changes" && !input.reason?.trim()) {
    return { ok: false, error: "A reason is required when requesting changes" };
  }

  const { userId, profile } = await getSessionProfile();
  if (!userId || !isCampaignManager(profile) || !profile?.company_id) {
    return { ok: false, error: "Campaign managers only." };
  }
  const service = createServiceClient();

  const { data, error } = await service
    .from("creator_accounts")
    .update({
      status: input.status,
      reason: input.reason,
      decision: input.decision,
      decided_by: userId,
      decided_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("company_id", profile.company_id)
    .eq("id", input.accountId)
    .select("creator_id")
    .maybeSingle();
  if (error) return { ok: false, error: error.message };
  if (!data) return { ok: false, error: "Account submission not found." };

  sendNotify({
    creator_id: (data as { creator_id: string }).creator_id,
    status: input.status,
    event: "account_decided",
  });

  revalidatePath("/manager", "layout");
  return { ok: true };
}
