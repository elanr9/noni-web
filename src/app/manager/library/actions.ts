"use server";

/* Library mutations and filtered reads, following src/app/admin/team/actions.ts:
   every action re-checks the session and role and scopes writes to the
   session profile's company, never a client-passed id. Semantics mirror the
   mobile app's lib/library-api.ts and lib/post-fill.ts. */

import { revalidatePath } from "next/cache";

import { fillBrief, saveBrief } from "@/app/manager/briefs/actions";
import {
  parsePointMedia,
  parseTextOverlay,
  type BriefDraft,
  type BriefFormat,
  type BriefWeekSummary,
  type Json,
  type PostType,
} from "@/components/manager/briefs/lib";
import { getSessionProfile, canManageCampaigns } from "@/lib/auth";
import { callEdgeFunction } from "@/lib/edge";
import { listPostTypes } from "@/lib/manager/briefs";
import {
  countLibraryItems,
  currentPlanningWeek,
  listEmptyWeekSlots,
  listLibraryItems,
  listOurPosts,
  type EmptyWeekSlot,
  type LibraryCounts,
  type LibraryItem,
  type LibrarySource,
  type LibraryUsedFilter,
  type OurPost,
  type OurPostsSort,
} from "@/lib/manager/library";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";

type Gate =
  | { ok: true; userId: string; companyId: string }
  | { ok: false; error: string };

async function requireManager(): Promise<Gate> {
  const { userId, profile } = await getSessionProfile();
  if (!userId || !canManageCampaigns(profile) || !profile?.company_id) {
    return { ok: false, error: "Campaign managers only." };
  }
  return { ok: true, userId, companyId: profile.company_id };
}

export type LibraryActionResult = { ok: true } | { ok: false; error: string };

export type CaptureResult =
  | { ok: true; ideas: number; reference: boolean }
  | { ok: false; error: string };

/** A single-line paste that is one http(s) URL routes to a reference. */
function isCaptureUrl(raw: string): boolean {
  const line = raw.trim();
  return /^https?:\/\/\S+$/i.test(line) && !line.includes("\n");
}

type LinkPreview = { thumbnail_url?: string | null; title?: string | null };

async function resolveLinkPreview(url: string): Promise<LinkPreview | null> {
  const { data } = await callEdgeFunction<LinkPreview | null>("library-link", { url });
  return data ?? null;
}

/* Best effort, same edge function the app calls after its insert. A link
   that resolves nothing stays a reference without art. */
async function enrichReference(itemId: string, url: string): Promise<void> {
  try {
    const preview = await resolveLinkPreview(url);
    if (!preview?.thumbnail_url && !preview?.title) return;
    await createServiceClient()
      .from("library_items")
      .update({
        thumbnail_url: preview.thumbnail_url ?? null,
        ...(preview.title ? { text: preview.title } : {}),
      })
      .eq("id", itemId);
  } catch {
    /* The reference row already exists. */
  }
}

export async function captureLibraryItem(raw: string): Promise<CaptureResult> {
  const gate = await requireManager();
  if (!gate.ok) return gate;
  const service = createServiceClient();

  if (isCaptureUrl(raw)) {
    const url = raw.trim();
    const { data, error } = await service
      .from("library_items")
      .insert({
        company_id: gate.companyId,
        source: "reference",
        url,
        created_by: gate.userId,
      })
      .select("id")
      .single();
    if (error) return { ok: false, error: error.message };
    await enrichReference(data.id, url);
    revalidatePath("/manager/library");
    return { ok: true, ideas: 0, reference: true };
  }

  const lines = raw
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 0);
  if (lines.length === 0) return { ok: false, error: "Type an idea first." };

  const { error } = await service.from("library_items").insert(
    lines.map((text) => ({
      company_id: gate.companyId,
      source: "idea",
      text,
      created_by: gate.userId,
    })),
  );
  if (error) return { ok: false, error: error.message };

  revalidatePath("/manager/library");
  return { ok: true, ideas: lines.length, reference: false };
}

export async function updateLibraryItemText(
  id: string,
  text: string,
): Promise<LibraryActionResult> {
  const gate = await requireManager();
  if (!gate.ok) return gate;
  const { error } = await createServiceClient()
    .from("library_items")
    .update({ text: text.trim() })
    .eq("company_id", gate.companyId)
    .eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/manager/library");
  return { ok: true };
}

export async function deleteLibraryItem(id: string): Promise<LibraryActionResult> {
  const gate = await requireManager();
  if (!gate.ok) return gate;
  const { error } = await createServiceClient()
    .from("library_items")
    .delete()
    .eq("company_id", gate.companyId)
    .eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/manager/library");
  return { ok: true };
}

