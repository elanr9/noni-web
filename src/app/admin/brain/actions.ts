"use server";

import { revalidatePath } from "next/cache";

import { rewriteBrainDoc, transcribeBrainAudio } from "@/lib/admin/brain-cleanup";
import {
  currentWeekStart,
  pickWeekTemplates,
  rankProductFeatures,
  type FeatureDraft,
  type RankedFeature,
} from "@/lib/admin/feature-analyze";
import {
  analyzeInspirationPosts,
  fetchTopInspirationPosts,
  inspirationDigest,
  type FetchedPost,
} from "@/lib/admin/inspiration-fetch";
import { MOCK_DATASET } from "@/lib/admin/mock-data";
import type { InspirationPost, Platform, ProductFeature } from "@/lib/admin/types";
import { getSessionProfile, isCompanyAdmin, isPlatformAdmin } from "@/lib/auth";
import { createServiceClient } from "@/lib/supabase/service";

export type BrainActionResult = { ok: true } | { ok: false; error: string };

/* Table kinds, mirroring the read mapping in src/lib/admin/data.ts. */
const DB_KIND: Record<"product" | "audience", string> = {
  product: "product_truth",
  audience: "audience_niche",
};

/* Mock mode (dev + ADMIN_QA_MOCK=1): reads come from MOCK_DATASET, so
   mutations write it in place too, same pattern as @/lib/admin/billing. */
function mockMode(): boolean {
  return (
    process.env.NODE_ENV === "development" && process.env.ADMIN_QA_MOCK === "1"
  );
}

const MONTH_SHORT = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

function todayShort(): string {
  const d = new Date();
  return `${MONTH_SHORT[d.getMonth()]} ${d.getDate()}`;
}

type Gate =
  | { ok: true; companyId: string; mock: boolean }
  | { ok: false; error: string };

async function requireCompanyAdmin(): Promise<Gate> {
  if (mockMode()) {
    return { ok: true, companyId: MOCK_DATASET.company.id, mock: true };
  }
  const { profile } = await getSessionProfile();
  if (!isCompanyAdmin(profile) && !isPlatformAdmin(profile)) {
    return { ok: false, error: "Company admins only." };
  }
  if (!profile?.company_id) {
    return { ok: false, error: "No company on this account." };
  }
  return { ok: true, companyId: profile.company_id, mock: false };
}

export async function saveBrainDoc(input: {
  kind: "product" | "audience";
  body: string;
}): Promise<BrainActionResult> {
  const gate = await requireCompanyAdmin();
  if (!gate.ok) return { ok: false, error: gate.error };

  if (gate.mock) {
    const doc = MOCK_DATASET.brainDocs.find((d) => d.kind === input.kind);
    if (doc) {
      doc.body = input.body.trim();
      doc.updated = doc.body ? todayShort() : "";
    }
    revalidatePath("/admin", "layout");
    return { ok: true };
  }

  const supabase = createServiceClient();
  const dbKind = DB_KIND[input.kind];
  const content = input.body.trim();
  const now = new Date().toISOString();

  /* brand_docs has no guaranteed unique constraint on (company_id, kind),
     so update the existing row when there is one instead of upserting. */
  const { data, error: readError } = await supabase
    .from("brand_docs")
    .select("id")
    .eq("company_id", gate.companyId)
    .eq("kind", dbKind)
    .maybeSingle();
  if (readError) return { ok: false, error: readError.message };
  const existing = (data ?? null) as { id: string } | null;

  const { error } = existing
    ? await supabase
        .from("brand_docs")
        .update({ content, human_edited: true, updated_at: now })
        .eq("id", existing.id)
    : await supabase.from("brand_docs").insert({
        company_id: gate.companyId,
        kind: dbKind,
        content,
        human_edited: true,
        updated_at: now,
      });
  if (error) return { ok: false, error: error.message };

  /* The brain setup step, nav badge and to-do all derive from these docs. */
  revalidatePath("/admin", "layout");
  return { ok: true };
}

export async function cleanUpBrainDoc(input: {
  kind: "product" | "audience";
  text: string;
}): Promise<{ ok: true; text: string } | { ok: false; error: string }> {
  const gate = await requireCompanyAdmin();
  if (!gate.ok) return { ok: false, error: gate.error };

  const raw = input.text.trim();
  if (!raw) return { ok: false, error: "Nothing to clean up." };

  return rewriteBrainDoc(input.kind, raw);
}

