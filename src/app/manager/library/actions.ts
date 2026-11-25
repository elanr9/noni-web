"use server";

/* Library mutations and filtered reads, following src/app/admin/team/actions.ts:
   every action re-checks the session and role and scopes writes to the
   session profile's company, never a client-passed id. Semantics mirror the
   mobile app's lib/library-api.ts and lib/post-fill.ts. */

import { revalidatePath } from "next/cache";

import { getSessionProfile, canManageCampaigns } from "@/lib/auth";
import { callEdgeFunction } from "@/lib/edge";
import {
  countLibraryItems,
  listLibraryItems,
  listOurPosts,
  type LibraryCounts,
  type LibraryItem,
  type LibrarySource,
  type LibraryUsedFilter,
  type OurPost,
  type OurPostsSort,
} from "@/lib/manager/library";
import { createServiceClient } from "@/lib/supabase/service";

type Gate =
  | { ok: true; userId: string; companyId: string }
  | { ok: false; error: string };

async function requireManager(): Promise<Gate> {
  const { userId, profile } = await getSessionProfile();
  if (!userId || !canManageCampaigns(profile) || !profile?.active_company_id) {
    return { ok: false, error: "Campaign managers only." };
  }
  return { ok: true, userId, companyId: profile.active_company_id };
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

export async function captureLibraryItem(
  raw: string,
  /** How the reference should translate to our product; rides into every AI fill from it. */
  notes?: string | null,
): Promise<CaptureResult> {
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
        notes: notes?.trim() || null,
        created_by: gate.userId,
      })
      .select("id")
      .single();
    if (error) return { ok: false, error: error.message };
    await enrichReference(data.id, url);
    /* Queue the one time study that teaches the writer from this post; the
       edge function answers at once and scrapes in the background. */
    await callEdgeFunction("study-reference", { library_item_id: data.id }).catch(() => null);
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

/** A brief was saved from this idea or reference: count the use. */
export async function markLibraryItemUsed(itemId: string): Promise<LibraryActionResult> {
  const gate = await requireManager();
  if (!gate.ok) return gate;
  const service = createServiceClient();
  const { data: item } = await service
    .from("library_items")
    .select("id, used_count")
    .eq("company_id", gate.companyId)
    .eq("id", itemId)
    .maybeSingle();
  if (!item) return { ok: false, error: "That library item is gone." };
  const { error } = await service
    .from("library_items")
    .update({ used_count: (item.used_count ?? 0) + 1, last_used_at: new Date().toISOString() })
    .eq("id", item.id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/manager/library");
  return { ok: true };
}
