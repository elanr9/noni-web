/* Pure analytics maths for /admin/analytics: range slicing, day / week /
   month buckets, the ratios founders steer by (sign-ups per 1k views,
   revenue per 1k views, cost per sign-up), per-post and per-creator
   rankings with a plain verdict, and the "what is working" callouts.

   Everything here is derived from real rows shaped by insights-data.ts.
   Nothing is estimated or smoothed: a day with no data is a zero, and a
   ratio with nothing under it is null (drawn as a dash). Days are UTC, the
   same days conversion_daily is written in. No React; unit-tested in
   insights.test.ts. */

import type { PostFormat } from "./types";

/* ── Shapes ── */

export interface InsightDay {
  /** UTC day, YYYY-MM-DD. */
  day: string;
  /** Views gained that day across every post. */
  views: number;
  /** Every sign-up the company had that day. */
  signups: number;
  trials: number;
  /** Number of sales and their value. */
  sales: number;
  salesCents: number;
  /** Sign-ups that came in on a creator's code. */
  codedSignups: number;
  /** Paid to creators that day. */
  spendCents: number;
  /** Posts that went live that day. */
  posts: number;
}

/** One day of one post: [day, views gained, sign-ups credited, sales cents
    credited, cents paid for it]. Only days with something on them. */
export type PostDay = [day: string, views: number, signups: number, salesCents: number, costCents: number];

export interface InsightPost {
  id: string;
  title: string;
  creatorId: string | null;
  creator: string;
  format: PostFormat;
  /** UTC day it went live. */
  day: string;
  link: string;
  /** Lifetime engagement, latest snapshot across platforms. */
  likes: number;
  comments: number;
  shares: number;
  saves: number;
  daily: PostDay[];
}

export interface InsightsData {
  /** Today's UTC day; the last entry of `days`. */
  today: string;
  /** Continuous, ascending, ending today. */
  days: InsightDay[];
  posts: InsightPost[];
  /** A sign-up source is connected (the company's database or Stripe). */
  signupsOn: boolean;
  /** Stripe is connected, so sales exist. */
  salesOn: boolean;
}

/* ── Day arithmetic (UTC) ── */

const DAY_MS = 24 * 60 * 60 * 1000;

export function dayKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function dayTime(day: string): number {
  return Date.parse(day + "T00:00:00Z");
}

export function addDays(day: string, n: number): string {
  return dayKey(new Date(dayTime(day) + n * DAY_MS));
}

export function daysBetween(from: string, to: string): number {
  return Math.round((dayTime(to) - dayTime(from)) / DAY_MS);
}

/* ── Ranges ── */

export const RANGES = ["Last 7 days", "Last 30 days", "Last 90 days", "All time"] as const;
export type Range = (typeof RANGES)[number];

const RANGE_LENGTH: Record<Range, number | null> = {
  "Last 7 days": 7,
  "Last 30 days": 30,
  "Last 90 days": 90,
  "All time": null,
};

/** The tabs of the Analytics page. */
export const ANALYTICS_TABS = ["Trend", "Posts", "Creators", "Formats", "Calendar"] as const;
export type AnalyticsTab = (typeof ANALYTICS_TABS)[number];

export const GRAINS = ["Day", "Week", "Month"] as const;
export type Grain = (typeof GRAINS)[number];

/** The grain a range opens on. */
export function defaultGrain(range: Range): Grain {
  if (range === "Last 90 days") return "Week";
  if (range === "All time") return "Month";
  return "Day";
}

export interface RangeWindow {
  current: InsightDay[];
  /** The same number of days just before, empty for All time or when the
      history does not reach back that far. */
  previous: InsightDay[];
  /** Short name of the comparison, e.g. "prior 30d". */
  versus: string;
}

export function windowFor(days: InsightDay[], range: Range): RangeWindow {
  const length = RANGE_LENGTH[range];
  if (length === null) {
    /* All time starts on the first day anything happened. */
    const first = days.findIndex(
      (d) => d.views > 0 || d.posts > 0 || d.signups > 0 || d.salesCents > 0 || d.spendCents > 0,
    );
    return { current: first > 0 ? days.slice(first) : days, previous: [], versus: "" };
  }
  const current = days.slice(-length);
  const before = days.slice(0, Math.max(0, days.length - length));
  const previous = before.length >= length ? before.slice(-length) : [];
  return { current, previous, versus: `prior ${length}d` };
}

/* ── Totals and ratios ── */

