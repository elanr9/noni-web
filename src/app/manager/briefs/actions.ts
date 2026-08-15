"use server";

import { revalidatePath } from "next/cache";

import {
  parseHookOptions,
  parseTalkingPoints,
  splitFamily,
  type BriefDraft,
  type BriefFormat,
  type BriefReviewResult,
  type BriefSaveInput,
  type BriefSegment,
  type Json,
  type PublishResult,
  type RegenDraftPayload,
  type RegenField,
  type RegenResult,
  type ReviewEventInput,
  type TalkingPoint,
  type WeekPostItem,
} from "@/components/manager/briefs/lib";
import { getSessionProfile, isCampaignManager } from "@/lib/auth";
import { callEdgeFunction } from "@/lib/edge";
import {
  listPostTypes,
  listSearchQueries,
  listWeekPosts,
  segmentScreenshotUrls,
  stampedCampaignIds,
} from "@/lib/manager/briefs";
import { createServiceClient } from "@/lib/supabase/service";

/* Server actions for the manager Briefs pages. Mutations follow the
   src/app/admin/team/actions.ts pattern: every action re-checks the session
   and the campaign_manager role and scopes writes by the session profile's
   company_id. Edge functions (ingest-brief, brief-assist, brief-review,
   publish-campaign) are the same ones the mobile app invokes, called with
   the signed-in manager's token. */

type Gate =
  | { ok: true; userId: string; companyId: string }
  | { ok: false; error: string };

async function requireManager(): Promise<Gate> {
  const { userId, profile } = await getSessionProfile();
  if (!userId || !isCampaignManager(profile) || !profile?.company_id) {
    return { ok: false, error: "Campaign managers only." };
  }
  return { ok: true, userId, companyId: profile.company_id };
}

const ISO_DAY = /^\d{4}-\d{2}-\d{2}$/;

function clampTarget(n: number): number {
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.min(99, Math.round(n)));
}

/** The brief must exist and belong to the manager's company. */
async function briefInCompany(
  companyId: string,
  briefId: string,
): Promise<boolean> {
  const service = createServiceClient();
  const { data } = await service
    .from("briefs")
    .select("id")
    .eq("company_id", companyId)
    .eq("id", briefId)
    .maybeSingle();
  return data !== null;
}

async function campaignInCompany(
  companyId: string,
  campaignId: string,
): Promise<boolean> {
  const service = createServiceClient();
  const { data } = await service
    .from("campaigns")
    .select("id")
    .eq("company_id", companyId)
    .eq("id", campaignId)
    .maybeSingle();
  return data !== null;
}

// ---------------------------------------------------------------------------
// Week setup: ported from mobile createWeek. One campaign per drop date,
// stamped rows from the type split, phrases from the search bank.

export type StartWeekResult =
  | { ok: true; campaignId: string }
  | { ok: false; error: string };

