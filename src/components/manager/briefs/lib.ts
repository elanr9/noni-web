/* Shared pure types and helpers for the manager Briefs pages. Ported from
   the mobile app's lib/briefs-api.ts (the source of truth for statuses and
   week math). No imports with server or client side effects: this module is
   used by server reads, server actions, and client components alike. */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json }
  | Json[];

export type BriefFormat = "video" | "photo_carousel";

export type TalkingPoint = {
  id: string;
  text: string | null;
  is_product: boolean;
  edited_by_admin: boolean;
  claim_id: string | null;
};

/** How on-screen text is drawn: rounded box, outlined letters, or plain. */
export type TextOverlayMode = "box" | "outline" | "plain";

export type TextOverlay = {
  enabled: boolean;
  mode: TextOverlayMode;
  text_color: string;
  accent_color: string;
};

export const DEFAULT_TEXT_OVERLAY: TextOverlay = {
  enabled: true,
  mode: "box",
  text_color: "#B73B6B",
  accent_color: "#F9C9DC",
};

export function parseTextOverlay(value: Json | null | undefined): TextOverlay {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return DEFAULT_TEXT_OVERLAY;
  }
  const raw = value as Record<string, Json | undefined>;
  const mode = raw.mode;
  return {
    enabled: raw.enabled !== false,
    mode:
      mode === "box" || mode === "outline" || mode === "plain"
        ? mode
        : DEFAULT_TEXT_OVERLAY.mode,
    text_color:
      typeof raw.text_color === "string"
        ? raw.text_color
        : DEFAULT_TEXT_OVERLAY.text_color,
    accent_color:
      typeof raw.accent_color === "string"
        ? raw.accent_color
        : DEFAULT_TEXT_OVERLAY.accent_color,
  };
}

export function parseTalkingPoints(value: Json | null | undefined): TalkingPoint[] {
  if (!Array.isArray(value)) return [];
  const points: TalkingPoint[] = [];
  for (const entry of value) {
    if (entry === null || typeof entry !== "object" || Array.isArray(entry)) continue;
    const raw = entry as Record<string, unknown>;
    points.push({
      id: typeof raw.id === "string" ? raw.id : String(points.length + 1),
      text: typeof raw.text === "string" ? raw.text : null,
      is_product: raw.is_product === true,
      edited_by_admin: raw.edited_by_admin === true,
      claim_id: typeof raw.claim_id === "string" ? raw.claim_id : null,
    });
  }
  return points;
}

export function parseHookOptions(value: Json | null | undefined): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((v): v is string => typeof v === "string");
}

// ---------------------------------------------------------------------------
// Row types, matching the live tables (service reads cast to these).

export type PostType = {
  id: string;
  key: string;
  label: string;
  family: string;
  min_points: number;
  max_points: number;
  clip_structure: string;
  requires_plug: boolean;
  requires_credential: boolean;
  default_week_count: number;
  sort_order: number;
  target_words_min: number | null;
  target_words_max: number | null;
};

export type Brief = {
  id: string;
  company_id: string;
  format: string;
  title: string;
  hook: string | null;
  script: string | null;
  caption: string | null;
  example_url: string | null;
  example_transcript: string | null;
  why_it_works: string | null;
  archived_at: string | null;
  created_at: string;
  hook_options: Json;
  talking_points: Json;
  hashtags: string[];
  search_phrase: string | null;
  point_count: number | null;
  target_words: number;
  generation_id: string | null;
  post_type_id: string | null;
  cta: string | null;
  kill_reason: string | null;
  reviewed_at: string | null;
  review_result: Json;
  text_overlay: Json;
};

export type BriefWithType = Brief & { post_types: PostType | null };

export type Campaign = {
  id: string;
  company_id: string;
  name: string;
  drop_date: string | null;
  status: string;
  published_at: string | null;
  video_target: number | null;
  slideshow_target: number | null;
  type_split: Json;
  created_at: string;
};

export type CampaignBriefItem = {
  campaign_id: string;
  brief_id: string;
  position: number | null;
  briefs: BriefWithType;
};

export type BriefSegment = {
  id: string;
  brief_id: string;
  slot_index: number;
  kind: string;
  talking_point_index: number | null;
  overlay_text: string | null;
  show_on_screen: boolean;
  screenshot_url: string | null;
  screenshot_x: number | null;
  screenshot_y: number | null;
  screenshot_width: number | null;
  layout: string | null;
  text_y: number | null;
  overlay_style: Json;
};

// ---------------------------------------------------------------------------
// Row state, exactly as the mobile grid derives it.

export type GridRowState = "empty" | "partial" | "filled" | "complete" | "killed";