// ---------------------------------------------------------------------------
// Filtered reads for the client, so search, sub tabs, sort and paging stay live.

export type LibraryItemsPage =
  | { ok: true; items: LibraryItem[]; counts: LibraryCounts }
  | { ok: false; error: string };

export async function loadLibraryItems(params: {
  source: LibrarySource;
  search: string;
  used: LibraryUsedFilter;
  offset: number;
}): Promise<LibraryItemsPage> {
  const gate = await requireManager();
  if (!gate.ok) return gate;
  try {
    const [items, counts] = await Promise.all([
      listLibraryItems({ companyId: gate.companyId, ...params }),
      countLibraryItems(gate.companyId, params.source),
    ]);
    return { ok: true, items, counts };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Could not load." };
  }
}

export type OurPostsPage =
  | { ok: true; posts: OurPost[] }
  | { ok: false; error: string };

export async function loadOurPosts(params: {
  sort: OurPostsSort;
  creatorId: string | null;
  postTypeId: string | null;
  search: string;
  offset: number;
}): Promise<OurPostsPage> {
  const gate = await requireManager();
  if (!gate.ok) return gate;
  try {
    const posts = await listOurPosts({
      days: params.sort === "top" ? 60 : null,
      creatorId: params.creatorId ?? undefined,
      postTypeId: params.postTypeId ?? undefined,
      search: params.search,
      sort: params.sort,
      offset: params.offset,
    });
    return { ok: true, posts };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Could not load." };
  }
}

// ---------------------------------------------------------------------------
// Our posts have no library_items row until something needs one (a use, a
// thumbnail). Find by post_id, else insert with used_count 0.

export interface OurPostRef {
  post_id: string;
  brief_id: string | null;
  post_url: string | null;
  creator_id: string | null;
  post_type_id: string | null;
  title: string | null;
  hook: string | null;
  library_item_id: string | null;
}

async function findOrCreateOurPostItem(
  companyId: string,
  userId: string,
  post: OurPostRef,
): Promise<LibraryItem> {
  const service = createServiceClient();
  if (post.library_item_id) {
    const { data, error } = await service
      .from("library_items")
      .select("*")
      .eq("company_id", companyId)
      .eq("id", post.library_item_id)
      .maybeSingle();
    if (error) throw error;
    if (data) return data;
  }
  const { data: existing, error: findError } = await service
    .from("library_items")
    .select("*")
    .eq("company_id", companyId)
    .eq("source", "our_post")
    .eq("post_id", post.post_id)
    .maybeSingle();
  if (findError) throw findError;
  if (existing) return existing;

  const { data, error } = await service
    .from("library_items")
    .insert({
      company_id: companyId,
      source: "our_post",
      post_id: post.post_id,
      creator_id: post.creator_id,
      post_type_id: post.post_type_id,
      text: post.title ?? post.hook,
      url: post.post_url,
      created_by: userId,
    })
    .select("*")
    .single();
  if (error) throw error;
  return data;
}

export type ThumbnailResult =
  | { ok: true; url: string | null }
  | { ok: false; error: string };

/** Resolve a thumbnail for one of our posts, storing it on the our_post row. */
export async function resolveOurPostThumbnail(post: OurPostRef): Promise<ThumbnailResult> {
  const gate = await requireManager();
  if (!gate.ok) return gate;
  if (!post.post_url) return { ok: true, url: null };
  try {
    const item = await findOrCreateOurPostItem(gate.companyId, gate.userId, post);
    if (item.thumbnail_url) return { ok: true, url: item.thumbnail_url };
    const preview = await resolveLinkPreview(post.post_url);
    if (!preview?.thumbnail_url) return { ok: true, url: null };
    const { error } = await createServiceClient()
      .from("library_items")
      .update({ thumbnail_url: preview.thumbnail_url })
      .eq("id", item.id);
    if (error) throw error;
    return { ok: true, url: preview.thumbnail_url };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Could not load." };
  }
}

// ---------------------------------------------------------------------------
// Make post: the planning week's empty slots, then a fill into one of them.

export type MakeTargetsResult =
  | {
      ok: true;
      week: BriefWeekSummary | null;
      slots: EmptyWeekSlot[];
      postTypes: PostType[];
    }
  | { ok: false; error: string };

export async function loadMakeTargets(): Promise<MakeTargetsResult> {
  const gate = await requireManager();
  if (!gate.ok) return gate;
  try {
    const [week, postTypes] = await Promise.all([
      currentPlanningWeek(gate.companyId),
      listPostTypes(gate.companyId),
    ]);
    const slots = week ? await listEmptyWeekSlots(gate.companyId, week.campaign.id) : [];
    return { ok: true, week, slots, postTypes };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Could not load this week." };
  }
}

