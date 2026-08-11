import { notFound } from "next/navigation";
import { InviteForm } from "@/components/ops/InviteForm";
import { JoinCode } from "@/components/ops/JoinCode";
import { createClient } from "@/lib/supabase/server";
import type { CompanyInvite } from "@/lib/edge";

type PageProps = {
  params: Promise<{ id: string }>;
};

type ManagerRow = {
  id: string;
  full_name: string | null;
  onboarded: boolean | null;
  created_at: string;
};

export default async function OpsCompanyDetailPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: company } = await supabase
    .from("companies")
    .select("id, name, slug, website, join_code, created_at")
    .eq("id", id)
    .maybeSingle();

  if (!company) notFound();

  const nowIso = new Date().toISOString();
  const [{ data: managers }, { count: creatorCount }, { data: invites }] =
    await Promise.all([
      supabase
        .from("profiles")
        .select("id, full_name, onboarded, created_at")
        .eq("company_id", id)
        .eq("role", "campaign_manager")
        .order("created_at", { ascending: true }),
      supabase
        .from("profiles")
        .select("id", { count: "exact", head: true })
        .eq("company_id", id)
        .eq("role", "creator"),
      supabase
        .from("company_invites")
        .select("id, company_id, email, token, expires_at, created_at, accepted_at")
        .eq("company_id", id)
        .is("accepted_at", null)
        .gt("expires_at", nowIso)
        .order("created_at", { ascending: false }),
    ]);

  const managerRows = (managers ?? []) as ManagerRow[];
  const pendingInvites = (invites ?? []) as CompanyInvite[];

  return (
    <div>
      <h1 className="display text-3xl font-semibold text-ink md:text-4xl">
        {company.name}
      </h1>
      <p className="mt-1 text-[15px] text-muted">
        {company.slug}
        {company.website ? <> · {company.website}</> : null} · joined{" "}
        {new Date(company.created_at).toLocaleDateString()}
      </p>

      <div className="mt-6 flex flex-wrap gap-3">
        <span className="rounded-full bg-soft px-4 py-2 text-sm font-bold text-ink-soft">
          {managerRows.length} campaign{" "}
          {managerRows.length === 1 ? "manager" : "managers"}
        </span>
        <span className="rounded-full bg-soft px-4 py-2 text-sm font-bold text-ink-soft">
          {creatorCount ?? 0} {creatorCount === 1 ? "creator" : "creators"}
        </span>
      </div>

      <div className="mt-6 rounded-2xl border border-line bg-white p-5 shadow-[0_8px_24px_rgba(15,23,32,0.03)]">
        <h2 className="text-sm font-bold uppercase tracking-wide text-ink-soft">
          Creator join code
        </h2>
        <p className="mt-1 text-sm text-muted">
          Creators enter this code in the app during onboarding to join{" "}
          {company.name}.
        </p>
        <div className="mt-3">
          <JoinCode
            companyId={company.id}
            code={company.join_code}
            canRegenerate
          />
        </div>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
        <div className="space-y-8">
          <section>
            <h2 className="display text-xl font-semibold text-ink">
              Campaign managers
            </h2>
            {managerRows.length === 0 ? (
              <div className="mt-4 rounded-[28px] border border-dashed border-line bg-white p-10 text-center text-muted">
                No campaign managers yet. Send an invite.
              </div>
            ) : (
              <div className="mt-4 grid gap-3">
                {managerRows.map((manager) => (
                  <article
                    key={manager.id}
                    className="rounded-2xl border border-line bg-white p-5 shadow-[0_8px_24px_rgba(15,23,32,0.03)]"
                  >
                    <h3 className="text-lg font-bold text-ink">
                      {manager.full_name ?? "Unnamed manager"}
                    </h3>
                    <p className="mt-1 text-sm text-muted">
                      {manager.onboarded ? "Onboarded" : "Pending"} · joined{" "}
                      {new Date(manager.created_at).toLocaleDateString()}
                    </p>
                  </article>
                ))}
              </div>
            )}
          </section>

          <section>
            <h2 className="display text-xl font-semibold text-ink">Pending invites</h2>
            {pendingInvites.length === 0 ? (
              <div className="mt-4 rounded-[28px] border border-dashed border-line bg-white p-10 text-center text-muted">
                No pending invites.
              </div>
            ) : (
              <div className="mt-4 grid gap-3">
                {pendingInvites.map((invite) => (
                  <article
                    key={invite.id}
                    className="rounded-2xl border border-line bg-white p-5 shadow-[0_8px_24px_rgba(15,23,32,0.03)]"
                  >
                    <h3 className="text-lg font-bold text-ink">{invite.email}</h3>
                    <p className="mt-1 text-sm text-muted">
                      Sent {new Date(invite.created_at).toLocaleDateString()} · expires{" "}
                      {new Date(invite.expires_at).toLocaleDateString()}
                    </p>
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>

        <div className="h-fit rounded-[28px] border border-line bg-white p-6 shadow-[0_8px_24px_rgba(15,23,32,0.03)]">
          <h2 className="display text-xl font-semibold text-ink">
            Invite campaign manager
          </h2>
          <p className="mt-1 text-sm text-muted">
            They get an email with a link to accept and take over this company.
          </p>
          <div className="mt-5">
            <InviteForm companyId={company.id} />
          </div>
        </div>
      </div>
    </div>
  );
}
