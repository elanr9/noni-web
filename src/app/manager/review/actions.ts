"use server";

import { revalidatePath } from "next/cache";

import { getSessionProfile, canManageCampaigns } from "@/lib/auth";
import { callEdgeFunction } from "@/lib/edge";
import { parseNotes } from "@/lib/manager/review";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";

export type ReviewActionResult = { ok: true } | { ok: false; error: string };

/* Fire and forget notify, matching the mobile `void supabase.functions
   .invoke('notify', ...)` calls. Failures never block the review. */
function sendNotify(body: Record<string, unknown>): void {
  void callEdgeFunction("notify", body).catch(() => undefined);
}

/* Review a submitted post, ported from mobile lib/admin-api.ts
   reviewAssignment. The status moves through the same guarded transition
   (submitted -> approved | changes_requested, compare and swap on the
   current status) and the review_events row is written the same way.
   Approval stamps assignments.publish_at through schedule_assignment_publish;
   the publish-due cron posts it at the slot time (migration 081). */
export async function reviewPost(input: {
  assignmentId: string;
  submissionId: string;
  action: "approved" | "changes_requested";
  note: string | null;
}): Promise<ReviewActionResult> {
  if (input.action !== "approved" && input.action !== "changes_requested") {
    return { ok: false, error: "Unknown action." };
  }

  const { userId, profile } = await getSessionProfile();
  if (!userId || !canManageCampaigns(profile) || !profile?.company_id) {
    return { ok: false, error: "Campaign managers only." };
  }
  const companyId = profile.company_id;
  const service = createServiceClient();

  const { data: assignmentData, error: assignmentError } = await service
    .from("assignments")
    .select("id, status, creator_id, briefs:brief_id ( format )")
    .eq("company_id", companyId)
    .eq("id", input.assignmentId)
    .maybeSingle();
  if (assignmentError) return { ok: false, error: assignmentError.message };
  const assignment = assignmentData as unknown as {
    id: string;
    status: string;
    creator_id: string;
    briefs: { format: string | null } | null;
  } | null;
  if (!assignment) return { ok: false, error: "Post not found." };

  /* assertTransition mirror: only submitted can move to approved or
     changes_requested (lib/tasks.ts ALLOWED). */
  if (assignment.status !== "submitted") {
    return { ok: false, error: "This post is not waiting for review anymore." };
  }
  if (input.action === "approved" && assignment.creator_id === userId) {
    return { ok: false, error: "You cannot approve your own submission." };
  }

  const { data: submissionData, error: submissionError } = await service
    .from("submissions")
    .select("id, assignment_id, render_status")
    .eq("id", input.submissionId)
    .maybeSingle();
  if (submissionError) return { ok: false, error: submissionError.message };
  const submission = submissionData as {
    id: string;
    assignment_id: string | null;
    render_status: string | null;
  } | null;
  if (!submission || submission.assignment_id !== input.assignmentId) {
    return { ok: false, error: "This post has no video to review yet." };
  }

  /* The finished edit is what gets scheduled, so a video mid render cannot
     be approved (mobile blocks this with the Still editing alert). */
  const isVideo = assignment.briefs?.format !== "photo_carousel";
  if (
    input.action === "approved" &&
    isVideo &&
    submission.render_status !== null &&
    submission.render_status !== "ready"
  ) {
    return {
      ok: false,
      error:
        "The final video is not ready yet. Wait for the edit to finish before you approve.",
    };
  }

  const { error: eventError } = await service.from("review_events").insert({
    submission_id: submission.id,
    author_id: userId,
    action: input.action,
    note: input.note,
    notes: input.action === "changes_requested" ? parseNotes(input.note) : null,
  });
  if (eventError) return { ok: false, error: eventError.message };

  /* transitionAssignment mirror: compare and swap on the current status so
     concurrent reviews cannot double apply. */
  const { data: updated, error: updateError } = await service
    .from("assignments")
    .update({ status: input.action })
    .eq("id", assignment.id)
    .eq("company_id", companyId)
    .eq("status", "submitted")
    .select("id")
    .maybeSingle();
  if (updateError) return { ok: false, error: updateError.message };
  if (!updated) {
    return { ok: false, error: "This post was just reviewed by someone else." };
  }

  if (input.action === "approved") {
    /* The rpc reads auth.uid() for is_campaign_manager and
       current_company_id, so it runs on the session client, not the
       service role. */
    const userClient = await createClient();
    const { error: scheduleError } = await userClient.rpc(
      "schedule_assignment_publish",
      { p_assignment_id: assignment.id },
    );
    if (scheduleError) {
      revalidatePath("/manager", "layout");
      return { ok: false, error: scheduleError.message };
    }
  }

  sendNotify({ assignment_id: assignment.id, event: input.action });

  revalidatePath("/manager", "layout");
  return { ok: true };
}
