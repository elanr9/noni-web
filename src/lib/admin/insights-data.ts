/* Server loader for /admin/analytics. Reads the real tables with the
   service client (the company-admin gate in the /admin layout runs first)
   and shapes them into @/lib/admin/insights InsightsData.

   - Views: post_metrics snapshots are cumulative per platform row, so the
     views a post gained on a day is the rise of its running high that day.
   - Sign-ups, trials and sales: conversion_daily. The row with no creator
     is everything the company had that day; a creator's row is what came
     in on their code. Both only count from the day the first post went
     live, so history from before Noni never shows.
   - Per-post sign-ups and sales: only what came in on the creator's code,
     split across that creator's posts by the views each gained that day
     and the six before it (the same rule the mobile app uses). Sales with
     no code are never pinned on a post.
   - Cost: what creators were credited (wallet_ledger).
   Days are UTC throughout, matching conversion_daily. */

import { cache } from "react";

import { createServiceClient } from "@/lib/supabase/service";

import {
  addDays,
  dayKey,
  type InsightDay,
  type InsightPost,
  type InsightsData,
  type PostDay,
} from "./insights";
import type { PostFormat } from "./types";

interface Snapshot {
  views: number | null;
  likes: number | null;
  comments: number | null;
  shares: number | null;
  saves: number | null;
  fetched_at: string | null;
}

export interface RawPost {
  id: string;
  platform: string | null;
  post_url: string | null;
  posted_at: string | null;
  assignment_id: string | null;
  task_id: string | null;
  assignments: {
    company_id: string | null;
    creator_id: string | null;
    briefs: { title: string | null; format: string | null } | null;
  } | null;
  content_tasks: {
    company_id: string | null;
    assigned_to: string | null;
    title: string | null;
    format: string | null;
  } | null;
  post_metrics: Snapshot[];
}

export interface RawConversion {
  creator_id: string | null;
  day: string;
  new_accounts: number;
  free_trials: number;
  sales_count: number;
  sales_cents: number;
}

export interface RawLedger {
  post_id: string | null;
  assignment_id: string | null;
  amount_cents: number;
  created_at: string;
}

export interface RawInputs {
  companyId: string;
  posts: RawPost[];
  conversions: RawConversion[];
  ledger: RawLedger[];
  names: Map<string, string>;
  firstCampaignDay: string | null;
  signupsOn: boolean;
  salesOn: boolean;
  now: Date;
}

/** The feed always reaches back at least this far so every range has a
    full window, and never further than MAX_DAYS. */
const MIN_DAYS = 90;
const MAX_DAYS = 730;
/** A code's sign-up is shared out by views over this many days. */
const CREDIT_WINDOW_DAYS = 7;

function toFormat(raw: string | null | undefined): PostFormat {
  return raw === "photo_carousel" || raw === "carousel" || raw === "Carousel" ? "Carousel" : "Video";
}

interface Working {
  post: InsightPost;
  rowIds: string[];
  views: Map<string, number>;
  signups: Map<string, number>;
  sales: Map<string, number>;
  cost: Map<string, number>;
}

function bump(map: Map<string, number>, key: string, n: number): void {
  map.set(key, (map.get(key) ?? 0) + n);
}

