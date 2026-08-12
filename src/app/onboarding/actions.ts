"use server";

import { revalidatePath } from "next/cache";

import { getSessionProfile, isCompanyAdmin } from "@/lib/auth";
import { PERMISSION_DEFS } from "@/lib/permissions";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";

export interface OnboardingSubmission {
  fullName: string;
  /** "Founder" | "Marketing" | "Content" | "Growth" | "Operations" | "Something else". */
  adminRole: string;
  website: string;
  doesUgc: boolean;
  creatorCount: number;
  managerCount: number;
  selfIsManager: boolean;
}

export type OnboardingResult = { ok: true } | { ok: false; error: string };

function toCount(value: number): number {
  return Number.isFinite(value) ? Math.max(0, Math.round(value)) : 0;
}

/* Persists the question-flow answers: profile name + onboarded flag,
   company website, the answer columns added by
   supabase/migrations/20260812000100_company_onboarding_answers.sql, and
   the self-as-manager seeding. */
export async function completeOnboarding(
  input: OnboardingSubmission,
): Promise<OnboardingResult> {
  /* TEMPORARY QA BYPASS — mirrors the /admin layout envs. No writes in QA
     mode. Remove before finishing. */
  if (
    process.env.NODE_ENV === "development" &&
    process.env.ADMIN_QA_BYPASS === "1"
  ) {
    return { ok: true };
  }

  const { userId, profile } = await getSessionProfile();
  if (!userId || !isCompanyAdmin(profile) || !profile?.company_id) {
    return { ok: false, error: "Company admins only." };
  }

  const fullName = input.fullName.trim();
  const website = input.website.trim();
  if (!fullName) return { ok: false, error: "Your name is required." };
  if (!website) return { ok: false, error: "Your website is required." };

  const companyId = profile.company_id;
  const doesUgc = input.doesUgc === true;
  const creatorCount = doesUgc ? toCount(input.creatorCount) : 0;
  const managerCount = doesUgc ? toCount(input.managerCount) : 0;
  const selfIsManager = managerCount > 0 && input.selfIsManager === true;

  const supabase = await createClient();

  const { error: websiteError } = await supabase
    .from("companies")
    .update({ website })
    .eq("id", companyId);
  if (websiteError) return { ok: false, error: websiteError.message };

  /* The answer columns may not be migrated yet; src/lib/admin/data.ts reads
     them defensively, so a failure here must not block onboarding. */
  await supabase
    .from("companies")
    .update({
      admin_role: input.adminRole || null,
      does_ugc: doesUgc,
      creator_count: creatorCount,
      manager_count: managerCount,
      self_is_manager: selfIsManager,
    })
    .eq("id", companyId);

  const { error: profileError } = await supabase
    .from("profiles")
    .update({ full_name: fullName, onboarded: true })
    .eq("id", userId);
  if (profileError) return { ok: false, error: profileError.message };

  if (selfIsManager) {
    /* Seed the admin as an Active campaign manager using the
       company_members pattern getMemberPermissions reads, with every
       permission granted, so the same Google account runs campaigns in the
       Noni app with no extra setup. The table is owned by the mobile repo;
       tolerate any shape mismatch rather than blocking onboarding. */
    try {
      const service = createServiceClient();
      const { data: existing } = await service
        .from("company_members")
        .select("profile_id")
        .eq("company_id", companyId)
        .eq("profile_id", userId)
        .maybeSingle();
      if (!existing) {
        const permissions = Object.fromEntries(
          PERMISSION_DEFS.map((def) => [def.key, true]),
        );
        await service
          .from("company_members")
          .insert({ company_id: companyId, profile_id: userId, permissions });
      }
    } catch {
      /* Tolerated: seeding is best-effort until the schema lands. */
    }
  }

  revalidatePath("/admin");
  return { ok: true };
}
