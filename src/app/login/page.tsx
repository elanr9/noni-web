"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { sendSignInLink } from "./actions";

function LoginForm() {
  const params = useSearchParams();
  const next = params.get("next") ?? "/dash";
  const authError =
    params.get("error") === "auth"
      ? params.get("error_description") ||
        "Sign-in failed. Try again, or use the same browser where you started login."
      : null;

  const [busy, setBusy] = useState<OAuthProvider | "email" | null>(null);
  const [error, setError] = useState<string | null>(authError);
  const [email, setEmail] = useState("");
  const [sentTo, setSentTo] = useState<string | null>(null);

  async function emailLink() {
    setBusy("email");
    setError(null);
    const r = await sendSignInLink(email, next);
    setBusy(null);
    if (!r.ok) {
      setError(r.error);
      return;
    }
    setSentTo(email.trim().toLowerCase());
  }

  async function signInWith(provider: OAuthProvider) {
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
      setError(`Google sign-in did not return a redirect URL.`);
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

        {sentTo ? (
          <div className="mt-6 rounded-2xl bg-soft px-4 py-4 text-center">
            <p className="m-0 text-[15px] font-semibold text-ink">Check your inbox</p>
            <p className="m-0 mt-1 text-[13px] text-muted">{sentTo}</p>
          </div>
        ) : (
          <form
            className="mt-6 flex flex-col gap-2.5"
            onSubmit={(e) => {
              e.preventDefault();
              void emailLink();
            }}
          >
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Work email"
              className="w-full rounded-full border border-line bg-white px-5 py-3 text-[15px] font-medium text-ink outline-none focus:border-accent"
            />
            <button
              type="submit"
              disabled={busy !== null || !email.trim()}
              className="w-full cursor-pointer rounded-full border-none bg-ink px-5 py-3 text-[15px] font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
            >
              {busy === "email" ? "Sending…" : "Email me a sign-in link"}
            </button>
          </form>
        )}

        <div className="mt-5 flex items-center gap-3 text-[12px] font-semibold uppercase tracking-[0.08em] text-slate-400">
          <span className="h-px flex-1 bg-line" />
          Creators
          <span className="h-px flex-1 bg-line" />
        </div>

        <button
          type="button"
          disabled={busy !== null}
          onClick={() => void signInWith("google")}
          className="mt-4 flex w-full items-center justify-center gap-2.5 rounded-full border border-line bg-white px-5 py-3 text-[15px] font-semibold text-ink transition hover:bg-soft disabled:opacity-50"
        >
          <GoogleLogo />
          {busy === "google" ? "Opening Google…" : "Continue with Google"}
        </button>

        {error ? (
          <p className="mt-4 rounded-xl bg-red-50 px-3.5 py-2.5 text-[13px] font-medium text-red-600">
            {error}
          </p>
        ) : null}
      </div>

      <p className="mt-5 text-center text-[13px] text-muted">
        New to Noni?{" "}
        <Link href="/apply" className="font-semibold text-accent hover:text-accent-deep">
          Get started
        </Link>
      </p>
    </div>
  );
}

type OAuthProvider = "google";

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
