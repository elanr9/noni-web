import Link from "next/link";
import { JoinCode } from "@/components/ops/JoinCode";
import { NewCompanyForm } from "@/components/ops/NewCompanyForm";
import { createClient } from "@/lib/supabase/server";

type CompanyRow = {
  id: string;
  name: string;
  slug: string;
  join_code: string;
  created_at: string;
};

type RosterRow = {
  company_id: string | null;
  role: string | null;
};

export default async function OpsCompaniesPage() {
  const supabase = await createClient();

  const [{ data: companies, error }, { data: roster }] = await Promise.all([
    supabase
      .from("companies")
      .select("id, name, slug, join_code, created_at")
      .order("created_at", { ascending: false }),
    supabase
      .from("profiles")
      .select("company_id, role")
      .in("role", ["campaign_manager", "creator"]),
  ]);

  const rows = (companies ?? []) as CompanyRow[];
  const counts = new Map<string, { managers: number; creators: number }>();
  for (const p of (roster ?? []) as RosterRow[]) {
    if (!p.company_id) continue;
    const entry = counts.get(p.company_id) ?? { managers: 0, creators: 0 };
    if (p.role === "campaign_manager") entry.managers += 1;
    if (p.role === "creator") entry.creators += 1;
    counts.set(p.company_id, entry);
  }

  return (
    <div>
      <h1 className="display text-3xl font-semibold text-ink md:text-4xl">Companies</h1>
      <p className="mt-1 text-[15px] text-muted">Every brand on the platform.</p>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
        <div>
          {error ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
              {error.message}
            </div>
          ) : rows.length === 0 ? (
            <div className="rounded-[28px] border border-dashed border-line bg-white p-12 text-center text-muted">
              No companies yet. Create the first one.
            </div>
          ) : (
            <div className="grid gap-3">
              {rows.map((company) => {
                const count = counts.get(company.id) ?? { managers: 0, creators: 0 };
                return (
                  <Link
                    key={company.id}
                    href={`/ops/companies/${company.id}`}
                    className="rounded-2xl border border-line bg-white p-5 shadow-[0_8px_24px_rgba(15,23,32,0.03)] transition hover:border-ink/15"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <h2 className="text-lg font-bold text-ink">{company.name}</h2>
                        <p className="mt-1 text-sm text-muted">
                          {company.slug} · joined{" "}
                          {new Date(company.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <span className="rounded-full bg-soft px-3 py-1 text-xs font-bold uppercase tracking-wide text-ink-soft">
                        {count.managers} managers · {count.creators} creators
                      </span>
                    </div>
                    <div className="mt-3">
                      <JoinCode code={company.join_code} />
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        <div className="h-fit rounded-[28px] border border-line bg-white p-6 shadow-[0_8px_24px_rgba(15,23,32,0.03)]">
          <h2 className="display text-xl font-semibold text-ink">New company</h2>
          <p className="mt-1 text-sm text-muted">
            Creates the company, then invite a campaign manager from its page.
          </p>
          <div className="mt-5">
            <NewCompanyForm />
          </div>
        </div>
      </div>
    </div>
  );
}