/** Pure shaping step, separated from the queries so it can be tested. */
export function buildInsights(input: RawInputs): InsightsData {
  const { companyId, names, now } = input;
  const today = dayKey(now);

  /* Fold platform rows (TikTok + Instagram) into one post per assignment
     or task. */
  const groups = new Map<string, Working>();
  const groupByRowId = new Map<string, Working>();
  for (const row of input.posts) {
    const owner = row.assignments;
    const task = row.content_tasks;
    if ((owner?.company_id ?? task?.company_id) !== companyId || !row.posted_at) continue;
    const key = row.assignment_id ?? row.task_id ?? row.id;
    const posted = dayKey(new Date(row.posted_at));
    const creatorId = owner?.creator_id ?? task?.assigned_to ?? null;

    let g = groups.get(key);
    if (!g) {
      g = {
        post: {
          id: key,
          title: owner?.briefs?.title ?? task?.title ?? "Post",
          creatorId,
          creator: (creatorId ? names.get(creatorId) : null) ?? "Creator",
          format: toFormat(owner?.briefs?.format ?? task?.format),
          day: posted,
          link: row.post_url ?? "",
          likes: 0,
          comments: 0,
          shares: 0,
          saves: 0,
          daily: [],
        },
        rowIds: [],
        views: new Map(),
        signups: new Map(),
        sales: new Map(),
        cost: new Map(),
      };
      groups.set(key, g);
    }
    g.rowIds.push(row.id);
    groupByRowId.set(row.id, g);
    if (posted < g.post.day) g.post.day = posted;
    if (!g.post.link && row.post_url) g.post.link = row.post_url;

    const snaps = row.post_metrics
      .filter((s): s is Snapshot & { fetched_at: string } => s.fetched_at !== null)
      .sort((a, b) => Date.parse(a.fetched_at) - Date.parse(b.fetched_at));
    /* Running high: a snapshot that dips (a platform under-reporting for a
       poll) neither hides growth nor counts it twice when it recovers. */
    let high = 0;
    for (const s of snaps) {
      const v = s.views ?? 0;
      if (v <= high) continue;
      /* A snapshot can never predate the post going live. */
      const day = dayKey(new Date(s.fetched_at));
      bump(g.views, day < posted ? posted : day, v - high);
      high = v;
    }
    const last = snaps[snaps.length - 1];
    if (last) {
      g.post.likes += last.likes ?? 0;
      g.post.comments += last.comments ?? 0;
      g.post.shares += last.shares ?? 0;
      g.post.saves += last.saves ?? 0;
    }
  }
  const all = [...groups.values()];

  /* Conversions count from the first post (or the first campaign when
     nothing is live yet). */
  let firstDay: string | null = null;
  for (const g of all) if (firstDay === null || g.post.day < firstDay) firstDay = g.post.day;
  firstDay ??= input.firstCampaignDay;
  const counted = input.conversions.filter(
    (r) => firstDay !== null && r.day >= firstDay && r.day <= today,
  );

  /* Credit each creator's coded sign-ups and sales to their posts. */
  const byCreator = new Map<string, Working[]>();
  for (const g of all) {
    if (!g.post.creatorId) continue;
    const list = byCreator.get(g.post.creatorId) ?? [];
    list.push(g);
    byCreator.set(g.post.creatorId, list);
  }
  const codedByDay = new Map<string, number>();
  for (const row of counted) {
    if (row.creator_id === null) continue;
    bump(codedByDay, row.day, row.new_accounts);
    if (row.new_accounts <= 0 && row.sales_cents <= 0) continue;
    const live = (byCreator.get(row.creator_id) ?? []).filter((g) => g.post.day <= row.day);
    if (live.length === 0) continue;
    const window = Array.from({ length: CREDIT_WINDOW_DAYS }, (_, i) => addDays(row.day, -i));
    let weights = live.map((g) => window.reduce((n, k) => n + (g.views.get(k) ?? 0), 0));
    let total = weights.reduce((n, w) => n + w, 0);
    if (total <= 0) {
      /* Nothing gained views that week: the newest post takes it. */
      const newest = live.reduce((a, b) => (b.post.day > a.post.day ? b : a));
      weights = live.map((g) => (g === newest ? 1 : 0));
      total = 1;
    }
    live.forEach((g, i) => {
      if (weights[i] <= 0) return;
      bump(g.signups, row.day, (row.new_accounts * weights[i]) / total);
      bump(g.sales, row.day, (row.sales_cents * weights[i]) / total);
    });
  }

  /* What creators were paid, per day and per post. */
  const spendByDay = new Map<string, number>();
  for (const entry of input.ledger) {
    const day = dayKey(new Date(entry.created_at));
    if (day > today) continue;
    bump(spendByDay, day, entry.amount_cents);
    const g =
      (entry.post_id ? groupByRowId.get(entry.post_id) : undefined) ??
      (entry.assignment_id ? groups.get(entry.assignment_id) : undefined);
    if (g) bump(g.cost, day, entry.amount_cents);
  }

  /* Company day feed. */
  const viewsByDay = new Map<string, number>();
  const postsByDay = new Map<string, number>();
  for (const g of all) {
    bump(postsByDay, g.post.day, 1);
    for (const [day, v] of g.views) bump(viewsByDay, day, v);
  }
  const totalByDay = new Map<string, RawConversion>();
  for (const row of counted) if (row.creator_id === null) totalByDay.set(row.day, row);

  let start = addDays(today, -(MIN_DAYS - 1));
  const earliest = [...viewsByDay.keys(), ...totalByDay.keys(), ...spendByDay.keys(), ...postsByDay.keys()];
  for (const key of earliest) if (key < start) start = key;
  const floor = addDays(today, -(MAX_DAYS - 1));
  if (start < floor) start = floor;

  const days: InsightDay[] = [];
  for (let day = start; day <= today; day = addDays(day, 1)) {
    const c = totalByDay.get(day);
    days.push({
      day,
      views: viewsByDay.get(day) ?? 0,
      signups: c?.new_accounts ?? 0,
      trials: c?.free_trials ?? 0,
      sales: c?.sales_count ?? 0,
      salesCents: c?.sales_cents ?? 0,
      codedSignups: codedByDay.get(day) ?? 0,
      spendCents: spendByDay.get(day) ?? 0,
      posts: postsByDay.get(day) ?? 0,
    });
  }

  const posts = all.map((g) => {
    const keys = new Set([...g.views.keys(), ...g.signups.keys(), ...g.sales.keys(), ...g.cost.keys()]);
    const daily: PostDay[] = [...keys].sort().map((day) => [
      day,
      g.views.get(day) ?? 0,
      Math.round((g.signups.get(day) ?? 0) * 100) / 100,
      Math.round(g.sales.get(day) ?? 0),
      g.cost.get(day) ?? 0,
    ]);
    return { ...g.post, daily };
  });

  return { today, days, posts, signupsOn: input.signupsOn, salesOn: input.salesOn };
}

