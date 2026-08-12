/* Pure series-derivation functions for the analytics explorer, ported from
   design_handoff_ops_console/OpsApp.jsx (rangeData, OpsOverview,
   CompanyExplorer). No React in here; unit-tested in analytics.test.ts. */

import type { Company, Person, Post, PostFormat } from "./types";

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

/* ── Range label ── */

const RANGE_TITLES: Record<Range, string> = {
  "Last 24 hours": "Today",
  "Last 7 days": "This Week",
  "Last 2 weeks": "Last 2 Weeks",
  "Last month": "This Month",
  "Last 12 weeks": "Last 12 Weeks",
};

/** Page title for a range, e.g. "This Week on Noni". */
export function rangeLabel(range: Range): string {
  return (RANGE_TITLES[range] || range) + " on Noni";
}

/* ── Range bucketing ── */

export interface RangeSeries {
  data: number[];
  labels: string[];
}

/** Re-buckets a 12-point weekly series (thousands) into the chart series and
    x-axis labels for a range. Verbatim port of the prototype's rangeData. */
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

/* ── Post filtering ── */

export interface PostFilter {
  /** Company id, or null for platform-wide. */
  scope?: string | null;
  /** "All formats" or a PostFormat. */
  format?: string;
  /** "All creators" or a creator display name. */
  creator?: string;
  /** Inclusive day-of-month bounds. */
  dayRange?: { from: number; to: number };
}

/** Filters posts by scope, format, creator and day range; sorted by views
    descending. Every filter composes with the others. */
export function filterPosts(posts: Post[], filter: PostFilter = {}): Post[] {
  const { scope = null, format = ALL_FORMATS, creator = ALL_CREATORS, dayRange } = filter;
  return posts
    .filter(
      (q) =>
        (!scope || q.company === scope) &&
        (format === ALL_FORMATS || q.format === format) &&
        (creator === ALL_CREATORS || q.creator === creator) &&
        (!dayRange || (q.day >= dayRange.from && q.day <= dayRange.to)),
    )
    .sort((a, b) => b.viewsN - a.viewsN);
}

/** Posts a company published on a given day of the month. */
export function postsOnDay(posts: Post[], companyId: string, day: number): Post[] {
  return posts.filter((q) => q.company === companyId && q.day === day);
}

/* ── Scope derivation ── */

/** Creators in scope with views, sorted by views descending. */
export function creatorsInScope(people: Person[], scope: string | null): Person[] {
  return people
    .filter(
      (p) => p.role === "Creator" && (!scope || p.company === scope) && (p.viewsN ?? 0) > 0,
    )
    .sort((a, b) => (b.viewsN ?? 0) - (a.viewsN ?? 0));
}

/** Format counts for the scoped company, or aggregated across active
    companies platform-wide. */
export function formatsInScope(
  companies: Company[],
  scope: string | null,
): Partial<Record<PostFormat, number>> {
  const one = scope ? companies.find((c) => c.id === scope) : null;
  if (one) return one.formats;
  return companies
    .filter((c) => c.status === "Active")
    .reduce<Partial<Record<PostFormat, number>>>((acc, c) => {
      (Object.entries(c.formats) as Array<[PostFormat, number]>).forEach(([k, v]) => {
        acc[k] = (acc[k] || 0) + v;
      });
      return acc;
    }, {});
}

/** 12-point weekly views series (thousands) for the scoped company, or the
    per-week sum across active companies platform-wide. */
export function seriesInScope(companies: Company[], scope: string | null): number[] {
  const one = scope ? companies.find((c) => c.id === scope) : null;
  if (one) return one.series;
  const active = companies.filter((c) => c.status === "Active");
  return Array.from({ length: 12 }, (_, i) =>
    active.reduce((n, c) => n + (c.series[i] || 0), 0),
  );
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

/** Share of scoped views the creator filter keeps, 0..1, plus the selected
    creator when the filter names one. */
export function creatorShare(
  creators: Person[],
  creator: string,
): { share: number; selected: Person | null } {
  const total = creators.reduce((n, p) => n + (p.viewsN ?? 0), 0) || 1;
  const selected = creators.find((p) => p.name === creator) ?? null;
  return { share: selected ? (selected.viewsN ?? 0) / total : 1, selected };
}

/** Weekly series scaled by the composed filter shares, 1-decimal rounded. */
export function scaleSeries(weekly: number[], factor: number): number[] {
  return weekly.map((v) => +(v * factor).toFixed(1));
}

/* ── Sort-mode datasets ── */

export interface CreatorBar {
  person: Person;
  /** Filtered views in thousands. */
  value: number;
}

/** Bars for the Top creators view: the selected creator only when one is
    filtered, each scaled by the format share, in thousands. */
export function topCreators(
  creators: Person[],
  creator: string,
  fmtShare: number,
): CreatorBar[] {
  const { selected } = creatorShare(creators, creator);
  return (selected ? [selected] : creators).map((p) => ({
    person: p,
    value: Math.round(((p.viewsN ?? 0) * fmtShare) / 1000),
  }));
}

export interface FormatEntry {
  format: PostFormat;
  value: number;
}

/** Bars for the Formats view: post counts per format, filtered to the format
    filter and scaled by the creator share. */
export function formatBreakdown(
  formats: Partial<Record<PostFormat, number>>,
  format: string,
  crShare: number,
): FormatEntry[] {
  return (Object.entries(formats) as Array<[PostFormat, number]>)
    .filter(([k]) => format === ALL_FORMATS || k === format)
    .map(([k, v]) => ({ format: k, value: Math.round(v * crShare) }));
}

/** Max of the bar values, floored at 1 so bars never divide by zero. */
export function barMax(values: number[]): number {
  return Math.max(...values, 1);
}

/* ── Stat strip ── */

export interface OverviewStats {
  views: string;
  posts: number;
  campaigns: number;
  creators: number;
  dViews?: string;
  dPosts?: string;
  dCamp?: string;
}

/** Stat strip totals and deltas for the Overview, platform-wide or scoped to
    one company. Matches the prototype's OpsOverview stats verbatim. */
export function overviewStats(
  companies: Company[],
  people: Person[],
  scope: string | null,
): OverviewStats {
  const one = scope ? companies.find((c) => c.id === scope) : null;
  if (one) {
    const stats: OverviewStats = {
      views: one.views,
      posts: one.posts,
      campaigns: one.campaigns,
      creators: one.creators,
    };
    if (one.deltas.views) stats.dViews = one.deltas.views;
    if (one.deltas.posts) stats.dPosts = one.deltas.posts;
    if (one.deltas.campaigns) stats.dCamp = one.deltas.campaigns;
    return stats;
  }
  const active = companies.filter((c) => c.status === "Active");
  return {
    views: "2.0M",
    posts: companies.reduce((n, c) => n + c.posts, 0),
    campaigns: companies.reduce((n, c) => n + c.campaigns, 0),
    creators: people.filter((p) => p.role === "Creator").length,
    dViews: "+15% vs July",
    dPosts: "+14% vs July",
    dCamp: `${active.length} companies`,
  };
}
