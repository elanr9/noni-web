"use server";

/* Company detail server actions. */

import { revalidatePath } from "next/cache";

import { getSessionProfile, isPlatformAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";

export type CompanyActionResult = { ok: true } | { ok: false; error: string };

async function requirePlatformAdmin(): Promise<string | null> {
  const { userId, profile } = await getSessionProfile();
  if (!userId || !isPlatformAdmin(profile)) {
    return "Platform ops only.";
  }
  return null;
}

/** Sends the company's admins a "top up your budget" push nudge, using the
    same Expo push channel the app's notify edge function uses
    (profiles.expo_push_token on admin/campaign-manager profiles). */
export async function pingTopUp(input: {
  companyId: string;
  adminFirstName: string;
}): Promise<CompanyActionResult> {
  const denied = await requirePlatformAdmin();
  if (denied) return { ok: false, error: denied };
  if (!input.companyId) return { ok: false, error: "Company id is required." };

  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("expo_push_token")
    .eq("company_id", input.companyId)
    .in("role", ["company_admin", "campaign_manager"])
    .not("expo_push_token", "is", null);
  if (error) return { ok: false, error: error.message };

  const tokens = (data ?? [])
    .map((p) => (p as { expo_push_token: string | null }).expo_push_token)
    .filter((t): t is string => Boolean(t));
  if (tokens.length === 0) {
    return { ok: false, error: "No admin has push notifications set up yet." };
  }

  const res = await fetch("https://exp.host/--/api/v2/push/send", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(
      tokens.map((to) => ({
        to,
        title: "Budget running low",
        body: "Your Noni credits are running low. Top up to keep bounties paying out.",
        data: { event: "credits_low", company_id: input.companyId },
      })),
    ),
  });
  if (!res.ok) return { ok: false, error: "The push could not be sent." };
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
