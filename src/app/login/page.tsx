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
    <div className="mx-auto w-full max-w-md">
      <Link
        href="/"
        className="display inline-flex items-center gap-2.5 text-3xl font-semibold text-ink"
      >
        <img
          src="/brand/marlin-blue.svg"
          alt=""
          width={32}
          height={32}
          className="h-8 w-8"
        />
        noni
      </Link>
      <h1 className="display mt-8 text-4xl font-semibold text-ink">Welcome back</h1>
      <p className="mt-2 text-[15px] text-muted">
        Sign in to the admin web app or your Noni account.
      </p>

      <button
        type="button"
        disabled={busy}
        onClick={() => void signInWithGoogle()}
        className="mt-8 flex w-full items-center justify-center rounded-full border border-line bg-white px-5 py-3.5 text-[15px] font-bold text-ink transition hover:border-ink/20 disabled:opacity-50"
      >
        Continue with Google
      </button>

      <div className="my-6 flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.14em] text-muted">
        <div className="h-px flex-1 bg-line" />
        or email
        <div className="h-px flex-1 bg-line" />
      </div>

      <form onSubmit={onSubmit} className="space-y-3">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          className="w-full rounded-2xl border border-line bg-white px-4 py-3.5 text-[15px] outline-none ring-accent/30 focus:ring-4"
        />
        <input
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          className="w-full rounded-2xl border border-line bg-white px-4 py-3.5 text-[15px] outline-none ring-accent/30 focus:ring-4"
        />
        {error ? <p className="text-sm font-medium text-red-600">{error}</p> : null}
        <button
          type="submit"
          disabled={busy}
          className="w-full rounded-full bg-ink px-5 py-3.5 text-[15px] font-bold text-white disabled:opacity-50"
        >
          {busy ? "Signing in…" : "Login"}
        </button>
      </form>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center bg-white px-5 py-16">
      <Suspense fallback={<div className="mx-auto text-muted">Loading…</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
