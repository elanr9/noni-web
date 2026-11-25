import { createServiceClient } from "@/lib/supabase/service";

/* Scout: creators Noni found for a company outside Noni (scout edge
   function, migration 161). Read with the service client; callers gate
   access first. */

export type ScoutPlatform = "tiktok" | "instagram";

export type ScoutStatus =
  | "found"
  | "vetting"
  | "match"
  | "skipped"
  | "contacted"
  | "replied"
  | "applied"
  | "joined"
  | "passed";

export type ScoutVideo = {
  url: string;
  cover: string | null;
  views: number | null;
  caption: string;
  posted_at: string | null;
};

export type ScoutCreator = {
  id: string;
  source: "search" | "link";
  platform: ScoutPlatform;
  handle: string;
  name: string | null;
  avatar_url: string | null;
  bio: string | null;
  followers: number | null;
  median_views: number | null;
  email: string | null;
  videos: ScoutVideo[];
  score: number | null;
  why: string | null;
  tags: string[];
  dm: string | null;
  email_subject: string | null;
  email_body: string | null;
  status: ScoutStatus;
  code: string;
  contacted_at: string | null;
  joined_at: string | null;
  created_at: string;
};

export type ScoutRunStatus = "planning" | "searching" | "enriching" | "vetting" | "done" | "failed";

export type ScoutRun = {
  id: string;
  brief: string;
  plan: {
    ideal?: string;
    tiktok_queries?: string[];
    tiktok_hashtags?: string[];
    instagram_hashtags?: string[];
  };
  status: ScoutRunStatus;
  counts: { posts?: number; accounts?: number; shortlisted?: number; vetted?: number; matches?: number };
  error: string | null;
  lease_until: string | null;
  created_at: string;
  finished_at: string | null;
};

export type ScoutData = {
  companyId: string;
  companyName: string;
  color: string | null;
  joinSlug: string;
  run: ScoutRun | null;
  creators: ScoutCreator[];
};

export const ACTIVE_RUN: ScoutRunStatus[] = ["planning", "searching", "enriching", "vetting"];

const CREATOR_COLUMNS =
  "id, source, platform, handle, name, avatar_url, bio, followers, median_views, email, videos, score, why, tags, dm, email_subject, email_body, status, code, contacted_at, joined_at, created_at";

export async function loadScout(companyId: string): Promise<ScoutData | null> {
  const db = createServiceClient();
  const [{ data: company }, { data: slug }, { data: run }, { data: creators }] = await Promise.all([
    db.from("companies").select("id, name, settings").eq("id", companyId).maybeSingle(),
    db.rpc("scout_join_slug", { p_company_id: companyId }),
    db
      .from("scout_runs")
      .select("id, brief, plan, status, counts, error, lease_until, created_at, finished_at")
      .eq("company_id", companyId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    db
      .from("scout_creators")
      .select(CREATOR_COLUMNS)
      .eq("company_id", companyId)
      .neq("status", "vetting")
      .order("score", { ascending: false, nullsFirst: false })
      .limit(1500),
  ]);
  if (!company) return null;
  const settings = (company.settings ?? {}) as { overlay_theme?: { color?: unknown } };
  const color = typeof settings.overlay_theme?.color === "string" ? settings.overlay_theme.color : null;
  return {
    companyId,
    companyName: company.name as string,
    color,
    joinSlug: (slug as string | null) ?? "",
    run: (run as ScoutRun | null) ?? null,
    creators: (creators ?? []) as ScoutCreator[],
  };
}

export function joinUrl(origin: string, slug: string, code?: string): string {
  return `${origin}/join/${slug}${code ? `?c=${code}` : ""}`;
}

export function profileUrl(platform: ScoutPlatform, handle: string): string {
  return platform === "tiktok" ? `https://www.tiktok.com/@${handle}` : `https://www.instagram.com/${handle}/`;
}

export function compact(n: number | null | undefined): string {
  if (n === null || n === undefined) return "";
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(n >= 10_000_000 ? 0 : 1).replace(/\.0$/, "")}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(n >= 100_000 ? 0 : 1).replace(/\.0$/, "")}k`;
  return String(n);
}
