"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useState } from "react";
import { createClient } from "@/lib/supabase/client";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") ?? "/admin";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const supabase = createClient();
    const { error: signError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    setBusy(false);
    if (signError) {
      setError(signError.message);
      return;
    }
    router.replace(next);
    router.refresh();
  }

  async function signInWithGoogle() {
    setBusy(true);
    setError(null);
    const supabase = createClient();
    const origin = window.location.origin;
    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${origin}/auth/callback?next=${encodeURIComponent(next)}`,
      },
    });
    if (oauthError) {
      setBusy(false);
      setError(oauthError.message);
    }
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
          Sign in to manage your company or your Noni account.
        </p>

        <button
          type="button"
          disabled={busy}
          onClick={() => void signInWithGoogle()}
          className="mt-6 flex w-full items-center justify-center gap-2.5 rounded-full border border-line bg-white px-5 py-3 text-[15px] font-semibold text-ink transition hover:bg-soft disabled:opacity-50"
        >
          <GoogleLogo />
          Continue with Google
        </button>

        <div className="my-5 flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted/70">
          <div className="h-px flex-1 bg-line" />
          or
          <div className="h-px flex-1 bg-line" />
        </div>

        <form onSubmit={onSubmit} className="space-y-3">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            autoComplete="email"
            className={inputClass}
          />
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            autoComplete="current-password"
            className={inputClass}
          />
          {error ? (
            <p className="rounded-xl bg-red-50 px-3.5 py-2.5 text-[13px] font-medium text-red-600">
              {error}
            </p>
          ) : null}
          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-full bg-ink px-5 py-3 text-[15px] font-bold text-white transition hover:bg-ink/90 disabled:opacity-50"
          >
            {busy ? "Signing in…" : "Login"}
          </button>
        </form>
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

const inputClass =
  "w-full rounded-xl border border-line bg-white px-4 py-3 text-[15px] text-ink placeholder:text-muted/60 outline-none transition focus:border-accent";

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