export async function startWeek(input: {
  dropDate: string;
  videoTarget: number;
  slideshowTarget: number;
}): Promise<StartWeekResult> {
  const gate = await requireManager();
  if (!gate.ok) return gate;
  const { userId, companyId } = gate;

  if (!ISO_DAY.test(input.dropDate)) {
    return { ok: false, error: "Pick a start day." };
  }
  const videoTarget = clampTarget(input.videoTarget);
  const slideshowTarget = clampTarget(input.slideshowTarget);
  if (videoTarget + slideshowTarget === 0) {
    return { ok: false, error: "Set at least one post." };
  }

  const service = createServiceClient();
  const postTypes = await listPostTypes(companyId);
  if (postTypes.length === 0) {
    return {
      ok: false,
      error: "Post types are missing for this company. Contact support.",
    };
  }
  const typeSplit: Record<string, number> = {
    ...splitFamily(
      postTypes.filter((t) => t.family === "video"),
      videoTarget,
    ),
    ...splitFamily(
      postTypes.filter((t) => t.family === "photo_carousel"),
      slideshowTarget,
    ),
  };

  /* A stamped campaign already on this Sunday is the week; reuse it. */
  const { data: existing, error: existingError } = await service
    .from("campaigns")
    .select("id")
    .eq("company_id", companyId)
    .eq("drop_date", input.dropDate)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (existingError) return { ok: false, error: existingError.message };
  if (existing) {
    const already = await stampedCampaignIds(companyId, [existing.id as string]);
    if (already.has(existing.id as string)) {
      return { ok: true, campaignId: existing.id as string };
    }
  }

  /* Drop empty leftover drafts so Start week never stacks two cards on the
     same Sunday. */
  const { data: draftCamps, error: draftError } = await service
    .from("campaigns")
    .select("id")
    .eq("company_id", companyId)
    .eq("status", "draft");
  if (draftError) return { ok: false, error: draftError.message };
  const draftIds = ((draftCamps ?? []) as { id: string }[]).map((d) => d.id);
  const stampedDrafts = await stampedCampaignIds(companyId, draftIds);
  for (const draftId of draftIds) {
    if (stampedDrafts.has(draftId)) continue;
    const { error: unlinkError } = await service
      .from("campaign_briefs")
      .delete()
      .eq("company_id", companyId)
      .eq("campaign_id", draftId);
    if (unlinkError) return { ok: false, error: unlinkError.message };
    const { error: deleteError } = await service
      .from("campaigns")
      .delete()
      .eq("company_id", companyId)
      .eq("id", draftId);
    if (deleteError) return { ok: false, error: deleteError.message };
  }

  /* Phrase pool: fresh phrases first, deduped against the last four weeks. */
  const since = new Date(
    new Date(`${input.dropDate}T00:00:00`).getTime() - 28 * 86400000,
  )
    .toISOString()
    .slice(0, 10);
  const [{ data: recent, error: recentError }, queries] = await Promise.all([
    service
      .from("campaigns")
      .select("id")
      .eq("company_id", companyId)
      .gte("drop_date", since),
    listSearchQueries(companyId),
  ]);
  if (recentError) return { ok: false, error: recentError.message };

  const usedPhrases = new Set<string>();
  const recentIds = ((recent ?? []) as { id: string }[]).map((c) => c.id);
  if (recentIds.length > 0) {
    const { data: links, error: linksError } = await service
      .from("campaign_briefs")
      .select("briefs(search_phrase)")
      .eq("company_id", companyId)
      .in("campaign_id", recentIds);
    if (linksError) return { ok: false, error: linksError.message };
    type LinkRow = {
      briefs:
        | { search_phrase: string | null }
        | { search_phrase: string | null }[]
        | null;
    };
    for (const link of (links ?? []) as LinkRow[]) {
      const brief = Array.isArray(link.briefs) ? link.briefs[0] : link.briefs;
      if (brief?.search_phrase) usedPhrases.add(brief.search_phrase);
    }
  }
  const fresh = queries.filter((q) => !usedPhrases.has(q.query));
  const stale = queries.filter((q) => usedPhrases.has(q.query));
  const pool = [...fresh, ...stale];
  const phraseFor = (slot: number): string | null =>
    pool.length > 0 ? pool[slot % pool.length].query : null;

  const dropLabel = new Date(`${input.dropDate}T00:00:00`);
  const monthNames = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];
  const name = `Week of ${monthNames[dropLabel.getMonth()]} ${dropLabel.getDate()}`;

  const { data: campaign, error: campaignError } = await service
    .from("campaigns")
    .insert({
      company_id: companyId,
      name,
      drop_date: input.dropDate,
      status: "draft",
      video_target: videoTarget,
      slideshow_target: slideshowTarget,
      type_split: typeSplit,
    })
    .select("id")
    .single();
  if (campaignError) return { ok: false, error: campaignError.message };
  const campaignId = (campaign as { id: string }).id;

  /* One pre-stamped brief per slot: videos first, then slideshows, types in
     sort order. The phrase doubles as the provisional title. */
  const orderedTypes = [
    ...postTypes.filter((t) => t.family === "video"),
    ...postTypes.filter((t) => t.family === "photo_carousel"),
  ];
  const slots: { postTypeId: string; format: string; title: string; phrase: string | null }[] = [];
  for (const postType of orderedTypes) {
    const count = typeSplit[postType.key] ?? 0;
    for (let i = 0; i < count; i += 1) {
      const phrase = phraseFor(slots.length);
      slots.push({
        postTypeId: postType.id,
        format: postType.family,
        title: phrase ?? postType.label,
        phrase,
      });
    }
  }

  const { data: briefs, error: briefsError } = await service
    .from("briefs")
    .insert(
      slots.map((slot) => ({
        company_id: companyId,
        created_by: userId,
        title: slot.title,
        format: slot.format,
        post_type_id: slot.postTypeId,
        search_phrase: slot.phrase,
      })),
    )
    .select("id");
  if (briefsError) return { ok: false, error: briefsError.message };

  const { error: linkError } = await service.from("campaign_briefs").insert(
    ((briefs ?? []) as { id: string }[]).map((brief, i) => ({
      campaign_id: campaignId,
      brief_id: brief.id,
      company_id: companyId,
      position: i,
    })),
  );
  if (linkError) return { ok: false, error: linkError.message };

  revalidatePath("/manager/briefs", "layout");
  return { ok: true, campaignId };
}

