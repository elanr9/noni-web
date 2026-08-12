"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { Card, Label, Pill } from "@/components/kit";
import { createClient } from "@/lib/supabase/client";
import { acceptInvite } from "./actions";

/* Company-admin invite screens from design_handoff_admin_app_web
   (AdminOnbFlow.jsx step 0): the "You're invited" landing with Get started
   with Google, and the wrong-Google-account gate that shows the invited
   address and offers an account switch. */

function GoogleG({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden="true">
      <path
        fill="#EA4335"
        d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
      />
      <path
        fill="#4285F4"
        d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
      />
      <path
        fill="#FBBC05"
        d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
      />
      <path
        fill="#34A853"
        d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
      />
    </svg>
  );
}

function GoogleButton({
  children,
  onClick,
}: {
  children: string;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="mt-6 flex w-full cursor-pointer items-center justify-center gap-2.5 rounded-pill border border-line bg-white px-5 py-3.5 text-[14.5px] font-bold text-ink shadow-card transition-colors duration-[160ms] ease-om hover:bg-fill-quiet"
    >
      <GoogleG /> {children}
    </button>
  );
}

function InviteShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-ground font-ops">
      <div className="flex shrink-0 items-center gap-[9px] px-7 py-[22px]">
        <Image src="/brand/noni-logo.svg" alt="" width={28} height={28} />
        <span className="text-[19px] font-bold tracking-[-0.6px] text-ink">
          noni
        </span>
      </div>
      <div className="flex flex-1 items-center justify-center px-6 pb-[60px]">
        <Card pad={36} className="w-[420px] max-w-full animate-om-pop text-center">
          {children}
        </Card>
      </div>
    </div>
  );
}

/* Starts Google OAuth and returns to the invite's accept route. The invited
   email rides along as a login hint; switching signs the current session
   out first and forces the Google account picker. */
async function startGoogleSignIn(
  token: string,
  invitedEmail: string,
  switchAccount: boolean,
): Promise<string | null> {
  const supabase = createClient();
  if (switchAccount) await supabase.auth.signOut();
  const next = `/invite/${token}/accept`;
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
      skipBrowserRedirect: true,
      queryParams: switchAccount
        ? { prompt: "select_account" }
        : { login_hint: invitedEmail },
    },
  });
  if (error) return error.message;
  if (!data.url) return "Google sign-in did not return a redirect URL.";
  // Ensure the PKCE verifier cookie was written before leaving the page.
  if (!document.cookie.includes("code-verifier")) {
    return "Could not save sign-in cookies. Allow cookies for this site and try again.";
  }
  window.location.assign(data.url);
  return null;
}

export function AdminInviteLanding({
  token,
  companyName,
  invitedEmail,
}: {
  token: string;
  companyName: string;
  invitedEmail: string;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onGoogle() {
    setBusy(true);
    setError(null);
    const message = await startGoogleSignIn(token, invitedEmail, false);
    if (message) {
      setBusy(false);
      setError(message);
    }
  }

  return (
    <InviteShell>
      <Image
        src="/brand/noni-logo.svg"
        alt=""
        width={46}
        height={46}
        className="mx-auto block"
      />
      <Label className="mt-5 block">{"You're invited"}</Label>
      <h1 className="mb-0 mt-2 text-[25px] font-bold tracking-[-0.6px] text-ink">
        {`To run ${companyName}'s UGC with Noni!`}
      </h1>
      <GoogleButton onClick={busy ? undefined : () => void onGoogle()}>
        {busy ? "Opening Google…" : "Get started with Google"}
      </GoogleButton>
      {error ? (
        <p className="mb-0 mt-3 text-[12.5px] font-semibold text-danger">
          {error}
        </p>
      ) : null}
      <p className="mb-0 mt-4 text-[12.5px] font-semibold leading-normal text-slate-400">
        Use the account this invite was sent to:{" "}
        <span className="text-ink">{invitedEmail}</span>
      </p>
    </InviteShell>
  );
}

/* One accept attempt per token per page load; survives Strict Mode's
   double-run of effects in dev. */
const startedTokens = new Set<string>();

export function AdminInviteGate({
  token,
  companyName,
  invitedEmail,
  currentEmail,
}: {
  token: string;
  companyName: string;
  invitedEmail: string;
  currentEmail: string;
}) {
  const router = useRouter();
  const wrongAccount =
    invitedEmail.trim().toLowerCase() !== currentEmail.trim().toLowerCase();
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (wrongAccount || startedTokens.has(token)) return;
    startedTokens.add(token);
    void (async () => {
      const result = await acceptInvite(token);
      if (!result.ok) {
        startedTokens.delete(token);
        setError(result.error);
        return;
      }
      router.replace("/onboarding");
      router.refresh();
    })();
  }, [attempt, router, token, wrongAccount]);

  async function onSwitch() {
    setError(null);
    const message = await startGoogleSignIn(token, invitedEmail, true);
    if (message) setError(message);
  }

  if (wrongAccount) {
    return (
      <InviteShell>
        <Label className="block">Wrong Google account</Label>
        <h1 className="mb-0 mt-2 text-[25px] font-bold tracking-[-0.6px] text-ink">
          This invite was sent to another address
        </h1>
        <p className="mb-0 mt-3 text-[13.5px] font-semibold leading-[1.55] text-slate-400">
          The invite to run {companyName} was sent to{" "}
          <span className="text-ink">{invitedEmail}</span>. You are signed in
          as <span className="text-ink">{currentEmail}</span>.
        </p>
        <GoogleButton onClick={() => void onSwitch()}>
          Switch account
        </GoogleButton>
        {error ? (
          <p className="mb-0 mt-3 text-[12.5px] font-semibold text-danger">
            {error}
          </p>
        ) : null}
      </InviteShell>
    );
  }

  return (
    <InviteShell>
      <Label className="block">{"You're invited"}</Label>
      <h1 className="mb-0 mt-2 text-[25px] font-bold tracking-[-0.6px] text-ink">
        {error ? "Something went wrong" : `Setting up ${companyName}…`}
      </h1>
      {error ? (
        <>
          <p className="mb-0 mt-3 text-[13.5px] font-semibold leading-[1.55] text-danger">
            {error}
          </p>
          <Pill
            className="mt-5"
            onClick={() => {
              setError(null);
              setAttempt((n) => n + 1);
            }}
          >
            Try again
          </Pill>
        </>
      ) : (
        <p className="mb-0 mt-3 text-[13.5px] font-semibold leading-[1.55] text-slate-400">
          Binding this Google account as the company admin.
        </p>
      )}
    </InviteShell>
  );
}
