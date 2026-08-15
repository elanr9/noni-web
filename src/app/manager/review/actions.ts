"use server";

import { revalidatePath } from "next/cache";

import { getSessionProfile, isCampaignManager } from "@/lib/auth";
import { callEdgeFunction } from "@/lib/edge";
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
   Approval also runs the post-approved pipeline, exactly like mobile. */
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
  if (!userId || !isCampaignManager(profile) || !profile?.company_id) {
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

  /* Approving posts the finished edit, so a video mid render cannot be
     approved (mobile blocks this with the Still editing alert). */
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
        "The final video is not ready yet. It gets posted the moment you approve so wait for the edit to finish.",
    };
  }

  const { error: eventError } = await service.from("review_events").insert({
    submission_id: submission.id,
    author_id: userId,
    action: input.action,
    note: input.note,
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

  sendNotify({ assignment_id: assignment.id, event: input.action });

  if (input.action === "approved") {
    const { data: postResult, error: postError } = await callEdgeFunction<{
      error?: string;
    }>("post-approved", { assignment_id: assignment.id });
    if (postError !== null) {
      revalidatePath("/manager", "layout");
      return { ok: false, error: postError };
    }
    if (postResult?.error) {
      revalidatePath("/manager", "layout");
      return { ok: false, error: postResult.error };
    }
    /* The post is through Upload-Post: tell the creator, with deep links to
       both platforms resolved server side by notify. */
    sendNotify({ assignment_id: assignment.id, event: "post_live" });
  }

  revalidatePath("/manager", "layout");
  return { ok: true };
}
