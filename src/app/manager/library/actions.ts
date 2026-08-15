"use server";

/* Library mutations, following src/app/admin/team/actions.ts: every action
   re-checks the session and role and scopes writes to the session
   profile's company, never a client-passed id. Semantics mirror the
   mobile app's captureQuick (noni/lib/library-api.ts): a single pasted
   http(s) URL becomes a reference (thumbnail and title resolved through
   the library-link edge function, best effort), anything else becomes one
   idea row per non-empty line so a bulk paste is one save. */

import { revalidatePath } from "next/cache";

import { getSessionProfile, isCampaignManager } from "@/lib/auth";
import { callEdgeFunction } from "@/lib/edge";
import { createServiceClient } from "@/lib/supabase/service";

export type CaptureResult =
  | { ok: true; ideas: number; reference: boolean }
  | { ok: false; error: string };

/** A single-line paste that is one http(s) URL routes to a reference. */
function isCaptureUrl(raw: string): boolean {
  const line = raw.trim();
  return /^https?:\/\/\S+$/i.test(line) && !line.includes("\n");
}

export async function captureLibraryItem(raw: string): Promise<CaptureResult> {
  const { userId, profile } = await getSessionProfile();
  if (!userId || !isCampaignManager(profile)) {
    return { ok: false, error: "Campaign managers only." };
  }
  const companyId = profile?.company_id;
  if (!companyId) return { ok: false, error: "No company on this account." };

  const service = createServiceClient();

  if (isCaptureUrl(raw)) {
    const url = raw.trim();
    const { data, error } = await service
      .from("library_items")
      .insert({
        company_id: companyId,
        source: "reference",
        url,
        created_by: userId,
      })
      .select("id")
      .single();
    if (error) return { ok: false, error: error.message };

    /* Best effort, same edge function the app calls after its insert. A
       link that resolves nothing stays a reference without art. */
    try {
      const { data: preview } = await callEdgeFunction<{
        thumbnail_url?: string | null;
        title?: string | null;
      }>("library-link", { url });
      if (preview && (preview.thumbnail_url || preview.title)) {
        await service
          .from("library_items")
          .update({
            thumbnail_url: preview.thumbnail_url ?? null,
            ...(preview.title ? { text: preview.title } : {}),
          })
          .eq("id", data.id);
      }
    } catch {
      /* The reference row already exists. */
    }

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
      company_id: companyId,
      source: "idea",
      text,
      created_by: userId,
    })),
  );
  if (error) return { ok: false, error: error.message };

  revalidatePath("/manager/library");
  return { ok: true, ideas: lines.length, reference: false };
}
