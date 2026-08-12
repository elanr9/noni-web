"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getSessionProfile, isCompanyAdmin, isPlatformAdmin } from "@/lib/auth";

type PublishSettings = {
  day: string;
  time: string;
  timezone: string;
};

export type PublishResult = { ok: true } | { ok: false; error: string };

export async function savePublishTime(input: {
  day: string;
  time: string;
}): Promise<PublishResult> {
  const { userId, profile } = await getSessionProfile();
  if (!userId || (!isCompanyAdmin(profile) && !isPlatformAdmin(profile)) || !profile?.company_id) {
    return { ok: false, error: "Company admins only." };
  }

  const supabase = await createClient();
  const { data: company, error: readError } = await supabase
    .from("companies")
    .select("settings")
    .eq("id", profile.company_id)
    .maybeSingle();
  if (readError) return { ok: false, error: readError.message };

  const settings = (company?.settings ?? {}) as Record<string, unknown>;
  const publish: PublishSettings = {
    day: input.day,
    time: input.time,
    timezone: "America/New_York",
  };

  const { error } = await supabase
    .from("companies")
    .update({ settings: { ...settings, publish } })
    .eq("id", profile.company_id);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/admin/publish");
  return { ok: true };
}