// ---------------------------------------------------------------------------
// Week grid mutations.

export type BriefActionResult = { ok: true } | { ok: false; error: string };

/** Draft-week target edits. Counts only; stamped rows and the split stay. */
export async function saveWeekTargets(
  campaignId: string,
  videoTarget: number,
  slideshowTarget: number,
): Promise<BriefActionResult> {
  const gate = await requireManager();
  if (!gate.ok) return gate;
  if (!(await campaignInCompany(gate.companyId, campaignId))) {
    return { ok: false, error: "Week not found." };
  }
  const service = createServiceClient();
  const { error } = await service
    .from("campaigns")
    .update({
      video_target: clampTarget(videoTarget),
      slideshow_target: clampTarget(slideshowTarget),
    })
    .eq("company_id", gate.companyId)
    .eq("id", campaignId);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/manager/briefs", "layout");
  return { ok: true };
}

export type PublishWeekResult =
  | ({ ok: true } & PublishResult)
  | { ok: false; error: string };

/** Publishes through the deployed publish-campaign function (shuffle + RPC). */
export async function publishWeek(
  campaignId: string,
): Promise<PublishWeekResult> {
  const gate = await requireManager();
  if (!gate.ok) return gate;
  if (!(await campaignInCompany(gate.companyId, campaignId))) {
    return { ok: false, error: "Week not found." };
  }
  const { data, error } = await callEdgeFunction<
    Partial<PublishResult> & { error?: string }
  >("publish-campaign", { campaign_id: campaignId });
  if (error !== null) return { ok: false, error };
  if (data.error) return { ok: false, error: data.error };
  revalidatePath("/manager/briefs", "layout");
  return {
    ok: true,
    creators: data.creators ?? 0,
    assignments_written: data.assignments_written ?? 0,
    notified: data.notified ?? 0,
    scheduled: data.scheduled === true,
    notify_at: data.notify_at ?? null,
  };
}

export async function removeBriefFromWeek(
  campaignId: string,
  briefId: string,
): Promise<BriefActionResult> {
  const gate = await requireManager();
  if (!gate.ok) return gate;
  const service = createServiceClient();
  const { error } = await service
    .from("campaign_briefs")
    .delete()
    .eq("company_id", gate.companyId)
    .eq("campaign_id", campaignId)
    .eq("brief_id", briefId);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/manager/briefs", "layout");
  return { ok: true };
}

/** Briefs are never deleted; the backlog is the moat. */
export async function archiveBrief(briefId: string): Promise<BriefActionResult> {
  const gate = await requireManager();
  if (!gate.ok) return gate;
  const service = createServiceClient();
  const { error } = await service
    .from("briefs")
    .update({ archived_at: new Date().toISOString() })
    .eq("company_id", gate.companyId)
    .eq("id", briefId);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/manager/briefs", "layout");
  return { ok: true };
}

// ---------------------------------------------------------------------------
// Calendar view lazy read: posts made from a published week.

export type WeekPostsResult =
  | { ok: true; posts: WeekPostItem[] }
  | { ok: false; error: string };

