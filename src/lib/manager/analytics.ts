/* Server reads for /manager/analytics, mirroring the mobile app's
   fetchCompanyAnalytics (noni/lib/analytics-api.ts). The mobile client
   leans on RLS to scope posts; here the service client bypasses RLS, so
   every query filters on the caller's company_id and posts (which carry no
   company column) are scoped through their joined assignment or task while
   grouping, same as src/lib/admin/data.ts. */

import { cache } from "react";

import {
  buildMoneyGate,
  DAY_MS,
  localDayKey,
  pctDelta,
  viewsAt,
  type ManagerAnalytics,
  type ManagerAnalyticsDay,
  type ManagerAnalyticsPost,
  type ManagerAnalyticsTotals,
  type ManagerPostFormat,
  type PayoutDay,
  type PlatformStats,
  type ViewSnapshot,
} from "@/components/manager/analytics/derive";
import { createServiceClient } from "@/lib/supabase/service";

/* ── Raw row shapes ── */

interface MetricSnapshot {
  views: number | null;
  likes: number | null;
  saves: number | null;
  fetched_at: string | null;
}

interface PostRow {
  id: string;
  platform: string | null;
  post_url: string | null;
  posted_at: string | null;
  status: string | null;
  assignment_id: string | null;
  task_id: string | null;
  assignments: {
    company_id: string | null;
    creator_id: string | null;
    briefs: { title: string | null; format: string | null } | null;
    profiles: { full_name: string | null } | null;
  } | null;
  content_tasks: {
    company_id: string | null;
    title: string | null;
    format: string | null;
    assigned_to: string | null;
    profiles: { full_name: string | null } | null;
  } | null;
  post_metrics: MetricSnapshot[];
}

interface ConversionRow {
  day: string;
  new_accounts: number;
  sales_cents: number;
}

interface LedgerRow {
  post_id: string | null;
  amount_cents: number;
}

interface PayoutRow {
  amount_cents: number;
  created_at: string | null;
  completed_at: string | null;
}

interface CampaignDateRow {
  starts_on: string | null;
  created_at: string | null;
}

function asFormat(raw: string | null | undefined): ManagerPostFormat {
  return raw === "photo_carousel" || raw === "carousel" ? "Carousel" : "Video";
}

/** The day the company started its first campaign on Noni (YYYY-MM-DD).
    Sign-ups and sales only count from that day, so Stripe history predating
    Noni never shows in Analytics. */
function firstCampaignDayOf(rows: CampaignDateRow[]): string | null {
  let first: string | null = null;
  for (const row of rows) {
    const day = row.starts_on ?? row.created_at?.slice(0, 10) ?? null;
    if (day && (first === null || day < first)) first = day;
  }
  return first;
}

const WINDOW_DAYS = 84;

