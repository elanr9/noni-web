"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getSessionProfile, isAdmin } from "@/lib/auth";

type TaskStatus =
  | "assigned"
  | "recorded"
  | "submitted"
  | "changes_requested"
  | "approved"
  | "posted";

const ALLOWED: Record<TaskStatus, TaskStatus[]> = {
  assigned: ["recorded"],
  recorded: ["submitted"],
  submitted: ["changes_requested", "approved"],
  changes_requested: ["recorded"],
  approved: ["posted"],
  posted: [],
};

export type ReviewActionResult = { ok: true } | { ok: false; error: string };

export async function reviewSubmission(input: {
  assignmentId: string;
  submissionId: string;
  action: "approved" | "changes_requested";
  note?: string | null;
}): Promise<ReviewActionResult> {
  const { userId, profile } = await getSessionProfile();
  if (!userId || !isAdmin(profile)) {
    return { ok: false, error: "Admin only." };
  }

  const supabase = await createClient();
  const { data: assignment, error: assignmentError } = await supabase
    .from("assignments")
    .select("id, status, creator_id")
    .eq("id", input.assignmentId)
    .maybeSingle();

  if (assignmentError || !assignment) {
    return { ok: false, error: assignmentError?.message ?? "Assignment not found." };
  }

  if (assignment.creator_id === userId) {
    return { ok: false, error: "You cannot approve your own submission." };
  }

  const from = assignment.status as TaskStatus;
  if (!ALLOWED[from]?.includes(input.action)) {
    return {
      ok: false,
      error: `Invalid transition: ${from} to ${input.action}.`,
    };
  }

  const { error: eventError } = await supabase.from("review_events").insert({
    submission_id: input.submissionId,
    author_id: userId,
    action: input.action,
    note: input.note ?? null,
  });
  if (eventError) {
    return { ok: false, error: eventError.message };
  }

  const { data: updated, error: updateError } = await supabase
    .from("assignments")
    .update({ status: input.action })
    .eq("id", input.assignmentId)
    .eq("status", from)
    .select("id")
    .maybeSingle();

  if (updateError) {
    return { ok: false, error: updateError.message };
  }
  if (!updated) {
    return { ok: false, error: "This item was already reviewed." };
  }

  void supabase.functions.invoke("notify", {
    body: { assignment_id: input.assignmentId, event: input.action },
  });

  if (input.action === "approved") {
    const { data: postResult, error: postError } = await supabase.functions.invoke(
      "post-approved",
      { body: { assignment_id: input.assignmentId } },
    );
    if (postError) {
      return { ok: false, error: postError.message };
    }
    const errMsg = (postResult as { error?: string } | null)?.error;
    if (errMsg) {
      return { ok: false, error: errMsg };
    }
    void supabase.functions.invoke("notify", {
      body: { assignment_id: input.assignmentId, event: "post_live" },
    });
  }

  revalidatePath("/admin");
  revalidatePath(`/admin/review/${input.assignmentId}`);
  revalidatePath("/admin/library");
  return { ok: true };
}