export async function getWeekPosts(
  campaignId: string,
): Promise<WeekPostsResult> {
  const gate = await requireManager();
  if (!gate.ok) return gate;
  if (!(await campaignInCompany(gate.companyId, campaignId))) {
    return { ok: false, error: "Week not found." };
  }
  const posts = await listWeekPosts(gate.companyId, campaignId);
  return { ok: true, posts };
}

// ---------------------------------------------------------------------------
// Brief editor: save plus segment derivation.

export type SaveBriefResult =
  | {
      ok: true;
      segments: BriefSegment[] | null;
      screenshotUrls: Record<string, string> | null;
    }
  | { ok: false; error: string };

/**
 * Writes the briefs row. When deriveSegments is set (points, hook, or type
 * changed, or no segments exist yet) it re-derives brief_segments through
 * the brief-assist function's sync RPC, which preserves overlay_text,
 * show_on_screen and screenshot_url on surviving rows.
 */
export async function saveBrief(
  briefId: string,
  input: BriefSaveInput,
  options: {
    deriveSegments: boolean;
    overlayLabels: (string | null)[] | null;
  },
): Promise<SaveBriefResult> {
  const gate = await requireManager();
  if (!gate.ok) return gate;
  if (!(await briefInCompany(gate.companyId, briefId))) {
    return { ok: false, error: "Post not found." };
  }
  const service = createServiceClient();
  const { error } = await service
    .from("briefs")
    .update({
      title: input.title,
      format: input.format,
      hook: input.hook,
      hook_options: input.hook_options,
      talking_points: input.talking_points,
      hashtags: input.hashtags,
      search_phrase: input.search_phrase,
      point_count: input.point_count,
      target_words: input.target_words,
      script: input.script,
      caption: input.caption,
      why_it_works: input.why_it_works,
      cta: input.cta,
      post_type_id: input.post_type_id,
      kill_reason: input.kill_reason,
      generation_id: input.generation_id,
      example_url: input.example_url,
      text_overlay: input.text_overlay,
    })
    .eq("company_id", gate.companyId)
    .eq("id", briefId);
  if (error) return { ok: false, error: error.message };

  let segments: BriefSegment[] | null = null;
  let screenshotUrls: Record<string, string> | null = null;
  if (options.deriveSegments && input.post_type_id !== null) {
    const { data, error: deriveError } = await callEdgeFunction<{
      error?: string;
      segments?: BriefSegment[];
    }>("brief-assist", {
      action: "derive_segments",
      brief_id: briefId,
      ...(options.overlayLabels ? { overlay_labels: options.overlayLabels } : {}),
    });
    if (deriveError !== null) return { ok: false, error: deriveError };
    if (data.error) return { ok: false, error: data.error };
    segments = data.segments ?? [];
    screenshotUrls = await segmentScreenshotUrls(segments);
  }

  revalidatePath("/manager/briefs", "layout");
  return { ok: true, segments, screenshotUrls };
}

// ---------------------------------------------------------------------------
// AI fill through the deployed ingest-brief function. A kill is a
// first-class outcome: the reason is persisted so the grid row renders it.

type RawDraftResponse = Partial<{
  title: string;
  format: string;
  hook_options: string[];
  talking_points: TalkingPoint[];
  hashtags: string[];
  search_phrase: string | null;
  point_count: number | null;
  target_words: number;
  script: string | null;
  caption: string;
  why_it_works: string;
  cta: string | null;
  post_type_id: string | null;
  overlay_labels: (string | null)[];
  generation_id: string | null;
  warnings: string[];
  example_url: string;
  example_transcript: string | null;
}> & { error?: string; kill_reason?: string };

export type FillBriefResult =
  | { ok: true; kind: "draft"; draft: BriefDraft }
  | { ok: true; kind: "kill"; killReason: string }
  | { ok: false; error: string };

