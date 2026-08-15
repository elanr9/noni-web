import { cache } from "react";

import {
  addDays,
  briefWeekMonday,
  briefWeekStatus,
  isoDate,
  type Brief,
  type BriefFormat,
  type BriefSegment,
  type BriefWeekStats,
  type BriefWeekStatus,
  type BriefWeekSummary,
  type BriefWithType,
  type Campaign,
  type CampaignBriefItem,
  type PostType,
  type WeekPostItem,
} from "@/components/manager/briefs/lib";
import { createServiceClient } from "@/lib/supabase/service";

/* Server reads for the /manager Briefs pages. Queries are ported from the
   mobile app's lib/briefs-api.ts, where RLS scoped everything; here the
   service client bypasses RLS so EVERY query is scoped by company_id from
   the session profile. */

// ---------------------------------------------------------------------------
// Post types and search queries.

/** All seeded types, sorted for pickers and setup screens. */
export const listPostTypes = cache(
  async (companyId: string): Promise<PostType[]> => {
    const supabase = createServiceClient();
    const { data, error } = await supabase
      .from("post_types")
      .select("*")
      .eq("company_id", companyId)
      .order("sort_order", { ascending: true });
    if (error) throw error;
    return (data ?? []) as PostType[];
  },
);

export type SearchQueryRow = {
  id: string;
  query: string;
  used_count: number;
};

/** Lowest used_count first so the long tail gets covered. */
export async function listSearchQueries(
  companyId: string,
): Promise<SearchQueryRow[]> {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("search_queries")
    .select("id, query, used_count")
    .eq("company_id", companyId)
    .order("used_count", { ascending: true })
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data ?? []) as SearchQueryRow[];
}

// ---------------------------------------------------------------------------
// Campaign weeks.

/** Campaigns that already have typed brief rows (week-setup stamps). */
export async function stampedCampaignIds(
  companyId: string,
  campaignIds: string[],
): Promise<Set<string>> {
  const stamped = new Set<string>();
  if (campaignIds.length === 0) return stamped;
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("campaign_briefs")
    .select("campaign_id, briefs(post_type_id)")
    .eq("company_id", companyId)
    .in("campaign_id", campaignIds);
  if (error) throw error;
  type Row = {
    campaign_id: string;
    briefs: { post_type_id: string | null } | { post_type_id: string | null }[] | null;
  };
  for (const row of (data ?? []) as Row[]) {
    const brief = Array.isArray(row.briefs) ? row.briefs[0] : row.briefs;
    if (brief?.post_type_id) stamped.add(row.campaign_id);
  }
  return stamped;
}

/** Stamped or published weeks, newest first. Hides never-stamped drafts. */
export const listCampaigns = cache(
  async (companyId: string): Promise<Campaign[]> => {
    const supabase = createServiceClient();
    const { data, error } = await supabase
      .from("campaigns")
      .select("*")
      .eq("company_id", companyId)
      .not("drop_date", "is", null)
      .order("drop_date", { ascending: false })
      .order("created_at", { ascending: false });
    if (error) throw error;
    const all = (data ?? []) as Campaign[];
    if (all.length === 0) return [];
    const stamped = await stampedCampaignIds(
      companyId,
      all.map((c) => c.id),
    );
    return all.filter((c) => c.status === "published" || stamped.has(c.id));
  },
);

export async function getCampaign(
  companyId: string,
  id: string,
): Promise<Campaign | null> {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("campaigns")
    .select("*")
    .eq("company_id", companyId)
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return (data as Campaign | null) ?? null;
}

/** 1-based chronological week number by drop date, oldest week is 1. */
export async function weekNumberOf(
  companyId: string,
  campaignId: string,
): Promise<number | null> {
  const all = await listCampaigns(companyId);
  const asc = [...all].sort((a, b) =>
    (a.drop_date ?? "") < (b.drop_date ?? "") ? -1 : 1,
  );
  const idx = asc.findIndex((c) => c.id === campaignId);
  return idx >= 0 ? idx + 1 : null;
}

