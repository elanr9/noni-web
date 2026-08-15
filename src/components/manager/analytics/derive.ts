/* Pure derivation helpers for the /manager analytics surface, ported from
   the mobile app's lib/analytics-api.ts so web and iOS agree on every
   number: engagement from post_metrics snapshots, sign-ups and sales from
   conversion_daily, per-post earnings from wallet_ledger bounty credits,
   paid-out totals from payouts, money gated on the Stripe connect day.
   No React, no Supabase; safe to import from server and client code. */

export type ViewSnapshot = { t: number; views: number };

export type PlatformStats = { views: number; likes: number; saves: number };

export type ManagerPostFormat = "Video" | "Carousel";

/** One piece of content. Platform rows (TikTok + Instagram) that share an
    assignment or task are folded into a single post. */
export interface ManagerAnalyticsPost {
  id: string;
  title: string;
  creatorId: string | null;
  creatorName: string;
  creatorFirst: string;
  format: ManagerPostFormat;
  /** Local calendar day the post went live, YYYY-MM-DD. */
  day: string;
  /** Total views across platforms, latest snapshots. */
  views: number;
  earnedCents: number;
  tiktok: PlatformStats;
  instagram: PlatformStats;
  postUrl: string | null;
  /** Cumulative view snapshots per platform row, for range bucketing. */
  series: ViewSnapshot[][];
}

export interface ManagerAnalyticsDay {
  /** Local calendar day, YYYY-MM-DD. */
  day: string;
  views: number;
  signups: number;
  salesCents: number;
  postIds: string[];
}

export interface ManagerAnalyticsTotals {
  views: number;
  posts: number;
  signups: number;
  /** Last 30 days vs the 30 before; null until there is a base to compare. */
  viewsDeltaPct: number | null;
  signupsDeltaPct: number | null;
  postsThisWeek: number;
}

export interface PayoutDay {
  day: string;
  amountCents: number;
}

/* ── Money gate ──
   Money exists only from the day the company connected Stripe. Managers
   without the billing permission fall back on the first completed payout:
   money can only exist after Stripe connected. */

export interface MoneyGate {
  /** First day money data exists, YYYY-MM-DD. Null means Stripe is not connected. */
  connectedDay: string | null;
  /** Short label for copy, e.g. "Aug 11". */
  sinceLabel: string | null;
}

export interface ManagerAnalytics {
  posts: ManagerAnalyticsPost[];
  /** Last 84 days ascending (covers every chart range and the calendar). */
  days: ManagerAnalyticsDay[];
  totals: ManagerAnalyticsTotals;
  /** Completed creator payouts, ascending by day. */
  payouts: PayoutDay[];
  gate: MoneyGate;
}

export function buildMoneyGate(
  connectedAtIso: string | null,
  fallbackDay?: string,
): MoneyGate {
  const day =
    connectedAtIso !== null
      ? localDayKey(new Date(connectedAtIso))
      : (fallbackDay ?? null);
  if (day === null) return { connectedDay: null, sinceLabel: null };
  return { connectedDay: day, sinceLabel: shortDayLabel(day) };
}

/** True when money data exists for this local day (on or after the connect date). */
export function moneyOn(gate: MoneyGate, day: string): boolean {
  return gate.connectedDay !== null && day >= gate.connectedDay;
}

/* ── Formatting ── */

export function localDayKey(date: Date): string {
  const y = date.getFullYear();
  const m = `${date.getMonth() + 1}`.padStart(2, "0");
  const d = `${date.getDate()}`.padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** "2026-08-11" to "Aug 11". */
export function shortDayLabel(day: string): string {
  const [y, m, d] = day.split("-").map((n) => parseInt(n, 10));
  return new Date(y, m - 1, d).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

/** Whole dollars: 41050 cents to "$410". */
export function formatMoney(cents: number): string {
  return `$${Math.round(cents / 100).toLocaleString("en-US")}`;
}

/** 53600 to "54k", 1200000 to "1.2M", 640 to "640" (admin web convention). */
export function fmtViews(n: number): string {
  if (n >= 1e6) return (n / 1e6).toFixed(1) + "M";
  if (n >= 1e3) return Math.round(n / 1e3) + "k";
  return String(Math.round(n));
}

export function pctDelta(current: number, previous: number): number | null {
  if (previous <= 0) return null;
  return Math.round(((current - previous) / previous) * 100);
}

/* ── Chart ranges ── */

export const ANALYTICS_RANGES = [
  "Last 24 hours",
  "Last 7 days",
  "Last 2 weeks",
  "Last month",
  "Last 12 weeks",
] as const;

export type AnalyticsRange = (typeof ANALYTICS_RANGES)[number];

export type ChartSeries = { points: number[]; labels: string[] };

const HOUR_MS = 60 * 60 * 1000;
export const DAY_MS = 24 * HOUR_MS;

const RANGE_BUCKETS: Record<
  AnalyticsRange,
  { count: number; ms: number; label: "hour" | "weekday" | "date" }
> = {
  "Last 24 hours": { count: 12, ms: 2 * HOUR_MS, label: "hour" },
  "Last 7 days": { count: 7, ms: DAY_MS, label: "weekday" },
  "Last 2 weeks": { count: 14, ms: DAY_MS, label: "date" },
  "Last month": { count: 5, ms: 7 * DAY_MS, label: "date" },
  "Last 12 weeks": { count: 12, ms: 7 * DAY_MS, label: "date" },
};

function bucketLabel(t: number, kind: "hour" | "weekday" | "date"): string {
  const date = new Date(t);
  if (kind === "hour") {
    const h = date.getHours();
    return `${h % 12 === 0 ? 12 : h % 12}${h < 12 ? "a" : "p"}`;
  }
  if (kind === "weekday") {
    return date.toLocaleDateString("en-US", { weekday: "short" });
  }
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

/** Cumulative views across every platform row at time t. */
export function viewsAt(series: ViewSnapshot[][], t: number): number {
  let total = 0;
  for (const row of series) {
    let latest = 0;
    for (const snap of row) {
      if (snap.t > t) break;
      latest = snap.views;
    }
    total += latest;
  }
  return total;
}

/** View deltas bucketed over the range, from the given (pre-filtered) posts. */
export function buildViewsSeries(
  posts: ManagerAnalyticsPost[],
  range: AnalyticsRange,
): ChartSeries {
  const spec = RANGE_BUCKETS[range];
  const now = Date.now();
  const points: number[] = [];
  const starts: number[] = [];
  for (let i = 0; i < spec.count; i++) {
    const end = now - (spec.count - 1 - i) * spec.ms;
    const start = end - spec.ms;
    starts.push(start);
    let v = 0;
    for (const post of posts) {
      v += Math.max(0, viewsAt(post.series, end) - viewsAt(post.series, start));
    }
    points.push(v);
  }
  const labels = [
    bucketLabel(starts[0], spec.label),
    bucketLabel(starts[Math.floor(spec.count / 2)], spec.label),
    bucketLabel(starts[spec.count - 1], spec.label),
  ];
  return { points, labels };
}