export async function speakBrainDoc(input: {
  kind: "product" | "audience";
  existing: string;
  audio: File;
}): Promise<{ ok: true; text: string } | { ok: false; error: string }> {
  const gate = await requireCompanyAdmin();
  if (!gate.ok) return { ok: false, error: gate.error };

  if (!input.audio || input.audio.size < 200) {
    return { ok: false, error: "Didn't catch that. Try speaking again." };
  }

  const transcript = await transcribeBrainAudio(input.audio);
  if (!transcript.ok) return transcript;

  const draft = [input.existing.trim(), transcript.text]
    .filter(Boolean)
    .join("\n\n");
  const rewritten = await rewriteBrainDoc(input.kind, draft);
  return rewritten.ok ? rewritten : { ok: true, text: draft };
}

const IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

function extFor(type: string): string {
  if (type === "image/png") return "png";
  if (type === "image/webp") return "webp";
  if (type === "image/gif") return "gif";
  return "jpg";
}

async function fileToBase64(file: File): Promise<{ mime: string; imageBase64: string }> {
  const mime = file.type || "image/jpeg";
  const imageBase64 = Buffer.from(await file.arrayBuffer()).toString("base64");
  return { mime, imageBase64 };
}

function dataUrlParts(url: string): { mime: string; imageBase64: string } | null {
  const match = url.match(/^data:([^;]+);base64,(.+)$/);
  if (!match) return null;
  return { mime: match[1], imageBase64: match[2] };
}

async function loadBrainCopy(
  companyId: string,
  mock: boolean,
): Promise<{ product: string; audience: string }> {
  if (mock) {
    return {
      product: MOCK_DATASET.brainDocs.find((d) => d.kind === "product")?.body ?? "",
      audience: MOCK_DATASET.brainDocs.find((d) => d.kind === "audience")?.body ?? "",
    };
  }
  const supabase = createServiceClient();
  const { data } = await supabase
    .from("brand_docs")
    .select("kind, content")
    .eq("company_id", companyId);
  const rows = (data ?? []) as Array<{ kind: string | null; content: string | null }>;
  return {
    product: rows.find((r) => r.kind === "product_truth")?.content ?? "",
    audience: rows.find((r) => r.kind === "audience_niche")?.content ?? "",
  };
}

function stampMockTemplates(ranked: RankedFeature[]) {
  const picked = pickWeekTemplates(ranked);
  MOCK_DATASET.briefTemplates.splice(
    0,
    MOCK_DATASET.briefTemplates.length,
    ...picked.map((row, i) => ({
      id: `bt-${row.id}-${i}`,
      featureId: row.id,
      title: row.title || row.name,
      format: row.format,
      typeLabel: row.typeLabel,
      example: row.example,
      description: row.description,
      action: row.action,
      phrase: row.phrase,
    })),
  );
}

async function stampDbTemplates(
  companyId: string,
  ranked: RankedFeature[],
): Promise<string | null> {
  const supabase = createServiceClient();
  const weekStart = currentWeekStart();
  const picked = pickWeekTemplates(ranked);
  const { error: delError } = await supabase
    .from("brief_templates")
    .delete()
    .eq("company_id", companyId)
    .eq("week_start", weekStart);
  if (delError) return delError.message;
  if (picked.length === 0) return null;
  const { error } = await supabase.from("brief_templates").insert(
    picked.map((row, i) => ({
      company_id: companyId,
      feature_id: row.id,
      week_start: weekStart,
      title: row.title || row.name,
      format: row.format,
      type_label: row.typeLabel,
      example: row.example,
      description: row.description,
      action: row.action,
      phrase: row.phrase,
      sort_order: i,
    })),
  );
  return error?.message ?? null;
}

function applyRankedToMock(ranked: RankedFeature[]) {
  for (const [i, row] of ranked.entries()) {
    const feature = MOCK_DATASET.features.find((f) => f.id === row.id);
    if (!feature) continue;
    feature.name = row.name;
    feature.score = row.score;
    feature.reason = row.reason;
    feature.rank = i + 1;
  }
  MOCK_DATASET.features.sort((a, b) => (a.rank ?? 99) - (b.rank ?? 99));
  stampMockTemplates(ranked);
}

async function applyRankedToDb(
  companyId: string,
  ranked: RankedFeature[],
): Promise<string | null> {
  const supabase = createServiceClient();
  for (const [i, row] of ranked.entries()) {
    const { error } = await supabase
      .from("product_features")
      .update({
        name: row.name,
        score: row.score,
        reason: row.reason,
        rank: i + 1,
        updated_at: new Date().toISOString(),
      })
      .eq("id", row.id)
      .eq("company_id", companyId);
    if (error) return error.message;
  }
  return stampDbTemplates(companyId, ranked);
}

