import type { createServiceClient } from "@/lib/supabase/service";

/* Company logos live in the public company-logos bucket, keyed by company id
   (migration 092). Limits mirror the bucket config so a bad file fails here
   with a readable message instead of a storage error. */

export const COMPANY_LOGO_BUCKET = "company-logos";
export const COMPANY_LOGO_MAX_BYTES = 2 * 1024 * 1024;
export const COMPANY_LOGO_ACCEPT = "image/png,image/jpeg,image/webp,image/svg+xml";

const EXT_BY_TYPE: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
  "image/svg+xml": "svg",
};

export function companyLogoUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${COMPANY_LOGO_BUCKET}/${path}`;
}

export function validateCompanyLogo(file: File): string | null {
  if (!EXT_BY_TYPE[file.type]) return "Logos must be PNG, JPEG, WebP or SVG.";
  if (file.size > COMPANY_LOGO_MAX_BYTES) return "Logos must be 2MB or smaller.";
  if (file.size === 0) return "That file is empty.";
  return null;
}

export type UploadLogoResult =
  | { ok: true; path: string }
  | { ok: false; error: string };

/* Uploads the file and points companies.logo_path at it. The caller has
   already checked the session may edit this company's brand. */
export async function uploadCompanyLogo(
  supabase: ReturnType<typeof createServiceClient>,
  companyId: string,
  file: File,
): Promise<UploadLogoResult> {
  const invalid = validateCompanyLogo(file);
  if (invalid) return { ok: false, error: invalid };

  const path = `${companyId}/logo-${Date.now()}.${EXT_BY_TYPE[file.type]}`;
  const { error: uploadError } = await supabase.storage
    .from(COMPANY_LOGO_BUCKET)
    .upload(path, file, { contentType: file.type, upsert: false });
  if (uploadError) return { ok: false, error: uploadError.message };

  const { error } = await supabase
    .from("companies")
    .update({ logo_path: path })
    .eq("id", companyId);
  if (error) return { ok: false, error: error.message };

  return { ok: true, path };
}
