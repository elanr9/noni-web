import Link from "next/link";
import { notFound } from "next/navigation";
import { ReviewActions } from "@/components/admin/ReviewActions";
import { createClient } from "@/lib/supabase/server";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function AdminReviewDetailPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: assignment, error } = await supabase
    .from("assignments")
    .select(
      "id, status, created_at, creator_id, briefs:brief_id ( title, format, hook ), profiles:creator_id ( full_name )",
    )
    .eq("id", id)
    .maybeSingle();

  if (error || !assignment) notFound();

  const { data: submission } = await supabase
    .from("submissions")
    .select("id, version, video_path, render_status, render_error, duration_seconds, created_at")
    .eq("assignment_id", id)
    .order("version", { ascending: false })
    .limit(1)
    .maybeSingle();

  let videoUrl: string | null = null;
  if (submission?.video_path) {
    const { data: signed } = await supabase.storage
      .from("videos")
      .createSignedUrl(submission.video_path, 3600);
    videoUrl = signed?.signedUrl ?? null;
  }

  const brief = assignment.briefs as unknown as {
    title: string | null;
    format: string | null;
    hook: string | null;
  } | null;
  const profile = assignment.profiles as unknown as {
    full_name: string | null;
  } | null;
  const canReview = assignment.status === "submitted" && Boolean(submission?.id);

  return (
    <div className="mx-auto max-w-3xl">
      <Link
        href="/admin"
        className="text-sm font-semibold text-muted transition hover:text-ink"
      >
        ← Back to Review
      </Link>

      <div className="mt-5 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="display text-3xl font-semibold text-ink md:text-4xl">
            {brief?.title ?? "Untitled brief"}
          </h1>
          <p className="mt-2 text-[15px] text-muted">
            {profile?.full_name ?? "Creator"} · {brief?.format ?? "content"} · attempt{" "}
            {submission?.version ?? 1}
          </p>
        </div>
        <span className="rounded-full bg-soft px-3 py-1 text-xs font-bold uppercase tracking-wide text-ink-soft">
          {assignment.status}
        </span>
      </div>

      {brief?.hook ? (
        <p className="mt-5 rounded-2xl border border-line bg-white px-4 py-3.5 text-[15px] text-ink">
          {brief.hook}
        </p>
      ) : null}

      <div className="mt-6 overflow-hidden rounded-[24px] border border-line bg-black">
        {videoUrl ? (
          <video
            key={videoUrl}
            src={videoUrl}
            controls
            playsInline
            className="aspect-[9/16] max-h-[70vh] w-full object-contain"
          />
        ) : (
          <div className="flex aspect-[9/16] max-h-[70vh] items-center justify-center px-6 text-center text-sm text-white/70">
            {submission
              ? `No playable video yet${submission.render_status ? ` (${submission.render_status})` : ""}.`
              : "This post has no submission yet."}
          </div>
        )}
      </div>

      {submission?.render_error ? (
        <p className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {submission.render_error}
        </p>
      ) : null}

      <div className="mt-6">
        {canReview && submission ? (
          <ReviewActions assignmentId={assignment.id} submissionId={submission.id} />
        ) : (
          <p className="rounded-2xl border border-line bg-white px-4 py-3.5 text-[15px] text-muted">
            {assignment.status === "submitted"
              ? "Waiting on a submission before you can approve."
              : "This item is already past review."}
          </p>
        )}
      </div>
    </div>
  );
}