async function draftsFromMock(): Promise<FeatureDraft[]> {
  const drafts: FeatureDraft[] = [];
  for (const feature of MOCK_DATASET.features) {
    const parts = dataUrlParts(feature.screenshotUrl);
    if (!parts) continue;
    drafts.push({ id: feature.id, sentence: feature.sentence, ...parts });
  }
  return drafts;
}

async function draftsFromDb(companyId: string): Promise<FeatureDraft[]> {
  const supabase = createServiceClient();
  const { data } = await supabase
    .from("product_features")
    .select("id, sentence, screenshot_path")
    .eq("company_id", companyId);
  const rows = (data ?? []) as Array<{
    id: string;
    sentence: string;
    screenshot_path: string;
  }>;
  const drafts: FeatureDraft[] = [];
  for (const row of rows) {
    const { data: file, error } = await supabase.storage
      .from("product-features")
      .download(row.screenshot_path);
    if (error || !file) continue;
    const mime = file.type || "image/jpeg";
    const imageBase64 = Buffer.from(await file.arrayBuffer()).toString("base64");
    drafts.push({ id: row.id, sentence: row.sentence, mime, imageBase64 });
  }
  return drafts;
}

async function loadInspirationDigest(
  companyId: string,
  mock: boolean,
): Promise<string> {
  if (mock) {
    return inspirationDigest(
      MOCK_DATASET.inspirationAccounts
        .filter((a) => !a.muted)
        .flatMap((a) =>
          (a.posts ?? []).map((p) => ({
            handle: a.handle,
            views: p.views,
            hook: p.hook,
            why: p.why,
            caption: p.caption,
          })),
        ),
    );
  }
  const supabase = createServiceClient();
  const [{ data: accountRows }, { data: postRows }] = await Promise.all([
    supabase
      .from("source_accounts")
      .select("handle, platform, muted")
      .eq("company_id", companyId),
    supabase
      .from("source_posts")
      .select("handle, views, hook, why, caption, platform")
      .eq("company_id", companyId)
      .order("score", { ascending: false })
      .limit(40),
  ]);
  const unmuted = new Set(
    ((accountRows ?? []) as Array<{ handle: string; platform: string; muted: boolean }>)
      .filter((a) => !a.muted)
      .map(
        (a) =>
          `${a.platform}:${a.handle.replace(/^@+/, "").toLowerCase()}`,
      ),
  );
  const rows = ((postRows ?? []) as Array<{
    handle: string;
    views: number;
    hook: string;
    why: string;
    caption: string;
    platform: string;
  }>).filter((p) =>
    unmuted.has(`${p.platform}:${p.handle.replace(/^@+/, "").toLowerCase()}`),
  );
  return inspirationDigest(rows);
}

async function rankAllFeatures(
  companyId: string,
  mock: boolean,
): Promise<string | null> {
  const { product, audience } = await loadBrainCopy(companyId, mock);
  const drafts = mock ? await draftsFromMock() : await draftsFromDb(companyId);
  if (drafts.length === 0) return null;
  const inspiration = await loadInspirationDigest(companyId, mock);
  const result = await rankProductFeatures(product, audience, drafts, inspiration);
  if (!result.ok) return result.error;
  if (mock) {
    applyRankedToMock(result.ranked);
    return null;
  }
  return applyRankedToDb(companyId, result.ranked);
}

export async function addProductFeature(input: {
  sentence: string;
  image: File;
}): Promise<BrainActionResult> {
  const gate = await requireCompanyAdmin();
  if (!gate.ok) return { ok: false, error: gate.error };

  const sentence = input.sentence.trim();
  if (!sentence) return { ok: false, error: "Add one sentence about this feature." };
  if (!input.image || input.image.size < 50) {
    return { ok: false, error: "Upload a screenshot of the feature." };
  }
  if (input.image.size > 8 * 1024 * 1024) {
    return { ok: false, error: "Keep screenshots under 8 MB." };
  }
  const type = input.image.type || "image/jpeg";
  if (!IMAGE_TYPES.has(type)) {
    return { ok: false, error: "Use a JPG, PNG, WEBP, or GIF screenshot." };
  }

  const id = crypto.randomUUID();

  if (gate.mock) {
    const { mime, imageBase64 } = await fileToBase64(input.image);
    const feature: ProductFeature = {
      id,
      name: "",
      sentence,
      screenshotUrl: `data:${mime};base64,${imageBase64}`,
      score: null,
      reason: "",
      rank: null,
    };
    MOCK_DATASET.features.push(feature);
    const rankError = await rankAllFeatures(gate.companyId, true);
    revalidatePath("/admin", "layout");
    if (rankError) return { ok: false, error: rankError };
    return { ok: true };
  }

  const path = `${gate.companyId}/${id}.${extFor(type)}`;
  const supabase = createServiceClient();
  const bytes = Buffer.from(await input.image.arrayBuffer());
  const { error: uploadError } = await supabase.storage
    .from("product-features")
    .upload(path, bytes, { contentType: type, upsert: false });
  if (uploadError) return { ok: false, error: uploadError.message };

  const { error: insertError } = await supabase.from("product_features").insert({
    id,
    company_id: gate.companyId,
    sentence,
    screenshot_path: path,
  });
  if (insertError) return { ok: false, error: insertError.message };

  const rankError = await rankAllFeatures(gate.companyId, false);
  revalidatePath("/admin", "layout");
  if (rankError) return { ok: false, error: rankError };
  return { ok: true };
}

