import { createServiceClient } from "@/lib/supabase/service";

/* Signed URL for a private storage object, for rendering creator videos,
   screenshots, and chat media inside the /manager pages. Returns null when
   the path is missing or signing fails so callers can render a fallback. */
export async function signedMediaUrl(
  bucket: string,
  path: string | null | undefined,
  expiresInSeconds = 60 * 60,
): Promise<string | null> {
  if (!path) return null;
  const supabase = createServiceClient();
  const { data } = await supabase.storage
    .from(bucket)
    .createSignedUrl(path, expiresInSeconds);
  return data?.signedUrl ?? null;
}
