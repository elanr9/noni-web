"use server";

import { canManageCampaigns, getSessionProfile, isPlatformAdmin } from "@/lib/auth";
import { callEdgeFunction } from "@/lib/edge";
import {
  normalizeCreator,
  type CreatorFilters,
  type CreatorSort,
  type Listing,
  type ListingPatch,
  type MarketCreator,
  type MarketData,
  type MarketPage,
  type MarketScope,
} from "@/lib/manager/market";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";

/* Market tab. The database functions check the caller manages the active
   company (migration 155), so every call runs as the signed-in user. */

type Result<T> = { ok: true; data: T } | { ok: false; error: string };

async function gate(): Promise<{ ok: true; companyId: string } | { ok: false; error: string }> {
  const { profile } = await getSessionProfile();
  const companyId = profile?.active_company_id;
  if (!companyId || !(canManageCampaigns(profile) || isPlatformAdmin(profile))) {
    return { ok: false, error: "Managers only." };
  }
  return { ok: true, companyId };
}

function plain(message: string): string {
  if (/managers only/i.test(message)) return "Managers only.";
  return message.replace(/^.*?ERROR:\s*/i, "");
}

/* Signed photo URLs for a page of creators; a missing photo falls back to initials. */
async function withPhotos(rows: MarketCreator[]): Promise<MarketCreator[]> {
  const paths = [...new Set(rows.map((r) => r.avatar_path).filter((p): p is string => !!p))];
  if (paths.length === 0) return rows;
  const { data } = await createServiceClient().storage.from("avatars").createSignedUrls(paths, 3600);
  const map = new Map<string, string>();
  for (const e of data ?? []) if (e.path && e.signedUrl) map.set(e.path, e.signedUrl);
  return rows.map((r) => ({ ...r, photo: r.avatar_path ? map.get(r.avatar_path) ?? null : null }));
}

export type CreatorQuery = {
  listingId: string | null;
  scope: MarketScope;
  search?: string;
  filters?: CreatorFilters;
  sort?: CreatorSort;
  limit?: number;
  offset?: number;
};

async function queryCreators(q: CreatorQuery): Promise<MarketPage> {
  const supabase = await createClient();
  const f = q.filters;
  const { data, error } = await supabase.rpc("marketplace_creators" as never, {
    p_listing_id: q.listingId,
    p_scope: q.scope,
    p_search: q.search?.trim() || null,
    p_niches: f && f.niches.length > 0 ? f.niches : null,
    p_gender: f?.gender ?? null,
    p_min_age: f?.minAge ?? null,
    p_max_age: f?.maxAge ?? null,
    p_min_views: f?.minViews ?? null,
    p_min_earned_cents: f?.minEarnedCents ?? null,
    p_min_followers: f?.minFollowers ?? null,
    p_experience: f?.experience ?? null,
    p_sort: q.sort ?? "match",
    p_limit: q.limit ?? 120,
    p_offset: q.offset ?? 0,
  } as never);
  if (error) throw new Error(plain(error.message));
  const out = (data ?? { total: 0, rows: [] }) as unknown as MarketPage;
  return { total: Number(out.total) || 0, rows: await withPhotos((out.rows ?? []).map(normalizeCreator)) };
}

async function countScope(listingId: string | null, scope: MarketScope): Promise<number> {
  if (!listingId) return 0;
  return (await queryCreators({ listingId, scope, limit: 1 })).total;
}

/** Everything the tab opens with. */
export async function loadMarket(): Promise<Result<MarketData>> {
  const g = await gate();
  if (!g.ok) return g;
  try {
    const supabase = await createClient();
    const [{ data: listings, error }, { data: company }] = await Promise.all([
      supabase
        .from("marketplace_listings" as never)
        .select("*")
        .eq("company_id", g.companyId)
        .order("created_at", { ascending: true }),
      createServiceClient().from("companies").select("name").eq("id", g.companyId).maybeSingle(),
    ]);
    if (error) throw new Error(error.message);
    const listing = ((listings ?? []) as unknown as Listing[])[0] ?? null;
    const [applicantCount, invitedCount, creators] = await Promise.all([
      countScope(listing?.id ?? null, "applicants"),
      countScope(listing?.id ?? null, "invited"),
      queryCreators({ listingId: listing?.id ?? null, scope: listing ? "applicants" : "all" }),
    ]);
    return {
      ok: true,
      data: {
        companyName: (company as { name?: string } | null)?.name ?? "Your company",
        listing,
        applicantCount,
        invitedCount,
        creators,
      },
    };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Could not load." };
  }
}

export async function loadCreators(q: CreatorQuery): Promise<Result<MarketPage>> {
  const g = await gate();
  if (!g.ok) return g;
  try {
    return { ok: true, data: await queryCreators(q) };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Could not load creators." };
  }
}

export async function saveListing(id: string | null, patch: ListingPatch): Promise<Result<Listing>> {
  const g = await gate();
  if (!g.ok) return g;
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("save_marketplace_listing" as never, { p_id: id, p_patch: patch } as never);
  if (error) return { ok: false, error: plain(error.message) };
  return { ok: true, data: data as unknown as Listing };
}

export async function inviteCreator(listingId: string, creatorId: string, message: string): Promise<Result<null>> {
  const g = await gate();
  if (!g.ok) return g;
  const supabase = await createClient();
  const { error } = await supabase.rpc("invite_creator_to_listing" as never, {
    p_listing_id: listingId,
    p_creator_id: creatorId,
    p_message: message.trim() || null,
  } as never);
  if (error) return { ok: false, error: plain(error.message) };
  return { ok: true, data: null };
}

export async function decideApplication(applicationId: string, accept: boolean): Promise<Result<{ status: string; start_date: string | null }>> {
  const g = await gate();
  if (!g.ok) return g;
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("decide_marketplace_application" as never, {
    p_id: applicationId,
    p_accept: accept,
    p_note: null,
    p_start_date: null,
  } as never);
  if (error) return { ok: false, error: plain(error.message) };
  return { ok: true, data: data as unknown as { status: string; start_date: string | null } };
}

/** The agreement exactly as this creator signed it. */
export async function loadSignedContract(applicationId: string): Promise<Result<{ title: string | null; body: string | null; signedName: string | null; signedAt: string | null }>> {
  const g = await gate();
  if (!g.ok) return g;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("marketplace_applications" as never)
    .select("contract_title, contract_body, signed_name, signed_at")
    .eq("id", applicationId)
    .maybeSingle();
  if (error) return { ok: false, error: error.message };
  const r = data as { contract_title: string | null; contract_body: string | null; signed_name: string | null; signed_at: string | null } | null;
  if (!r) return { ok: false, error: "Not found." };
  return { ok: true, data: { title: r.contract_title, body: r.contract_body, signedName: r.signed_name, signedAt: r.signed_at } };
}

/** AI reads every listed creator against the campaign and saves a score. */
export async function rankWithAi(listingId: string): Promise<Result<number>> {
  const g = await gate();
  if (!g.ok) return g;
  const r = await callEdgeFunction<{ ranked?: number; error?: string }>("marketplace-match", { listing_id: listingId });
  if (r.error !== null) return { ok: false, error: r.error };
  if (r.data?.error) return { ok: false, error: r.data.error };
  return { ok: true, data: r.data?.ranked ?? 0 };
}
