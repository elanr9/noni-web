"use server";

/* Media library and theme color mutations, shared by /admin/media and
   /manager/media. Files are uploaded straight from the browser with the
   user's session client so storage RLS applies; these actions only own the
   media_library rows, the storage cleanup and companies.settings. Every
   action re-checks the session and scopes writes to the session profile's
   company, never a client-passed id. */

import { revalidatePath } from "next/cache";

import { MOCK_DATASET } from "@/lib/admin/mock-data";
import {
  getSessionProfile,
  isCampaignManager,
  isCompanyAdmin,
  isPlatformAdmin,
} from "@/lib/auth";
import {
  BRIEF_ASSETS_BUCKET,
  normalizeThemeHex,
  type MediaKind,
} from "@/lib/media-library-shared";
import type { MediaLibraryRow } from "@/lib/media-library";
import type { Json, TablesInsert } from "@/lib/supabase/database.types";
import { createServiceClient } from "@/lib/supabase/service";

export type MediaActionResult = { ok: true } | { ok: false; error: string };

/* Mock mode (dev + ADMIN_QA_MOCK=1), same pattern as @/app/admin/brain/actions. */
function mockMode(): boolean {
  return (
    process.env.NODE_ENV === "development" && process.env.ADMIN_QA_MOCK === "1"
  );
}

type Gate =
  | { ok: true; companyId: string; userId: string | null; mock: boolean }
  | { ok: false; error: string };

async function requireCompanyManager(): Promise<Gate> {
  if (mockMode()) {
    return { ok: true, companyId: MOCK_DATASET.company.id, userId: null, mock: true };
  }
  const { userId, profile } = await getSessionProfile();
  if (
    !isCompanyAdmin(profile) &&
    !isCampaignManager(profile) &&
    !isPlatformAdmin(profile)
  ) {
    return { ok: false, error: "Campaign managers only." };
  }
  if (!profile?.company_id) {
    return { ok: false, error: "No company on this account." };
  }
  return { ok: true, companyId: profile.company_id, userId, mock: false };
}

function revalidateMedia(): void {
  revalidatePath("/admin", "layout");
  revalidatePath("/manager", "layout");
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export interface AddMediaLibraryInput {
  kind: MediaKind;
  title: string | null;
  path: string;
  thumbPath: string | null;
  durationMs: number | null;
  width: number | null;
  height: number | null;
}

/** Registers a file the browser already uploaded under <company>/library/. */
export async function addMediaLibraryItem(
  input: AddMediaLibraryInput,
): Promise<MediaActionResult> {
  const gate = await requireCompanyManager();
  if (!gate.ok) return { ok: false, error: gate.error };

  const prefix = `${gate.companyId}/library/`;
  if (
    !input.path.startsWith(prefix) ||
    (input.thumbPath !== null && !input.thumbPath.startsWith(prefix))
  ) {
    return { ok: false, error: "That file is not in this company's library." };
  }

  if (gate.mock) {
    revalidateMedia();
    return { ok: true };
  }

  const row: TablesInsert<"media_library"> = {
    company_id: gate.companyId,
    kind: input.kind,
    title: input.title?.trim() || null,
    path: input.path,
    thumb_path: input.thumbPath,
    duration_ms: input.durationMs,
    width: input.width,
    height: input.height,
    created_by: gate.userId,
  };
  const supabase = createServiceClient();
  const { error } = await supabase.from("media_library").insert(row);
  if (error) return { ok: false, error: error.message };

  revalidateMedia();
  return { ok: true };
}

export async function renameMediaLibraryItem(
  id: string,
  title: string | null,
): Promise<MediaActionResult> {
  const gate = await requireCompanyManager();
  if (!gate.ok) return { ok: false, error: gate.error };

  if (gate.mock) {
    revalidateMedia();
    return { ok: true };
  }

  const { error } = await createServiceClient()
    .from("media_library")
    .update({ title: title?.trim() || null })
    .eq("id", id)
    .eq("company_id", gate.companyId);
  if (error) return { ok: false, error: error.message };

  revalidateMedia();
  return { ok: true };
}

/** Deletes the row, then the file and poster. Posts keep their own copy. */
export async function removeMediaLibraryItem(id: string): Promise<MediaActionResult> {
  const gate = await requireCompanyManager();
  if (!gate.ok) return { ok: false, error: gate.error };

  if (gate.mock) {
    revalidateMedia();
    return { ok: true };
  }

  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("media_library")
    .delete()
    .eq("id", id)
    .eq("company_id", gate.companyId)
    .select("path, thumb_path")
    .returns<Pick<MediaLibraryRow, "path" | "thumb_path">[]>();
  if (error) return { ok: false, error: error.message };

  const paths = (data ?? []).flatMap((row) =>
    row.thumb_path ? [row.path, row.thumb_path] : [row.path],
  );
  if (paths.length > 0) {
    await supabase.storage.from(BRIEF_ASSETS_BUCKET).remove(paths);
  }

  revalidateMedia();
  return { ok: true };
}

/** Writes companies.settings.overlay_theme.color, preserving every other key. */
export async function saveThemeColor(hex: string | null): Promise<MediaActionResult> {
  const gate = await requireCompanyManager();
  if (!gate.ok) return { ok: false, error: gate.error };

  let color: string | null = null;
  if (hex !== null) {
    color = normalizeThemeHex(hex);
    if (!color) return { ok: false, error: "Enter a six digit hex color." };
  }

  if (gate.mock) {
    revalidateMedia();
    return { ok: true };
  }

  const supabase = createServiceClient();
  const { data, error: readError } = await supabase
    .from("companies")
    .select("settings")
    .eq("id", gate.companyId)
    .single();
  if (readError) return { ok: false, error: readError.message };

  const current: unknown = data?.settings;
  const settings: Json = {
    ...(isRecord(current) ? (current as { [key: string]: Json }) : {}),
    overlay_theme: { color },
  };
  const { error } = await supabase
    .from("companies")
    .update({ settings })
    .eq("id", gate.companyId);
  if (error) return { ok: false, error: error.message };

  revalidateMedia();
  return { ok: true };
}
