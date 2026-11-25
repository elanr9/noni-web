"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";

export type ActionResult = { ok: true } | { ok: false; error: string };

/* Every write is a database function (migrations 155 and 162) that only
   ever acts as the signed-in creator. */
async function run(fn: string, args: Record<string, unknown>): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Sign in again" };
  const { error } = await supabase.rpc(fn as never, args as never);
  if (error) return { ok: false, error: error.message || "Something went wrong" };
  revalidatePath("/campaigns");
  return { ok: true };
}

/** Sign the agreement and apply; on an invite this joins the company. */
export async function signAndApply(listingId: string, signedName: string, note: string): Promise<ActionResult> {
  if (!signedName.trim()) return { ok: false, error: "Type your full name" };
  return run("apply_to_listing", { p_listing_id: listingId, p_signed_name: signedName, p_note: note.trim() || null });
}

export async function withdraw(applicationId: string): Promise<ActionResult> {
  return run("withdraw_marketplace_application", { p_id: applicationId });
}

export async function leave(companyId: string): Promise<ActionResult> {
  return run("leave_campaign", { p_company_id: companyId });
}