export interface Totals {
  views: number;
  signups: number;
  trials: number;
  sales: number;
  salesCents: number;
  codedSignups: number;
  spendCents: number;
  posts: number;
}

export function totalsOf(days: InsightDay[]): Totals {
  const t: Totals = {
    views: 0,
    signups: 0,
    trials: 0,
    sales: 0,
    salesCents: 0,
    codedSignups: 0,
    spendCents: 0,
    posts: 0,
  };
  for (const d of days) {
    t.views += d.views;
    t.signups += d.signups;
    t.trials += d.trials;
    t.sales += d.sales;
    t.salesCents += d.salesCents;
    t.codedSignups += d.codedSignups;
    t.spendCents += d.spendCents;
    t.posts += d.posts;
  }
  return t;
}

/** `n` per 1,000 views, null with no views. */
export function per1k(n: number, views: number): number | null {
  return views > 0 ? (n / views) * 1000 : null;
}

/** a / b, null when b is zero. */
export function ratio(a: number, b: number): number | null {
  return b > 0 ? a / b : null;
}

/** Whole-percent change, null without a base to compare against. */
export function pctChange(current: number | null, previous: number | null): number | null {
  if (current === null || previous === null || previous <= 0) return null;
  return Math.round(((current - previous) / previous) * 100);
}

/* ── Buckets ── */