export async function listCampaignBriefs(
  companyId: string,
  campaignId: string,
): Promise<CampaignBriefItem[]> {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("campaign_briefs")
    .select("campaign_id, brief_id, position, briefs(*, post_types(*))")
    .eq("company_id", companyId)
    .eq("campaign_id", campaignId)
    .order("position", { ascending: true, nullsFirst: false })
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data ?? []) as unknown as CampaignBriefItem[];
}

// ---------------------------------------------------------------------------
// Week list with stats, ported from mobile listBriefWeeks.

type WeekMetricSnapshot = { views: number | null; fetched_at: string | null };

function weekLatestViews(rows: WeekMetricSnapshot[]): number {
  let views = 0;
  let latest = -Infinity;
  for (const row of rows) {
    if (row.fetched_at === null) continue;
    const t = new Date(row.fetched_at).getTime();
    if (t > latest) {
      latest = t;
      views = row.views ?? 0;
    }
  }
  return views;
}

function emptyWeekStats(): BriefWeekStats {
  return {
    creators: 0,
    earnCentsPerDay: 0,
    viewsPerDay: 0,
    postsPerCreatorPerDay: 0,
    salesCents: 0,
    posts: 0,
    views: 0,
  };
}

async function fetchBriefWeekStats(
  companyId: string,
  campaigns: Campaign[],
  statuses: Map<string, { status: BriefWeekStatus; dayOfWeek: number | null }>,
): Promise<Map<string, BriefWeekStats>> {
  const result = new Map<string, BriefWeekStats>();
  const ranges = campaigns.flatMap((c) => {
    if (c.drop_date === null) return [];
    const monday = briefWeekMonday(c.drop_date);
    return [
      {
        id: c.id,
        start: isoDate(monday),
        end: isoDate(addDays(monday, 6)),
      },
    ];
  });
  if (ranges.length === 0) return result;

  const supabase = createServiceClient();
  const ids = ranges.map((r) => r.id);
  const minDay = ranges.reduce((m, r) => (r.start < m ? r.start : m), ranges[0].start);
  const maxDay = ranges.reduce((m, r) => (r.end > m ? r.end : m), ranges[0].end);

  const [assignmentsRes, postsRes, conversionsRes, revenueRes] = await Promise.all([
    supabase
      .from("assignments")
      .select("id, campaign_id, creator_id")
      .eq("company_id", companyId)
      .in("campaign_id", ids),
    supabase
      .from("posts")
      .select(
        "posted_at, post_metrics ( views, fetched_at ), assignments!inner ( campaign_id, company_id )",
      )
      .eq("assignments.company_id", companyId)
      .in("assignments.campaign_id", ids)
      .not("posted_at", "is", null)
      .neq("status", "failed"),
    supabase
      .from("conversion_daily")
      .select("day, sales_cents")
      .eq("company_id", companyId)
      .is("creator_id", null)
      .gte("day", minDay)
      .lte("day", maxDay),
    supabase
      .from("revenue_events")
      .select("amount_cents, occurred_at")
      .eq("company_id", companyId)
      .gte("occurred_at", `${minDay}T00:00:00`)
      .lte("occurred_at", `${maxDay}T23:59:59`),
  ]);
  if (assignmentsRes.error) throw assignmentsRes.error;
  if (postsRes.error) throw postsRes.error;
  if (conversionsRes.error) throw conversionsRes.error;
  if (revenueRes.error) throw revenueRes.error;

  const creatorsByCampaign = new Map<string, Set<string>>();
  type AssignmentRow = { campaign_id: string | null; creator_id: string };
  for (const a of (assignmentsRes.data ?? []) as AssignmentRow[]) {
    if (a.campaign_id === null) continue;
    const set = creatorsByCampaign.get(a.campaign_id) ?? new Set<string>();
    set.add(a.creator_id);
    creatorsByCampaign.set(a.campaign_id, set);
  }

  type WeekPostRow = {
    posted_at: string | null;
    post_metrics: WeekMetricSnapshot[];
    assignments: { campaign_id: string | null } | null;
  };
  const postTotals = new Map<string, { posted: number; views: number }>();
  for (const post of (postsRes.data ?? []) as unknown as WeekPostRow[]) {
    const campaignId = post.assignments?.campaign_id;
    if (!campaignId) continue;
    const entry = postTotals.get(campaignId) ?? { posted: 0, views: 0 };
    entry.posted += 1;
    entry.views += weekLatestViews(post.post_metrics);
    postTotals.set(campaignId, entry);
  }

  /* Same revenue rule as analytics: conversion_daily once synced, else
     Noni's own link-attributed revenue_events. */
  const revenueByDay = new Map<string, number>();
  type ConversionRow = { day: string; sales_cents: number | null };
  type RevenueRow = { amount_cents: number | null; occurred_at: string | null };
  const conversions = (conversionsRes.data ?? []) as ConversionRow[];
  if (conversions.length > 0) {
    for (const row of conversions) {
      revenueByDay.set(row.day, (revenueByDay.get(row.day) ?? 0) + (row.sales_cents ?? 0));
    }
  } else {
    for (const event of (revenueRes.data ?? []) as RevenueRow[]) {
      if (event.occurred_at === null) continue;
      const day = isoDate(new Date(event.occurred_at));
      revenueByDay.set(day, (revenueByDay.get(day) ?? 0) + (event.amount_cents ?? 0));
    }
  }

  for (const range of ranges) {
    const days = statuses.get(range.id)?.dayOfWeek ?? 7;
    const creators = creatorsByCampaign.get(range.id)?.size ?? 0;
    const totals = postTotals.get(range.id) ?? { posted: 0, views: 0 };
    let revenueCents = 0;
    for (const [day, cents] of revenueByDay) {
      if (day >= range.start && day <= range.end) revenueCents += cents;
    }
    result.set(range.id, {
      creators,
      earnCentsPerDay: revenueCents / days,
      viewsPerDay: totals.views / days,
      postsPerCreatorPerDay: creators > 0 ? totals.posted / days / creators : 0,
      salesCents: revenueCents,
      posts: totals.posted,
      views: totals.views,
    });
  }
  return result;
}