async function fetchAnalytics(companyId: string): Promise<ManagerAnalytics> {
  const supabase = createServiceClient();

  /* Posts carry no date filter: old posts still accrue views inside the
     window. Company scope is applied while grouping. */
  const [postsRes, conversionsRes, ledgerRes, payoutsRes, campaignsRes, billingRes] =
    await Promise.all([
      supabase
        .from("posts")
        .select(
          `id, platform, post_url, posted_at, status, assignment_id, task_id,
           assignments:assignment_id ( company_id, creator_id, briefs:brief_id ( title, format ), profiles:creator_id ( full_name ) ),
           content_tasks:task_id ( company_id, title, format, assigned_to, profiles!content_tasks_assigned_to_fkey ( full_name ) ),
           post_metrics ( views, likes, saves, fetched_at )`,
        )
        .neq("status", "failed"),
      supabase
        .from("conversion_daily")
        .select("day, new_accounts, sales_cents")
        .eq("company_id", companyId)
        .is("creator_id", null),
      supabase
        .from("wallet_ledger")
        .select("post_id, amount_cents")
        .eq("company_id", companyId)
        .eq("kind", "bounty_credit"),
      supabase
        .from("payouts")
        .select("amount_cents, created_at, completed_at")
        .eq("company_id", companyId)
        .eq("status", "paid"),
      supabase
        .from("campaigns")
        .select("starts_on, created_at")
        .eq("company_id", companyId),
      supabase
        .from("company_billing")
        .select("*")
        .eq("company_id", companyId)
        .maybeSingle(),
    ]);

  const firstCampaignDay = firstCampaignDayOf(
    (campaignsRes.data ?? []) as CampaignDateRow[],
  );
  const conversions = ((conversionsRes.data ?? []) as ConversionRow[]).filter(
    (r) => firstCampaignDay !== null && r.day >= firstCampaignDay,
  );

  const rows = (postsRes.data ?? []) as unknown as PostRow[];

  const earnedByPostId = new Map<string, number>();
  for (const entry of (ledgerRes.data ?? []) as LedgerRow[]) {
    if (entry.post_id === null) continue;
    earnedByPostId.set(
      entry.post_id,
      (earnedByPostId.get(entry.post_id) ?? 0) + entry.amount_cents,
    );
  }

  /* Fold platform rows into posts keyed on the shared assignment or task. */
  const groups = new Map<string, PostRow[]>();
  for (const row of rows) {
    if (row.posted_at === null) continue;
    const rowCompany =
      row.assignments?.company_id ?? row.content_tasks?.company_id ?? null;
    if (rowCompany !== companyId) continue;
    const key = row.assignment_id ?? row.task_id ?? row.id;
    const group = groups.get(key) ?? [];
    group.push(row);
    groups.set(key, group);
  }

  const posts: ManagerAnalyticsPost[] = [];
  for (const [key, groupRows] of groups) {
    const first = groupRows[0];
    const title =
      first.assignments?.briefs?.title ?? first.content_tasks?.title ?? "Post";
    const creatorName =
      first.assignments?.profiles?.full_name ??
      first.content_tasks?.profiles?.full_name ??
      "Creator";
    const creatorId =
      first.assignments?.creator_id ?? first.content_tasks?.assigned_to ?? null;
    const format = asFormat(
      first.assignments?.briefs?.format ?? first.content_tasks?.format,
    );

    let day = "9999-12-31";
    let postUrl: string | null = null;
    const series: ViewSnapshot[][] = [];
    const empty = (): PlatformStats => ({ views: 0, likes: 0, saves: 0 });
    const tiktok = empty();
    const instagram = empty();
    let earned = 0;

    for (const row of groupRows) {
      const rowDay = localDayKey(new Date(row.posted_at ?? ""));
      if (rowDay < day) day = rowDay;
      if (postUrl === null && row.post_url !== null) postUrl = row.post_url;
      earned += earnedByPostId.get(row.id) ?? 0;

      const snaps = row.post_metrics
        .filter(
          (s): s is MetricSnapshot & { fetched_at: string } =>
            s.fetched_at !== null,
        )
        .sort(
          (a, b) =>
            new Date(a.fetched_at).getTime() - new Date(b.fetched_at).getTime(),
        );
      series.push(
        snaps.map((s) => ({
          t: new Date(s.fetched_at).getTime(),
          views: s.views ?? 0,
        })),
      );

      const last = snaps[snaps.length - 1];
      const target = row.platform === "instagram" ? instagram : tiktok;
      target.views += last?.views ?? 0;
      target.likes += last?.likes ?? 0;
      target.saves += last?.saves ?? 0;
    }

    posts.push({
      id: key,
      title,
      creatorId,
      creatorName,
      creatorFirst: creatorName.split(" ")[0],
      format,
      day,
      views: tiktok.views + instagram.views,
      earnedCents: earned,
      tiktok,
      instagram,
      postUrl,
      series,
    });
  }

  const conversionByDay = new Map<string, ConversionRow>();
  for (const row of conversions) conversionByDay.set(row.day, row);

  const postIdsByDay = new Map<string, string[]>();
  for (const post of posts) {
    const list = postIdsByDay.get(post.day) ?? [];
    list.push(post.id);
    postIdsByDay.set(post.day, list);
  }

  const windowStart = new Date();
  windowStart.setDate(windowStart.getDate() - (WINDOW_DAYS - 1));
  windowStart.setHours(0, 0, 0, 0);

  const days: ManagerAnalyticsDay[] = [];
  for (let i = 0; i < WINDOW_DAYS; i++) {
    const date = new Date(windowStart.getTime() + i * DAY_MS);
    const endOfDay = date.getTime() + DAY_MS - 1;
    const key = localDayKey(date);
    let views = 0;
    for (const post of posts) {
      views += Math.max(
        0,
        viewsAt(post.series, endOfDay) - viewsAt(post.series, endOfDay - DAY_MS),
      );
    }
    const conversion = conversionByDay.get(key);
    days.push({
      day: key,
      views,
      signups: conversion?.new_accounts ?? 0,
      salesCents: conversion?.sales_cents ?? 0,
      postIds: postIdsByDay.get(key) ?? [],
    });
  }

  const sum = (
    list: ManagerAnalyticsDay[],
    pick: (d: ManagerAnalyticsDay) => number,
  ) => list.reduce((n, d) => n + pick(d), 0);
  const last30 = days.slice(-30);
  const prev30 = days.slice(-60, -30);
  const weekAgo = localDayKey(new Date(Date.now() - 6 * DAY_MS));

  const totals: ManagerAnalyticsTotals = {
    views: posts.reduce((n, p) => n + p.views, 0),
    posts: posts.length,
    signups: conversions.reduce((n, c) => n + c.new_accounts, 0),
    viewsDeltaPct: pctDelta(
      sum(last30, (d) => d.views),
      sum(prev30, (d) => d.views),
    ),
    signupsDeltaPct: pctDelta(
      sum(last30, (d) => d.signups),
      sum(prev30, (d) => d.signups),
    ),
    postsThisWeek: posts.filter((p) => p.day >= weekAgo).length,
  };

  const payouts: PayoutDay[] = ((payoutsRes.data ?? []) as PayoutRow[])
    .map((p) => ({
      day: localDayKey(new Date(p.completed_at ?? p.created_at ?? "")),
      amountCents: p.amount_cents,
    }))
    .sort((a, b) => (a.day < b.day ? -1 : 1));

  /* Money gate: the mobile app reads the Stripe connect moment from the
     company-billing status (stripe_customer_id set means connected, dated
     by the row's updated_at) and falls back on the first completed payout.
     Same semantics here off company_billing directly. */
  const billing = (billingRes.data ?? null) as Record<string, unknown> | null;
  const connected =
    typeof billing?.stripe_customer_id === "string" ||
    billing?.stripe_connected === true;
  const connectedAtIso =
    connected && typeof billing?.updated_at === "string"
      ? billing.updated_at
      : null;
  const gate = buildMoneyGate(connectedAtIso, payouts[0]?.day);

  return { posts, days, totals, payouts, gate };
}

/** One fetch per request, scoped to the manager's company. */
export const getManagerAnalytics = cache(fetchAnalytics);