export type MakeSource =
  | { kind: "item"; itemId: string }
  | { kind: "our_post"; post: OurPostRef };

export type MakePostResult =
  | { ok: true; kind: "made"; briefId: string }
  | { ok: true; kind: "kill"; killReason: string }
  | { ok: false; error: string };

/** The editor stores the body and its hashtags merged into briefs.caption. */
function mergeCaption(caption: string, hashtags: string[]): string {
  const body = caption.replace(/#\w+/g, " ").replace(/\s+/g, " ").trim();
  const tags = hashtags.map((t) => (t.startsWith("#") ? t : `#${t}`)).join(" ");
  return [body, tags].filter(Boolean).join("\n\n");
}

type RawPortResponse = Partial<Omit<BriefDraft, "point_media">> & {
  point_media?: unknown;
  error?: string;
  kill_reason?: string;
};

type PortOutcome =
  | { kind: "draft"; draft: BriefDraft }
  | { kind: "kill"; killReason: string }
  | { kind: "error"; error: string };

/** brief-assist port_format: a finished post of ours ported into the target type. */
async function portDraft(sourceBriefId: string, postTypeKey: string): Promise<PortOutcome> {
  const { data, error } = await callEdgeFunction<RawPortResponse>("brief-assist", {
    action: "port_format",
    brief_id: sourceBriefId,
    target_post_type: postTypeKey,
  });
  if (error !== null) return { kind: "error", error };
  if (data.error) return { kind: "error", error: data.error };
  if (data.kill_reason) return { kind: "kill", killReason: data.kill_reason };
  if (!data.title) return { kind: "error", error: "Draft came back incomplete." };
  return {
    kind: "draft",
    draft: {
      title: data.title,
      format: data.format === "photo_carousel" ? "photo_carousel" : "video",
      hook_options: data.hook_options ?? [],
      talking_points: data.talking_points ?? [],
      point_media: parsePointMedia(data.point_media),
      hashtags: data.hashtags ?? [],
      search_phrase: data.search_phrase ?? null,
      point_count: data.point_count ?? null,
      target_words: data.target_words ?? 380,
      script: data.script ?? null,
      caption: data.caption ?? "",
      why_it_works: data.why_it_works ?? "",
      cta: data.cta ?? null,
      post_type_id: data.post_type_id ?? null,
      overlay_labels: data.overlay_labels ?? [],
      generation_id: data.generation_id ?? null,
      warnings: data.warnings ?? [],
      example_url: data.example_url ?? "",
      example_transcript: data.example_transcript ?? null,
    },
  };
}

/** Pictures follow their point across a port; storage objects are shared by path. */
async function carryScreenshots(
  companyId: string,
  sourceBriefId: string,
  targetBriefId: string,
): Promise<void> {
  const service = createServiceClient();
  const { count } = await service
    .from("briefs")
    .select("id", { count: "exact", head: true })
    .eq("company_id", companyId)
    .in("id", [sourceBriefId, targetBriefId]);
  if (count !== 2) return;
  const [source, target] = await Promise.all([
    service
      .from("brief_segments")
      .select("talking_point_index, screenshot_url, screenshot_x, screenshot_y, screenshot_width")
      .eq("brief_id", sourceBriefId)
      .not("screenshot_url", "is", null),
    service
      .from("brief_segments")
      .select("id, talking_point_index")
      .eq("brief_id", targetBriefId)
      .is("screenshot_url", null),
  ]);
  await Promise.all(
    (target.data ?? []).map(async (row) => {
      if (row.talking_point_index === null) return;
      const from = (source.data ?? []).find(
        (s) => s.talking_point_index === row.talking_point_index,
      );
      if (!from) return;
      await service
        .from("brief_segments")
        .update({
          screenshot_url: from.screenshot_url,
          screenshot_x: from.screenshot_x,
          screenshot_y: from.screenshot_y,
          screenshot_width: from.screenshot_width,
        })
        .eq("id", row.id);
    }),
  );
}

/**
 * A port writes the draft into the slot the way fillBrief does for ideas and
 * links: row, derived clips, carried pictures, then the AI snapshot.
 */
async function portIntoSlot(params: {
  companyId: string;
  sourceBriefId: string;
  briefId: string;
  postTypeId: string;
  postTypeKey: string;
  family: BriefFormat;
  textOverlay: Json;
}): Promise<MakePostResult> {
  const outcome = await portDraft(params.sourceBriefId, params.postTypeKey);
  if (outcome.kind === "error") return { ok: false, error: outcome.error };
  if (outcome.kind === "kill") return { ok: true, kind: "kill", killReason: outcome.killReason };

  const { draft } = outcome;
  const slideshow = params.family === "photo_carousel";
  const saved = await saveBrief(
    params.briefId,
    {
      title: draft.title,
      format: params.family,
      hook: slideshow ? null : (draft.hook_options[0] ?? null),
      hook_options: slideshow ? [] : draft.hook_options,
      talking_points: draft.talking_points,
      hashtags: draft.hashtags,
      search_phrase: draft.search_phrase,
      point_count: draft.talking_points.length,
      target_words: draft.target_words,
      script: draft.script,
      caption: mergeCaption(draft.caption, draft.hashtags) || null,
      why_it_works: draft.why_it_works || null,
      cta: slideshow ? null : draft.cta,
      post_type_id: params.postTypeId,
      kill_reason: null,
      generation_id: draft.generation_id,
      example_url: draft.example_url || null,
      text_overlay: parseTextOverlay(params.textOverlay),
      subtitles: true,
    },
    { deriveSegments: true, overlayLabels: draft.overlay_labels },
  );
  if (!saved.ok) return saved;

  await createServiceClient()
    .from("briefs")
    .update({ example_transcript: draft.example_transcript })
    .eq("company_id", params.companyId)
    .eq("id", params.briefId);
  await carryScreenshots(params.companyId, params.sourceBriefId, params.briefId);

  const session = await createClient();
  await session.rpc("snapshot_ai_brief", { p_brief_id: params.briefId, p_source_kind: "port" });
  return { ok: true, kind: "made", briefId: params.briefId };
}

async function fillIntoSlot(
  briefId: string,
  source: { query?: string; url?: string },
  postTypeKey: string,
): Promise<MakePostResult> {
  const result = await fillBrief({ briefId, ...source, postTypeKey, saveIdea: false });
  if (!result.ok) return result;
  if (result.kind === "kill") return { ok: true, kind: "kill", killReason: result.killReason };
  return { ok: true, kind: "made", briefId };
}

/** Increment usage and remember the post it became; never deletes. */
async function markItemUsed(item: LibraryItem, briefId: string): Promise<void> {
  await createServiceClient()
    .from("library_items")
    .update({
      used_count: item.used_count + 1,
      last_used_at: new Date().toISOString(),
      last_brief_id: briefId,
    })
    .eq("id", item.id);
}

/**
 * Generates the whole post into the chosen empty slot and marks the source
 * row used, the way mobile fillPostSlot does. The source post, if there is
 * one, is never touched.
 */
export async function makePostFromLibrary(params: {
  source: MakeSource;
  briefId: string;
  postTypeId: string;
  postTypeKey: string;
  family: BriefFormat;
}): Promise<MakePostResult> {
  const gate = await requireManager();
  if (!gate.ok) return gate;
  const service = createServiceClient();

  const { data: slot } = await service
    .from("briefs")
    .select("id, text_overlay")
    .eq("company_id", gate.companyId)
    .eq("id", params.briefId)
    .maybeSingle();
  if (!slot) return { ok: false, error: "Post not found." };

  let result: MakePostResult;
  let item: LibraryItem | null = null;

  if (params.source.kind === "item") {
    const { data } = await service
      .from("library_items")
      .select("*")
      .eq("company_id", gate.companyId)
      .eq("id", params.source.itemId)
      .maybeSingle();
    if (!data) return { ok: false, error: "That library item is gone." };
    item = data;
    if (data.url) result = await fillIntoSlot(params.briefId, { url: data.url }, params.postTypeKey);
    else if (data.text) result = await fillIntoSlot(params.briefId, { query: data.text }, params.postTypeKey);
    else return { ok: false, error: "Nothing to make a post from." };
  } else {
    const post = params.source.post;
    if (post.brief_id) {
      result = await portIntoSlot({
        companyId: gate.companyId,
        sourceBriefId: post.brief_id,
        briefId: params.briefId,
        postTypeId: params.postTypeId,
        postTypeKey: params.postTypeKey,
        family: params.family,
        textOverlay: slot.text_overlay,
      });
    } else if (post.post_url) {
      result = await fillIntoSlot(params.briefId, { url: post.post_url }, params.postTypeKey);
    } else return { ok: false, error: "Nothing to make a post from." };
  }

  if (!result.ok || result.kind !== "made") return result;

  if (item) await markItemUsed(item, params.briefId);
  else if (params.source.kind === "our_post") {
    const ourPost = await findOrCreateOurPostItem(gate.companyId, gate.userId, params.source.post);
    await markItemUsed(ourPost, params.briefId);
  }

  revalidatePath("/manager/library");
  revalidatePath("/manager/briefs", "layout");
  return result;
}