export async function fillBrief(params: {
  briefId: string;
  query?: string;
  url?: string;
  context?: string;
  postTypeKey?: string;
}): Promise<FillBriefResult> {
  const gate = await requireManager();
  if (!gate.ok) return gate;
  if (!(await briefInCompany(gate.companyId, params.briefId))) {
    return { ok: false, error: "Post not found." };
  }

  const body: Record<string, string> = {};
  if (params.query?.trim()) body.query = params.query.trim();
  if (params.url?.trim()) body.url = params.url.trim();
  if (params.postTypeKey) body.post_type = params.postTypeKey;
  if (params.context?.trim()) body.context = params.context.trim();

  const { data, error } = await callEdgeFunction<RawDraftResponse>(
    "ingest-brief",
    body,
  );
  if (error !== null) return { ok: false, error };
  if (data.error) return { ok: false, error: data.error };

  if (data.kill_reason) {
    /* Persist immediately so the row shows the reason even if the manager
       backs out without saving. */
    const service = createServiceClient();
    await service
      .from("briefs")
      .update({ kill_reason: data.kill_reason })
      .eq("company_id", gate.companyId)
      .eq("id", params.briefId);
    revalidatePath("/manager/briefs", "layout");
    return { ok: true, kind: "kill", killReason: data.kill_reason };
  }

  if (!data.title) return { ok: false, error: "Draft came back incomplete." };

  /* A fill from a bank phrase counts as a use; a stamp alone never does. */
  if (params.query?.trim()) {
    await markSearchQueryUsedByText(gate.companyId, params.query);
  }

  const format: BriefFormat =
    data.format === "photo_carousel" ? "photo_carousel" : "video";
  return {
    ok: true,
    kind: "draft",
    draft: {
      title: data.title,
      format,
      hook_options: data.hook_options ?? [],
      talking_points: data.talking_points ?? [],
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
      example_url: data.example_url ?? params.url ?? "",
      example_transcript: data.example_transcript ?? null,
    },
  };
}

async function markSearchQueryUsedByText(
  companyId: string,
  query: string,
): Promise<void> {
  const q = query.trim();
  if (!q) return;
  const service = createServiceClient();
  const { data } = await service
    .from("search_queries")
    .select("id, used_count")
    .eq("company_id", companyId)
    .eq("query", q)
    .maybeSingle();
  const row = data as { id: string; used_count: number | null } | null;
  if (!row) return;
  await service
    .from("search_queries")
    .update({
      used_count: (row.used_count ?? 0) + 1,
      last_used_at: new Date().toISOString(),
    })
    .eq("id", row.id);
}

// ---------------------------------------------------------------------------
// brief-assist per-field regeneration. Nothing is saved here.

export type RegenerateResult =
  | { ok: true; result: RegenResult }
  | { ok: false; error: string };

export async function regenerateBriefField(params: {
  field: RegenField;
  draft: RegenDraftPayload;
  postTypeKey?: string;
  index?: number;
}): Promise<RegenerateResult> {
  const gate = await requireManager();
  if (!gate.ok) return gate;

  const { data, error } = await callEdgeFunction<
    Record<string, unknown> & { error?: string }
  >("brief-assist", {
    action: "regenerate_field",
    field: params.field,
    draft: params.draft,
    ...(params.postTypeKey ? { post_type: params.postTypeKey } : {}),
    ...(typeof params.index === "number" ? { index: params.index } : {}),
  });
  if (error !== null) return { ok: false, error };
  const raw = data;
  if (typeof raw.error === "string" && raw.error) {
    return { ok: false, error: raw.error };
  }
  if (typeof raw.kill_reason === "string") {
    return { ok: true, result: { kind: "kill", kill_reason: raw.kill_reason } };
  }
  const warnings = Array.isArray(raw.warnings)
    ? raw.warnings.filter((w): w is string => typeof w === "string")
    : [];
  switch (params.field) {
    case "search_phrase":
      return {
        ok: true,
        result: {
          kind: "search_phrase",
          search_phrase:
            typeof raw.search_phrase === "string" ? raw.search_phrase : null,
          warnings,
        },
      };
    case "talking_points":
      return {
        ok: true,
        result: {
          kind: "talking_points",
          talking_points: parseTalkingPoints(raw.talking_points as Json),
          cta: typeof raw.cta === "string" ? raw.cta : null,
          point_count:
            typeof raw.point_count === "number" ? raw.point_count : null,
          script: typeof raw.script === "string" ? raw.script : null,
          target_words:
            typeof raw.target_words === "number" ? raw.target_words : null,
          overlay_labels: Array.isArray(raw.overlay_labels)
            ? raw.overlay_labels.map((l) => (typeof l === "string" ? l : null))
            : [],
          hook_may_be_stale: raw.hook_may_be_stale === true,
          warnings,
        },
      };
    case "talking_point": {
      const point = parseTalkingPoints([raw.talking_point] as Json)[0];
      if (!point) return { ok: false, error: "Regeneration came back empty." };
      return {
        ok: true,
        result: {
          kind: "talking_point",
          talking_point: point,
          overlay_label:
            typeof raw.overlay_label === "string" ? raw.overlay_label : null,
          index: typeof raw.index === "number" ? raw.index : (params.index ?? 0),
          hook_may_be_stale: raw.hook_may_be_stale === true,
          warnings,
        },
      };
    }
    case "hook":
      return {
        ok: true,
        result: {
          kind: "hook",
          hook_options: parseHookOptions(raw.hook_options as Json),
          warnings,
        },
      };
    case "caption":
      return {
        ok: true,
        result: {
          kind: "caption",
          caption: typeof raw.caption === "string" ? raw.caption : "",
          hashtags: Array.isArray(raw.hashtags)
            ? raw.hashtags.filter((h): h is string => typeof h === "string")
            : [],
          warnings,
        },
      };
  }
}

