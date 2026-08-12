"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getSessionProfile } from "@/lib/auth";

export type FeatureActionResult = { ok: true } | { ok: false; error: string };

export type ProductFeatureInput = {
  name: string;
  what_it_does: string;
  claim: string;
};

// All writes run on the caller's cookie session, so the RLS policy
// "feature writes need manage_features" is the real permission gate.

/** Manager-written claim: already approved, never pending. */
export async function addFeature(
  input: ProductFeatureInput,
): Promise<FeatureActionResult> {
  const { userId, profile } = await getSessionProfile();
  if (!userId || !profile?.company_id) {
    return { ok: false, error: "Not signed in." };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("product_features").insert({
    company_id: profile.company_id,
    name: input.name.trim(),
    what_it_does: input.what_it_does.trim(),
    claim: input.claim.trim(),
    source: "manual",
    approved: true,
    rejected: false,
  });
  if (error) return { ok: false, error: error.message };

  revalidatePath("/admin/features");
  return { ok: true };
}

/** Edits fields only; approval is untouched so typos do not yank a claim. */
export async function updateFeature(
  id: string,
  input: ProductFeatureInput,
): Promise<FeatureActionResult> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("product_features")
    .update({
      name: input.name.trim(),
      what_it_does: input.what_it_does.trim(),
      claim: input.claim.trim(),
    })
    .eq("id", id);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/admin/features");
  return { ok: true };
}

export async function approveFeature(id: string): Promise<FeatureActionResult> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("product_features")
    .update({ approved: true, rejected: false })
    .eq("id", id);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/admin/features");
  return { ok: true };
}

/** Soft dismiss. The row stays so rescans and idempotency skip the name. */
export async function rejectFeature(id: string): Promise<FeatureActionResult> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("product_features")
    .update({ rejected: true, approved: false })
    .eq("id", id);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/admin/features");
  return { ok: true };
}
