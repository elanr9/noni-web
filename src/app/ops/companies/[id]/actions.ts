"use server";

/* Company detail server actions. */

import { revalidatePath } from "next/cache";

import { getSessionProfile, isPlatformAdmin } from "@/lib/auth";
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
    .from("company_roster")
    .select("expo_push_token")
    .eq("company_id", input.companyId)
    .in("member_role", ["company_admin", "campaign_manager"])
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
        body: "Your Noni credits are running low. Top up to keep your creators getting paid.",
        data: { event: "credits_low", company_id: input.companyId },
      })),
    ),
  });
  if (!res.ok) return { ok: false, error: "The push could not be sent." };
  return { ok: true };
}

/* Every file under the company's folder, in every bucket. Storage has no
   recursive delete, so folders are walked; a folder entry has a null id. */
async function removeCompanyFiles(
  service: ReturnType<typeof createServiceClient>,
  companyId: string,
): Promise<void> {
  const { data: buckets } = await service.storage.listBuckets();
  for (const bucket of buckets ?? []) {
    const folders = [companyId];
    const files: string[] = [];
    while (folders.length > 0) {
      const folder = folders.pop()!;
      for (let offset = 0; ; offset += 1000) {
        const { data } = await service.storage
          .from(bucket.id)
          .list(folder, { limit: 1000, offset });
        for (const entry of data ?? []) {
          const path = `${folder}/${entry.name}`;
          if (entry.id === null) folders.push(path);
          else files.push(path);
        }
        if (!data || data.length < 1000) break;
      }
    }
    for (let i = 0; i < files.length; i += 100) {
      await service.storage.from(bucket.id).remove(files.slice(i, i + 100));
    }
  }
}

/** Removes the company and everything scoped to it. `companies` has no
    delete policy, so this goes through ops_delete_company with the service
    role after the platform admin gate. People keep their accounts; only
    their membership of this company goes. */
export async function removeCompany(input: {
  companyId: string;
}): Promise<CompanyActionResult> {
  const denied = await requirePlatformAdmin();
  if (denied) return { ok: false, error: denied };
  if (!input.companyId) return { ok: false, error: "Company id is required." };

  const service = createServiceClient();
  const { data, error } = await service.rpc("ops_delete_company", {
    p_company_id: input.companyId,
  });
  if (error) return { ok: false, error: error.message };
  if (data !== true) return { ok: false, error: "That company no longer exists." };

  /* The rows are gone either way; a leftover file is not worth failing on. */
  try {
    await removeCompanyFiles(service, input.companyId);
  } catch {
    /* ignored */
  }

  revalidatePath("/ops/companies");
  revalidatePath("/ops/invites");
  revalidatePath("/ops/users");
  revalidatePath("/ops");
  return { ok: true };
}
