"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getSessionProfile } from "@/lib/auth";

export type BrandActionResult = { ok: true } | { ok: false; error: string };

export type BrandDocKind =
  | "product_truth"
  | "audience_niche"
  | "voice"
  | "learnings";

export type BrandProfileInput = {
  tone: string;
  audience: string;
  hashtag_bank: string[];
  banned_phrases: string[];
};

// Writes run on the caller's cookie session, so the RLS policy
// "brand writes need manage_brand" is the real permission gate.
export async function saveBrandProfile(
  input: BrandProfileInput,
): Promise<BrandActionResult> {
  const { userId, profile } = await getSessionProfile();
  if (!userId || !profile?.company_id) {
    return { ok: false, error: "Not signed in." };
  }

  const supabase = await createClient();
  const values = {
    tone: input.tone.trim() || null,
    audience: input.audience.trim() || null,
    hashtag_bank: input.hashtag_bank,
    banned_phrases: input.banned_phrases,
    updated_at: new Date().toISOString(),
  };

  const { data: existing, error: readError } = await supabase
    .from("brand_profiles")
    .select("id")
    .eq("company_id", profile.company_id)
    .maybeSingle();
  if (readError) return { ok: false, error: readError.message };

  const { error } = existing
    ? await supabase.from("brand_profiles").update(values).eq("id", existing.id)
    : await supabase
        .from("brand_profiles")
        .insert({ company_id: profile.company_id, ...values });
  if (error) return { ok: false, error: error.message };

  revalidatePath("/admin/brand");
  return { ok: true };
}

export async function saveBrandDoc(
  kind: BrandDocKind,
  content: string,
): Promise<BrandActionResult> {
  const { userId, profile } = await getSessionProfile();
  if (!userId || !profile?.company_id) {
    return { ok: false, error: "Not signed in." };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("brand_docs").upsert(
    {
      company_id: profile.company_id,
      kind,
      content,
      human_edited: true,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "company_id,kind" },
  );
  if (error) return { ok: false, error: error.message };

  revalidatePath("/admin/brand");
  return { ok: true };
}
