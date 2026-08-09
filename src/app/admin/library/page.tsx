import { createClient } from "@/lib/supabase/server";

export default async function LibraryPage() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("assignments")
    .select(
      "id, status, scheduled_date, briefs:brief_id ( title, format ), profiles:creator_id ( full_name )",
    )
    .in("status", ["approved", "posted", "scheduled"])
    .order("created_at", { ascending: false })
    .limit(60);

  const rows = (data ?? []) as unknown as Array<{
    id: string;
    status: string;
    scheduled_date: string | null;
    briefs: { title: string | null; format: string | null } | null;
    profiles: { full_name: string | null } | null;
  }>;

  return (
    <div>
      <h1 className="display text-3xl font-semibold text-ink md:text-4xl">Library</h1>
      <p className="mt-1 text-[15px] text-muted">Approved and posted work.</p>

      {error ? (
        <div className="mt-8 rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
          {error.message}
        </div>
      ) : (
        <div className="mt-8 grid gap-3 md:grid-cols-2">
          {rows.map((row) => (
            <article
              key={row.id}
              className="rounded-2xl border border-line bg-white p-5"
            >
              <div className="text-xs font-bold uppercase tracking-[0.12em] text-accent-deep">
                {row.status}
              </div>
              <h2 className="mt-2 text-lg font-bold text-ink">
                {row.briefs?.title ?? "Untitled"}
              </h2>
              <p className="mt-1 text-sm text-muted">
                {row.profiles?.full_name ?? "Creator"} · {row.briefs?.format ?? "content"}
                {row.scheduled_date
                  ? ` · ${new Date(row.scheduled_date).toLocaleDateString()}`
                  : ""}
              </p>
            </article>
          ))}
          {rows.length === 0 ? (
            <div className="col-span-full rounded-[28px] border border-dashed border-line bg-white p-12 text-center text-muted">
              Library is empty.
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