export async function removeProductFeature(input: {
  id: string;
}): Promise<BrainActionResult> {
  const gate = await requireCompanyAdmin();
  if (!gate.ok) return { ok: false, error: gate.error };

  if (gate.mock) {
    const kept = MOCK_DATASET.features.filter((f) => f.id !== input.id);
    MOCK_DATASET.features.splice(0, MOCK_DATASET.features.length, ...kept);
    const rankError = await rankAllFeatures(gate.companyId, true);
    revalidatePath("/admin", "layout");
    if (rankError) return { ok: false, error: rankError };
    return { ok: true };
  }

  const supabase = createServiceClient();
  const { data } = await supabase
    .from("product_features")
    .select("screenshot_path")
    .eq("id", input.id)
    .eq("company_id", gate.companyId)
    .maybeSingle();
  const path = (data as { screenshot_path?: string } | null)?.screenshot_path;
  const { error } = await supabase
    .from("product_features")
    .delete()
    .eq("id", input.id)
    .eq("company_id", gate.companyId);
  if (error) return { ok: false, error: error.message };
  if (path) await supabase.storage.from("product-features").remove([path]);
  const rankError = await rankAllFeatures(gate.companyId, false);
  revalidatePath("/admin", "layout");
  if (rankError) return { ok: false, error: rankError };
  return { ok: true };
}

export async function rankBrainFeatures(): Promise<BrainActionResult> {
  const gate = await requireCompanyAdmin();
  if (!gate.ok) return { ok: false, error: gate.error };
  const rankError = await rankAllFeatures(gate.companyId, gate.mock);
  revalidatePath("/admin", "layout");
  if (rankError) return { ok: false, error: rankError };
  return { ok: true };
}

/* Handles are stored bare in some rows and @-prefixed in others; the read
   layer normalizes to @handle, so mutations match both spellings. */
function handleVariants(handle: string): string[] {
  const bare = handle.trim().replace(/^@+/, "");
  return [bare, "@" + bare];
}

function toInspirationPost(post: FetchedPost, id: string): InspirationPost {
  return {
    id,
    url: post.url,
    caption: post.caption,
    thumbnailUrl: post.thumbnailUrl,
    views: post.views,
    likes: post.likes,
    shares: post.shares,
    hook: post.hook,
    why: post.why,
  };
}

function mockTopPosts(handle: string, platform: Platform): InspirationPost[] {
  const base = platform === "instagram" ? 42000 : 88000;
  return Array.from({ length: 5 }, (_, i) => ({
    id: `mock-${platform}-${handle}-${i}`,
    url:
      platform === "instagram"
        ? `https://www.instagram.com/p/mock${i}/`
        : `https://www.tiktok.com/@${handle}/video/mock${i}`,
    caption: `Top post ${i + 1} from @${handle}`,
    thumbnailUrl: "",
    views: Math.round(base / (i + 1)),
    likes: Math.round((base / (i + 1)) * 0.08),
    shares: Math.round((base / (i + 1)) * 0.01),
    hook: "",
    why: "",
  }));
}

