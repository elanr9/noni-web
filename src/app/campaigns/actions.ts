"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

import { createClient } from "@/lib/supabase/server";

export type ActionResult = { ok: true } | { ok: false; error: string };

/* Every write is a database function (migrations 155 and 162) that only
   ever acts as the signed-in creator. */
async function run(fn: string, args: Record<string, unknown>, signing = false): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Sign in again" };
  let call = supabase.rpc(fn as never, args as never);
  if (signing) {
    /* The signature record keeps the signer's own address and browser, not
       this server's (migration 168, stamp_signature). */
    const h = await headers();
    const ip = (h.get("x-forwarded-for") ?? "").split(",")[0].trim() || h.get("x-real-ip") || "";
    const agent = h.get("user-agent") ?? "";
    if (ip) call = call.setHeader("x-signer-ip", ip);
    if (agent) call = call.setHeader("x-signer-agent", agent.slice(0, 400));
  }
  const { error } = await call;
  if (error) return { ok: false, error: error.message || "Something went wrong" };
  revalidatePath("/campaigns");
  return { ok: true };
}

/** Apply to a campaign. Nothing is signed until the company accepts. */
export async function apply(listingId: string, note = ""): Promise<ActionResult> {
  return run("apply_to_listing", { p_listing_id: listingId, p_signed_name: null, p_note: note.trim() || null });
}

/** Sign the agreement written for this creator (after an accept or an invite)
    and join the company. */
export async function signAgreement(applicationId: string, signedName: string): Promise<ActionResult> {
  if (!signedName.trim()) return { ok: false, error: "Type your full name" };
  return run("sign_creator_agreement", { p_application_id: applicationId, p_signed_name: signedName }, true);
}

export async function withdraw(applicationId: string): Promise<ActionResult> {
  return run("withdraw_marketplace_application", { p_id: applicationId });
}

export async function leave(companyId: string): Promise<ActionResult> {
  return run("leave_campaign", { p_company_id: companyId });
}
