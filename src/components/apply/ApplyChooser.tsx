"use client";

import { ArrowRight, Building2, Video } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

import type { ApplyKind } from "@/lib/applications";
import { createClient } from "@/lib/supabase/client";

/* The front door: brand or creator, then Google. Signed-in people skip
   Google and go straight to the chat. */

const CHOICES: { kind: ApplyKind; icon: typeof Video; title: string; body: string }[] = [
  {
    kind: "company",
    icon: Building2,
    title: "I'm a brand",
    body: "Get creators posting about your product. A few quick questions.",
  },
  {
    kind: "creator",
    icon: Video,
    title: "I'm a creator",
    body: "Get paid to make short videos for brands. New to it is fine.",
  },
];

export function ApplyChooser({ signedIn, preselect }: { signedIn: boolean; preselect: ApplyKind | null }) {
  const [busy, setBusy] = useState<ApplyKind | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function pick(kind: ApplyKind) {
    setBusy(kind);
    setError(null);
    const next = `/apply?as=${kind}`;
    if (signedIn) {
      window.location.assign(next);
      return;
    }
    const supabase = createClient();
    const { data, error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
        skipBrowserRedirect: true,
      },
    });
    if (oauthError || !data.url) {
      setBusy(null);
      setError(oauthError?.message ?? "Google sign-in did not start. Try again.");
      return;
    }
    window.location.assign(data.url);
  }

  const shown = preselect ? CHOICES.filter((c) => c.kind === preselect) : CHOICES;

  return (
    <div className="flex min-h-screen flex-col bg-[#fbfbfc] font-ops">
      <header className="flex items-center gap-[9px] px-5 py-4 sm:px-7">
        <Link href="/" className="flex items-center gap-[9px] no-underline">
          <Image src="/brand/noni-logo.svg" alt="" width={26} height={26} />
          <span className="text-[18px] font-bold tracking-[-0.6px] text-ink">noni</span>
        </Link>
        <span className="flex-1" />
        <Link href="/login" className="text-[14px] font-bold text-slate-500 no-underline hover:text-ink">
          Sign in
        </Link>
      </header>
      <main className="mx-auto flex w-full max-w-[560px] flex-1 flex-col justify-center gap-7 px-5 pb-24">
        <div>
          <h1 className="m-0 text-[34px] font-bold leading-[1.08] tracking-[-1px] text-ink sm:text-[42px]">
            {preselect === "creator" ? "Join Noni as a creator" : preselect === "company" ? "Get creators for your brand" : "Join Noni"}
          </h1>
          <p className="m-0 mt-3 text-[17px] font-medium leading-[1.5] text-slate-500">
            Two minutes, in a chat. We review every application and email you when you&apos;re in.
          </p>
        </div>
        <div className="flex flex-col gap-3">
          {shown.map(({ kind, icon: Icon, title, body }) => (
            <button
              key={kind}
              type="button"
              disabled={busy !== null}
              onClick={() => void pick(kind)}
              className="group flex w-full cursor-pointer items-center gap-4 rounded-[24px] border-[1.5px] border-line bg-white p-5 text-left shadow-[0_1px_2px_rgba(15,23,42,0.05)] transition-[border-color,box-shadow,transform] duration-150 hover:-translate-y-px hover:border-blue-500 hover:shadow-[0_8px_30px_rgba(37,99,235,0.14)] active:translate-y-0 disabled:opacity-60"
            >
              <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                <Icon size={22} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[18px] font-bold text-ink">{busy === kind ? "Opening Google…" : title}</span>
                <span className="mt-0.5 block text-[14.5px] font-medium leading-[1.45] text-slate-500">{body}</span>
              </span>
              <ArrowRight size={20} className="shrink-0 text-slate-300 transition-colors group-hover:text-blue-500" />
            </button>
          ))}
        </div>
        {preselect ? (
          <Link href="/apply" className="text-[14px] font-bold text-slate-500 no-underline hover:text-ink">
            {preselect === "creator" ? "Applying as a brand instead?" : "Applying as a creator instead?"}
          </Link>
        ) : null}
        {!signedIn ? (
          <p className="m-0 text-[13.5px] font-medium text-slate-400">You&apos;ll continue with your Google account.</p>
        ) : null}
        {error ? <p className="m-0 text-[14px] font-semibold text-danger">{error}</p> : null}
      </main>
    </div>
  );
}
