"use server";

import { revalidatePath } from "next/cache";

import { canManageCampaigns, getSessionProfile, isPlatformAdmin } from "@/lib/auth";
import { callEdgeFunction } from "@/lib/edge";
import {
  outlineTwinId,
  type Brief,
  type BriefType,
  type FillResponse,
  type PlannedPost,
  type SaveBriefInput,
} from "@/lib/manager/brief-library";
import { createClient } from "@/lib/supabase/server";
import { loadBriefLibrary } from "@/lib/manager/brief-library-server";

/* Briefs tab: the company's library of templates and outlines (table
   library_briefs). Reads and writes run as the signed-in manager, so the
   table's own company rules apply. */

type Result<T> = { ok: true; data: T } | { ok: false; error: string };

async function gate(): Promise<{ ok: true; companyId: string; userId: string } | { ok: false; error: string }> {
  const { userId, profile } = await getSessionProfile();
  const companyId = profile?.active_company_id;
  if (!userId || !companyId || !(canManageCampaigns(profile) || isPlatformAdmin(profile))) {
    return { ok: false, error: "Managers only." };
  }
  return { ok: true, companyId, userId };
}

export async function refreshBriefs(): Promise<Result<Brief[]>> {
  const g = await gate();
  if (!g.ok) return g;
  return { ok: true, data: await loadBriefLibrary(g.companyId) };
}

function toRow(b: SaveBriefInput, companyId: string, userId: string, ts: string, from: string | null) {
  return {
    id: b.id,
    company_id: companyId,
    kind: b.kind,
    type: b.type,
    title: b.title,
    notes: b.notes,
    link: b.link || null,
    created_by: userId,
    from_id: from,
    audio: b.audio,
    clips: b.clips,
    g: b.g,
    lt: b.lt,
    caption: b.caption || null,
    tags: b.tags,
    updated_at: ts,
  };
}

/** Saves briefs (a Guided one with its Outline twin, like the app) and returns the fresh library. */
export async function saveBriefs(inputs: SaveBriefInput[]): Promise<Result<Brief[]>> {
  const g = await gate();
  if (!g.ok) return g;
  const bad = inputs.find((b) => !b.title.trim());
  if (bad) return { ok: false, error: "Add a title." };
  const now = Date.now();
  const rows = inputs.flatMap((b) => {
    const main = toRow(b, g.companyId, g.userId, new Date(now).toISOString(), null);
    if (b.kind !== "Guided" || b.noTwin) return [main];
    const twin = toRow(
      { ...b, id: outlineTwinId(b.id), kind: "Outline", g: null, lt: null, clips: null, audio: null, caption: "", tags: [] },
      g.companyId,
      g.userId,
      new Date(now - 1).toISOString(),
      b.id,
    );
    return [main, twin];
  });
  const supabase = await createClient();
  const { error } = await supabase.from("library_briefs").upsert(rows as never);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/manager/briefs");
  return { ok: true, data: await loadBriefLibrary(g.companyId) };
}

/** Deletes a brief and, for a Guided one, its Outline twin. */
export async function deleteBrief(id: string): Promise<Result<Brief[]>> {
  const g = await gate();
  if (!g.ok) return g;
  const supabase = await createClient();
  const { error } = await supabase.from("library_briefs").delete().eq("company_id", g.companyId).or(`id.eq.${id},from_id.eq.${id}`);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/manager/briefs");
  return { ok: true, data: await loadBriefLibrary(g.companyId) };
}

/** Fill in with AI (brief-fill): a guided plan, an outline or a long text story. */
export async function fillWithAi(body: {
  mode: "guided" | "outline" | "long_text";
  type: BriefType;
  title: string;
  link?: string;
  notes?: string;
}): Promise<Result<FillResponse>> {
  const g = await gate();
  if (!g.ok) return g;
  const r = await callEdgeFunction<FillResponse>("brief-fill", body);
  if (r.error !== null) return { ok: false, error: r.error };
  if (r.data?.error) return { ok: false, error: r.data.error };
  if (r.data?.kill_reason) return { ok: false, error: r.data.kill_reason };
  return { ok: true, data: r.data ?? {} };
}

/** Upload brief, step 1: read the files (already in the brief-imports bucket), links and text, list the posts. */
export async function planImport(input: {
  files: { path: string; name: string; mime: string }[];
  links: string[];
  text: string;
  count: number;
}): Promise<Result<{ importId: string; summary: string; posts: PlannedPost[] }>> {
  const g = await gate();
  if (!g.ok) return g;
  if (input.files.some((f) => !f.path.startsWith(`${g.companyId}/`))) return { ok: false, error: "Wrong company." };
  const r = await callEdgeFunction<{ import_id?: string; summary?: string; posts?: PlannedPost[]; error?: string }>("brief-import", {
    action: "plan",
    files: input.files,
    links: input.links,
    text: input.text,
    notes: "",
    count: input.count,
  });
  if (r.error !== null) return { ok: false, error: r.error };
  if (r.data?.error) return { ok: false, error: r.data.error };
  if (!r.data?.import_id || !r.data.posts?.length) return { ok: false, error: "No posts came back from that brief. Try a different file." };
  return { ok: true, data: { importId: r.data.import_id, summary: r.data.summary ?? "", posts: r.data.posts } };
}

/** Upload brief, step 2: write one listed post. */
export async function writeImportPost(importId: string, index: number): Promise<Result<FillResponse>> {
  const g = await gate();
  if (!g.ok) return g;
  const r = await callEdgeFunction<FillResponse>("brief-import", { action: "write", import_id: importId, index });
  if (r.error !== null) return { ok: false, error: r.error };
  if (r.data?.error) return { ok: false, error: r.data.error };
  if (!r.data?.clips?.length) return { ok: false, error: "That post came back empty." };
  return { ok: true, data: r.data };
}
