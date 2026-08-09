import { createClient } from "@/lib/supabase/server";

export default async function CreatorsPage() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name, role, phone, onboarded, created_at")
    .eq("role", "creator")
    .order("created_at", { ascending: false })
    .limit(100);

  const rows = data ?? [];

  return (
    <div>
      <h1 className="display text-3xl font-semibold text-ink md:text-4xl">Creators</h1>
      <p className="mt-1 text-[15px] text-muted">Everyone on your roster.</p>

      {error ? (
        <div className="mt-8 rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
          {error.message}
        </div>
      ) : (
        <div className="mt-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {rows.map((row) => (
            <article
              key={row.id}
              className="rounded-2xl border border-line bg-white p-5 shadow-[0_8px_24px_rgba(15,23,32,0.03)]"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-accent-soft text-sm font-bold text-accent-deep">
                {(row.full_name ?? "?").slice(0, 1).toUpperCase()}
              </div>
              <h2 className="mt-4 text-lg font-bold text-ink">
                {row.full_name ?? "Unnamed creator"}
              </h2>
              <p className="mt-1 text-sm text-muted">
                {row.phone ?? "No phone"} · {row.onboarded ? "Onboarded" : "Pending"}
              </p>
            </article>
          ))}
          {rows.length === 0 ? (
            <div className="col-span-full rounded-[28px] border border-dashed border-line bg-white p-12 text-center text-muted">
              No creators yet.
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
