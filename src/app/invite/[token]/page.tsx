import Link from "next/link";

import { GetTheApp } from "@/components/GetTheApp";
import { createServiceClient } from "@/lib/supabase/service";
import { AdminInviteLanding } from "./InviteAuth";

type PageProps = {
  params: Promise<{ token: string }>;
};

type InviteRow = {
  email: string;
  invited_name: string | null;
  role: string;
  accepted_at: string | null;
  expires_at: string;
  companies: { name: string } | null;
};

function isExpired(expiresAt: string): boolean {
  return new Date(expiresAt).getTime() < Date.now();
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-soft px-5">
      <div className="w-full max-w-md rounded-[28px] border border-line bg-white p-8 text-center shadow-sm">
        {children}
      </div>
    </div>
  );
}

// The token in the URL is the credential, so the lookup runs on the service
// role without a session. Signing in happens on this page for admins (Get
// started with Google) and in the app for everyone else.
export default async function InvitePage({ params }: PageProps) {
  const { token } = await params;
  const supabase = createServiceClient();
  const { data } = await supabase
    .from("company_invites")
    .select("email, invited_name, role, accepted_at, expires_at, companies(name)")
    .eq("token", token)
    .maybeSingle();

  const invite = data as InviteRow | null;

  if (!invite) {
    return (
      <Shell>
        <h1 className="display text-3xl font-semibold text-ink">
          Invite not found
        </h1>
        <p className="mt-3 text-[15px] text-muted">
          This invite link is not valid. Ask your Noni contact to send a new
          one.
        </p>
      </Shell>
    );
  }

  const companyName = invite.companies?.name ?? "your company";

  const isAdminInvite = invite.role === "company_admin";
  const isCreatorInvite = invite.role === "creator";

  if (invite.accepted_at) {
    return (
      <Shell>
        <h1 className="display text-3xl font-semibold text-ink">
          You are all set
        </h1>
        <p className="mt-3 text-[15px] text-muted">
          This invite has already been used.{" "}
          {isAdminInvite ? (
            <>
              Sign in with{" "}
              <span className="font-semibold text-ink">{invite.email}</span> to run{" "}
              {companyName}.
            </>
          ) : (
            <>
              Open the Noni app and sign in with{" "}
              <span className="font-semibold text-ink">{invite.email}</span> to{" "}
              {isCreatorInvite ? "create for" : "manage"} {companyName}.
            </>
          )}
        </p>
        <a
          href={isAdminInvite ? "/login" : "noni://"}
          className="mt-6 inline-flex w-full items-center justify-center rounded-full bg-ink px-6 py-3.5 text-[15px] font-bold text-white"
        >
          {isAdminInvite ? "Sign in" : "Open the Noni app"}
        </a>
      </Shell>
    );
  }

  if (isExpired(invite.expires_at)) {
    return (
      <Shell>
        <h1 className="display text-3xl font-semibold text-ink">
          Invite expired
        </h1>
        <p className="mt-3 text-[15px] text-muted">
          This invite has expired. Ask your Noni contact to send a new one.
        </p>
      </Shell>
    );
  }

  if (isAdminInvite) {
    return (
      <AdminInviteLanding
        token={token}
        companyName={companyName}
        invitedEmail={invite.email}
      />
    );
  }

  return (
    <Shell>
      <h1 className="display text-3xl font-semibold text-ink">
        You are invited
      </h1>
      <p className="mt-3 text-[15px] text-muted">
        {isCreatorInvite ? (
          <>
            You have been invited to create content for{" "}
            <span className="font-semibold text-ink">{companyName}</span> on
            Noni. Get the app below and sign in with{" "}
            <span className="font-semibold text-ink">{invite.email}</span>.
          </>
        ) : (
          <>
            You have been invited to manage{" "}
            <span className="font-semibold text-ink">{companyName}</span> on
            Noni. Get the app below and sign in with{" "}
            <span className="font-semibold text-ink">{invite.email}</span>. Noni
            sets you up as a campaign manager automatically.
          </>
        )}
      </p>

      <div className="mt-6">
        <GetTheApp
          email={invite.email}
          name={invite.invited_name ?? undefined}
          source={isCreatorInvite ? "invite_creator" : "invite_manager"}
        />
      </div>

      <p className="mt-6 text-[13px] text-muted">
        Already using Noni with this email?{" "}
        <Link
          href={`/invite/${token}/accept`}
          className="font-semibold text-accent hover:text-accent-deep"
        >
          Accept here instead
        </Link>
        . If you already work with another company on Noni, accepting adds{" "}
        {companyName} to your account and you keep your other companies.
      </p>
    </Shell>
  );
}
