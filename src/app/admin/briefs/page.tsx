import { createClient } from "@/lib/supabase/server";

export default async function BriefsPage() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("briefs")
    .select("id, title, format, archived_at, created_at")
    .order("created_at", { ascending: false })
    .limit(50);

  const rows = data ?? [];

  return (
    <div>
      <h1 className="display text-3xl font-semibold text-ink md:text-4xl">Briefs</h1>
      <p className="mt-1 text-[15px] text-muted">Campaign briefs across your company.</p>

      {error ? (
        <div className="mt-8 rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
          {error.message}
        </div>
      ) : (
        <div className="mt-8 overflow-hidden rounded-[24px] border border-line bg-white">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-line bg-soft/80 text-xs uppercase tracking-[0.12em] text-muted">
              <tr>
                <th className="px-5 py-3 font-semibold">Title</th>
                <th className="px-5 py-3 font-semibold">Format</th>
                <th className="px-5 py-3 font-semibold">State</th>
                <th className="hidden px-5 py-3 font-semibold md:table-cell">Created</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id} className="border-b border-line last:border-0">
                  <td className="px-5 py-4 font-semibold text-ink">{row.title ?? "—"}</td>
                  <td className="px-5 py-4 text-muted">{row.format ?? "—"}</td>
                  <td className="px-5 py-4 text-muted">
                    {row.archived_at ? "Archived" : "Active"}
                  </td>
                  <td className="hidden px-5 py-4 text-muted md:table-cell">
                    {row.created_at
                      ? new Date(row.created_at).toLocaleDateString()
                      : "—"}
                  </td>
                </tr>
              ))}
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-5 py-12 text-center text-muted">
                    No briefs yet.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