/** The Briefs list: every stamped or published week, newest first. */
export async function listBriefWeeks(
  companyId: string,
): Promise<BriefWeekSummary[]> {
  const campaigns = await listCampaigns(companyId);
  if (campaigns.length === 0) return [];
  const ids = campaigns.map((c) => c.id);
  const supabase = createServiceClient();

  const numberById = new Map<string, number>();
  [...campaigns]
    .sort((a, b) => ((a.drop_date ?? "") < (b.drop_date ?? "") ? -1 : 1))
    .forEach((c, i) => numberById.set(c.id, i + 1));

  /* Lane progress: reviewed or intentionally killed rows count as done. */
  const { data: laneLinks, error: laneError } = await supabase
    .from("campaign_briefs")
    .select(
      "campaign_id, briefs!inner ( format, reviewed_at, kill_reason, post_types ( family ) )",
    )
    .eq("company_id", companyId)
    .in("campaign_id", ids);
  if (laneError) throw laneError;
  type LaneLink = {
    campaign_id: string;
    briefs: {
      format: string;
      reviewed_at: string | null;
      kill_reason: string | null;
      post_types: { family: string } | null;
    } | null;
  };
  const laneDone = new Map<string, { video: number; slideshow: number }>();
  for (const link of (laneLinks ?? []) as unknown as LaneLink[]) {
    const b = link.briefs;
    if (!b || (b.reviewed_at === null && b.kill_reason === null)) continue;
    const family = b.post_types?.family ?? b.format;
    const entry = laneDone.get(link.campaign_id) ?? { video: 0, slideshow: 0 };
    if (family === "photo_carousel") entry.slideshow += 1;
    else entry.video += 1;
    laneDone.set(link.campaign_id, entry);
  }

  const statuses = new Map(
    campaigns.map((c) => [c.id, briefWeekStatus(c)] as const),
  );
  const statsById = await fetchBriefWeekStats(
    companyId,
    campaigns.filter((c) => statuses.get(c.id)?.status !== "next"),
    statuses,
  );

  return campaigns.map((campaign) => {
    const where = statuses.get(campaign.id) ?? {
      status: "next" as const,
      dayOfWeek: null,
    };
    const done = laneDone.get(campaign.id) ?? { video: 0, slideshow: 0 };
    return {
      campaign,
      weekNumber: numberById.get(campaign.id) ?? campaigns.length,
      status: where.status,
      dayOfWeek: where.dayOfWeek,
      videoDone: done.video,
      videoTarget: campaign.video_target ?? 20,
      slideshowDone: done.slideshow,
      slideshowTarget: campaign.slideshow_target ?? 10,
      stats:
        where.status === "next"
          ? null
          : (statsById.get(campaign.id) ?? emptyWeekStats()),
    };
  });
}