// ---------------------------------------------------------------------------
// AI review (brief-review) and confirm.

export type RunReviewResult =
  | { ok: true; result: BriefReviewResult }
  | { ok: false; error: string };

export async function runBriefReview(params: {
  draft: RegenDraftPayload;
  postTypeKey?: string;
  hookIndex?: number;
}): Promise<RunReviewResult> {
  const gate = await requireManager();
  if (!gate.ok) return gate;
  const { data, error } = await callEdgeFunction<
    Partial<BriefReviewResult> & { error?: string }
  >("brief-review", {
    draft: params.draft,
    ...(params.postTypeKey ? { post_type: params.postTypeKey } : {}),
    ...(typeof params.hookIndex === "number"
      ? { hook_index: params.hookIndex }
      : {}),
  });
  if (error !== null) return { ok: false, error };
  if (data.error) return { ok: false, error: data.error };
  return {
    ok: true,
    result: {
      checks: data.checks ?? [],
      scores: data.scores ?? { overall: 0, hook: 0, talking_points: 0, cta: 0 },
      tier3: data.tier3 ?? { spoken: true, worst_line: null },
    },
  };
}

/**
 * Confirm flips the post to complete: reviewed_at plus the review snapshot,
 * the override and edit log rows, and banned phrases from rewritten
 * generated lines. Events and phrases are computed client side like mobile.
 */
export async function confirmBriefReview(params: {
  briefId: string;
  result: BriefReviewResult;
  events: ReviewEventInput[];
  bannedPhrases: string[];
}): Promise<BriefActionResult> {
  const gate = await requireManager();
  if (!gate.ok) return gate;
  if (!(await briefInCompany(gate.companyId, params.briefId))) {
    return { ok: false, error: "Post not found." };
  }
  const service = createServiceClient();
  const { error } = await service
    .from("briefs")
    .update({
      reviewed_at: new Date().toISOString(),
      review_result: params.result as unknown as Json,
    })
    .eq("company_id", gate.companyId)
    .eq("id", params.briefId);
  if (error) return { ok: false, error: error.message };

  if (params.events.length > 0) {
    await service.from("brief_review_events").insert(
      params.events.map((e) => ({
        brief_id: params.briefId,
        company_id: gate.companyId,
        author_id: gate.userId,
        event: e.event,
        check_id: e.check_id ?? null,
        tier: e.tier ?? null,
        diff: (e.diff ?? null) as Json,
      })),
    );
  }

  /* Rewritten generated lines feed the tenant ban list. */
  const cleaned = params.bannedPhrases.map((p) => p.trim()).filter(Boolean);
  if (cleaned.length > 0) {
    const { data: brand } = await service
      .from("brand_profiles")
      .select("id, banned_phrases")
      .eq("company_id", gate.companyId)
      .maybeSingle();
    const row = brand as { id: string; banned_phrases: string[] | null } | null;
    if (row) {
      const existing = row.banned_phrases ?? [];
      const merged = [
        ...existing,
        ...cleaned.filter((p) => !existing.includes(p)),
      ];
      if (merged.length !== existing.length) {
        await service
          .from("brand_profiles")
          .update({ banned_phrases: merged })
          .eq("id", row.id);
      }
    }
  }

  revalidatePath("/manager/briefs", "layout");
  return { ok: true };
}

