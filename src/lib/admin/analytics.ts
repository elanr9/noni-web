/* Pure series-derivation functions for the /admin analytics explorer,
   ported from design_handoff_admin_app_web/AdminAnalytics.jsx
   (AnalyticsPage, aRangeData, aFmtK, aMoney). Single-company on purpose:
   independent of @/lib/ops/analytics, keyed to @/lib/admin/types. No React
   in here; unit-tested in analytics.test.ts. */

import type { AdminPost, DayActivity, Member, PostFormat } from "./types";

export const RANGES = [
  "Last 24 hours",
  "Last 7 days",
  "Last 2 weeks",
  "Last month",
  "Last 12 weeks",
] as const;
export type Range = (typeof RANGES)[number];

export const SORTS = [
  "Views over time",
  "Top creators",
  "Top posts",
  "Formats",
] as const;
export type SortMode = (typeof SORTS)[number];

export const ALL_FORMATS = "All formats";
export const ALL_CREATORS = "All creators";

/* ── Display formatting (aFmtK / aMoney in the prototype) ── */

/** 53600 → "54k", 1200000 → "1.2M", 640 → "640". */
export function fmtViews(n: number): string {
  if (n >= 1e6) return (n / 1e6).toFixed(1) + "M";
  if (n >= 1e3) return Math.round(n / 1e3) + "k";
  return String(Math.round(n));
}

/** 2140 → "$2,140". */
export function money(n: number): string {
  return "$" + n.toLocaleString("en-US");
}

/* ── Range bucketing ── */

export interface RangeSeries {
  data: number[];
  labels: string[];
}

/** Re-buckets a 12-point weekly series (thousands) into the chart series and
    x-axis labels for a range. Verbatim port of the prototype's aRangeData. */
export function rangeData(range: Range, weekly: number[]): RangeSeries {
  const lastW = weekly[weekly.length - 1] || 0;
  const wave = (n: number, base: number, amp: number, rise: number) =>
    Array.from({ length: n }, (_, i) =>
      Math.max(0.1, +(base * (1 + amp * Math.sin(i * 1.35 + 0.8) + (rise * i) / n)).toFixed(1)),
    );
  if (range === "Last 24 hours")
    return { data: wave(12, lastW / 7 / 10, 0.45, 0.5), labels: ["2a", "6a", "10a", "2p", "6p", "10p"] };
  if (range === "Last 7 days")
    return { data: wave(7, lastW / 7, 0.3, 0.25), labels: ["Wed", "Thu", "Fri", "Sat", "Sun", "Mon", "Tue"] };
  if (range === "Last 2 weeks")
    return { data: wave(14, lastW / 7, 0.35, 0.3), labels: ["Jul 30", "Aug 3", "Aug 7", "Aug 11"] };
  if (range === "Last month")
    return { data: weekly.slice(-5), labels: ["Jul 13", "Jul 20", "Jul 27", "Aug 3", "Aug 10"] };
  return { data: weekly, labels: ["May 25", "Jun 8", "Jun 22", "Jul 6", "Jul 20", "Aug 3"] };
}

/* ── Scope derivation (one company: creators and formats come straight
      from the dataset) ── */

/** Creators with views this month, sorted by views descending. Feeds the
    creator filter and the Top creators ranking. */
export function creatorsWithViews(creators: Member[]): Member[] {
  return creators
    .filter((p) => (p.viewsN ?? 0) > 0)
    .sort((a, b) => (b.viewsN ?? 0) - (a.viewsN ?? 0));
}

/** Post counts per format (ADM_FORMATS in the prototype, derived here so
    real data needs no extra column). */
export function formatCounts(posts: AdminPost[]): Partial<Record<PostFormat, number>> {
  const counts: Partial<Record<PostFormat, number>> = {};
  for (const q of posts) counts[q.format] = (counts[q.format] || 0) + 1;
  return counts;
}

/* ── Filter shares (how much of the series a filter keeps) ── */

/** Share of total posts the format filter keeps, 0..1. */
export function formatShare(
  formats: Partial<Record<PostFormat, number>>,
  format: string,
): number {
  const total = (formats.Video || 0) + (formats.Carousel || 0);
  if (format === ALL_FORMATS || !total) return 1;
  return (formats[format as PostFormat] || 0) / total;
}

