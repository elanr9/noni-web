"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getSessionProfile, isCompanyAdmin, isPlatformAdmin } from "@/lib/auth";

export type RegenerateResult =
  | { ok: true; code: string }
  | { ok: false; error: string };

export async function regenerateJoinCode(): Promise<RegenerateResult> {
  const { userId, profile } = await getSessionProfile();
  if (!userId || (!isCompanyAdmin(profile) && !isPlatformAdmin(profile)) || !profile?.company_id) {
    return { ok: false, error: "Company admins only." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("regenerate_company_join_code", {
    p_company_id: profile.company_id,
  });
  if (error) return { ok: false, error: error.message };

  revalidatePath("/admin/code");
  return { ok: true, code: data as string };
}
