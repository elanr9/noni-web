/* Server reads for the shared Media library (/admin/media and
   /manager/media), mirroring the mobile app's lib/media-library-api.ts.
   One table, media_library, one private bucket, brief-assets. Files are
   read through signed URLs only. Company scope always comes from the
   caller's session profile. */

import { cache } from "react";

import {
  BRIEF_ASSETS_BUCKET,
  type MediaKind,
} from "@/lib/media-library-shared";
import type { Tables } from "@/lib/supabase/database.types";
import { createServiceClient } from "@/lib/supabase/service";

export type MediaLibraryRow = Tables<"media_library">;

export interface MediaLibraryItem {
  id: string;
  kind: MediaKind;
  /** Manager given name, e.g. "Highlight video". */
  title: string | null;
  path: string;
  thumbPath: string | null;
  /** Signed URL for the file itself. */
  url: string;
  /** Signed poster URL: the thumb for recordings, the file for screenshots. */
  previewUrl: string;
  durationMs: number | null;
  width: number | null;
  height: number | null;
  createdAt: string;
}

const SIGNED_URL_TTL = 3600;

async function fetchMediaLibrary(companyId: string): Promise<MediaLibraryItem[]> {
  const supabase = createServiceClient();
  const { data } = await supabase
    .from("media_library")
    .select("*")
    .eq("company_id", companyId)
    .order("created_at", { ascending: false })
    .returns<MediaLibraryRow[]>();
  const rows = data ?? [];
  if (rows.length === 0) return [];

  const paths = rows.flatMap((row) =>
    row.thumb_path ? [row.path, row.thumb_path] : [row.path],
  );
  const { data: signed } = await supabase.storage
    .from(BRIEF_ASSETS_BUCKET)
    .createSignedUrls(paths, SIGNED_URL_TTL);
  const urlFor = new Map<string, string>();
  for (const entry of signed ?? []) {
    if (entry.path && entry.signedUrl) urlFor.set(entry.path, entry.signedUrl);
  }

  return rows.flatMap((row) => {
    const url = urlFor.get(row.path);
    if (!url) return [];
    const preview = row.thumb_path ? urlFor.get(row.thumb_path) : null;
    return [
      {
        id: row.id,
        kind: row.kind === "recording" ? "recording" : "screenshot",
        title: row.title,
        path: row.path,
        thumbPath: row.thumb_path,
        url,
        previewUrl: preview ?? url,
        durationMs: row.duration_ms,
        width: row.width,
        height: row.height,
        createdAt: row.created_at,
      },
    ];
  });
}

/** Newest first, one fetch per request, scoped to the caller's company. */
export const getMediaLibrary = cache(fetchMediaLibrary);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/** companies.settings.overlay_theme.color, or null when no theme is set. */
export const getThemeColor = cache(async (companyId: string): Promise<string | null> => {
  const supabase = createServiceClient();
  const { data } = await supabase
    .from("companies")
    .select("settings")
    .eq("id", companyId)
    .maybeSingle();
  const settings: unknown = data?.settings;
  if (!isRecord(settings) || !isRecord(settings.overlay_theme)) return null;
  const color = settings.overlay_theme.color;
  return typeof color === "string" ? color : null;
});
