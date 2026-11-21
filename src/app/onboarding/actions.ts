"use server";

import { revalidatePath } from "next/cache";

import { startBrainIngest, type BrainResult } from "@/app/admin/brain/knowledge-actions";
import type { IngestState } from "@/lib/admin/brain-model";
import { getSessionProfile, isCompanyAdmin } from "@/lib/auth";
import { callEdgeFunction } from "@/lib/edge";
import { isStaleCompany, STALE_COMPANY_ERROR } from "@/lib/stale-company";
import { createClient } from "@/lib/supabase/server";

/** Campaign intake (companies.intake, app migration 149). */
export interface OnboardingIntake {
  goal?: "signups" | "sales" | "audience" | "trust";
  platforms?: Array<"tiktok" | "instagram" | "youtube">;
  creators_wanted?: "1-5" | "5-10" | "10-25" | "25+";
  monthly_budget?: "under_1k" | "1k-3k" | "3k-10k" | "10k+" | "unsure";
  launch?: "this_week" | "this_month" | "exploring";
}

export interface OnboardingSubmission {
  fullName: string;
  /** "Founder" | "Marketing" | "Content" | "Growth" | "Operations" | "Something else". */
  adminRole: string;
  website: string;
  doesUgc: boolean;
  creatorCount: number;
  managerCount: number;
  selfIsManager: boolean;
  intake?: OnboardingIntake;
}

export type OnboardingResult = { ok: true } | { ok: false; error: string };

function toCount(value: number): number {
  return Number.isFinite(value) ? Math.max(0, Math.round(value)) : 0;
}

/* Mock mode (dev + ADMIN_QA_MOCK=1): nothing is written, same switch as
   @/app/admin/brain/actions. */
function mockMode(): boolean {
  return process.env.NODE_ENV === "development" && process.env.ADMIN_QA_MOCK === "1";
}

type Gate =
  | { ok: true; userId: string; companyId: string }
  | { ok: false; error: string };

/* `renderedFor` is the company the flow was opened for. The answers and
   the finished mark belong to that company, so the write is refused when
   the account has since switched to another one (another tab, or the app). */
async function requireOnboardingAdmin(renderedFor: string): Promise<Gate> {
  const { userId, profile } = await getSessionProfile();
  if (!userId || !isCompanyAdmin(profile) || !profile?.active_company_id) {
    return { ok: false, error: "Company admins only." };
  }
  if (isStaleCompany(profile.active_company_id, renderedFor)) {
    return { ok: false, error: STALE_COMPANY_ERROR };
  }
  return { ok: true, userId, companyId: profile.active_company_id };
}

/* Writes the account answers given so far, so a refresh or a return visit
   picks the flow up where it stopped. profiles.onboarded stays false until
   completeOnboarding. */
async function writeAnswers(
  gate: { userId: string; companyId: string },
  input: Partial<OnboardingSubmission>,
): Promise<OnboardingResult> {
  const supabase = await createClient();

  const fullName = input.fullName?.trim();
  if (fullName) {
    const { error } = await supabase
      .from("profiles")
      .update({ full_name: fullName })
      .eq("id", gate.userId);
    if (error) return { ok: false, error: error.message };
  }

  const website = input.website?.trim();
  if (website) {
    const { error } = await supabase
      .from("companies")
      .update({ website })
      .eq("id", gate.companyId);
    if (error) return { ok: false, error: error.message };
  }

  const answers: Record<string, unknown> = {};
  if (input.adminRole !== undefined) answers.admin_role = input.adminRole || null;
  if (input.doesUgc !== undefined) answers.does_ugc = input.doesUgc === true;
  if (input.creatorCount !== undefined) answers.creator_count = toCount(input.creatorCount);
  if (input.managerCount !== undefined) answers.manager_count = toCount(input.managerCount);
  if (input.selfIsManager !== undefined) answers.self_is_manager = input.selfIsManager === true;
  if (input.intake && Object.keys(input.intake).length > 0) {
    /* Merged into what is there, one answer at a time. */
    const { data: row } = await supabase.from("companies").select("intake").eq("id", gate.companyId).maybeSingle();
    const current = (row?.intake as Record<string, unknown> | null) ?? {};
    await supabase
      .from("companies")
      .update({ intake: { ...current, ...input.intake } })
      .eq("id", gate.companyId);
  }
  if (Object.keys(answers).length > 0) {
    /* The answer columns may not be migrated yet; src/lib/admin/data.ts reads
       them defensively, so a failure here must not block onboarding. */
    await supabase.from("companies").update(answers).eq("id", gate.companyId);
  }
  return { ok: true };
}

