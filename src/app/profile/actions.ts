"use server";

import type { CreatorProfile } from "@/lib/creator-profile";
import { createClient } from "@/lib/supabase/server";

export type SaveResult = { ok: true } | { ok: false; error: string };

/* The creator saves their own profile; save_creator_profile checks the
   values and only ever writes the caller's row. */
export async function saveProfile(patch: Partial<CreatorProfile>): Promise<SaveResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Sign in again" };
  const { error } = await supabase.rpc("save_creator_profile", { p_patch: patch });
  if (error) return { ok: false, error: error.message || "Could not save" };
  return { ok: true };
}
