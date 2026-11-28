import Link from "next/link";
import { createServiceClient } from "@/lib/supabase/service";
import { resolveReport } from "./actions";

export const dynamic = "force-dynamic";

type Report = {
  id: string;
  kind: string;
  reason: string;
  excerpt: string | null;
  status: "open" | "actioned" | "dismissed";
  created_at: string;
  reporter_id: string | null;
  target_user_id: string | null;
  company_id: string | null;
};

const KIND: Record<string, string> = {
  message: "Message",
  manager_message: "Team message",
  marketplace_message: "Campaign message",
  listing: "Campaign",
  creator: "Creator profile",
};

/* Content people reported in the app (App Store guideline 1.2), open first.
   Each one is answered within 24 hours. The ops layout already limits /ops to
   the platform admin; the action checks again. */
export default async function OpsReportsPage() {
  const db = createServiceClient();
  const { data } = await db
    .from("content_reports")
    .select("id, kind, reason, excerpt, status, created_at, reporter_id, target_user_id, company_id")
    .order("created_at", { ascending: false })
    .limit(300);
  const reports = ((data ?? []) as Report[]).sort(
    (a, b) => Number(b.status === "open") - Number(a.status === "open"),
  );

  const userIds = [...new Set(reports.flatMap((r) => [r.reporter_id, r.target_user_id]).filter((v): v is string => !!v))];
  const companyIds = [...new Set(reports.map((r) => r.company_id).filter((v): v is string => !!v))];
  const [people, companies] = await Promise.all([
    userIds.length ? db.from("profiles").select("id, full_name").in("id", userIds) : Promise.resolve({ data: [] }),
    companyIds.length ? db.from("companies").select("id, name").in("id", companyIds) : Promise.resolve({ data: [] }),
  ]);
  const personName = new Map((people.data ?? []).map((p) => [p.id as string, (p.full_name as string | null) || "No name"]));
  const companyName = new Map((companies.data ?? []).map((c) => [c.id as string, c.name as string]));

  return (
    <div className="mx-auto max-w-4xl px-5 py-8">
      <h1 className="display text-3xl font-semibold text-ink">Reports</h1>
      {reports.length === 0 ? (
        <p className="mt-6 text-[15px] text-muted">No reports.</p>
      ) : (
        <ul className="mt-6 space-y-3">
          {reports.map((r) => (
            <li key={r.id} className="rounded-[20px] border border-line bg-white p-5">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
                <span className="font-bold text-ink">{KIND[r.kind] ?? r.kind}</span>
                <span className="text-muted">{r.reason}</span>
                <span className="text-muted">{new Date(r.created_at).toLocaleString("en-US")}</span>
                <span className={r.status === "open" ? "font-bold text-accent-deep" : "text-muted"}>{r.status}</span>
              </div>
              {r.excerpt ? <p className="mt-3 text-[15px] text-ink">{r.excerpt}</p> : null}
              <p className="mt-3 text-sm text-muted">
                {"About "}
                {r.target_user_id ? (
                  <Link className="font-semibold text-ink underline" href={`/ops/users/${r.target_user_id}`}>
                    {personName.get(r.target_user_id) ?? "Deleted account"}
                  </Link>
                ) : (
                  "nobody on record"
                )}
                {r.company_id ? (
                  <>
                    {" at "}
                    <Link className="font-semibold text-ink underline" href={`/ops/companies/${r.company_id}`}>
                      {companyName.get(r.company_id) ?? "Deleted company"}
                    </Link>
                  </>
                ) : null}
                {". Reported by "}
                {r.reporter_id ? (
                  <Link className="font-semibold text-ink underline" href={`/ops/users/${r.reporter_id}`}>
                    {personName.get(r.reporter_id) ?? "Deleted account"}
                  </Link>
                ) : (
                  "a deleted account"
                )}
                .
              </p>
              {r.status === "open" ? (
                <form action={resolveReport} className="mt-4 flex gap-2">
                  <input type="hidden" name="id" value={r.id} />
                  <button name="status" value="actioned" className="rounded-full bg-ink px-4 py-2 text-sm font-bold text-white">
                    Removed
                  </button>
                  <button name="status" value="dismissed" className="rounded-full border border-line px-4 py-2 text-sm font-bold text-ink">
                    Dismiss
                  </button>
                </form>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
