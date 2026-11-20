"use server";

/* Payout test mode (app migration 146): run a company end to end before
   Noni's bank account is live. Every action here refuses a company that is
   not in test mode, and the database functions check again. */

import { revalidatePath } from "next/cache";

import { getSessionProfile, isPlatformAdmin } from "@/lib/auth";
import { callEdgeFunction } from "@/lib/edge";
import { createServiceClient } from "@/lib/supabase/service";

export type TestActionResult = { ok: true; message?: string } | { ok: false; error: string };

export type TestModeCreator = {
  id: string;
  name: string;
  payoutReady: boolean;
  availableCents: number;
  pendingCents: number;
  paidOutCents: number;
};

export type TestModePost = {
  id: string;
  platform: string;
  url: string | null;
  postedAt: string | null;
  creator: string;
  title: string;
  format: "video" | "static";
  views: number;
  earnedCents: number;
  awaitingMusic: boolean;
};

export type TestModeState = {
  on: boolean;
  creditCents: number;
  creators: TestModeCreator[];
  posts: TestModePost[];
};

async function requirePlatformAdmin(): Promise<string | null> {
  const { userId, profile } = await getSessionProfile();
  if (!userId || !isPlatformAdmin(profile)) return "Platform ops only.";
  return null;
}

function done(companyId: string) {
  revalidatePath(`/ops/companies/${companyId}`);
}

export async function getTestModeState(companyId: string): Promise<TestModeState | { error: string }> {
  const denied = await requirePlatformAdmin();
  if (denied) return { error: denied };
  const db = createServiceClient();

  const [company, billing, wallets, payouts, posts] = await Promise.all([
    db.from("companies").select("payout_test_mode").eq("id", companyId).maybeSingle(),
    db.from("company_billing").select("credit_balance_cents").eq("company_id", companyId).maybeSingle(),
    db
      .from("creator_wallets")
      .select("creator_id, payout_ready, available_cents, pending_cents, profiles(full_name)")
      .eq("company_id", companyId),
    db
      .from("mercury_payouts")
      .select("creator_id, amount_cents, status")
      .eq("company_id", companyId)
      .eq("status", "sent"),
    db
      .from("posts")
      .select(
        "id, platform, post_url, posted_at, assignments!inner(company_id, base_paid_cents, view_paid_cents, music_approved_at, profiles!assignments_creator_id_fkey(full_name), briefs(title, format)), post_metrics(views)",
      )
      .eq("assignments.company_id", companyId)
      .eq("status", "posted")
      .order("posted_at", { ascending: false })
      .limit(50),
  ]);
  const failed = [company, billing, wallets, payouts, posts].find((r) => r.error);
  if (failed?.error) return { error: failed.error.message };

  const paidBy = new Map<string, number>();
  for (const p of payouts.data ?? []) {
    paidBy.set(p.creator_id, (paidBy.get(p.creator_id) ?? 0) + p.amount_cents);
  }

  type Joined<T> = T | T[] | null;
  const one = <T,>(v: Joined<T>): T | null => (Array.isArray(v) ? (v[0] ?? null) : v);

  return {
    on: company.data?.payout_test_mode === true,
    creditCents: billing.data?.credit_balance_cents ?? 0,
    creators: (wallets.data ?? []).map((w) => ({
      id: w.creator_id,
      name: one(w.profiles as Joined<{ full_name: string | null }>)?.full_name ?? "Creator",
      payoutReady: w.payout_ready === true,
      availableCents: w.available_cents,
      pendingCents: w.pending_cents,
      paidOutCents: paidBy.get(w.creator_id) ?? 0,
    })),
    posts: (posts.data ?? []).map((p) => {
      const a = one(
        p.assignments as Joined<{
          base_paid_cents: number;
          view_paid_cents: number;
          music_approved_at: string | null;
          profiles: Joined<{ full_name: string | null }>;
          briefs: Joined<{ title: string | null; format: string | null }>;
        }>,
      );
      const brief = one(a?.briefs ?? null);
      const isStatic = brief?.format === "photo_carousel";
      const metrics = (p.post_metrics ?? []) as Array<{ views: number | null }>;
      return {
        id: p.id,
        platform: p.platform,
        url: p.post_url,
        postedAt: p.posted_at,
        creator: one(a?.profiles ?? null)?.full_name ?? "Creator",
        title: brief?.title ?? "Post",
        format: isStatic ? "static" : "video",
        views: metrics.reduce((m, r) => Math.max(m, Number(r.views ?? 0)), 0),
        earnedCents: (a?.base_paid_cents ?? 0) + (a?.view_paid_cents ?? 0),
        awaitingMusic: isStatic && !a?.music_approved_at,
      };
    }),
  };
}

