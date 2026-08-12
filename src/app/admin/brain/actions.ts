"use server";

import { revalidatePath } from "next/cache";

import { MOCK_DATASET } from "@/lib/admin/mock-data";
import type { Platform } from "@/lib/admin/types";
import { getSessionProfile, isCompanyAdmin, isPlatformAdmin } from "@/lib/auth";
import { createServiceClient } from "@/lib/supabase/service";

export type BrainActionResult = { ok: true } | { ok: false; error: string };

/* Table kinds, mirroring the read mapping in src/lib/admin/data.ts. */
const DB_KIND: Record<"product" | "audience", string> = {
  product: "product_truth",
  audience: "audience_niche",
};

/* Mock mode (dev + ADMIN_QA_MOCK=1): reads come from MOCK_DATASET, so
   mutations write it in place too, same pattern as @/lib/admin/billing. */
function mockMode(): boolean {
  return (
    process.env.NODE_ENV === "development" && process.env.ADMIN_QA_MOCK === "1"
  );
}

const MONTH_SHORT = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

function todayShort(): string {
  const d = new Date();
  return `${MONTH_SHORT[d.getMonth()]} ${d.getDate()}`;
}

type Gate =
  | { ok: true; companyId: string; mock: boolean }
  | { ok: false; error: string };

async function requireCompanyAdmin(): Promise<Gate> {
  if (mockMode()) {
    return { ok: true, companyId: MOCK_DATASET.company.id, mock: true };
  }
  const { profile } = await getSessionProfile();
  if (!isCompanyAdmin(profile) && !isPlatformAdmin(profile)) {
    return { ok: false, error: "Company admins only." };
  }
  if (!profile?.company_id) {
    return { ok: false, error: "No company on this account." };
  }
  return { ok: true, companyId: profile.company_id, mock: false };
}

export async function saveBrainDoc(input: {
  kind: "product" | "audience";
  body: string;
}): Promise<BrainActionResult> {
  const gate = await requireCompanyAdmin();
  if (!gate.ok) return { ok: false, error: gate.error };

  if (gate.mock) {
    const doc = MOCK_DATASET.brainDocs.find((d) => d.kind === input.kind);
    if (doc) {
      doc.body = input.body.trim();
      doc.updated = doc.body ? todayShort() : "";
    }
    revalidatePath("/admin", "layout");
    return { ok: true };
  }

  const supabase = createServiceClient();
  const dbKind = DB_KIND[input.kind];
  const content = input.body.trim();
  const now = new Date().toISOString();

  /* brand_docs has no guaranteed unique constraint on (company_id, kind),
     so update the existing row when there is one instead of upserting. */
  const { data, error: readError } = await supabase
    .from("brand_docs")
    .select("id")
    .eq("company_id", gate.companyId)
    .eq("kind", dbKind)
    .maybeSingle();
  if (readError) return { ok: false, error: readError.message };
  const existing = (data ?? null) as { id: string } | null;

  const { error } = existing
    ? await supabase
        .from("brand_docs")
        .update({ content, human_edited: true, updated_at: now })
        .eq("id", existing.id)
    : await supabase.from("brand_docs").insert({
        company_id: gate.companyId,
        kind: dbKind,
        content,
        human_edited: true,
        updated_at: now,
      });
  if (error) return { ok: false, error: error.message };

  /* The brain setup step, nav badge and to-do all derive from these docs. */
  revalidatePath("/admin", "layout");
  return { ok: true };
}

/* SIMULATED AI CLEANUP. The repo has no Claude/AI cleanup endpoint yet
   (searched src/lib/edge.ts and every edge function reference), so this
   stub reproduces the prototype's deterministic tidy-up: collapse
   whitespace, fix spacing before punctuation, capitalize, end with a
   period. Replace the body with the real endpoint call when it lands. */
export async function cleanUpBrainDoc(input: {
  text: string;
}): Promise<{ ok: true; text: string } | { ok: false; error: string }> {
  const gate = await requireCompanyAdmin();
  if (!gate.ok) return { ok: false, error: gate.error };

  const raw = input.text.trim();
  if (!raw) return { ok: false, error: "Nothing to clean up." };

  let t = raw.replace(/\s+/g, " ").replace(/\s+([,.!?])/g, "$1");
  t = t.charAt(0).toUpperCase() + t.slice(1);
  if (!/[.!?]$/.test(t)) t += ".";
  return { ok: true, text: t };
}

/* Handles are stored bare in some rows and @-prefixed in others; the read
   layer normalizes to @handle, so mutations match both spellings. */
function handleVariants(handle: string): string[] {
  const bare = handle.trim().replace(/^@+/, "");
  return [bare, "@" + bare];
}

export async function addInspirationAccount(input: {
  platform: Platform;
  handle: string;
}): Promise<BrainActionResult> {
  const gate = await requireCompanyAdmin();
  if (!gate.ok) return { ok: false, error: gate.error };

  const bare = input.handle.trim().replace(/^@+/, "");
  if (!bare) return { ok: false, error: "Handle is required." };

  if (gate.mock) {
    MOCK_DATASET.inspirationAccounts.push({
      platform: input.platform,
      handle: "@" + bare,
      muted: false,
    });
    revalidatePath("/admin/brain");
    return { ok: true };
  }

  const supabase = createServiceClient();
  const { error } = await supabase.from("source_accounts").insert({
    company_id: gate.companyId,
    platform: input.platform,
    handle: bare,
    kind: "reference",
    muted: false,
  });
  if (error) return { ok: false, error: error.message };

  revalidatePath("/admin/brain");
  return { ok: true };
}

export async function setInspirationAccountMuted(input: {
  platform: Platform;
  handle: string;
  muted: boolean;
}): Promise<BrainActionResult> {
  const gate = await requireCompanyAdmin();
  if (!gate.ok) return { ok: false, error: gate.error };

  if (gate.mock) {
    const wanted = new Set(handleVariants(input.handle));
    const account = MOCK_DATASET.inspirationAccounts.find(
      (a) => a.platform === input.platform && wanted.has(a.handle),
    );
    if (account) account.muted = input.muted;
    revalidatePath("/admin/brain");
    return { ok: true };
  }

  const supabase = createServiceClient();
  const { error } = await supabase
    .from("source_accounts")
    .update({ muted: input.muted })
    .eq("company_id", gate.companyId)
    .eq("platform", input.platform)
    .in("handle", handleVariants(input.handle));
  if (error) return { ok: false, error: error.message };

  revalidatePath("/admin/brain");
  return { ok: true };
}

export async function removeInspirationAccount(input: {
  platform: Platform;
  handle: string;
}): Promise<BrainActionResult> {
  const gate = await requireCompanyAdmin();
  if (!gate.ok) return { ok: false, error: gate.error };

  if (gate.mock) {
    const wanted = new Set(handleVariants(input.handle));
    const kept = MOCK_DATASET.inspirationAccounts.filter(
      (a) => a.platform !== input.platform || !wanted.has(a.handle),
    );
    MOCK_DATASET.inspirationAccounts.splice(
      0,
      MOCK_DATASET.inspirationAccounts.length,
      ...kept,
    );
    revalidatePath("/admin/brain");
    return { ok: true };
  }

  const supabase = createServiceClient();
  const { error } = await supabase
    .from("source_accounts")
    .delete()
    .eq("company_id", gate.companyId)
    .eq("platform", input.platform)
    .in("handle", handleVariants(input.handle));
  if (error) return { ok: false, error: error.message };

  revalidatePath("/admin/brain");
  return { ok: true };
}
