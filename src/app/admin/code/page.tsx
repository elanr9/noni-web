import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getSessionProfile, isCompanyAdmin, isPlatformAdmin } from "@/lib/auth";
import { CodePanel } from "./CodePanel";

export const metadata = { title: "Company code · Noni" };

type CreatorRow = {
  id: string;
  full_name: string | null;
  created_at: string;
};

export default async function CompanyCodePage() {
  const { userId, profile } = await getSessionProfile();
  if (!userId) redirect("/login?next=/admin/code");
  if (!isCompanyAdmin(profile) && !isPlatformAdmin(profile)) redirect("/admin");

  const supabase = await createClient();
  const [{ data: company }, { data: creators }] = await Promise.all([
    supabase
      .from("companies")
      .select("join_code")
      .eq("id", profile!.company_id!)
      .maybeSingle(),
    supabase
      .from("profiles")
      .select("id, full_name, created_at")
      .eq("company_id", profile!.company_id!)
      .eq("role", "creator")
      .order("created_at", { ascending: false }),
  ]);

  const joined = (creators ?? []) as CreatorRow[];

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="display text-3xl font-semibold text-ink">Company code</h1>
      <p className="mt-1 text-[15px] text-muted">
        The six character code creators use to join your company from the app.
      </p>

      <div className="mt-6">
        <CodePanel initialCode={company?.join_code ?? "——————"} />
      </div>

      <section className="mt-10">
        <h2 className="display text-xl font-semibold text-ink">
          Creators who joined with it
        </h2>
        {joined.length === 0 ? (
          <p className="mt-3 text-[14px] text-muted">
            No creators yet. Share the code and they will show up here.
          </p>
        ) : (
          <div className="mt-3 divide-y divide-line rounded-2xl border border-line bg-white">
            {joined.map((creator) => (
              <div
                key={creator.id}
                className="flex items-center justify-between px-5 py-3.5"
              >
                <div className="text-[14px] font-semibold text-ink">
                  {creator.full_name ?? "Unnamed creator"}
                </div>
                <div className="text-[12px] text-muted">
                  joined {new Date(creator.created_at).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
