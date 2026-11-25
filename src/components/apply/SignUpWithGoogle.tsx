"use client";

import Link from "next/link";
import { useState } from "react";

import type { ApplyKind } from "@/lib/applications";
import { createClient } from "@/lib/supabase/client";

/* Get started, signed out: a plain sign-up card with Google, the same look
   as /login. Nothing of the chat shows here; once they are signed in they
   come back to /apply and the chat starts fresh. */

function GoogleLogo() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
    </svg>
  );
}

export function SignUpWithGoogle({
  preselect,
  carry = "",
}: {
  preselect: ApplyKind | null;
  /** What was already said in the Get started chat (name, asked flags), as query params. */
  carry?: string;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const signUp = async () => {
    setBusy(true);
    setError(null);
    const next = preselect ? `/apply?as=${preselect}${carry}` : "/apply";
    const { data, error: oauthError } = await createClient().auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
        skipBrowserRedirect: true,
      },
    });
    if (oauthError || !data.url) {
      setBusy(false);
      setError(oauthError?.message ?? "Google sign in did not start. Try again.");
      return;
    }
    window.location.assign(data.url);
  };

  return (
    <div className="flex min-h-screen items-center bg-soft px-5 py-16">
      <div className="mx-auto w-full max-w-sm">
        <div className="flex justify-center">
          <Link href="/" className="display inline-flex items-center gap-2 text-2xl font-semibold text-ink no-underline">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/brand/noni-logo.svg" alt="" width={28} height={28} className="h-7 w-7" />
            noni
          </Link>
        </div>

        <div className="mt-6 rounded-3xl border border-line bg-white p-6 sm:p-8">
          <h1 className="display m-0 text-center text-[26px] font-semibold text-ink">Create your account</h1>

          <button
            type="button"
            disabled={busy}
            onClick={() => void signUp()}
            className="mt-6 flex w-full cursor-pointer items-center justify-center gap-2.5 rounded-full border border-line bg-white px-5 py-3 text-[15px] font-semibold text-ink transition hover:bg-soft active:scale-[0.98] disabled:opacity-50"
          >
            <GoogleLogo />
            {busy ? "Opening Google…" : "Continue with Google"}
          </button>

          {error ? (
            <p className="m-0 mt-4 rounded-xl bg-red-50 px-3.5 py-2.5 text-[13px] font-medium text-red-600">{error}</p>
          ) : null}

          <p className="m-0 mt-5 text-center text-[12px] leading-relaxed text-slate-400">
            By continuing you agree to the{" "}
            <Link href="/terms" className="text-slate-500 underline">
              Terms
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="text-slate-500 underline">
              Privacy Policy
            </Link>
            .
          </p>
        </div>

        <p className="m-0 mt-5 text-center text-[13px] text-muted">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-accent hover:text-accent-deep">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