/** Turning test mode on also simulates the company's own billing page
    (company_billing.billing_simulated), so its admin can pick a plan and add
    credits without a card. */
export async function setTestMode(input: { companyId: string; on: boolean }): Promise<TestActionResult> {
  const denied = await requirePlatformAdmin();
  if (denied) return { ok: false, error: denied };
  const db = createServiceClient();
  const { error } = await db
    .from("companies")
    .update({ payout_test_mode: input.on })
    .eq("id", input.companyId);
  if (error) return { ok: false, error: error.message };
  const { error: billingError } = await db
    .from("company_billing")
    .upsert(
      { company_id: input.companyId, billing_simulated: input.on, updated_at: new Date().toISOString() },
      { onConflict: "company_id" },
    );
  if (billingError) return { ok: false, error: billingError.message };
  done(input.companyId);
  return { ok: true };
}

export async function grantTestCredits(input: { companyId: string; dollars: number }): Promise<TestActionResult> {
  const denied = await requirePlatformAdmin();
  if (denied) return { ok: false, error: denied };
  const cents = Math.round(input.dollars * 100);
  if (!Number.isFinite(cents) || cents <= 0) return { ok: false, error: "Enter an amount above $0." };
  const db = createServiceClient();
  const { error } = await db.rpc("ops_grant_test_credits", { p_company: input.companyId, p_cents: cents });
  if (error) return { ok: false, error: error.message };
  done(input.companyId);
  return { ok: true };
}

export async function simulateViews(input: { companyId: string; postId: string; views: number }): Promise<TestActionResult> {
  const denied = await requirePlatformAdmin();
  if (denied) return { ok: false, error: denied };
  const views = Math.floor(input.views);
  if (!Number.isFinite(views) || views < 0) return { ok: false, error: "Enter a view count." };
  const db = createServiceClient();
  const { data, error } = await db.rpc("ops_simulate_post_views", { p_post: input.postId, p_views: views });
  if (error) return { ok: false, error: error.message };
  const r = (data ?? {}) as { reason?: string | null; paid_base_cents?: number; paid_view_cents?: number };
  done(input.companyId);
  if (r.reason === "insufficient_credits") {
    return { ok: false, error: "Views saved, but the company is out of credits. Add credits and set the views again." };
  }
  if (r.reason === "awaiting_music_approval") {
    return { ok: false, error: "Views saved. A static post pays once its music is approved." };
  }
  const paid = (r.paid_base_cents ?? 0) + (r.paid_view_cents ?? 0);
  return { ok: true, message: paid > 0 ? `Paid the creator $${(paid / 100).toFixed(2)} more.` : "Views saved. Nothing new to pay." };
}

export async function payOutNow(input: { companyId: string }): Promise<TestActionResult> {
  const denied = await requirePlatformAdmin();
  if (denied) return { ok: false, error: denied };
  const { data, error } = await callEdgeFunction<{
    results?: Array<{ creators_paid?: number; sent_cents?: number; rejected?: string[]; skipped?: string[] | boolean; reason?: string }>;
  }>("mercury-weekly-payouts", { company_id: input.companyId });
  if (error !== null) return { ok: false, error };
  const r = data.results?.[0];
  done(input.companyId);
  if (!r) return { ok: true, message: "No creator has a balance and payouts set up." };
  if (r.reason) return { ok: false, error: r.reason };
  if (r.rejected?.length) return { ok: false, error: r.rejected.join("; ") };
  const n = r.creators_paid ?? 0;
  return {
    ok: true,
    message: n
      ? `Paid out $${((r.sent_cents ?? 0) / 100).toFixed(2)} to ${n} creator${n === 1 ? "" : "s"} (test, no money moved).`
      : "No creator has a balance and payouts set up.",
  };
}
