"use server";

import { revalidatePath } from "next/cache";
import { getSessionProfile, isPlatformAdmin } from "@/lib/auth";
import { createServiceClient } from "@/lib/supabase/service";

/* Closes a report: "actioned" when the content or the account was removed,
   "dismissed" when it broke no rule. */
export async function resolveReport(formData: FormData): Promise<void> {
  const { userId, profile } = await getSessionProfile();
  if (!userId || !isPlatformAdmin(profile)) return;
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "");
  if (!id || (status !== "actioned" && status !== "dismissed")) return;
  await createServiceClient()
    .from("content_reports")
    .update({ status, resolved_at: new Date().toISOString(), resolved_by: userId })
    .eq("id", id);
  revalidatePath("/ops/reports");
}
