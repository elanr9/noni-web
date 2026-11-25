"use server";

import { canManageCampaigns, getSessionProfile, isPlatformAdmin } from "@/lib/auth";
import { callEdgeFunction } from "@/lib/edge";
import { ACTIVE_RUN, loadScout, type ScoutData, type ScoutStatus } from "@/lib/scout";
import { createServiceClient } from "@/lib/supabase/service";

/* Scout tab actions, shared by /admin/scout (the company's own) and
   /ops/scout/[id] (the platform admin, for any company). */

type Gate = { ok: true; companyId: string } | { ok: false; error: string };

async function gate(companyId?: string): Promise<Gate> {
  const { profile } = await getSessionProfile();
  if (companyId && isPlatformAdmin(profile)) return { ok: true, companyId };
  const active = profile?.active_company_id;
  if (!active || !(canManageCampaigns(profile) || isPlatformAdmin(profile))) {
    return { ok: false, error: "You cannot use Scout here." };
  }
  if (companyId && companyId !== active) return { ok: false, error: "Wrong company." };
  return { ok: true, companyId: active };
}

export async function startScout(input: {
  companyId?: string;
  brief: string;
  platforms: ("tiktok" | "instagram")[];
  seeds: string[];
  minFollowers: number | null;
  maxFollowers: number | null;
}): Promise<{ ok: true; data: ScoutData } | { ok: false; error: string }> {
  const g = await gate(input.companyId);
  if (!g.ok) return g;
  const r = await callEdgeFunction<{ run: unknown }>("scout", {
    action: "start",
    company_id: g.companyId,
    brief: input.brief,
    platforms: input.platforms,
    seeds: input.seeds,
    min_followers: input.minFollowers,
    max_followers: input.maxFollowers,
  });
  if (r.error !== null) return { ok: false, error: r.error };
  const data = await loadScout(g.companyId);
  return data ? { ok: true, data } : { ok: false, error: "Company not found." };
}

/* Polled while a run is going. Nudges the run along when no worker holds
   it, so it moves as fast as Apify and Claude allow instead of once a
   minute on the cron. */
export async function refreshScout(companyId?: string): Promise<{ ok: true; data: ScoutData } | { ok: false; error: string }> {
  const g = await gate(companyId);
  if (!g.ok) return g;
  const data = await loadScout(g.companyId);
  if (!data) return { ok: false, error: "Company not found." };
  const run = data.run;
  if (run && ACTIVE_RUN.includes(run.status) && (!run.lease_until || Date.parse(run.lease_until) < Date.now())) {
    await callEdgeFunction("scout", { action: "tick", run_id: run.id });
  }
  return { ok: true, data };
}

const NEXT: Partial<Record<ScoutStatus, ScoutStatus[]>> = {
  match: ["contacted", "skipped"],
  skipped: ["match"],
  contacted: ["replied", "passed", "match"],
  replied: ["passed", "contacted"],
  passed: ["match"],
  applied: ["passed"],
};

export async function updateScoutCreator(input: {
  companyId?: string;
  id: string;
  status?: ScoutStatus;
  dm?: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const g = await gate(input.companyId);
  if (!g.ok) return g;
  const db = createServiceClient();
  const { data: row } = await db
    .from("scout_creators")
    .select("id, status, profile_id")
    .eq("id", input.id)
    .eq("company_id", g.companyId)
    .maybeSingle();
  if (!row) return { ok: false, error: "Creator not found." };

  const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (typeof input.dm === "string") patch.dm = input.dm.trim().slice(0, 600);
  if (input.status && input.status !== row.status) {
    // Accepting someone who applied through the join link.
    if (input.status === "joined") {
      if (row.status !== "applied" || !row.profile_id) return { ok: false, error: "Only people who applied can be accepted." };
      const { error } = await db.rpc("marketplace_join", { p_company_id: g.companyId, p_creator_id: row.profile_id });
      if (error) return { ok: false, error: error.message };
      patch.joined_at = new Date().toISOString();
    } else if (!(NEXT[row.status as ScoutStatus] ?? []).includes(input.status)) {
      return { ok: false, error: "That move is not allowed." };
    }
    patch.status = input.status;
    if (input.status === "contacted" && row.status === "match") patch.contacted_at = new Date().toISOString();
    if (input.status === "replied") patch.replied_at = new Date().toISOString();
  }
  const { error } = await db.from("scout_creators").update(patch).eq("id", row.id);
  return error ? { ok: false, error: error.message } : { ok: true };
}
