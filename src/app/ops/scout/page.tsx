import { OpsScoutList, type OpsScoutRow } from "@/components/scout/OpsScoutList";
import { createServiceClient } from "@/lib/supabase/service";

export const dynamic = "force-dynamic";

/* Every company with what Scout has found for it. */
export default async function OpsScoutPage() {
  const db = createServiceClient();
  const [{ data: companies }, { data: creators }, { data: runs }] = await Promise.all([
    db.from("companies").select("id, name, website").order("created_at", { ascending: false }),
    db.from("scout_creators").select("company_id, status").limit(50000),
    db.from("scout_runs").select("company_id, status, created_at").order("created_at", { ascending: false }).limit(500),
  ]);
  const rows: OpsScoutRow[] = (companies ?? []).map((c) => {
    const mine = (creators ?? []).filter((x) => x.company_id === c.id);
    const last = (runs ?? []).find((r) => r.company_id === c.id);
    return {
      id: c.id as string,
      name: c.name as string,
      website: (c.website as string | null) ?? null,
      matches: mine.filter((x) => x.status === "match").length,
      contacted: mine.filter((x) => x.status === "contacted" || x.status === "replied").length,
      joined: mine.filter((x) => x.status === "joined").length,
      lastRun: last ? { status: last.status as string, at: last.created_at as string } : null,
    };
  });
  return <OpsScoutList rows={rows} />;
}