// ---------------------------------------------------------------------------
// brief_segments: render-field writes are direct row updates, never the
// derive RPC, which preserves them across re-derives.

export type SegmentPatch = {
  overlay_text?: string | null;
  show_on_screen?: boolean;
  layout?: "standard" | "green_screen";
};

async function segmentInCompany(
  companyId: string,
  segmentId: string,
): Promise<{ id: string; brief_id: string } | null> {
  const service = createServiceClient();
  const { data } = await service
    .from("brief_segments")
    .select("id, brief_id")
    .eq("company_id", companyId)
    .eq("id", segmentId)
    .maybeSingle();
  return (data as { id: string; brief_id: string } | null) ?? null;
}

export async function updateSegment(
  segmentId: string,
  patch: SegmentPatch,
): Promise<BriefActionResult> {
  const gate = await requireManager();
  if (!gate.ok) return gate;
  const segment = await segmentInCompany(gate.companyId, segmentId);
  if (!segment) return { ok: false, error: "Clip not found." };

  const clean: SegmentPatch = {};
  if ("overlay_text" in patch) clean.overlay_text = patch.overlay_text ?? null;
  if (typeof patch.show_on_screen === "boolean") {
    clean.show_on_screen = patch.show_on_screen;
  }
  if (patch.layout === "standard" || patch.layout === "green_screen") {
    clean.layout = patch.layout;
  }
  if (Object.keys(clean).length === 0) {
    return { ok: false, error: "Nothing to change." };
  }

  const service = createServiceClient();
  const { error } = await service
    .from("brief_segments")
    .update(clean)
    .eq("company_id", gate.companyId)
    .eq("id", segmentId);
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export type UploadScreenshotResult =
  | { ok: true; path: string; signedUrl: string }
  | { ok: false; error: string };

/** Uploads to the private brief-assets bucket against the clip's segment. */
export async function uploadSegmentScreenshot(
  formData: FormData,
): Promise<UploadScreenshotResult> {
  const gate = await requireManager();
  if (!gate.ok) return gate;
  const segmentId = formData.get("segmentId");
  const file = formData.get("file");
  if (typeof segmentId !== "string" || !(file instanceof File)) {
    return { ok: false, error: "Pick an image first." };
  }
  const segment = await segmentInCompany(gate.companyId, segmentId);
  if (!segment) return { ok: false, error: "Clip not found." };

  const service = createServiceClient();
  const path = `${gate.companyId}/${segment.brief_id}/${segment.id}.jpg`;
  const bytes = await file.arrayBuffer();
  const { error: uploadError } = await service.storage
    .from("brief-assets")
    .upload(path, bytes, {
      contentType: file.type || "image/jpeg",
      upsert: true,
    });
  if (uploadError) return { ok: false, error: uploadError.message };

  const { error } = await service
    .from("brief_segments")
    .update({ screenshot_url: path })
    .eq("company_id", gate.companyId)
    .eq("id", segmentId);
  if (error) return { ok: false, error: error.message };

  const { data: signed } = await service.storage
    .from("brief-assets")
    .createSignedUrl(path, 3600);
  return {
    ok: true,
    path,
    signedUrl: signed?.signedUrl ?? "",
  };
}

export async function removeSegmentScreenshot(
  segmentId: string,
): Promise<BriefActionResult> {
  const gate = await requireManager();
  if (!gate.ok) return gate;
  const segment = await segmentInCompany(gate.companyId, segmentId);
  if (!segment) return { ok: false, error: "Clip not found." };
  const service = createServiceClient();
  const { error } = await service
    .from("brief_segments")
    .update({ screenshot_url: null })
    .eq("company_id", gate.companyId)
    .eq("id", segmentId);
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}