/** Share of company views the creator filter keeps, 0..1, plus the selected
    creator when the filter names one. */
export function creatorShare(
  creators: Member[],
  creator: string,
): { share: number; selected: Member | null } {
  const total = creators.reduce((n, p) => n + (p.viewsN ?? 0), 0) || 1;
  const selected = creators.find((p) => p.name === creator) ?? null;
  return { share: selected ? (selected.viewsN ?? 0) / total : 1, selected };
}

/** Weekly series scaled by the composed filter shares, 1-decimal rounded. */
export function scaleSeries(weekly: number[], factor: number): number[] {
  return weekly.map((v) => +(v * factor).toFixed(1));
}

/* ── Post filtering ── */

export interface PostFilter {
  /** "All formats" or a PostFormat. */
  format?: string;
  /** "All creators" or a creator display name. */
  creator?: string;
}

/** Filters posts by format and creator; sorted by views descending. The two
    filters compose. */
export function filterPosts(posts: AdminPost[], filter: PostFilter = {}): AdminPost[] {
  const { format = ALL_FORMATS, creator = ALL_CREATORS } = filter;
  return posts
    .filter(
      (q) =>
        (format === ALL_FORMATS || q.format === format) &&
        (creator === ALL_CREATORS || q.creator === creator),
    )
    .sort((a, b) => b.viewsN - a.viewsN);
}

/** Resolves a day's postIds into posts, keeping the activity's order. */
export function postsOnDay(
  posts: AdminPost[],
  activity: DayActivity | undefined,
): AdminPost[] {
  if (!activity) return [];
  const byId = new Map(posts.map((q) => [q.id, q]));
  return activity.postIds
    .map((id) => byId.get(id))
    .filter((q): q is AdminPost => q !== undefined);
}

/* ── Sort-mode datasets ── */

export interface CreatorBar {
  member: Member;
  /** Raw views scaled by the format share (CreatorRankRow's v). */
  views: number;
}

/** Ranked bars for the Top creators view: the selected creator only when one
    is filtered, each scaled by the format share, sorted by views descending. */
export function topCreators(
  creators: Member[],
  creator: string,
  fmtShare: number,
): CreatorBar[] {
  const { selected } = creatorShare(creators, creator);
  return (selected ? [selected] : creators)
    .slice()
    .sort((a, b) => (b.viewsN ?? 0) - (a.viewsN ?? 0))
    .map((p) => ({ member: p, views: Math.round((p.viewsN ?? 0) * fmtShare) }));
}

export interface FormatEntry {
  format: PostFormat;
  value: number;
}

/** Bars for the Formats view: post counts per format, filtered to the format
    filter and scaled by the creator share, 1-decimal rounded. */
export function formatBreakdown(
  formats: Partial<Record<PostFormat, number>>,
  format: string,
  crShare: number,
): FormatEntry[] {
  return (Object.entries(formats) as Array<[PostFormat, number]>)
    .filter(([k]) => format === ALL_FORMATS || k === format)
    .map(([k, v]) => ({ format: k, value: Math.round(v * crShare * 10) / 10 }));
}

/** Max of the bar values, floored at 1 so bars never divide by zero. */
export function barMax(values: number[]): number {
  return Math.max(...values, 1);
}

/* ── Calendar month metadata ── */

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export interface MonthMeta {
  /** Full month name, e.g. "August". */
  name: string;
  /** Short month name, e.g. "Aug". */
  short: string;
  /** Weekday index of the 1st (0 = Sunday). */
  firstWeekday: number;
  daysInMonth: number;
  /** Day of month for `now`. */
  today: number;
}

/** Calendar layout for the month containing `now`. DayActivityMap is scoped
    to the current month, so the calendar always shows this month. */
export function monthMeta(now: Date): MonthMeta {
  const year = now.getFullYear();
  const month = now.getMonth();
  return {
    name: MONTHS[month],
    short: MONTHS[month].slice(0, 3),
    firstWeekday: new Date(year, month, 1).getDay(),
    daysInMonth: new Date(year, month + 1, 0).getDate(),
    today: now.getDate(),
  };
}
