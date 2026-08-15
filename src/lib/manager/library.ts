/* Server reads for /manager/library, mirroring the mobile app's
   lib/library-api.ts. One table, library_items, where source means:
   'idea' = typed post ideas (one row per line of a bulk paste),
   'reference' = pasted links (thumbnail and title resolved by the
   library-link edge function after insert), 'our_post' = a lazily created
   usage counter for a live post (created the first time a post is used
   from the app's picker; nothing syncs posts in), 'from_creator' = ideas
   creators send in. The Posts tab reads live from posts: the mobile app
   uses the library_our_posts RPC, which scopes through auth.uid(), so the
   same join + latest-snapshot ranking is rebuilt here with the service
   client, scoped by company_id (top 60 days by views, the RPC default). */

import { cache } from "react";

import { createServiceClient } from "@/lib/supabase/service";

export type LibraryCardKind = "idea" | "our_post" | "reference";

/** One card-ready shape for every tab, mirroring the mobile
    LibraryItemCard models (itemCardModel / ourPostCardModel). */
export interface LibraryCard {
  id: string;
  kind: LibraryCardKind;
  title: string;
  url: string | null;
  thumbnailUrl: string | null;
  format: "Video" | "Carousel";
  /** Pre-joined meta line, e.g. "@handle · Aug 11 · Used 2 times". */
  meta: string;
}

export interface ManagerLibrary {
  posts: LibraryCard[];
  references: LibraryCard[];
  ideas: LibraryCard[];
}

const PAGE_SIZE = 50;
const OUR_POSTS_DAYS = 60;

interface ItemRow {
  id: string;
  source: string;
  text: string | null;
  url: string | null;
  thumbnail_url: string | null;
  used_count: number;
  created_at: string | null;
}

interface MetricSnapshot {
  views: number | null;
  fetched_at: string | null;
}

interface OurPostRow {
  id: string;
  platform: string | null;
  post_url: string | null;
  posted_at: string | null;
  assignments: {
    company_id: string | null;
    creator_id: string | null;
    briefs: { title: string | null; hook: string | null; format: string | null } | null;
    profiles: { full_name: string | null } | null;
  } | null;
  content_tasks: {
    company_id: string | null;
    title: string | null;
    format: string | null;
    profiles: { full_name: string | null } | null;
  } | null;
  post_metrics: MetricSnapshot[];
}

const MONTH_SHORT = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

function shortDate(iso: string | null): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  return `${MONTH_SHORT[d.getMonth()]} ${d.getDate()}`;
}

function fmtViews(n: number): string {
  if (n >= 1e6) return (n / 1e6).toFixed(1) + "M";
  if (n >= 1e3) return Math.round(n / 1e3) + "k";
  return String(Math.round(n));
}

function hostOf(url: string | null): string | null {
  if (!url) return null;
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return null;
  }
}

/** TikTok and Instagram links carry the handle in the path. */
function handleOf(url: string | null): string | null {
  if (!url) return null;
  const match = url.match(/@([A-Za-z0-9._]+)/);
  return match ? match[1] : null;
}

function usedBit(usedCount: number): string[] {
  if (usedCount <= 0) return [];
  return [`Used ${usedCount} time${usedCount === 1 ? "" : "s"}`];
}

function toFormat(raw: string | null | undefined): "Video" | "Carousel" {
  return raw === "photo_carousel" || raw === "carousel" ? "Carousel" : "Video";
}

function itemCard(row: ItemRow, kind: "idea" | "reference"): LibraryCard {
  const date = shortDate(row.created_at);
  const bits: string[] = [];
  if (kind === "reference") {
    const handle = handleOf(row.url);
    const host = hostOf(row.url);
    if (handle) bits.push(`@${handle}`);
    else if (host) bits.push(host);
  }
  if (date) bits.push(date);
  bits.push(...usedBit(row.used_count));

  return {
    id: row.id,
    kind,
    title: row.text ?? row.url ?? "",
    url: row.url,
    thumbnailUrl: row.thumbnail_url,
    format: "Video",
    meta: bits.join(" · "),
  };
}

async function listItems(
  companyId: string,
  source: "idea" | "reference",
): Promise<LibraryCard[]> {
  const supabase = createServiceClient();
  const { data } = await supabase
    .from("library_items")
    .select("id, source, text, url, thumbnail_url, used_count, created_at")
    .eq("company_id", companyId)
    .eq("source", source)
    .order("created_at", { ascending: false })
    .limit(PAGE_SIZE);
  return ((data ?? []) as ItemRow[]).map((row) => itemCard(row, source));
}

/** Live posts ranked by their latest views, top 60 days, one card per
    platform row (the RPC does not fold platforms). */
async function listOurPosts(companyId: string): Promise<LibraryCard[]> {
  const supabase = createServiceClient();
  const since = new Date(
    Date.now() - OUR_POSTS_DAYS * 24 * 60 * 60 * 1000,
  ).toISOString();
  const { data } = await supabase
    .from("posts")
    .select(
      `id, platform, post_url, posted_at,
       assignments:assignment_id ( company_id, creator_id, briefs:brief_id ( title, hook, format ), profiles:creator_id ( full_name ) ),
       content_tasks:task_id ( company_id, title, format, profiles!content_tasks_assigned_to_fkey ( full_name ) ),
       post_metrics ( views, fetched_at )`,
    )
    .neq("status", "failed")
    .gte("posted_at", since);

  const rows = ((data ?? []) as unknown as OurPostRow[]).filter(
    (row) =>
      (row.assignments?.company_id ?? row.content_tasks?.company_id) ===
        companyId && row.posted_at !== null,
  );

  const cards = rows.map((row) => {
    let latest: MetricSnapshot | null = null;
    for (const snap of row.post_metrics) {
      if (snap.fetched_at === null) continue;
      if (
        latest === null ||
        new Date(snap.fetched_at).getTime() >
          new Date(latest.fetched_at ?? "").getTime()
      ) {
        latest = snap;
      }
    }
    const views = latest?.views ?? 0;
    const creator =
      row.assignments?.profiles?.full_name ??
      row.content_tasks?.profiles?.full_name ??
      null;
    const bits: string[] = [];
    if (creator) bits.push(creator);
    bits.push(`${fmtViews(views)} views`);
    const date = shortDate(row.posted_at);
    if (date) bits.push(date);
    return {
      card: {
        id: row.id,
        kind: "our_post" as const,
        title:
          row.assignments?.briefs?.title ??
          row.assignments?.briefs?.hook ??
          row.content_tasks?.title ??
          "Post",
        url: row.post_url,
        thumbnailUrl: null,
        format: toFormat(
          row.assignments?.briefs?.format ?? row.content_tasks?.format,
        ),
        meta: bits.join(" · "),
      },
      views,
      postedAt: row.posted_at ?? "",
    };
  });

  return cards
    .sort((a, b) => b.views - a.views || (a.postedAt < b.postedAt ? 1 : -1))
    .slice(0, PAGE_SIZE)
    .map((c) => c.card);
}

async function fetchLibrary(companyId: string): Promise<ManagerLibrary> {
  const [posts, references, ideas] = await Promise.all([
    listOurPosts(companyId),
    listItems(companyId, "reference"),
    listItems(companyId, "idea"),
  ]);
  return { posts, references, ideas };
}

/** One fetch per request, scoped to the manager's company. */
export const getManagerLibrary = cache(fetchLibrary);
