import { createClient } from "@/lib/supabase/server";

export default async function AnalyticsPage() {
  const supabase = await createClient();

  const [submitted, approved, creators, briefs] = await Promise.all([
    supabase
      .from("assignments")
      .select("id", { count: "exact", head: true })
      .eq("status", "submitted"),
    supabase
      .from("assignments")
      .select("id", { count: "exact", head: true })
      .in("status", ["approved", "posted", "scheduled"]),
    supabase
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .eq("role", "creator"),
    supabase.from("briefs").select("id", { count: "exact", head: true }),
  ]);

  const cards = [
    { label: "In review", value: submitted.count ?? 0 },
    { label: "Approved / posted", value: approved.count ?? 0 },
    { label: "Creators", value: creators.count ?? 0 },
    { label: "Briefs", value: briefs.count ?? 0 },
  ];

  return (
    <div>
      <h1 className="display text-3xl font-semibold text-ink md:text-4xl">Analytics</h1>
      <p className="mt-1 text-[15px] text-muted">A calm snapshot of the program.</p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <div
            key={card.label}
            className="rounded-[24px] border border-line bg-white p-6 shadow-[0_8px_24px_rgba(15,23,32,0.03)]"
          >
            <div className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">
              {card.label}
            </div>
            <div className="display mt-3 text-4xl font-semibold text-ink">{card.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
