import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";

export default async function OpsOverviewPage() {
  const supabase = await createClient();
  // Cross tenant tables are not readable via RLS, so counts for briefs and
  // review queue use the service role client. The layout gate has already
  // verified the platform admin before this page renders.
  const service = createServiceClient();
  const nowIso = new Date().toISOString();

  const [companies, managers, creators, pendingInvites, briefs, inReview] =
    await Promise.all([
      supabase.from("companies").select("id", { count: "exact", head: true }),
      supabase
        .from("profiles")
        .select("id", { count: "exact", head: true })
        .eq("role", "campaign_manager"),
      supabase
        .from("profiles")
        .select("id", { count: "exact", head: true })
        .eq("role", "creator"),
      supabase
        .from("company_invites")
        .select("id", { count: "exact", head: true })
        .is("accepted_at", null)
        .gt("expires_at", nowIso),
      service.from("briefs").select("id", { count: "exact", head: true }),
      service
        .from("assignments")
        .select("id", { count: "exact", head: true })
        .eq("status", "submitted"),
    ]);

  const cards = [
    { label: "Companies", value: companies.count ?? 0 },
    { label: "Campaign managers", value: managers.count ?? 0 },
    { label: "Creators", value: creators.count ?? 0 },
    { label: "Pending invites", value: pendingInvites.count ?? 0 },
    { label: "Briefs, all companies", value: briefs.count ?? 0 },
    { label: "Awaiting review, all companies", value: inReview.count ?? 0 },
  ];

  return (
    <div>
      <h1 className="display text-3xl font-semibold text-ink md:text-4xl">Overview</h1>
      <p className="mt-1 text-[15px] text-muted">
        A cross company snapshot of the Noni platform.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {cards.map((card) => (
          <div
            key={card.label}
            className="rounded-[24px] border border-line bg-white p-6 shadow-[0_8px_24px_rgba(15,23,32,0.03)]"
          >
            <div className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">
              {card.label}
            </div>
            <div className="display mt-3 text-4xl font-semibold text-ink">
              {card.value}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