/** Weekly stats for one campaign, for the finished week header. */
export async function weekStatsFor(
  companyId: string,
  campaign: Campaign,
): Promise<BriefWeekStats> {
  const statuses = new Map([[campaign.id, briefWeekStatus(campaign)] as const]);
  const stats = await fetchBriefWeekStats(companyId, [campaign], statuses);
  return stats.get(campaign.id) ?? emptyWeekStats();
}

// ---------------------------------------------------------------------------
// Posts made from a published week, newest first.

export async function listWeekPosts(
  companyId: string,
  campaignId: string,
): Promise<WeekPostItem[]> {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("posts")
    .select(
      `id, posted_at,
       post_metrics ( views, fetched_at ),
       assignments!inner ( id, campaign_id, task_id, company_id, briefs:brief_id ( title, format ), profiles:creator_id ( full_name ) )`,
    )
    .eq("assignments.company_id", companyId)
    .eq("assignments.campaign_id", campaignId)
    .not("posted_at", "is", null)
    .neq("status", "failed")
    .order("posted_at", { ascending: false });
  if (error) throw error;
  type Row = {
    id: string;
    posted_at: string | null;
    post_metrics: WeekMetricSnapshot[];
    assignments: {
      id: string;
      task_id: string | null;
      briefs: { title: string | null; format: string | null } | null;
      profiles: { full_name: string | null } | null;
    } | null;
  };
  const rows = (data ?? []) as unknown as Row[];

  const salesByAssignment = new Map<string, number>();
  const salesByTask = new Map<string, number>();
  const { data: events, error: eventsError } = await supabase
    .from("revenue_events")
    .select("amount_cents, attribution_links(task_id, assignment_id)")
    .eq("company_id", companyId);
  if (eventsError) throw eventsError;
  type EventRow = {
    amount_cents: number | null;
    attribution_links:
      | { task_id: string | null; assignment_id: string | null }
      | { task_id: string | null; assignment_id: string | null }[]
      | null;
  };
  for (const row of (events ?? []) as EventRow[]) {
    const link = Array.isArray(row.attribution_links)
      ? row.attribution_links[0]
      : row.attribution_links;
    const cents = row.amount_cents ?? 0;
    if (link?.assignment_id) {
      salesByAssignment.set(
        link.assignment_id,
        (salesByAssignment.get(link.assignment_id) ?? 0) + cents,
      );
    } else if (link?.task_id) {
      salesByTask.set(link.task_id, (salesByTask.get(link.task_id) ?? 0) + cents);
    }
  }

  return rows.map((row) => {
    const postedAt = row.posted_at;
    const postedDay = postedAt === null ? "" : isoDate(new Date(postedAt));
    const assignmentId = row.assignments?.id ?? null;
    const taskId = row.assignments?.task_id ?? null;
    const salesCents =
      (assignmentId ? (salesByAssignment.get(assignmentId) ?? 0) : 0) +
      (taskId ? (salesByTask.get(taskId) ?? 0) : 0);
    const posted = postedAt === null ? null : new Date(postedAt);
    return {
      postId: row.id,
      assignmentId,
      title: row.assignments?.briefs?.title ?? "Post",
      creatorName: row.assignments?.profiles?.full_name ?? "Creator",
      format: (row.assignments?.briefs?.format === "photo_carousel"
        ? "photo_carousel"
        : "video") as BriefFormat,
      when:
        posted === null
          ? ""
          : `${posted.toLocaleDateString("en-US", { month: "short" })} ${posted.getDate()}`,
      postedDay,
      views: weekLatestViews(row.post_metrics),
      salesCents,
    };
  });
}

