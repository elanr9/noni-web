import { cache } from "react";

import { signedMediaUrl } from "@/lib/manager/storage";
import { createServiceClient } from "@/lib/supabase/service";

/* Server reads for the manager Review section, ported from the mobile app's
   lib/admin-api.ts, lib/creator-accounts-api.ts and lib/admin-queue-map.ts.
   Every query is scoped by the session profile's company_id; the /manager
   layout gate has already verified the role. */

/* Storage buckets, matching the mobile libs: submissions upload to `videos`
   (lib/submissions.ts) and account warm-up proof to `account-verification`
   (lib/creator-accounts-api.ts VERIFICATION_BUCKET). */
export const VIDEOS_BUCKET = "videos";
export const VERIFICATION_BUCKET = "account-verification";

export type PostFormat = "video" | "photo_carousel";

export type ReviewSection = {
  key: string;
  label: string;
  text: string;
};

/* --- Shared formatting, ported from lib/admin-queue-map.ts ---------------- */

export function formatAge(iso: string | null | undefined): string {
  if (!iso) return "just now";
  const ms = Date.now() - new Date(iso).getTime();
  if (Number.isNaN(ms) || ms < 0) return "just now";
  const mins = Math.floor(ms / 60_000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString("en-US");
}

function asFormat(raw: string | null | undefined): PostFormat {
  return raw === "photo_carousel" ? "photo_carousel" : "video";
}

function formatLengthLabel(
  format: PostFormat,
  durationSeconds: number | null | undefined,
): string {
  if (format === "photo_carousel") return "Slideshow";
  const sec = durationSeconds ?? 0;
  if (sec <= 0) return "Reel";
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

/* Split script into untimed lines (paragraphs / ---). */
function scriptToLines(script: string | null | undefined): string[] {
  if (!script?.trim()) return [];
  return script
    .split(/\n\s*---\s*\n|\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);
}

/* Slideshow slide copy from script (--- or newlines). */
function slidesFromScript(script: string | null | undefined): string[] {
  if (!script?.trim()) return [""];
  const parts = script
    .split(/\n\s*---\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
  if (parts.length > 1) return parts;
  const lines = script
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
  return lines.length > 0 ? lines : [""];
}

/* Hook / Clip n / Outro for Reels, Cover / Slide n / Close for Slideshows. */
function sectionLabel(index: number, count: number, isReel: boolean): string {
  if (index === 0) return isReel ? "Hook" : "Cover";
  if (index === count - 1 && count >= 3) return isReel ? "Outro" : "Close";
  return `${isReel ? "Clip" : "Slide"} ${index}`;
}

/* --- Raw row shapes (service client is untyped) --------------------------- */

type ProfileJoin = { id: string; full_name: string | null } | null;

type BriefJoin = {
  id: string;
  title: string;
  hook: string | null;
  script: string | null;
  caption: string | null;
  hashtags: string[] | null;
  format: string | null;
  point_count: number | null;
};

type AssignmentRow = {
  id: string;
  company_id: string;
  brief_id: string;
  creator_id: string;
  status: string;
  created_at: string;
  music_marked_by_creator_at: string | null;
  music_approved_at: string | null;
  briefs: BriefJoin | null;
  profiles: ProfileJoin;
};

type SubmissionRow = {
  id: string;
  assignment_id: string | null;
  video_path: string | null;
  duration_seconds: number | null;
  version: number | null;
  render_status: string | null;
  render_error: string | null;
  created_at: string | null;
};

type AccountRow = {
  id: string;
  creator_id: string;
  status: string;
  tiktok_handle: string | null;
  instagram_handle: string | null;
  instagram_recording_path: string | null;
  tiktok_recording_path: string | null;
  instagram_screenshot_path: string | null;
  tiktok_screenshot_path: string | null;
  reason: string | null;
  updated_at: string | null;
  profiles: ProfileJoin;
};

/* --- Review home queues ---------------------------------------------------- */

export interface PostQueueItem {
  assignmentId: string;
  creatorName: string;
  briefTitle: string;
  format: PostFormat;
  lengthLabel: string;
  ageLabel: string;
  attempt: number;
  /** hook + points + outro, from the brief. Null when the brief has no count. */
  unitCount: number | null;
}

export interface MusicQueueItem {
  assignmentId: string;
  creatorName: string;
  briefTitle: string;
  ageLabel: string;
  /** Cover + points + close. Null when the brief has no count. */
  slideCount: number | null;
}

export interface AccountQueueItem {
  accountId: string;
  creatorName: string;
  tiktokHandle: string | null;
  instagramHandle: string | null;
  ageLabel: string;
}

export interface ReviewQueues {
  posts: PostQueueItem[];
  music: MusicQueueItem[];
  accounts: AccountQueueItem[];
}

/** Latest submission per assignment id, one query (mobile
    latestSubmissionsByAssignment). */
async function latestSubmissionsByAssignment(
  assignmentIds: string[],
): Promise<Map<string, SubmissionRow>> {
  const map = new Map<string, SubmissionRow>();
  if (assignmentIds.length === 0) return map;
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("submissions")
    .select(
      "id, assignment_id, video_path, duration_seconds, version, render_status, render_error, created_at",
    )
    .in("assignment_id", assignmentIds)
    .order("version", { ascending: false });
  if (error) throw error;
  for (const row of (data ?? []) as SubmissionRow[]) {
    if (row.assignment_id !== null && !map.has(row.assignment_id)) {
      map.set(row.assignment_id, row);
    }
  }
  return map;
}

export const listReviewQueues = cache(
  async (companyId: string): Promise<ReviewQueues> => {
    const supabase = createServiceClient();

    const [postsRes, musicRes, accountsRes] = await Promise.all([
      /* Submitted assignments joined to brief and creator, newest first
         (mobile listAssignmentQueue, plus the company scope). */
      supabase
        .from("assignments")
        .select(
          "id, company_id, brief_id, creator_id, status, created_at, music_marked_by_creator_at, music_approved_at, briefs:brief_id ( id, title, hook, script, caption, hashtags, format, point_count ), profiles:creator_id ( id, full_name )",
        )
        .eq("company_id", companyId)
        .eq("status", "submitted")
        .order("created_at", { ascending: false }),
      /* Slideshows where the creator tapped Music added and no admin has
         approved yet (mobile listMusicApprovalQueue). */
      supabase
        .from("assignments")
        .select(
          "id, company_id, brief_id, creator_id, status, created_at, music_marked_by_creator_at, music_approved_at, briefs:brief_id ( id, title, hook, script, caption, hashtags, format, point_count ), profiles:creator_id ( id, full_name )",
        )
        .eq("company_id", companyId)
        .not("music_marked_by_creator_at", "is", null)
        .is("music_approved_at", null)
        .order("music_marked_by_creator_at", { ascending: true }),
      /* Pending rows only; needs_changes rows are waiting on the creator
         (mobile listAccountApprovalQueue). */
      supabase
        .from("creator_accounts")
        .select("*, profiles:creator_id ( id, full_name )")
        .eq("company_id", companyId)
        .eq("status", "pending")
        .order("updated_at", { ascending: true }),
    ]);
    if (postsRes.error) throw postsRes.error;
    if (musicRes.error) throw musicRes.error;
    if (accountsRes.error) throw accountsRes.error;

    const postRows = (postsRes.data ?? []) as unknown as AssignmentRow[];
    const musicRows = (musicRes.data ?? []) as unknown as AssignmentRow[];
    const accountRows = (accountsRes.data ?? []) as unknown as AccountRow[];

    const subs = await latestSubmissionsByAssignment(postRows.map((a) => a.id));

    const posts: PostQueueItem[] = postRows.map((a) => {
      const submission = subs.get(a.id) ?? null;
      const format = asFormat(a.briefs?.format);
      return {
        assignmentId: a.id,
        creatorName: a.profiles?.full_name?.trim() || "Creator",
        briefTitle: a.briefs?.title ?? "Post",
        format,
        lengthLabel: formatLengthLabel(format, submission?.duration_seconds),
        ageLabel: formatAge(submission?.created_at ?? a.created_at),
        attempt: submission?.version ?? 1,
        unitCount:
          a.briefs !== null && a.briefs.point_count !== null
            ? a.briefs.point_count + 2
            : null,
      };
    });

    const music: MusicQueueItem[] = musicRows.map((a) => ({
      assignmentId: a.id,
      creatorName: a.profiles?.full_name?.trim() || "Creator",
      briefTitle: a.briefs?.title ?? "Post",
      ageLabel: formatAge(a.music_marked_by_creator_at),
      slideCount:
        a.briefs !== null && a.briefs.point_count !== null
          ? a.briefs.point_count + 2
          : null,
    }));

    const accounts: AccountQueueItem[] = accountRows.map((row) => ({
      accountId: row.id,
      creatorName: row.profiles?.full_name?.trim() || "Creator",
      tiktokHandle: row.tiktok_handle,
      instagramHandle: row.instagram_handle,
      ageLabel: formatAge(row.updated_at),
    }));

    return { posts, music, accounts };
  },
);

/* --- Post review detail ---------------------------------------------------- */

export interface PostReviewDetail {
  assignmentId: string;
  creatorId: string;
  creatorName: string;
  tiktokHandle: string | null;
  briefTitle: string;
  hook: string | null;
  caption: string;
  hashtags: string[];
  format: PostFormat;
  ageLabel: string;
  attempt: number;
  submissionId: string | null;
  renderStatus: string | null;
  renderError: string | null;
  /** Signed URL for the finished edit; null until render_status is ready. */
  videoUrl: string | null;
  /** Spoken sections only, for per section change notes. */
  sections: ReviewSection[];
  /** Slideshow display copy; brief_segments overlay text wins over script. */
  slides: string[];
  hasScreenshot: boolean[];
}

export async function getPostReviewDetail(
  companyId: string,
  assignmentId: string,
): Promise<PostReviewDetail | null> {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("assignments")
    .select(
      "id, company_id, brief_id, creator_id, status, created_at, music_marked_by_creator_at, music_approved_at, briefs:brief_id ( id, title, hook, script, caption, hashtags, format, point_count ), profiles:creator_id ( id, full_name )",
    )
    .eq("company_id", companyId)
    .eq("id", assignmentId)
    .maybeSingle();
  if (error) throw error;
  const assignment = data as unknown as AssignmentRow | null;
  if (!assignment || assignment.status !== "submitted" || !assignment.briefs) {
    return null;
  }

  const [subs, segmentsRes, accountRes] = await Promise.all([
    latestSubmissionsByAssignment([assignment.id]),
    supabase
      .from("brief_segments")
      .select("slot_index, overlay_text, screenshot_url")
      .eq("company_id", companyId)
      .eq("brief_id", assignment.brief_id)
      .order("slot_index", { ascending: true }),
    supabase
      .from("creator_accounts")
      .select("tiktok_handle")
      .eq("company_id", companyId)
      .eq("creator_id", assignment.creator_id)
      .maybeSingle(),
  ]);
  if (segmentsRes.error) throw segmentsRes.error;

  const submission = subs.get(assignment.id) ?? null;
  const brief = assignment.briefs;
  const format = asFormat(brief.format);
  const isReel = format === "video";

  /* The finished edit is what gets reviewed; raw clips never play here.
     Legacy rows without a render_status count as ready (mobile parity). */
  const renderReady =
    submission?.render_status == null || submission.render_status === "ready";
  const videoUrl =
    isReel && submission?.video_path && renderReady
      ? await signedMediaUrl(VIDEOS_BUCKET, submission.video_path)
      : null;

  const scriptTexts = isReel
    ? scriptToLines(brief.script)
    : slidesFromScript(brief.script);
  const segments = (segmentsRes.data ?? []) as Array<{
    slot_index: number;
    overlay_text: string | null;
    screenshot_url: string | null;
  }>;
  const slides = scriptTexts.map((text, i) => {
    const overlay = segments[i]?.overlay_text;
    return overlay?.trim() ? overlay : text;
  });
  const hasScreenshot = scriptTexts.map(
    (_, i) => segments[i]?.screenshot_url != null,
  );
  const sections: ReviewSection[] = scriptTexts.map((text, i) => ({
    key: `segment-${i}`,
    label: sectionLabel(i, scriptTexts.length, isReel),
    text,
  }));

  const account = accountRes.data as { tiktok_handle: string | null } | null;

  return {
    assignmentId: assignment.id,
    creatorId: assignment.creator_id,
    creatorName: assignment.profiles?.full_name?.trim() || "Creator",
    tiktokHandle: account?.tiktok_handle ?? null,
    briefTitle: brief.title,
    hook: brief.hook,
    caption: brief.caption ?? "",
    hashtags: brief.hashtags ?? [],
    format,
    ageLabel: formatAge(submission?.created_at ?? assignment.created_at),
    attempt: submission?.version ?? 1,
    submissionId: submission?.id ?? null,
    renderStatus: isReel ? (submission?.render_status ?? "ready") : "ready",
    renderError: submission?.render_error ?? null,
    videoUrl,
    sections,
    slides,
    hasScreenshot,
  };
}

/* --- Music approval detail -------------------------------------------------- */

export interface MusicApprovalDetail {
  assignmentId: string;
  creatorName: string;
  briefTitle: string;
  slides: string[];
  tiktokHandle: string | null;
  instagramHandle: string | null;
  tiktokUrl: string | null;
  instagramUrl: string | null;
  /** Earliest live posted_at, falling back to when the creator marked it. */
  liveAgeLabel: string;
}

export async function getMusicApprovalDetail(
  companyId: string,
  assignmentId: string,
): Promise<MusicApprovalDetail | null> {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("assignments")
    .select(
      "id, company_id, brief_id, creator_id, status, created_at, music_marked_by_creator_at, music_approved_at, briefs:brief_id ( id, title, hook, script, caption, hashtags, format, point_count ), profiles:creator_id ( id, full_name )",
    )
    .eq("company_id", companyId)
    .eq("id", assignmentId)
    .not("music_marked_by_creator_at", "is", null)
    .is("music_approved_at", null)
    .maybeSingle();
  if (error) throw error;
  const assignment = data as unknown as AssignmentRow | null;
  if (!assignment) return null;

  const [postsRes, accountRes] = await Promise.all([
    supabase
      .from("posts")
      .select("platform, post_url, posted_at")
      .eq("assignment_id", assignment.id)
      .not("post_url", "is", null),
    supabase
      .from("creator_accounts")
      .select("tiktok_handle, instagram_handle")
      .eq("company_id", companyId)
      .eq("creator_id", assignment.creator_id)
      .maybeSingle(),
  ]);
  if (postsRes.error) throw postsRes.error;

  const posts = (postsRes.data ?? []) as Array<{
    platform: string | null;
    post_url: string | null;
    posted_at: string | null;
  }>;
  const urlFor = (platform: string): string | null =>
    posts.find((p) => p.platform === platform)?.post_url ?? null;
  let liveAt: string | null = null;
  for (const p of posts) {
    if (p.posted_at !== null && (liveAt === null || p.posted_at < liveAt)) {
      liveAt = p.posted_at;
    }
  }

  const account = accountRes.data as {
    tiktok_handle: string | null;
    instagram_handle: string | null;
  } | null;

  return {
    assignmentId: assignment.id,
    creatorName: assignment.profiles?.full_name?.trim() || "Creator",
    briefTitle: assignment.briefs?.title ?? "Post",
    slides: slidesFromScript(assignment.briefs?.script),
    tiktokHandle: account?.tiktok_handle ?? null,
    instagramHandle: account?.instagram_handle ?? null,
    tiktokUrl: urlFor("tiktok"),
    instagramUrl: urlFor("instagram"),
    liveAgeLabel: formatAge(liveAt ?? assignment.music_marked_by_creator_at),
  };
}

/* --- Account approval detail ------------------------------------------------ */

export interface AccountEvidenceUrls {
  instagramRecording: string | null;
  tiktokRecording: string | null;
  instagramScreenshot: string | null;
  tiktokScreenshot: string | null;
}

export interface AccountApprovalDetail {
  accountId: string;
  creatorName: string;
  status: string;
  reason: string | null;
  tiktokHandle: string | null;
  instagramHandle: string | null;
  ageLabel: string;
  urls: AccountEvidenceUrls;
}

export async function getAccountApprovalDetail(
  companyId: string,
  accountId: string,
): Promise<AccountApprovalDetail | null> {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("creator_accounts")
    .select("*, profiles:creator_id ( id, full_name )")
    .eq("company_id", companyId)
    .eq("id", accountId)
    .maybeSingle();
  if (error) throw error;
  const row = data as unknown as AccountRow | null;
  if (!row) return null;

  const [instagramRecording, tiktokRecording, instagramScreenshot, tiktokScreenshot] =
    await Promise.all([
      signedMediaUrl(VERIFICATION_BUCKET, row.instagram_recording_path),
      signedMediaUrl(VERIFICATION_BUCKET, row.tiktok_recording_path),
      signedMediaUrl(VERIFICATION_BUCKET, row.instagram_screenshot_path),
      signedMediaUrl(VERIFICATION_BUCKET, row.tiktok_screenshot_path),
    ]);

  return {
    accountId: row.id,
    creatorName: row.profiles?.full_name?.trim() || "Creator",
    status: row.status,
    reason: row.reason,
    tiktokHandle: row.tiktok_handle,
    instagramHandle: row.instagram_handle,
    ageLabel: formatAge(row.updated_at),
    urls: { instagramRecording, tiktokRecording, instagramScreenshot, tiktokScreenshot },
  };
}
