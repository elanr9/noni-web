"use server";

import { revalidatePath } from "next/cache";

import { getSessionProfile, isCompanyAdmin } from "@/lib/auth";
import { isStaleCompany, STALE_COMPANY_ERROR } from "@/lib/stale-company";
import { createServiceClient } from "@/lib/supabase/service";

export type RunPath = "diy" | "dfy";
export type StartResult = { ok: true } | { ok: false; error: string };

/* The answers the sign up chat already has, so the onboarding chat that
   follows a "do it yourself" plan does not ask them twice. */
const ASKED_AT_SIGN_UP = ["goal", "platforms", "creators_wanted", "launch"] as const;

/** The one choice every new company makes before anything else: run the
    campaigns itself on Noni ("diy": plans and checkout, then the full
    onboarding) or have Noni run everything ("dfy": a call with the founders,
    and nothing else until then). Saved as companies.intake.campaigns_run_by,
    which the onboarding chat and the setup checklist already branch on. */
export async function chooseRunPath(renderedFor: string, path: RunPath): Promise<StartResult> {
  const { userId, profile } = await getSessionProfile();
  const companyId = profile?.active_company_id;
  if (!userId || !companyId || !isCompanyAdmin(profile)) return { ok: false, error: "Company admins only." };
  if (isStaleCompany(companyId, renderedFor)) return { ok: false, error: STALE_COMPANY_ERROR };

  const db = createServiceClient();
  const { data: company, error: readError } = await db
    .from("companies")
    .select("name, website, intake, onboarding_chat")
    .eq("id", companyId)
    .maybeSingle();
  if (readError || !company) return { ok: false, error: readError?.message ?? "Company not found." };

  const intake = (company.intake as Record<string, unknown> | null) ?? {};
  const runBy = path === "dfy" ? "noni" : "me";
  const firstCall = path === "dfy" && !intake.call_requested_at;
  const nextIntake: Record<string, unknown> = {
    ...intake,
    campaigns_run_by: runBy,
    ...(firstCall ? { call_requested_at: new Date().toISOString() } : {}),
  };

  const update: Record<string, unknown> = {
    intake: nextIntake,
    manager_count: path === "dfy" ? 0 : 1,
    self_is_manager: path === "diy",
  };
  /* Doing it yourself means answering everything: the onboarding chat runs
     after checkout, picking up after what sign up already asked. */
  const chat = (company.onboarding_chat as { messages?: unknown[] } | null) ?? {};
  if (path === "diy" && !chat.messages?.length) {
    const answered = [
      ...(company.website ? ["website"] : []),
      ...ASKED_AT_SIGN_UP.filter((k) => intake[k] !== undefined && intake[k] !== null && intake[k] !== ""),
      "runs_campaigns",
    ];
    update.onboarding_chat = { messages: [], answered, followups: {} };
  }
  const { error } = await db.from("companies").update(update).eq("id", companyId);
  if (error) return { ok: false, error: error.message };

  /* Done for you has no chat; do it yourself gets the full one after paying. */
  await db.from("profiles").update({ onboarded: path === "dfy" }).eq("id", userId);

  if (firstCall) {
    /* The founders hear about it the same way as every other lead (notify-lead). */
    const { data: auth } = await db.auth.admin.getUserById(userId);
    const email = auth.user?.email ?? null;
    const goal = typeof intake.goal === "string" ? intake.goal : null;
    const creators = typeof intake.creators_wanted === "string" ? intake.creators_wanted : null;
    await db.from("leads").insert({
      kind: "call",
      name: profile?.full_name?.trim() || email || "New company",
      email: email ?? "",
      company: company.name,
      website: company.website,
      message: [
        "Wants Done for you. Book their call; nothing happens on their side until then.",
        goal ? `Goal: ${goal}` : "",
        creators ? `Creators wanted: ${creators}` : "",
      ]
        .filter(Boolean)
        .join("\n"),
      source: "start",
    });
  }

  revalidatePath("/start");
  revalidatePath("/admin", "layout");
  return { ok: true };
}