/* ── Queries ── */

const PAGE = 500;

/** Every row of a query, a page at a time (PostgREST caps a request at
    1000 rows). A failed page ends the read with what came before it. */
async function allRows<T>(
  page: (from: number, to: number) => PromiseLike<{ data: unknown; error: unknown }>,
): Promise<T[]> {
  const rows: T[] = [];
  for (let from = 0; ; from += PAGE) {
    const { data, error } = await page(from, from + PAGE - 1);
    if (error) {
      console.error("[insights] query failed", error);
      return rows;
    }
    const batch = (data ?? []) as T[];
    rows.push(...batch);
    if (batch.length < PAGE) return rows;
  }
}

const POST_SELECT = `id, platform, post_url, posted_at, assignment_id, task_id,
  assignments:assignment_id!inner ( company_id, creator_id, briefs:brief_id ( title, format ) ),
  content_tasks:task_id ( company_id, assigned_to, title, format ),
  post_metrics ( views, likes, comments, shares, saves, fetched_at )`;

const TASK_POST_SELECT = `id, platform, post_url, posted_at, assignment_id, task_id,
  assignments:assignment_id ( company_id, creator_id, briefs:brief_id ( title, format ) ),
  content_tasks:task_id!inner ( company_id, assigned_to, title, format ),
  post_metrics ( views, likes, comments, shares, saves, fetched_at )`;

async function fetchInsights(companyId: string): Promise<InsightsData> {
  const now = new Date();
  if (!companyId) {
    return buildInsights({
      companyId,
      posts: [],
      conversions: [],
      ledger: [],
      names: new Map(),
      firstCampaignDay: null,
      signupsOn: false,
      salesOn: false,
      now,
    });
  }
  const supabase = createServiceClient();

  const [byAssignment, byTask, conversions, ledger, rosterRes, campaignsRes, billingRes, sourceRes] =
    await Promise.all([
      /* posts has no company column: scope through the assignment, then
         pick up legacy posts that only hang off a task. */
      allRows<RawPost>((from, to) =>
        supabase
          .from("posts")
          .select(POST_SELECT)
          .eq("assignments.company_id", companyId)
          .neq("status", "failed")
          .order("id")
          .range(from, to),
      ),
      allRows<RawPost>((from, to) =>
        supabase
          .from("posts")
          .select(TASK_POST_SELECT)
          .eq("content_tasks.company_id", companyId)
          .is("assignment_id", null)
          .neq("status", "failed")
          .order("id")
          .range(from, to),
      ),
      allRows<RawConversion>((from, to) =>
        supabase
          .from("conversion_daily")
          .select("creator_id, day, new_accounts, free_trials, sales_count, sales_cents")
          .eq("company_id", companyId)
          .order("day")
          .order("id")
          .range(from, to),
      ),
      allRows<RawLedger>((from, to) =>
        supabase
          .from("wallet_ledger")
          .select("post_id, assignment_id, amount_cents, created_at")
          .eq("company_id", companyId)
          .in("kind", ["bounty_credit", "streak_bonus"])
          .gt("amount_cents", 0)
          .order("id")
          .range(from, to),
      ),
      supabase.from("company_roster").select("id, full_name").eq("company_id", companyId),
      supabase.from("campaigns").select("starts_on, created_at").eq("company_id", companyId),
      supabase
        .from("company_billing")
        .select("stripe_account_id, stripe_connected")
        .eq("company_id", companyId)
        .maybeSingle(),
      supabase
        .from("company_signup_sources")
        .select("connected_at")
        .eq("company_id", companyId)
        .maybeSingle(),
    ]);

  const names = new Map<string, string>();
  for (const r of (rosterRes.data ?? []) as Array<{ id: string | null; full_name: string | null }>) {
    if (r.id && r.full_name) names.set(r.id, r.full_name);
  }

  let firstCampaignDay: string | null = null;
  for (const c of (campaignsRes.data ?? []) as Array<{ starts_on: string | null; created_at: string | null }>) {
    const day = c.starts_on ?? c.created_at?.slice(0, 10) ?? null;
    if (day && (firstCampaignDay === null || day < firstCampaignDay)) firstCampaignDay = day;
  }

  const billing = billingRes.data as { stripe_account_id: string | null; stripe_connected: boolean | null } | null;
  const source = sourceRes.data as { connected_at: string | null } | null;
  const salesOn = Boolean(billing?.stripe_account_id || billing?.stripe_connected);

  return buildInsights({
    companyId,
    posts: [...byAssignment, ...byTask],
    conversions,
    ledger,
    names,
    firstCampaignDay,
    signupsOn: salesOn || Boolean(source?.connected_at),
    salesOn,
    now,
  });
}

/** One fetch per request. Dev + ADMIN_QA_MOCK=1 serves the sample set. */
export const getInsights = cache(async (companyId: string): Promise<InsightsData> => {
  if (process.env.NODE_ENV === "development" && process.env.ADMIN_QA_MOCK === "1") {
    const { mockInsights } = await import("./insights-mock");
    return mockInsights();
  }
  return fetchInsights(companyId);
});