/**
 * Four-state derivation from the briefs row alone. A killed slot is state
 * empty and the caller renders kill_reason. Types with requires_plug false
 * do not require a cta to count as filled.
 */
export function briefRowState(
  brief: Brief,
  postType: Pick<PostType, "min_points" | "max_points" | "requires_plug"> | null,
): "empty" | "partial" | "filled" | "complete" {
  if (brief.reviewed_at) return "complete";
  const points = parseTalkingPoints(brief.talking_points);
  const hasHook = Boolean(brief.hook?.trim());
  const hasCta = Boolean(brief.cta?.trim());
  const hasCaption = Boolean(brief.caption?.trim());
  const hashtagsOk = brief.hashtags.length >= 3 && brief.hashtags.length <= 5;
  const pointsOk = postType
    ? points.length >= postType.min_points && points.length <= postType.max_points
    : points.length > 0;
  const ctaOk = postType && !postType.requires_plug ? true : hasCta;
  if (hasHook && ctaOk && hasCaption && hashtagsOk && pointsOk) return "filled";
  if (
    hasHook ||
    hasCta ||
    hasCaption ||
    brief.hashtags.length > 0 ||
    points.length > 0
  ) {
    return "partial";
  }
  return "empty";
}

export function rowStateOf(item: CampaignBriefItem): GridRowState {
  const state = briefRowState(item.briefs, item.briefs.post_types);
  if (state === "empty" && item.briefs.kill_reason) return "killed";
  return state;
}

export function familyOf(item: CampaignBriefItem): BriefFormat {
  const raw = item.briefs.post_types?.family ?? item.briefs.format;
  return raw === "photo_carousel" ? "photo_carousel" : "video";
}

/** Last review's overall score, stored on confirm. Never recomputed here. */
export function aiScore(brief: Brief): number | null {
  const raw = brief.review_result;
  if (raw === null || typeof raw !== "object" || Array.isArray(raw)) return null;
  const scores = (raw as { scores?: unknown }).scores;
  if (scores === null || typeof scores !== "object" || Array.isArray(scores)) {
    return null;
  }
  const overall = (scores as { overall?: unknown }).overall;
  return typeof overall === "number" ? Math.round(overall) : null;
}

/** e.g. "Hook and 3 of 5 points" for a partial row. */
export function progressLine(brief: BriefWithType): string {
  const points = parseTalkingPoints(brief.talking_points);
  const total =
    brief.point_count ?? brief.post_types?.min_points ?? points.length;
  const hasHook = Boolean(brief.hook?.trim());
  if (hasHook && total > 0) return `Hook and ${points.length} of ${total} points`;
  if (total > 0 && points.length > 0) return `${points.length} of ${total} points`;
  if (hasHook) return "Hook saved";
  return "In progress";
}

// ---------------------------------------------------------------------------
// Week math. A week runs Monday through Sunday of its drop week.

export type BriefWeekStatus = "next" | "current" | "done";

export function briefWeekMonday(dropDate: string): Date {
  const d = new Date(`${dropDate}T00:00:00`);
  const day = d.getDay();
  d.setDate(d.getDate() + (day === 0 ? -6 : 1 - day));
  return d;
}

export function addDays(d: Date, n: number): Date {
  const copy = new Date(d);
  copy.setDate(copy.getDate() + n);
  return copy;
}

export function isoDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

const MONTH_SHORT = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];
const WEEKDAY_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const WEEKDAY_LONG = [
  "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday",
];

export function monthShort(d: Date): string {
  return MONTH_SHORT[d.getMonth()];
}

export function weekdayShort(d: Date): string {
  return WEEKDAY_SHORT[d.getDay()];
}

export function weekdayLong(d: Date): string {
  return WEEKDAY_LONG[d.getDay()];
}

/** "Aug 17 to 23", or "Jul 27 to Aug 2" across a month boundary. */
export function briefWeekRangeLabel(dropDate: string): string {
  const mon = briefWeekMonday(dropDate);
  const sun = addDays(mon, 6);
  if (mon.getMonth() === sun.getMonth()) {
    return `${monthShort(mon)} ${mon.getDate()} to ${sun.getDate()}`;
  }
  return `${monthShort(mon)} ${mon.getDate()} to ${monthShort(sun)} ${sun.getDate()}`;
}

/** Drop date (Monday) of the week after the one containing today. */
export function upcomingWeekDropDate(): string {
  const thisMonday = briefWeekMonday(isoDate(new Date()));
  return isoDate(addDays(thisMonday, 7));
}

/**
 * Where a campaign week sits relative to today. Drafts are always the next
 * week: a week is fully planned before it starts.
 */