export async function saveOnboardingProgress(
  renderedFor: string,
  input: Partial<OnboardingSubmission>,
): Promise<OnboardingResult> {
  if (mockMode()) return { ok: true };
  const gate = await requireOnboardingAdmin(renderedFor);
  if (!gate.ok) return gate;
  return writeAnswers(gate, input);
}

/* The website step: saves the address and starts reading the company.
   Two jobs start here, both answering at once and working in the background:
   - brain-ingest builds the fact brain the review and the founder questions
     are filled from. Its state comes back so the flow can show progress.
   - research-company writes the industry playbook (brand_docs kind
     industry_research). The brief writer the web calls today (ingest-brief)
     still takes its facts, dates and insider details from that document, and
     brain-ingest does no web research, so it keeps running. It used to start
     on the last click; starting it here gives it the length of the survey. */
export async function startOnboardingScan(
  renderedFor: string,
  input: {
    website: string;
    appStoreUrl?: string;
  },
): Promise<BrainResult<IngestState>> {
  const website = input.website.trim();
  if (!website) return { ok: false, error: "Your website is required." };

  if (!mockMode()) {
    const gate = await requireOnboardingAdmin(renderedFor);
    if (!gate.ok) return gate;
    const saved = await writeAnswers(gate, { website });
    if (!saved.ok) return saved;

    try {
      const research = await callEdgeFunction<unknown>("research-company", { website });
      if (research.error !== null) {
        console.error(`Onboarding research did not start: ${research.error}`);
      }
    } catch (err) {
      console.error("Onboarding research did not start", err);
    }
  }

  const store = input.appStoreUrl?.trim();
  return startBrainIngest({
    website,
    appStoreUrls: store ? [store] : [],
    importLegacy: true,
  });
}

/* Closes the flow: writes every account answer once more (so nothing is
   lost if a step's save failed) and marks the profile onboarded. */
export async function completeOnboarding(
  renderedFor: string,
  input: OnboardingSubmission,
): Promise<OnboardingResult> {
  if (mockMode()) return { ok: true };
  const gate = await requireOnboardingAdmin(renderedFor);
  if (!gate.ok) return gate;

  const fullName = input.fullName.trim();
  const website = input.website.trim();
  if (!fullName) return { ok: false, error: "Your name is required." };
  if (!website) return { ok: false, error: "Your website is required." };

  const doesUgc = input.doesUgc === true;
  const managerCount = doesUgc ? toCount(input.managerCount) : 0;
  const saved = await writeAnswers(gate, {
    fullName,
    website,
    adminRole: input.adminRole,
    doesUgc,
    creatorCount: doesUgc ? toCount(input.creatorCount) : 0,
    managerCount,
    /* Self-as-manager needs no seeding: the admin's company_members row
       exists from the invite (role company_admin), and company admins hold
       every permission implicitly. */
    selfIsManager: managerCount > 0 && input.selfIsManager === true,
    intake: input.intake,
  });
  if (!saved.ok) return saved;

  const supabase = await createClient();
  const { error: profileError } = await supabase
    .from("profiles")
    .update({ onboarded: true })
    .eq("id", gate.userId);
  if (profileError) return { ok: false, error: profileError.message };

  /* Setup is per company: an account that already finished it elsewhere
     still walks a new company through it. */
  const { error: companyError } = await supabase
    .from("companies")
    .update({ onboarded_at: new Date().toISOString() })
    .eq("id", gate.companyId);
  if (companyError) return { ok: false, error: companyError.message };

  revalidatePath("/admin");
  return { ok: true };
}

/* The end of the onboarding conversation: the answers were saved as they
   were given (edge function onboarding-chat), so this only marks the person
   and the company as set up. */
export async function finishChatOnboarding(renderedFor: string): Promise<OnboardingResult> {
  if (mockMode()) return { ok: true };
  const gate = await requireOnboardingAdmin(renderedFor);
  if (!gate.ok) return gate;
  const supabase = await createClient();
  const { error: profileError } = await supabase.from("profiles").update({ onboarded: true }).eq("id", gate.userId);
  if (profileError) return { ok: false, error: profileError.message };
  const { error: companyError } = await supabase
    .from("companies")
    .update({ onboarded_at: new Date().toISOString() })
    .eq("id", gate.companyId);
  if (companyError) return { ok: false, error: companyError.message };
  revalidatePath("/admin");
  return { ok: true };
}
