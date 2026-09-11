/* Pure helpers shared by the Media library view, its upload path, the
   server actions and the tests. Nothing here touches Supabase or the DOM. */

export const BRIEF_ASSETS_BUCKET = "brief-assets";
/** Matches the brief-assets bucket file_size_limit. */
export const MAX_MEDIA_BYTES = 200 * 1024 * 1024;

export type MediaKind = "screenshot" | "recording";

/** What the bucket stores. Screenshots are always re encoded to JPEG. */
export const BUCKET_MIMES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "video/mp4",
  "video/quicktime",
] as const;

/** HEIC and HEIF are accepted as input only because the browser re encodes
    every screenshot to JPEG before it leaves the device. */
const INPUT_IMAGE_MIMES = new Set<string>([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
]);
const INPUT_VIDEO_MIMES = new Set<string>(["video/mp4", "video/quicktime"]);

export type MediaFileCheck =
  | { ok: true; kind: MediaKind }
  | { ok: false; error: string };

function sizeLabel(bytes: number): string {
  return `${Math.round(bytes / (1024 * 1024))} MB`;
}

/** Mime and size gate, run before any byte reaches storage. */
export function checkMediaFile(file: { type: string; size: number; name: string }): MediaFileCheck {
  const mime = file.type.toLowerCase();
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
  const kind: MediaKind | null = INPUT_IMAGE_MIMES.has(mime)
    ? "screenshot"
    : INPUT_VIDEO_MIMES.has(mime)
      ? "recording"
      : ["jpg", "jpeg", "png", "webp", "heic", "heif"].includes(ext)
        ? "screenshot"
        : ["mp4", "mov", "m4v"].includes(ext)
          ? "recording"
          : null;
  if (!kind) {
    return {
      ok: false,
      error: `${file.name} is not a JPEG, PNG, WebP, HEIC, MP4 or MOV file.`,
    };
  }
  if (file.size > MAX_MEDIA_BYTES) {
    return {
      ok: false,
      error: `${file.name} is ${sizeLabel(file.size)} and the limit is ${sizeLabel(MAX_MEDIA_BYTES)}.`,
    };
  }
  return { ok: true, kind };
}

export function extensionForContentType(contentType: string): string {
  switch (contentType) {
    case "video/quicktime":
      return "mov";
    case "video/mp4":
      return "mp4";
    case "image/png":
      return "png";
    case "image/webp":
      return "webp";
    default:
      return "jpg";
  }
}

export function formatDuration(ms: number | null): string {
  const total = Math.max(0, Math.round((ms ?? 0) / 1000));
  const minutes = Math.floor(total / 60);
  const seconds = total % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

/** Same palette as the app's Settings sheet: TikTok's text background colors. */
export const THEME_SWATCHES = [
  "#EA403F",
  "#FF933D",
  "#F2CD46",
  "#78C25E",
  "#3496F0",
  "#5756D4",
  "#F7D7E9",
  "#EB4C89",
  "#000000",
] as const;

const HEX_RE = /^#?[0-9a-fA-F]{6}$/;

/** "#RRGGBB" uppercase for any valid 6 digit hex, otherwise null. */
export function normalizeThemeHex(input: string): string | null {
  const trimmed = input.trim();
  if (!HEX_RE.test(trimmed)) return null;
  return `#${trimmed.replace(/^#/, "").toUpperCase()}`;
}

/** Black or white text for readable captions on a theme fill. */
export function themeTextColor(hex: string): "#000000" | "#FFFFFF" {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return luminance > 0.55 ? "#000000" : "#FFFFFF";
}
