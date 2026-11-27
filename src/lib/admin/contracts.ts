import { createServiceClient } from "@/lib/supabase/service";

/* Every creator agreement a company has: signed, or sent and waiting on the
   creator. One row per creator per campaign, newest first. Call only after
   the /admin gate; the company id comes from the signed-in admin's seat. */

export type ContractState = "signed" | "waiting" | "ended";

export interface ContractRow {
  id: string;
  creatorId: string;
  creator: string;
  campaign: string;
  state: ContractState;
  /** When it was signed, or when it was sent for the ones still waiting. */
  at: string | null;
  startDate: string | null;
}

export async function getCompanyContracts(companyId: string): Promise<ContractRow[]> {
  if (!companyId) return [];
  const supabase = createServiceClient();
  const { data } = await supabase
    .from("marketplace_applications" as never)
    .select("id, creator_id, listing_id, status, signed_at, decided_at, updated_at, start_date")
    .eq("company_id", companyId)
    .not("contract_body", "is", null)
    .order("updated_at", { ascending: false });
  const apps = (data ?? []) as unknown as {
    id: string;
    creator_id: string;
    listing_id: string;
    status: string;
    signed_at: string | null;
    decided_at: string | null;
    updated_at: string;
    start_date: string | null;
  }[];
  /* Signed ones always count; unsigned ones only while they are still open. */
  const kept = apps.filter((a) => a.signed_at || a.status === "offered" || a.status === "invited");
  if (kept.length === 0) return [];

  const [{ data: people }, { data: listings }, { data: members }] = await Promise.all([
    supabase.from("profiles").select("id, full_name").in("id", [...new Set(kept.map((a) => a.creator_id))]),
    supabase.from("marketplace_listings" as never).select("id, title").in("id", [...new Set(kept.map((a) => a.listing_id))]),
    supabase.from("company_members").select("profile_id, removed_at").eq("company_id", companyId),
  ]);
  const names = new Map((people ?? []).map((p) => [p.id as string, (p.full_name as string | null)?.trim() || "Creator"]));
  const titles = new Map(((listings ?? []) as unknown as { id: string; title: string | null }[]).map((l) => [l.id, l.title?.trim() || "Campaign"]));
  const onTeam = new Set((members ?? []).filter((m) => !m.removed_at).map((m) => m.profile_id as string));

  return kept.map((a) => ({
    id: a.id,
    creatorId: a.creator_id,
    creator: names.get(a.creator_id) ?? "Creator",
    campaign: titles.get(a.listing_id) ?? "Campaign",
    state: !a.signed_at ? "waiting" : onTeam.has(a.creator_id) ? "signed" : "ended",
    at: a.signed_at ?? a.decided_at ?? a.updated_at,
    startDate: a.start_date,
  }));
}