export function briefWeekStatus(
  campaign: Pick<Campaign, "status" | "drop_date">,
): { status: BriefWeekStatus; dayOfWeek: number | null } {
  if (campaign.status !== "published" || campaign.drop_date === null) {
    return { status: "next", dayOfWeek: null };
  }
  const monday = briefWeekMonday(campaign.drop_date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diff = Math.round((today.getTime() - monday.getTime()) / 86400000);
  if (diff < 0) return { status: "next", dayOfWeek: null };
  if (diff <= 6) return { status: "current", dayOfWeek: diff + 1 };
  return { status: "done", dayOfWeek: null };
}

/**
 * True before Sunday 8:00 PM in New York of the drop week, the notify
 * cutoff publish-campaign schedules against.
 */
export function isBeforeNotifyCutoff(dropDate: string): boolean {
  const sundayIso = isoDate(addDays(briefWeekMonday(dropDate), 6));
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/New_York",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    hour12: false,
  }).formatToParts(new Date());
  const get = (unit: string): string =>
    parts.find((p) => p.type === unit)?.value ?? "00";
  const nyDate = `${get("year")}-${get("month")}-${get("day")}`;
  if (nyDate !== sundayIso) return nyDate < sundayIso;
  return Number(get("hour")) < 20;
}

// ---------------------------------------------------------------------------
// Week list shapes.

export type BriefWeekStats = {
  creators: number;
  earnCentsPerDay: number;
  viewsPerDay: number;
  postsPerCreatorPerDay: number;
  salesCents: number;
  posts: number;
  views: number;
};

export type BriefWeekSummary = {
  campaign: Campaign;
  weekNumber: number;
  status: BriefWeekStatus;
  dayOfWeek: number | null;
  videoDone: number;
  videoTarget: number;
  slideshowDone: number;
  slideshowTarget: number;
  stats: BriefWeekStats | null;
};

export type WeekPostItem = {
  postId: string;
  assignmentId: string | null;
  title: string;
  creatorName: string;
  format: BriefFormat;
  when: string;
  postedDay: string;
  views: number;
  salesCents: number;
};

// ---------------------------------------------------------------------------
// Week setup math, ported from the mobile week-setup screen.

export const DEFAULT_VIDEO_TARGET = 20;
export const DEFAULT_SLIDESHOW_TARGET = 10;
/** Mirrors the publish scheduler: three posts per creator per day. */
export const SLOTS_PER_DAY = 3;

/** The next seven days, starting tomorrow. */
export function startDayOptions(): string[] {
  const options: string[] = [];
  for (let i = 1; i <= 7; i += 1) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    options.push(isoDate(d));
  }
  return options;
}

export function nextSunday(): string {
  const d = new Date();
  d.setDate(d.getDate() + (((7 - d.getDay()) % 7) || 7));
  return isoDate(d);
}

/** "Aug 12 to 16" for the days the schedule covers from the start day. */
export function scheduleRangeLabel(dropDate: string, totalPosts: number): string {
  const days = Math.min(7, Math.max(1, Math.ceil(totalPosts / SLOTS_PER_DAY)));
  const start = new Date(`${dropDate}T00:00:00`);
  const end = addDays(start, days - 1);
  if (start.getMonth() === end.getMonth()) {
    return `${monthShort(start)} ${start.getDate()} to ${end.getDate()}`;
  }
  return `${monthShort(start)} ${start.getDate()} to ${monthShort(end)} ${end.getDate()}`;
}

/**
 * Distribute one family's target across its types, proportional to
 * default_week_count (largest remainder), so the split always sums to
 * the target.
 */
export function splitFamily(
  types: PostType[],
  target: number,
): Record<string, number> {
  const split: Record<string, number> = {};
  if (types.length === 0 || target <= 0) return split;
  const totalWeight = types.reduce((sum, t) => sum + t.default_week_count, 0);
  const weightOf = (t: PostType): number =>
    totalWeight > 0 ? t.default_week_count : 1;
  const denominator = totalWeight > 0 ? totalWeight : types.length;
  let assigned = 0;
  const remainders: { key: string; frac: number }[] = [];
  for (const t of types) {
    const exact = (target * weightOf(t)) / denominator;
    const base = Math.floor(exact);
    split[t.key] = base;
    assigned += base;
    remainders.push({ key: t.key, frac: exact - base });
  }
  remainders.sort((a, b) => b.frac - a.frac);
  for (let i = 0; assigned < target; i += 1) {
    split[remainders[i % remainders.length].key] += 1;
    assigned += 1;
  }
  return split;
}

// ---------------------------------------------------------------------------
// Editor payloads shared with the brief-assist and brief-review functions.

export type RegenField =
  | "search_phrase"
  | "talking_points"
  | "talking_point"
  | "hook"
  | "caption";

