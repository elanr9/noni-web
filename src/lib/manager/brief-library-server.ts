import type { Brief, BriefKind, BriefType } from "@/lib/manager/brief-library";
import { createServiceClient } from "@/lib/supabase/service";

/* Server reads for the Briefs library. Callers pass the session company. */

type Row = {
  id: string;
  kind: string;
  type: string;
  title: string;
  notes: string | null;
  link: string | null;
  from_id: string | null;
  audio: unknown;
  clips: unknown;
  g: unknown;
  lt: unknown;
  caption: string | null;
  tags: string[] | null;
  updated_at: string;
};

function rowToBrief(r: Row, uses: number): Brief {
  return {
    id: r.id,
    type: r.type as BriefType,
    kind: r.kind as BriefKind,
    title: r.title,
    notes: r.notes ?? "",
    link: r.link ?? "",
    ts: new Date(r.updated_at).getTime(),
    audio: (r.audio as Brief["audio"]) ?? null,
    clips: (r.clips as Brief["clips"]) ?? null,
    g: (r.g as Brief["g"]) ?? null,
    lt: (r.lt as Brief["lt"]) ?? null,
    from: r.from_id,
    caption: r.caption ?? "",
    tags: r.tags ?? [],
    uses,
  };
}

/** Every saved brief, newest first, with how many posts each has made. */
export async function loadBriefLibrary(companyId: string): Promise<Brief[]> {
  const db = createServiceClient();
  const [{ data: rows }, { data: posts }] = await Promise.all([
    db.from("library_briefs").select("*").eq("company_id", companyId).order("updated_at", { ascending: false }),
    db
      .from("assignments")
      .select("library_brief_id")
      .eq("company_id", companyId)
      .not("library_brief_id", "is", null)
      .in("status", ["submitted", "approved", "posted"]),
  ]);
  const uses = new Map<string, number>();
  for (const p of (posts ?? []) as { library_brief_id: string | null }[]) {
    if (p.library_brief_id) uses.set(p.library_brief_id, (uses.get(p.library_brief_id) ?? 0) + 1);
  }
  return ((rows ?? []) as unknown as Row[]).map((r) => rowToBrief(r, uses.get(r.id) ?? 0));
}

