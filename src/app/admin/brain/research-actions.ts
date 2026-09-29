"use server";

import { revalidatePath } from "next/cache";

import {
  canManageCampaigns,
  getMemberPermissions,
  getSessionProfile,
  isCompanyAdmin,
  isPlatformAdmin,
} from "@/lib/auth";
import { callEdgeFunction } from "@/lib/edge";
import type {
  CompanyResearch,
  ReferenceLearning,
  StudiedReference,
} from "@/lib/admin/research";
import { createServiceClient } from "@/lib/supabase/service";

/* Industry research and reference learning on the Company Brain page. The
   work runs in the research-company and study-reference edge functions;
   these actions start it and read the results back for polling. */

type Gate = { ok: true; companyId: string } | { ok: false; error: string };

async function requireBrainAccess(): Promise<Gate> {
  const { profile } = await getSessionProfile();
  const companyId = profile?.active_company_id;
  if (!companyId) return { ok: false, error: "No company on this account." };
  const allowed =
    isCompanyAdmin(profile) ||
    isPlatformAdmin(profile) ||
    (canManageCampaigns(profile) && (await getMemberPermissions(profile)).manage_brand);
  if (!allowed) return { ok: false, error: "You cannot edit this company's brain." };
  return { ok: true, companyId };
}

export async function getCompanyResearch(): Promise<
  { ok: true; research: CompanyResearch | null } | { ok: false; error: string }
> {
  const gate = await requireBrainAccess();
  if (!gate.ok) return gate;
  const { data, error } = await createServiceClient()
    .from("company_research")
    .select("website, status, stage, profile, playbook, sources, error, started_at, finished_at")
    .eq("company_id", gate.companyId)
    .maybeSingle();
  if (error) return { ok: false, error: error.message };
  return { ok: true, research: (data as CompanyResearch | null) ?? null };
}

export async function startCompanyResearch(input: {
  website: string;
  force?: boolean;
}): Promise<{ ok: true; research: CompanyResearch } | { ok: false; error: string }> {
  const gate = await requireBrainAccess();
  if (!gate.ok) return gate;
  const { data, error } = await callEdgeFunction<{ research: CompanyResearch }>(
    "research-company",
    { website: input.website.trim(), force: Boolean(input.force) },
  );
  if (error || !data) return { ok: false, error: error ?? "Could not start the research." };
  return { ok: true, research: data.research };
}

export async function getReferenceLearning(): Promise<
  { ok: true; learning: ReferenceLearning } | { ok: false; error: string }
> {
  const gate = await requireBrainAccess();
  if (!gate.ok) return gate;
  const service = createServiceClient();
  const [studies, playbook, references] = await Promise.all([
    service
      .from("reference_studies")
      .select("id, url, status, format, pattern, studied_at")
      .eq("company_id", gate.companyId)
      .order("studied_at", { ascending: false, nullsFirst: false })
      .limit(60),
    service
      .from("brand_docs")
      .select("content, updated_at")
      .eq("company_id", gate.companyId)
      .eq("kind", "reference_playbook")
      .maybeSingle(),
    service
      .from("library_items")
      .select("id", { count: "exact", head: true })
      .eq("company_id", gate.companyId)
      .eq("source", "reference"),
  ]);
  if (studies.error) return { ok: false, error: studies.error.message };
  return {
    ok: true,
    learning: {
      studies: (studies.data ?? []) as StudiedReference[],
      playbook: (playbook.data?.content as string | undefined) ?? "",
      playbookUpdatedAt: (playbook.data?.updated_at as string | undefined) ?? null,
      referenceCount: references.count ?? 0,
    },
  };
}

/* Studies every Library reference not studied yet (a few per call), then
   rebuilds the playbook. */
export async function studyAllReferences(): Promise<
  { ok: true; queued: number } | { ok: false; error: string }
> {
  const gate = await requireBrainAccess();
  if (!gate.ok) return gate;
  const { data, error } = await callEdgeFunction<{ queued: number }>("study-reference", {
    backfill: true,
    distill: true,
  });
  if (error || !data) return { ok: false, error: error ?? "Could not start." };
  revalidatePath("/admin/brain");
  return { ok: true, queued: data.queued };
}