async function pullAndStorePosts(input: {
  companyId: string;
  mock: boolean;
  platform: Platform;
  handle: string;
}): Promise<BrainActionResult> {
  const { product, audience } = await loadBrainCopy(input.companyId, input.mock);
  const fetched = await fetchTopInspirationPosts(input.platform, input.handle);
  const posts = fetched.ok
    ? await analyzeInspirationPosts(product, audience, fetched.posts)
    : [];
  if (!fetched.ok && !input.mock) return fetched;

  if (input.mock) {
    const account = MOCK_DATASET.inspirationAccounts.find(
      (a) =>
        a.platform === input.platform &&
        a.handle.replace(/^@+/, "").toLowerCase() === input.handle.toLowerCase(),
    );
    if (account) {
      account.posts = posts.length
        ? posts.map((p, i) => toInspirationPost(p, `mock-${input.handle}-${i}`))
        : mockTopPosts(input.handle, input.platform);
    }
    return { ok: true };
  }

  if (posts.length === 0) return fetched.ok ? { ok: true } : fetched;

  const supabase = createServiceClient();
  const { error } = await supabase.from("source_posts").upsert(
    posts.map((p) => ({
      company_id: input.companyId,
      platform: input.platform,
      handle: input.handle,
      external_id: p.externalId,
      url: p.url,
      caption: p.caption,
      thumbnail_url: p.thumbnailUrl,
      views: p.views,
      likes: p.likes,
      shares: p.shares,
      comments: p.comments,
      score: p.score,
      hook: p.hook,
      why: p.why,
      format: p.format,
      fetched_at: new Date().toISOString(),
    })),
    { onConflict: "company_id,platform,external_id" },
  );
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function addInspirationAccount(input: {
  platform: Platform;
  handle: string;
}): Promise<BrainActionResult> {
  const gate = await requireCompanyAdmin();
  if (!gate.ok) return { ok: false, error: gate.error };

  const bare = input.handle.trim().replace(/^@+/, "");
  if (!bare) return { ok: false, error: "Handle is required." };

  if (gate.mock) {
    MOCK_DATASET.inspirationAccounts.push({
      platform: input.platform,
      handle: "@" + bare,
      muted: false,
      posts: [],
    });
    const pulled = await pullAndStorePosts({
      companyId: gate.companyId,
      mock: true,
      platform: input.platform,
      handle: bare,
    });
    revalidatePath("/admin/brain");
    return pulled;
  }

  const supabase = createServiceClient();
  const { error } = await supabase.from("source_accounts").insert({
    company_id: gate.companyId,
    platform: input.platform,
    handle: bare,
    kind: "reference",
    muted: false,
  });
  if (error) return { ok: false, error: error.message };

  const pulled = await pullAndStorePosts({
    companyId: gate.companyId,
    mock: false,
    platform: input.platform,
    handle: bare,
  });
  revalidatePath("/admin", "layout");
  return pulled;
}

export async function setInspirationAccountMuted(input: {
  platform: Platform;
  handle: string;
  muted: boolean;
}): Promise<BrainActionResult> {
  const gate = await requireCompanyAdmin();
  if (!gate.ok) return { ok: false, error: gate.error };

  if (gate.mock) {
    const wanted = new Set(handleVariants(input.handle));
    const account = MOCK_DATASET.inspirationAccounts.find(
      (a) => a.platform === input.platform && wanted.has(a.handle),
    );
    if (account) account.muted = input.muted;
    revalidatePath("/admin/brain");
    return { ok: true };
  }

  const supabase = createServiceClient();
  const { error } = await supabase
    .from("source_accounts")
    .update({ muted: input.muted })
    .eq("company_id", gate.companyId)
    .eq("platform", input.platform)
    .in("handle", handleVariants(input.handle));
  if (error) return { ok: false, error: error.message };

  revalidatePath("/admin/brain");
  return { ok: true };
}

export async function removeInspirationAccount(input: {
  platform: Platform;
  handle: string;
}): Promise<BrainActionResult> {
  const gate = await requireCompanyAdmin();
  if (!gate.ok) return { ok: false, error: gate.error };

  if (gate.mock) {
    const wanted = new Set(handleVariants(input.handle));
    const kept = MOCK_DATASET.inspirationAccounts.filter(
      (a) => a.platform !== input.platform || !wanted.has(a.handle),
    );
    MOCK_DATASET.inspirationAccounts.splice(
      0,
      MOCK_DATASET.inspirationAccounts.length,
      ...kept,
    );
    revalidatePath("/admin/brain");
    return { ok: true };
  }

  const supabase = createServiceClient();
  const { error } = await supabase
    .from("source_accounts")
    .delete()
    .eq("company_id", gate.companyId)
    .eq("platform", input.platform)
    .in("handle", handleVariants(input.handle));
  if (error) return { ok: false, error: error.message };

  await supabase
    .from("source_posts")
    .delete()
    .eq("company_id", gate.companyId)
    .eq("platform", input.platform)
    .in("handle", handleVariants(input.handle).map((h) => h.replace(/^@+/, "")));

  revalidatePath("/admin/brain");
  return { ok: true };
}
