"use server";

import { revalidatePath } from "next/cache";

import { getSessionProfile, isCampaignManager } from "@/lib/auth";
import { callEdgeFunction } from "@/lib/edge";
import { createServiceClient } from "@/lib/supabase/service";

export type MusicActionResult = { ok: true } | { ok: false; error: string };

function sendNotify(body: Record<string, unknown>): void {
  void callEdgeFunction("notify", body).catch(() => undefined);
}

/* Accept the song on a live slideshow, ported from mobile lib/admin-api.ts
   approveMusic. Approval unlocks that post's earnings (the gate itself is
   enforced in poll-metrics bounty crediting). */
export async function approveMusicAction(
  assignmentId: string,
): Promise<MusicActionResult> {
  const { userId, profile } = await getSessionProfile();
  if (!userId || !isCampaignManager(profile) || !profile?.company_id) {
    return { ok: false, error: "Campaign managers only." };
  }
  const service = createServiceClient();

  const { data, error } = await service
    .from("assignments")
    .update({
      music_approved_at: new Date().toISOString(),
      music_approved_by: userId,
    })
    .eq("company_id", profile.company_id)
    .eq("id", assignmentId)
    .select("id")
    .maybeSingle();
  if (error) return { ok: false, error: error.message };
  if (!data) return { ok: false, error: "Post not found." };

  sendNotify({ assignment_id: assignmentId, event: "music_approved" });

  revalidatePath("/manager", "layout");
  return { ok: true };
}

/* Send the song back, ported from mobile lib/admin-api.ts
   requestMusicChanges: clears the creator's music mark so the post leaves
   the approval queue, then drops the reasons and note into the review
   thread as a comment so the creator sees what to fix. It re-enters the
   queue when the creator taps Music added again. */
export async function requestMusicChangesAction(input: {
  assignmentId: string;
  reasons: string[];
  note: string | null;
}): Promise<MusicActionResult> {
  const { userId, profile } = await getSessionProfile();
  if (!userId || !isCampaignManager(profile) || !profile?.company_id) {
    return { ok: false, error: "Campaign managers only." };
  }
  const service = createServiceClient();

  const { data, error } = await service
    .from("assignments")
    .update({ music_marked_by_creator_at: null })
    .eq("company_id", profile.company_id)
    .eq("id", input.assignmentId)
    .select("id")
    .maybeSingle();
  if (error) return { ok: false, error: error.message };
  if (!data) return { ok: false, error: "Post not found." };

  const parts = [...input.reasons];
  const note = input.note?.trim();
  if (note) parts.push(note);
  const message = parts.join(". ");

  if (message) {
    const { data: submission, error: subError } = await service
      .from("submissions")
      .select("id")
      .eq("assignment_id", input.assignmentId)
      .order("version", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (subError) return { ok: false, error: subError.message };

    if (submission !== null) {
      const { error: eventError } = await service.from("review_events").insert({
        submission_id: (submission as { id: string }).id,
        author_id: userId,
        action: "comment",
        note: message,
      });
      if (eventError) return { ok: false, error: eventError.message };
    }

    sendNotify({ assignment_id: input.assignmentId, event: "comment" });
  }

  revalidatePath("/manager", "layout");
  return { ok: true };
}
