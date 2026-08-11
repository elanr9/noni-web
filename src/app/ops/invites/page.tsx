import { ResendButton } from "@/components/ops/ResendButton";
import { createClient } from "@/lib/supabase/server";

type InviteRow = {
  id: string;
  email: string;
  created_at: string;
  expires_at: string;
  accepted_at: string | null;
  companies: { name: string | null } | null;
};

type InviteStatus = "pending" | "accepted" | "expired";

function statusOf(invite: InviteRow): InviteStatus {
  if (invite.accepted_at) return "accepted";
  if (new Date(invite.expires_at).getTime() < Date.now()) return "expired";
  return "pending";
}

const STATUS_STYLE: Record<InviteStatus, string> = {
  pending: "bg-accent-soft text-accent-deep",
  accepted: "bg-[#E4F5EC] text-[#1F8F5F]",
  expired: "bg-soft text-muted",
};

export default async function OpsInvitesPage() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("company_invites")
    .select(
      "id, email, created_at, expires_at, accepted_at, companies:company_id ( name )",
    )
    .order("created_at", { ascending: false });

  const rows = (data ?? []) as unknown as InviteRow[];

  return (
    <div>
      <h1 className="display text-3xl font-semibold text-ink md:text-4xl">Invites</h1>
      <p className="mt-1 text-[15px] text-muted">
        Every campaign manager invite across the platform.
      </p>

      {error ? (
        <div className="mt-8 rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
          {error.message}
        </div>
      ) : rows.length === 0 ? (
        <div className="mt-10 rounded-[28px] border border-dashed border-line bg-white p-12 text-center text-muted">
          No invites yet. Send one from a company page.
        </div>
      ) : (
        <div className="mt-8 grid gap-3">
          {rows.map((invite) => {
            const status = statusOf(invite);
            return (
              <article
                key={invite.id}
                className="rounded-2xl border border-line bg-white p-5 shadow-[0_8px_24px_rgba(15,23,32,0.03)]"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-bold text-ink">{invite.email}</h2>
                    <p className="mt-1 text-sm text-muted">
                      {invite.companies?.name ?? "Unknown company"} · sent{" "}
                      {new Date(invite.created_at).toLocaleDateString()} ·{" "}
                      {status === "accepted"
                        ? `accepted ${new Date(invite.accepted_at!).toLocaleDateString()}`
                        : `expires ${new Date(invite.expires_at).toLocaleDateString()}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide ${STATUS_STYLE[status]}`}
                    >
                      {status}
                    </span>
                    {status !== "accepted" ? (
                      <ResendButton inviteId={invite.id} />
                    ) : null}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
