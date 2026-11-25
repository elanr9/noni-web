"use client";

import { Check, Clock } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

import { GetTheApp } from "@/components/GetTheApp";
import { createClient } from "@/lib/supabase/client";

type Brand = { name: string; logo: string | null; color: string };

function Frame({ brand, children }: { brand: Brand; children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-[#fbfbfc] font-ops">
      <header className="flex items-center gap-[9px] px-5 py-4 sm:px-7">
        <Image src="/brand/noni-logo.svg" alt="" width={24} height={24} />
        <span className="text-[17px] font-bold tracking-[-0.6px] text-ink">noni</span>
      </header>
      <main className="mx-auto flex w-full max-w-[440px] flex-1 flex-col justify-center gap-6 px-5 pb-24">
        <div className="flex items-center gap-3">
          {brand.logo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={brand.logo} alt="" className="h-14 w-14 rounded-[16px] border border-line bg-white object-contain p-1.5" />
          ) : (
            <span
              className="flex h-14 w-14 items-center justify-center rounded-[16px] text-[24px] font-bold text-white"
              style={{ backgroundColor: brand.color }}
            >
              {brand.name.slice(0, 1).toUpperCase()}
            </span>
          )}
        </div>
        {children}
      </main>
    </div>
  );
}

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

export function JoinCard({ brand, next, error }: { brand: Brand; next: string; error?: string }) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(error ?? null);

  const go = async () => {
    setBusy(true);
    setErr(null);
    const { data, error: oauthError } = await createClient().auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
        skipBrowserRedirect: true,
      },
    });
    if (oauthError || !data.url) {
      setBusy(false);
      setErr(oauthError?.message ?? "Google sign in did not start. Try again.");
      return;
    }
    window.location.assign(data.url);
  };

  return (
    <Frame brand={brand}>
      <h1 className="m-0 text-[34px] font-bold leading-[1.08] tracking-[-0.9px] text-ink">Post for {brand.name}</h1>
      <button
        type="button"
        onClick={go}
        disabled={busy}
        className="inline-flex w-full cursor-pointer items-center justify-center gap-2.5 rounded-full border border-line bg-white px-6 py-4 text-[16px] font-bold text-ink shadow-sm transition-transform duration-150 hover:-translate-y-px active:scale-[0.97] disabled:opacity-60"
      >
        <GoogleLogo />
        {busy ? "Opening Google…" : "Join with Google"}
      </button>
      {err ? <p className="m-0 text-[14px] font-semibold text-danger">{err}</p> : null}
    </Frame>
  );
}

export function JoinDone({ brand, joined, email }: { brand: Brand; joined: boolean; email: string }) {
  return (
    <Frame brand={brand}>
      <div className="flex items-center gap-3">
        <span
          className="inline-flex h-11 w-11 animate-om-check items-center justify-center rounded-full text-white"
          style={{ backgroundColor: joined ? "#2FD27A" : brand.color }}
        >
          {joined ? <Check size={22} strokeWidth={3} /> : <Clock size={20} />}
        </span>
        <h1 className="m-0 text-[30px] font-bold leading-[1.1] tracking-[-0.8px] text-ink">
          {joined ? `You're in at ${brand.name}` : "Applied"}
        </h1>
      </div>
      <div className="rounded-[20px] border border-line bg-white p-5">
        <GetTheApp email={email} source="join" look="ops" showOpenApp onDownload={() => {}} />
      </div>
    </Frame>
  );
}