/** The editor's current state, sent as context. Nothing is saved. */
export type RegenDraftPayload = {
  title: string;
  search_phrase: string | null;
  format: BriefFormat;
  point_count: number;
  target_words: number;
  hook_options: string[];
  talking_points: TalkingPoint[];
  cta: string | null;
  caption: string;
  hashtags: string[];
  why_it_works: string;
  script: string | null;
};

export type ReviewSection =
  | "hook"
  | "talking_points"
  | "cta"
  | "caption"
  | "overall";

export type ReviewSuggestion = {
  field: "hook" | "talking_point" | "cta" | "caption" | "search_phrase";
  index?: number;
  replacement: string;
};

export type ReviewCheck = {
  check_id: string;
  tier: 1 | 2 | 3;
  section: ReviewSection;
  severity: "fail" | "warn";
  message: string;
  suggestion?: ReviewSuggestion;
};

export type ReviewScores = {
  overall: number;
  hook: number;
  talking_points: number;
  cta: number;
};

export type Tier3Verdict = { spoken: boolean; worst_line: string | null };

export type BriefReviewResult = {
  checks: ReviewCheck[];
  scores: ReviewScores;
  tier3: Tier3Verdict;
};

export type BriefDraft = {
  title: string;
  format: BriefFormat;
  hook_options: string[];
  talking_points: TalkingPoint[];
  hashtags: string[];
  search_phrase: string | null;
  point_count: number | null;
  target_words: number;
  script: string | null;
  caption: string;
  why_it_works: string;
  cta: string | null;
  post_type_id: string | null;
  overlay_labels: (string | null)[];
  generation_id: string | null;
  warnings: string[];
  example_url: string;
  example_transcript: string | null;
};

/** Parsed brief-assist regenerate_field response, per field. */
export type RegenResult =
  | { kind: "kill"; kill_reason: string }
  | { kind: "search_phrase"; search_phrase: string | null; warnings: string[] }
  | {
      kind: "talking_points";
      talking_points: TalkingPoint[];
      cta: string | null;
      point_count: number | null;
      script: string | null;
      target_words: number | null;
      overlay_labels: (string | null)[];
      hook_may_be_stale: boolean;
      warnings: string[];
    }
  | {
      kind: "talking_point";
      talking_point: TalkingPoint;
      overlay_label: string | null;
      index: number;
      hook_may_be_stale: boolean;
      warnings: string[];
    }
  | { kind: "hook"; hook_options: string[]; warnings: string[] }
  | { kind: "caption"; caption: string; hashtags: string[]; warnings: string[] };

/** Everything the editor writes back onto the briefs row on save. */
export type BriefSaveInput = {
  title: string;
  format: BriefFormat;
  hook: string | null;
  hook_options: string[];
  talking_points: TalkingPoint[];
  hashtags: string[];
  search_phrase: string | null;
  point_count: number | null;
  target_words: number;
  script: string | null;
  caption: string | null;
  why_it_works: string | null;
  cta: string | null;
  post_type_id: string | null;
  kill_reason: string | null;
  generation_id: string | null;
  example_url: string | null;
  text_overlay: TextOverlay;
};

/** One brief_review_events row, computed client side like mobile. */
export type ReviewEventInput = {
  event: "override" | "edit" | "confirm";
  check_id?: string;
  tier?: number;
  diff?: { field: string; before: string | null; after: string | null };
};

export type PublishResult = {
  creators: number;
  assignments_written: number;
  notified: number;
  /** True when the push is deferred to Sunday 8PM EST via notify-scheduled. */
  scheduled: boolean;
  notify_at: string | null;
};

// ---------------------------------------------------------------------------
// Display formatting.

export function fmtViews(n: number): string {
  const v = Math.round(n);
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  if (v >= 1_000) return `${(v / 1_000).toFixed(1).replace(/\.0$/, "")}K`;
  return String(v);
}

export function fmtSales(cents: number): string {
  return `$${Math.round(cents / 100).toLocaleString("en-US")}`;
}

export function formatLabel(format: BriefFormat): string {
  return format === "photo_carousel" ? "Slideshow" : "Reel";
}

export function postedDayMeta(iso: string): string {
  const d = new Date(`${iso}T00:00:00`);
  return `${weekdayShort(d)} ${d.getDate()}`;
}

export function dayChipLabel(iso: string): string {
  const d = new Date(`${iso}T00:00:00`);
  return `${weekdayShort(d)} ${monthShort(d)} ${d.getDate()}`;
}

export function dayTitle(iso: string): string {
  const d = new Date(`${iso}T00:00:00`);
  return `${weekdayLong(d)} ${monthShort(d)} ${d.getDate()}`;
}

export function formatDropDate(iso: string): string {
  const d = new Date(`${iso}T00:00:00`);
  return `${monthShort(d)} ${d.getDate()}`;
}
