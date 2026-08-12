"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { createClient } from "@/lib/supabase/client";

function LoginForm() {
  const params = useSearchParams();
  const next = params.get("next") ?? "/admin";
  const authError =
    params.get("error") === "auth"
      ? params.get("error_description") ||
        "Google sign-in failed. Try again, or use the same browser where you started login."
      : null;

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(authError);

  async function signInWithGoogle() {
    setBusy(true);
    setError(null);
    const supabase = createClient();
    const origin = window.location.origin;
    const { data, error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${origin}/auth/callback?next=${encodeURIComponent(next)}`,
        skipBrowserRedirect: true,
      },
    });
    if (oauthError) {
      setBusy(false);
      setError(oauthError.message);
      return;
    }
    if (!data.url) {
      setBusy(false);
      setError("Google sign-in did not return a redirect URL.");
      return;
    }
    // Ensure the PKCE verifier cookie was written before leaving the page.
    if (!document.cookie.includes("code-verifier")) {
      setBusy(false);
      setError(
        "Could not save sign-in cookies. Allow cookies for localhost and try again.",
      );
      return;
    }
    window.location.assign(data.url);
  }

  return (
    <div className="mx-auto w-full max-w-sm">
      <div className="flex justify-center">
        <Link
          href="/"
          className="display inline-flex items-center gap-2 text-2xl font-semibold text-ink"
        >
          <img
            src="/brand/marlin-blue.svg"
            alt=""
            width={28}
            height={28}
            className="h-7 w-7"
          />
          noni
        </Link>
      </div>

      <div className="mt-6 rounded-3xl border border-line bg-white p-6 sm:p-8">
        <h1 className="display text-center text-[26px] font-semibold text-ink">
          Welcome back
        </h1>
        <p className="mt-1.5 text-center text-[14px] leading-relaxed text-muted">
          Sign in with the Google account your Noni invite was sent to.
        </p>

        <button
          type="button"
          disabled={busy}
          onClick={() => void signInWithGoogle()}
          className="mt-6 flex w-full items-center justify-center gap-2.5 rounded-full border border-line bg-white px-5 py-3 text-[15px] font-semibold text-ink transition hover:bg-soft disabled:opacity-50"
        >
          <GoogleLogo />
          {busy ? "Opening Google…" : "Continue with Google"}
        </button>

        {error ? (
          <p className="mt-4 rounded-xl bg-red-50 px-3.5 py-2.5 text-[13px] font-medium text-red-600">
            {error}
          </p>
        ) : null}
      </div>

      <p className="mt-5 text-center text-[13px] text-muted">
        New to Noni?{" "}
        <Link href="/" className="font-semibold text-accent hover:text-accent-deep">
          Join the waitlist
        </Link>
      </p>
    </div>
  );
}

function GoogleLogo() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
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

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center bg-soft px-5 py-16">
      <Suspense fallback={<div className="mx-auto text-muted">Loading…</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
