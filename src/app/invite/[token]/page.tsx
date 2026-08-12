import Link from "next/link";
import { createServiceClient } from "@/lib/supabase/service";

const APP_STORE_URL = "https://apps.apple.com/app/id6799189794";

type PageProps = {
  params: Promise<{ token: string }>;
};

type InviteRow = {
  email: string;
  role: string;
  accepted_at: string | null;
  expires_at: string;
  companies: { name: string } | null;
};

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
// role without a session. Signing in happens in the app, not here.
export default async function InvitePage({ params }: PageProps) {
  const { token } = await params;
  const supabase = createServiceClient();
  const { data } = await supabase
    .from("company_invites")
    .select("email, role, accepted_at, expires_at, companies(name)")
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
              <span className="font-semibold text-ink">{invite.email}</span> to manage{" "}
              {companyName}.
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

  if (new Date(invite.expires_at).getTime() < Date.now()) {
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
      <Shell>
        <h1 className="display text-3xl font-semibold text-ink">
          You are invited to run {companyName}
        </h1>
        <p className="mt-3 text-[15px] text-muted">
          Sign in with Google using{" "}
          <span className="font-semibold text-ink">{invite.email}</span> and Noni
          will set you up as the admin of {companyName}. You will go through a
          short onboarding, then land in your company dashboard.
        </p>
        <Link
          href={`/login?next=/invite/${token}/accept`}
          className="mt-6 inline-flex w-full items-center justify-center rounded-full bg-ink px-6 py-3.5 text-[15px] font-bold text-white"
        >
          Continue with Google
        </Link>
      </Shell>
    );
  }

  return (
    <Shell>
      <h1 className="display text-3xl font-semibold text-ink">
        You are invited
      </h1>
      <p className="mt-3 text-[15px] text-muted">
        You have been invited to manage{" "}
        <span className="font-semibold text-ink">{companyName}</span> on Noni.
        Get the app and sign in with{" "}
        <span className="font-semibold text-ink">{invite.email}</span>. Noni
        sets you up as a campaign manager automatically.
      </p>

      <div className="mt-6 space-y-3">
        <a
          href={APP_STORE_URL}
          className="inline-flex w-full items-center justify-center rounded-full bg-ink px-6 py-3.5 text-[15px] font-bold text-white"
        >
          Download on the App Store
        </a>
        <a
          href="noni://"
          className="inline-flex w-full items-center justify-center rounded-full border border-line bg-white px-6 py-3.5 text-[15px] font-bold text-ink transition hover:bg-soft"
        >
          Already have the app? Open it
        </a>
      </div>

      <p className="mt-6 text-[13px] text-muted">
        Already using Noni with this email?{" "}
        <Link
          href={`/invite/${token}/accept`}
          className="font-semibold text-accent hover:text-accent-deep"
        >
          Accept here instead
        </Link>
      </p>
    </Shell>
  );
}
