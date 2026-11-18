"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { createClient } from "@/lib/supabase/client";

function LoginForm() {
  const params = useSearchParams();
  const next = params.get("next") ?? "/dash";
  const authError =
    params.get("error") === "auth"
      ? params.get("error_description") ||
        "Sign-in failed. Try again, or use the same browser where you started login."
      : null;

  const [busy, setBusy] = useState<OAuthProvider | null>(null);
  const [error, setError] = useState<string | null>(authError);

  async function signInWith(provider: OAuthProvider) {
    const label = provider === "apple" ? "Apple" : "Google";
    setBusy(provider);
    setError(null);
    const supabase = createClient();
    const origin = window.location.origin;
    const { data, error: oauthError } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${origin}/auth/callback?next=${encodeURIComponent(next)}`,
        skipBrowserRedirect: true,
      },
    });
    if (oauthError) {
      setBusy(null);
      setError(oauthError.message);
      return;
    }
    if (!data.url) {
      setBusy(null);
      setError(`${label} sign-in did not return a redirect URL.`);
      return;
    }
    // Ensure the PKCE verifier cookie was written before leaving the page.
    if (!document.cookie.includes("code-verifier")) {
      setBusy(null);
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
            src="/brand/noni-logo.svg"
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
          Sign in with the email address your Noni invite was sent to.
        </p>

        <button
          type="button"
          disabled={busy !== null}
          onClick={() => void signInWith("google")}
          className="mt-6 flex w-full items-center justify-center gap-2.5 rounded-full border border-line bg-white px-5 py-3 text-[15px] font-semibold text-ink transition hover:bg-soft disabled:opacity-50"
        >
          <GoogleLogo />
          {busy === "google" ? "Opening Google…" : "Continue with Google"}
        </button>

        <button
          type="button"
          disabled={busy !== null}
          onClick={() => void signInWith("apple")}
          className="mt-3 flex w-full items-center justify-center gap-2.5 rounded-full border border-black bg-black px-5 py-3 text-[15px] font-semibold text-white transition hover:bg-black/85 disabled:opacity-50"
        >
          <AppleLogo />
          {busy === "apple" ? "Opening Apple…" : "Continue with Apple"}
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

type OAuthProvider = "google" | "apple";

/* Apple logo per Apple's Sign in with Apple guidelines: white on black. */
function AppleLogo() {
  return (
    <svg width="16" height="18" viewBox="0 0 814 1000" aria-hidden="true">
      <path
        fill="currentColor"
        d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76.5 0-103.7 40.8-165.9 40.8s-105.6-57-155.5-127C46.7 790.7 0 663 0 541.8c0-194.4 126.4-297.5 250.8-297.5 66.1 0 121.2 43.4 162.7 43.4 39.5 0 101.1-46 176.3-46 28.5 0 130.9 2.6 198.3 99.2zm-234-181.5c31.1-36.9 53.1-88.1 53.1-139.3 0-7.1-.6-14.3-1.9-20.1-50.6 1.9-110.8 33.7-147.1 75.8-28.5 32.4-55.1 83.6-55.1 135.5 0 7.8 1.3 15.6 1.9 18.1 3.2.6 8.4 1.3 13.6 1.3 45.4 0 102.5-30.4 135.5-71.3z"
      />
    </svg>
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
