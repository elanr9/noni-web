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

export type ScoutKind = "ugc" | "creator" | "niche";
export type ScoutGender = "female" | "male";
export type ScoutAge = "18-24" | "25-34" | "35+";

export type ScoutVideo = {
  url: string;
  cover: string | null;
  views: number | null;
  likes?: number | null;
  comments?: number | null;
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
  /** Posts a week over the last 90 days; null when no post dates were read. */
  posts_per_week: number | null;
  last_post_at: string | null;
  /** Percent. TikTok: likes and comments over views. Instagram: over followers. */
  engagement_rate: number | null;
  /** ugc: already makes brand videos. creator: posts for an audience. niche: a person in the niche. */
  kind: ScoutKind | null;
  on_camera: boolean | null;
  gender: ScoutGender | null;
  age: ScoutAge | null;
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
  "id, source, platform, handle, name, avatar_url, bio, followers, median_views, posts_per_week, last_post_at, engagement_rate, kind, on_camera, gender, age, email, videos, score, why, tags, dm, email_subject, email_body, status, code, contacted_at, joined_at, created_at";

/* Vetted and turned down by Claude or skipped by the company: only the
   strongest are worth showing again. */
const SKIPPED_SHOWN = 300;

/* Everyone on the board. A search returns hundreds and the API pages at
   1000 rows, so this reads page after page. Accounts still being read
   (found, vetting) are not on the board yet. */
async function loadCreators(db: ReturnType<typeof createServiceClient>, companyId: string): Promise<ScoutCreator[]> {
  const board: ScoutCreator[] = [];
  for (let from = 0; from < 5000; from += 1000) {
    const { data } = await db
      .from("scout_creators")
      .select(CREATOR_COLUMNS)
      .eq("company_id", companyId)
      .not("status", "in", "(found,vetting,skipped)")
      .order("score", { ascending: false, nullsFirst: false })
      .order("id")
      .range(from, from + 999);
    board.push(...((data ?? []) as ScoutCreator[]));
    if ((data?.length ?? 0) < 1000) break;
  }
  const { data: skipped } = await db
    .from("scout_creators")
    .select(CREATOR_COLUMNS)
    .eq("company_id", companyId)
    .eq("status", "skipped")
    .order("score", { ascending: false, nullsFirst: false })
    .order("id")
    .limit(SKIPPED_SHOWN);
  return [...board, ...((skipped ?? []) as ScoutCreator[])];
}

export async function loadScout(companyId: string): Promise<ScoutData | null> {
  const db = createServiceClient();
  const [{ data: company }, { data: slug }, { data: run }, creators] = await Promise.all([
    db.from("companies").select("id, name, settings").eq("id", companyId).maybeSingle(),
    db.rpc("scout_join_slug", { p_company_id: companyId }),
    db
      .from("scout_runs")
      .select("id, brief, plan, status, counts, error, lease_until, created_at, finished_at")
      .eq("company_id", companyId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    loadCreators(db, companyId),
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
    creators,
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

/* ------------------------------------------------------------------ ranking

   Scout is not looking for the biggest account. Best puts first the people
   who fit the niche (Claude's score), post often and recently, get a
   response from their audience, and are small enough to be cheap and easy
   to work with. Each part is 0 to 100. */

const DAY = 86_400_000;

export function daysSince(iso: string | null, now = Date.now()): number | null {
  if (!iso) return null;
  const t = Date.parse(iso);
  return Number.isFinite(t) ? Math.max(0, Math.floor((now - t) / DAY)) : null;
}

/* How often and how recently they post. Five posts a week and a post in
   the last seven days is full marks; nothing in 60 days is none. */
export function activityOf(c: Pick<ScoutCreator, "posts_per_week" | "last_post_at">, now = Date.now()): number {
  const days = daysSince(c.last_post_at, now);
  if (c.posts_per_week === null && days === null) return 0;
  const often = Math.min(1, (c.posts_per_week ?? 0) / 5);
  const recent = days === null ? 0 : days <= 7 ? 1 : Math.max(0, 1 - (days - 7) / 53);
  return Math.round(100 * (0.6 * often + 0.4 * recent));
}

function engagementOf(rate: number | null): number {
  return rate === null ? 40 : Math.min(100, (rate / 8) * 100);
}

/* 1k to 50k followers is the sweet spot: a real audience, still easy to sign. */
function sizeOf(followers: number | null): number {
  if (followers === null) return 50;
  if (followers < 300) return 40;
  if (followers < 1_000) return 70;
  if (followers <= 50_000) return 100;
  if (followers <= 150_000) return 70;
  if (followers <= 500_000) return 45;
  return 25;
}

export function rankOf(c: ScoutCreator, now = Date.now()): number | null {
  if (c.score === null) return null;
  return Math.round(0.5 * c.score + 0.2 * activityOf(c, now) + 0.15 * engagementOf(c.engagement_rate) + 0.15 * sizeOf(c.followers));
}

export const SCOUT_SORTS = ["Best", "Smallest", "Biggest", "Most active", "Most engaged"] as const;
export type ScoutSort = (typeof SCOUT_SORTS)[number];

/* Unknowns always sort last, whichever way the list runs. */
export function sortScout(rows: ScoutCreator[], sort: ScoutSort, now = Date.now()): ScoutCreator[] {
  const key = (c: ScoutCreator): number | null => {
    if (sort === "Smallest") return c.followers === null ? null : -c.followers;
    if (sort === "Biggest") return c.followers;
    if (sort === "Most active") return c.posts_per_week === null && !c.last_post_at ? null : activityOf(c, now) + Math.min(21, c.posts_per_week ?? 0) / 100;
    if (sort === "Most engaged") return c.engagement_rate;
    return rankOf(c, now);
  };
  return rows
    .map((c) => ({ c, k: key(c) }))
    .sort((a, b) => {
      if (a.k === null || b.k === null) return a.k === b.k ? (b.c.score ?? 0) - (a.c.score ?? 0) : a.k === null ? 1 : -1;
      return b.k - a.k || (b.c.score ?? 0) - (a.c.score ?? 0);
    })
    .map((x) => x.c);
}

/* ------------------------------------------------------------------ filters */

export const SIZE_BANDS = [
  { key: "xs", label: "Under 5k", min: 0, max: 5_000 },
  { key: "s", label: "5k to 25k", min: 5_000, max: 25_000 },
  { key: "m", label: "25k to 100k", min: 25_000, max: 100_000 },
  { key: "l", label: "Over 100k", min: 100_000, max: Infinity },
] as const;
export type SizeBand = (typeof SIZE_BANDS)[number]["key"];

export type ScoutFilters = {
  platform: ScoutPlatform[];
  size: SizeBand[];
  kind: ScoutKind[];
  gender: ScoutGender[];
  age: ScoutAge[];
  /** week: posted in the last 7 days. often: 3 or more posts a week. */
  activity: ("week" | "often")[];
  more: ("camera" | "email")[];
};

export const NO_FILTERS: ScoutFilters = { platform: [], size: [], kind: [], gender: [], age: [], activity: [], more: [] };

export function filterCount(f: ScoutFilters): number {
  return f.platform.length + f.size.length + f.kind.length + f.gender.length + f.age.length + f.activity.length + f.more.length;
}

/* Any of the picks inside a group, every group that has a pick. Someone
   whose gender or age is not known is left out once that group is used. */
export function passes(c: ScoutCreator, f: ScoutFilters, now = Date.now()): boolean {
  if (f.platform.length && !f.platform.includes(c.platform)) return false;
  if (f.size.length) {
    const n = c.followers;
    if (n === null || !SIZE_BANDS.some((b) => f.size.includes(b.key) && n >= b.min && n < b.max)) return false;
  }
  if (f.kind.length && (!c.kind || !f.kind.includes(c.kind))) return false;
  if (f.gender.length && (!c.gender || !f.gender.includes(c.gender))) return false;
  if (f.age.length && (!c.age || !f.age.includes(c.age))) return false;
  if (f.activity.includes("week")) {
    const d = daysSince(c.last_post_at, now);
    if (d === null || d > 7) return false;
  }
  if (f.activity.includes("often") && (c.posts_per_week ?? 0) < 3) return false;
  if (f.more.includes("camera") && c.on_camera !== true) return false;
  if (f.more.includes("email") && !c.email) return false;
  return true;
}

/* A search for the people the filters ask for: where to look, how big, and
   who they must be in plain words for the planner. Posting and email are
   not searchable, so they stay filters only. */
export function searchFromFilters(f: ScoutFilters): {
  platforms: ScoutPlatform[];
  minFollowers: number | null;
  maxFollowers: number | null;
  want: string;
} {
  const bands = SIZE_BANDS.filter((b) => f.size.includes(b.key));
  const want: string[] = [];
  if (f.gender.length === 1) want.push(f.gender[0] === "female" ? "Only women." : "Only men.");
  if (f.age.length) {
    const names = { "18-24": "18 to 24", "25-34": "25 to 34", "35+": "35 and up" } as const;
    want.push(`Ages ${f.age.map((a) => names[a]).join(" or ")}.`);
  }
  if (f.kind.length) {
    const names = {
      ugc: "people who already make UGC or brand videos",
      creator: "small creators who post often",
      niche: "everyday people who are the niche",
    } as const;
    want.push(`Only ${f.kind.map((k) => names[k]).join(", or ")}.`);
  }
  if (bands.length && Math.max(...bands.map((b) => b.max)) <= 5_000) want.push("Small accounts, under 5k followers.");
  if (f.more.includes("camera")) want.push("They show their face on camera.");
  return {
    platforms: f.platform.length ? [...f.platform] : ["tiktok", "instagram"],
    minFollowers: bands.length ? Math.min(...bands.map((b) => b.min)) : null,
    maxFollowers: bands.length ? Math.min(5_000_000, Math.max(...bands.map((b) => b.max))) : null,
    want: want.join(" "),
  };
}

export function perWeek(n: number | null): string {
  if (n === null) return "";
  if (n > 0 && n < 1) return "<1";
  return n >= 10 ? String(Math.round(n)) : String(n).replace(/\.0$/, "");
}

export function lastPosted(iso: string | null, now = Date.now()): string {
  const d = daysSince(iso, now);
  if (d === null) return "";
  if (d === 0) return "Today";
  if (d < 14) return `${d}d`;
  if (d < 60) return `${Math.floor(d / 7)}w`;
  return `${Math.floor(d / 30)}mo`;
}