export interface Bucket extends Totals {
  /** First day in the bucket. */
  key: string;
  /** Axis label: "Nov 21", "Nov 16" (week of) or "Nov". */
  label: string;
  /** Tooltip title: "Sat, Nov 21", "Week of Nov 16" or "November 2026". */
  title: string;
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const MONTHS_LONG = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

/** "2026-11-21" → "Nov 21". */
export function shortDay(day: string): string {
  return `${MONTHS[Number(day.slice(5, 7)) - 1]} ${Number(day.slice(8, 10))}`;
}

function bucketKey(day: string, grain: Grain): string {
  if (grain === "Day") return day;
  if (grain === "Month") return day.slice(0, 8) + "01";
  /* Weeks start on Monday. */
  const weekday = new Date(dayTime(day)).getUTCDay();
  return addDays(day, -((weekday + 6) % 7));
}

export function bucketize(days: InsightDay[], grain: Grain): Bucket[] {
  const out: Bucket[] = [];
  let open: Bucket | null = null;
  for (const d of days) {
    const key: string = bucketKey(d.day, grain);
    if (!open || open.key !== key) {
      const month: number = Number(key.slice(5, 7)) - 1;
      open = {
        key,
        label: grain === "Month" ? MONTHS[month] : shortDay(key),
        title:
          grain === "Day"
            ? `${WEEKDAYS[new Date(dayTime(key)).getUTCDay()]}, ${shortDay(key)}`
            : grain === "Week"
              ? `Week of ${shortDay(key)}`
              : `${MONTHS_LONG[month]} ${key.slice(0, 4)}`,
        ...totalsOf([]),
      };
      out.push(open);
    }
    open.views += d.views;
    open.signups += d.signups;
    open.trials += d.trials;
    open.sales += d.sales;
    open.salesCents += d.salesCents;
    open.codedSignups += d.codedSignups;
    open.spendCents += d.spendCents;
    open.posts += d.posts;
  }
  return out;
}

/* ── Posts ── */

export type Verdict = "Winner" | "Average" | "Not working" | "New";

export interface PostRow {
  post: InsightPost;
  /** Inside the window. */
  views: number;
  signups: number;
  salesCents: number;
  costCents: number;
  signupsPer1k: number | null;
  /** Every view the post has had up to the end of the window. */
  lifetimeViews: number;
  /** Lifetime views as a multiple of the company's usual post, null
      without enough posts to say what usual is. */
  multiple: number | null;
  verdict: Verdict | null;
}

/** A post needs this many days live before it can be called a miss. */
const SETTLE_DAYS = 3;
/** Usual needs this many settled posts behind it. */
const MIN_POSTS_FOR_USUAL = 3;

export function median(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

export interface PostFilter {
  format?: PostFormat | null;
  creatorId?: string | null;
}

/** Every post with what it did between `from` and `to` (inclusive), ranked
    by views. Posts that went live after `to` or did nothing in the window
    and were published before it are left out. The verdict is about the
    post as a whole, not the window: its lifetime views against the usual
    settled post across the whole company, so an old post still trickling
    views is not called a miss for a quiet week. */
export function rankPosts(
  posts: InsightPost[],
  from: string,
  to: string,
  filter: PostFilter = {},
): PostRow[] {
  const lifetime = new Map<string, number>();
  const settledLifetimes: number[] = [];
  for (const post of posts) {
    if (post.day > to) continue;
    let total = 0;
    for (const [day, v] of post.daily) if (day <= to) total += v;
    lifetime.set(post.id, total);
    if (daysBetween(post.day, to) >= SETTLE_DAYS) settledLifetimes.push(total);
  }
  const usual = settledLifetimes.length >= MIN_POSTS_FOR_USUAL ? median(settledLifetimes) : 0;

  const rows: PostRow[] = [];
  for (const post of posts) {
    if (post.day > to) continue;
    if (filter.format && post.format !== filter.format) continue;
    if (filter.creatorId && post.creatorId !== filter.creatorId) continue;
    let views = 0;
    let signups = 0;
    let salesCents = 0;
    let costCents = 0;
    for (const [day, v, s, sales, cost] of post.daily) {
      if (day < from || day > to) continue;
      views += v;
      signups += s;
      salesCents += sales;
      costCents += cost;
    }
    const active = views > 0 || signups > 0 || salesCents > 0 || costCents > 0;
    if (!active && post.day < from) continue;
    rows.push({
      post,
      views,
      signups,
      salesCents,
      costCents,
      signupsPer1k: per1k(signups, views),
      lifetimeViews: lifetime.get(post.id) ?? 0,
      multiple: null,
      verdict: null,
    });
  }

  const settled = (r: PostRow) => daysBetween(r.post.day, to) >= SETTLE_DAYS;
  for (const r of rows) {
    if (usual > 0) r.multiple = r.lifetimeViews / usual;
    if (r.multiple !== null && r.multiple >= 2) r.verdict = "Winner";
    else if (!settled(r)) r.verdict = "New";
    else if (r.multiple === null) r.verdict = null;
    else if (r.multiple < 0.5) r.verdict = "Not working";
    else r.verdict = "Average";
  }
  return rows.sort((a, b) => b.views - a.views);
}

export const POST_SORTS = ["views", "signups", "signupsPer1k", "salesCents", "costCents"] as const;
export type PostSort = (typeof POST_SORTS)[number];

export function sortRows<T extends Record<PostSort, number | null>>(rows: T[], by: PostSort): T[] {
  return [...rows].sort((a, b) => (b[by] ?? -1) - (a[by] ?? -1));
}

/* ── Breakdowns (creators, formats) ── */

export interface GroupRow {
  key: string;
  label: string;
  posts: number;
  views: number;
  viewsPerPost: number;
  signups: number;
  signupsPer1k: number | null;
  salesCents: number;
  costCents: number;
  winners: number;
}

export function groupRows(
  rows: PostRow[],
  by: "creator" | "format",
): GroupRow[] {
  const groups = new Map<string, GroupRow>();
  for (const r of rows) {
    const key = by === "creator" ? (r.post.creatorId ?? r.post.creator) : r.post.format;
    const label = by === "creator" ? r.post.creator : r.post.format;
    let g = groups.get(key);
    if (!g) {
      g = {
        key,
        label,
        posts: 0,
        views: 0,
        viewsPerPost: 0,
        signups: 0,
        signupsPer1k: null,
        salesCents: 0,
        costCents: 0,
        winners: 0,
      };
      groups.set(key, g);
    }
    g.posts += 1;
    g.views += r.views;
    g.signups += r.signups;
    g.salesCents += r.salesCents;
    g.costCents += r.costCents;
    if (r.verdict === "Winner") g.winners += 1;
  }
  for (const g of groups.values()) {
    g.viewsPerPost = g.posts > 0 ? g.views / g.posts : 0;
    g.signupsPer1k = per1k(g.signups, g.views);
  }
  return [...groups.values()].sort((a, b) => b.views - a.views);
}

/* ── Callouts ── */

export interface Highlight {
  tone: "good" | "bad" | "info";
  title: string;
  body: string;
}

/** Creator-code sign-ups need this much behind them before a rate is
    worth repeating. */
const MIN_SIGNUPS_FOR_RATE = 3;

/** Up to three plain sentences about what is and is not working in the
    window, strongest first. Empty when there is nothing solid to say. */
export function highlights(rows: PostRow[], withSignups = true): Highlight[] {
  const out: Highlight[] = [];
  if (rows.length === 0) return out;

  const top = rows[0];
  if (top.views > 0) {
    out.push({
      tone: "good",
      title: "Best post",
      body:
        `“${top.post.title}” by ${firstName(top.post.creator)}: ${fmtCount(top.views)} views` +
        (top.multiple !== null && top.multiple >= 1.5 ? `, ${fmtMultiple(top.multiple)} your usual post.` : "."),
    });
  }

  const converters = withSignups
    ? rows.filter((r) => r.signups >= MIN_SIGNUPS_FOR_RATE && r.signupsPer1k !== null)
    : [];
  if (converters.length > 0) {
    const best = converters.reduce((a, b) => ((b.signupsPer1k ?? 0) > (a.signupsPer1k ?? 0) ? b : a));
    const allViews = rows.reduce((n, r) => n + r.views, 0);
    const allSignups = rows.reduce((n, r) => n + r.signups, 0);
    const overall = per1k(allSignups, allViews);
    const lift = overall && best.signupsPer1k ? best.signupsPer1k / overall : null;
    out.push({
      tone: "good",
      title: "Best converter",
      body:
        `“${best.post.title}”: ${fmtRate(best.signupsPer1k)} sign-ups per 1k views` +
        (lift !== null && lift >= 1.3 && best !== top ? `, ${fmtMultiple(lift)} your average.` : "."),
    });
  }

  const formats = groupRows(rows, "format").filter((g) => g.posts >= 2 && g.views > 0);
  if (formats.length === 2) {
    const [a, b] = [...formats].sort((x, y) => y.viewsPerPost - x.viewsPerPost);
    if (b.viewsPerPost > 0 && a.viewsPerPost / b.viewsPerPost >= 1.3) {
      out.push({
        tone: "info",
        title: `${a.label}s are winning`,
        body: `${fmtMultiple(a.viewsPerPost / b.viewsPerPost)} the views per post of ${b.label.toLowerCase()}s (${fmtCount(a.viewsPerPost)} against ${fmtCount(b.viewsPerPost)}).`,
      });
    }
  }

  const misses = rows.filter((r) => r.verdict === "Not working");
  if (misses.length > 0) {
    const worst = misses.reduce((a, b) => (b.lifetimeViews < a.lifetimeViews ? b : a));
    out.push({
      tone: "bad",
      title: misses.length === 1 ? "1 post is not working" : `${misses.length} posts are not working`,
      body: `Under half your usual views. Lowest: “${worst.post.title}” at ${fmtCount(worst.lifetimeViews)}.`,
    });
  }

  return out.slice(0, 3);
}

/* ── Display formatting ── */

function firstName(name: string): string {
  return name.split(" ")[0] || name;
}

/** 640 → "640", 5400 → "5.4k", 53600 → "54k", 1200000 → "1.2M". */
export function fmtCount(n: number): string {
  const v = Math.round(n);
  if (v >= 1e6) return trim((v / 1e6).toFixed(1)) + "M";
  if (v >= 1e4) return Math.round(v / 1e3) + "k";
  if (v >= 1e3) return trim((v / 1e3).toFixed(1)) + "k";
  return String(v);
}

function trim(s: string): string {
  return s.endsWith(".0") ? s.slice(0, -2) : s;
}

/** A rate: two decimals under 1, one under 10, whole above. Null → "–". */
export function fmtRate(n: number | null): string {
  if (n === null) return "–";
  if (n === 0) return "0";
  if (n < 1) return n.toFixed(2);
  if (n < 10) return trim(n.toFixed(1));
  return Math.round(n).toLocaleString("en-US");
}

/** Sign-ups can be fractional once split across posts. */
export function fmtSignups(n: number): string {
  if (n > 0 && n < 10 && Math.abs(n - Math.round(n)) > 0.05) return n.toFixed(1);
  return Math.round(n).toLocaleString("en-US");
}

/** Cents as dollars: whole dollars from $10, cents below. Null → "–". */
export function fmtMoney(cents: number | null): string {
  if (cents === null) return "–";
  const dollars = cents / 100;
  if (dollars === 0) return "$0";
  if (Math.abs(dollars) >= 10) return "$" + Math.round(dollars).toLocaleString("en-US");
  return "$" + dollars.toFixed(2);
}

/** 2.37 → "2.4x". */
export function fmtMultiple(n: number): string {
  return (n >= 10 ? String(Math.round(n)) : trim(n.toFixed(1))) + "x";
}

/** "1 per 240 views", or "" when there is nothing to say. */
export function onePer(views: number, signups: number): string {
  const each = ratio(views, signups);
  return each === null ? "" : `1 per ${fmtCount(each)} views`;
}
