"use server";

/* Company detail server actions. Best-effort against Supabase while the
   console runs on mock data; Agent F finalizes the wiring. */

import { revalidatePath } from "next/cache";

import { getSessionProfile, isPlatformAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export type CompanyActionResult = { ok: true } | { ok: false; error: string };

async function requirePlatformAdmin(): Promise<string | null> {
  const { userId, profile } = await getSessionProfile();
  if (!userId || !isPlatformAdmin(profile)) {
    return "Platform ops only.";
  }
  return null;
}

/** Sends the company admin a "top up your budget" nudge. Stub for now:
    the UI shows the sent state immediately; delivery lands with real data. */
export async function pingTopUp(input: {
  companyId: string;
  adminFirstName: string;
}): Promise<CompanyActionResult> {
  const denied = await requirePlatformAdmin();
  if (denied) return { ok: false, error: denied };
  if (!input.companyId) return { ok: false, error: "Company id is required." };
  return { ok: true };
}

/** Removes the company. Mock-data ids match no rows, so this is a no-op
    until real companies flow through; the delete itself is final wiring. */
export async function removeCompany(input: {
  companyId: string;
}): Promise<CompanyActionResult> {
  const denied = await requirePlatformAdmin();
  if (denied) return { ok: false, error: denied };
  if (!input.companyId) return { ok: false, error: "Company id is required." };

  const supabase = await createClient();
  const { error } = await supabase
    .from("companies")
    .delete()
    .eq("id", input.companyId);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/ops/companies");
  revalidatePath("/ops");
  return { ok: true };
}
