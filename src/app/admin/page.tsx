import { createClient } from "@/lib/supabase/server";

type QueueRow = {
  id: string;
  status: string;
  created_at: string;
  briefs: { title: string | null; format: string | null } | null;
  profiles: { full_name: string | null } | null;
};

export default async function AdminReviewPage() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("assignments")
    .select(
      "id, status, created_at, briefs:brief_id ( title, format ), profiles:creator_id ( full_name )",
    )
    .eq("status", "submitted")
    .order("created_at", { ascending: false })
    .limit(40);

  const rows = (data ?? []) as unknown as QueueRow[];

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="display text-3xl font-semibold text-ink md:text-4xl">Review</h1>
          <p className="mt-1 text-[15px] text-muted">
            Submitted work waiting for an approve.
          </p>
        </div>
        <div className="rounded-full bg-accent-soft px-4 py-2 text-sm font-bold text-accent-deep">
          {rows.length} in queue
        </div>
      </div>

      {error ? (
        <div className="mt-8 rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
          Could not load queue: {error.message}
        </div>
      ) : rows.length === 0 ? (
        <div className="mt-10 rounded-[28px] border border-dashed border-line bg-white p-12 text-center">
          <div className="display text-2xl font-semibold text-ink">Queue is clear</div>
          <p className="mt-2 text-muted">New submissions will land here.</p>
        </div>
      ) : (
        <div className="mt-8 grid gap-3">
          {rows.map((row) => (
            <article
              key={row.id}
              className="rounded-2xl border border-line bg-white p-5 shadow-[0_8px_24px_rgba(15,23,32,0.03)]"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-bold text-ink">
                    {row.briefs?.title ?? "Untitled brief"}
                  </h2>
                  <p className="mt-1 text-sm text-muted">
                    {row.profiles?.full_name ?? "Creator"} ·{" "}
                    {row.briefs?.format ?? "content"} ·{" "}
                    {new Date(row.created_at).toLocaleString()}
                  </p>
                </div>
                <span className="rounded-full bg-soft px-3 py-1 text-xs font-bold uppercase tracking-wide text-ink-soft">
                  {row.status}
                </span>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