// ---------------------------------------------------------------------------
// One brief plus its segments.

export async function getBrief(
  companyId: string,
  id: string,
): Promise<BriefWithType | null> {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("briefs")
    .select("*, post_types(*)")
    .eq("company_id", companyId)
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return (data as unknown as BriefWithType | null) ?? null;
}

export async function listBriefSegments(
  companyId: string,
  briefId: string,
): Promise<BriefSegment[]> {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("brief_segments")
    .select("*")
    .eq("company_id", companyId)
    .eq("brief_id", briefId)
    .order("slot_index", { ascending: true });
  if (error) throw error;
  return (data ?? []) as BriefSegment[];
}

/** The campaign link for a brief: its week and position, for the header. */
export async function briefCampaignLink(
  companyId: string,
  briefId: string,
): Promise<{ campaignId: string; position: number | null } | null> {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("campaign_briefs")
    .select("campaign_id, position")
    .eq("company_id", companyId)
    .eq("brief_id", briefId)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  const row = data as { campaign_id: string; position: number | null };
  return { campaignId: row.campaign_id, position: row.position };
}

export async function getHashtagBank(companyId: string): Promise<string[]> {
  const supabase = createServiceClient();
  const { data } = await supabase
    .from("brand_profiles")
    .select("hashtag_bank")
    .eq("company_id", companyId)
    .maybeSingle();
  const bank = (data as { hashtag_bank: string[] | null } | null)?.hashtag_bank;
  return bank ?? [];
}

export type CampaignManager = { id: string; name: string };

/** Campaign managers and the company admin on this account. */
export async function listCampaignManagers(
  companyId: string,
): Promise<CampaignManager[]> {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name")
    .eq("company_id", companyId)
    .in("role", ["campaign_manager", "company_admin"])
    .order("full_name");
  if (error) throw error;
  type Row = { id: string; full_name: string | null };
  return ((data ?? []) as Row[]).map((p) => ({
    id: p.id,
    name: p.full_name?.trim() || "Manager",
  }));
}

/** Signed URLs for segment screenshots, keyed by segment id. */
export async function segmentScreenshotUrls(
  segments: BriefSegment[],
): Promise<Record<string, string>> {
  const supabase = createServiceClient();
  const entries = await Promise.all(
    segments
      .filter((s) => s.screenshot_url)
      .map(async (s) => {
        const { data } = await supabase.storage
          .from("brief-assets")
          .createSignedUrl(s.screenshot_url as string, 3600);
        return [s.id, data?.signedUrl ?? null] as const;
      }),
  );
  const out: Record<string, string> = {};
  for (const [id, url] of entries) {
    if (url) out[id] = url;
  }
  return out;
}

export type { Brief, BriefWithType, Campaign, CampaignBriefItem, PostType };
