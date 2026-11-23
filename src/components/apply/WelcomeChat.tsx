"use client";

import { ArrowUp, Building2, Video } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useLayoutEffect, useRef, useState } from "react";

import type { ApplyKind } from "@/lib/applications";
import { createClient } from "@/lib/supabase/client";
import { ASK_NAME, askKind, KIND_ANSWER, SIGN_IN_FIRST } from "@/lib/welcome-chat";

/* Where Get started lands. Step one is Sign in with Google. Back signed in,
   Noni greets them by the name Google gave (or asks it when there is none)
   and asks whether they are a company or a creator, then the same
   conversation carries on (company: the onboarding chat; creator: the
   creator chat), these first lines included. The wording comes from
   @/lib/welcome-chat, shared with the page that carries it on. */


type Line = { from: "noni" | "me"; text: string };

function Avatar() {
  return (
    <span className="mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white shadow-[0_1px_3px_rgba(15,23,42,0.12)]">
      <Image src="/brand/noni-logo.svg" alt="" width={18} height={18} />
    </span>
  );
}

/** One Noni line, typed out after a beat of dots. */
function NoniLine({ text, live, onDone }: { text: string; live: boolean; onDone: () => void }) {
  const [shown, setShown] = useState(live ? 0 : text.length);
  const done = useRef(onDone);
  useEffect(() => {
    done.current = onDone;
  }, [onDone]);
  useEffect(() => {
    if (!live) return;
    let n = 0;
    let timer = window.setTimeout(function tick() {
      n = Math.min(text.length, n + 1);
      setShown(n);
      if (n >= text.length) done.current();
      else timer = window.setTimeout(tick, 22);
    }, 500);
    return () => window.clearTimeout(timer);
  }, [live, text]);
  return (
    <div className="flex gap-3.5 animate-om-rise">
      <Avatar />
      <div className="min-w-0 flex-1 pt-[3px] text-[17px] font-medium leading-[1.6] tracking-[-0.1px] text-ink">
        {shown > 0 ? (
          <p className="m-0 whitespace-pre-wrap">
            {text.slice(0, shown)}
            {shown < text.length ? (
              <span className="ml-0.5 inline-block h-[18px] w-[2px] translate-y-[3px] animate-pulse bg-ink" />
            ) : null}
          </p>
        ) : (
          <span className="inline-flex h-7 items-center gap-1" aria-label="Noni is typing">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="h-2 w-2 rounded-full bg-slate-300"
                style={{ animation: `chat-dot 1.1s ${i * 0.15}s infinite ease-in-out` }}
              />
            ))}
          </span>
        )}
      </div>
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

function firstName(name: string) {
  return name.trim().split(/\s+/)[0] ?? name;
}

export function WelcomeChat({
  signedIn,
  preselect,
  knownName = "",
}: {
  signedIn: boolean;
  preselect: ApplyKind | null;
  /** The name Google gave, when signed in. */
  knownName?: string;
}) {
  const startName = signedIn ? knownName.trim().slice(0, 60) : "";
  /* Asked only when Google gave no name; carried on so the real chat shows it. */
  const askedName = signedIn && !startName;
  const [lines, setLines] = useState<Line[]>([
    { from: "noni", text: !signedIn ? SIGN_IN_FIRST : startName ? askKind(firstName(startName)) : ASK_NAME },
  ]);
  const [settled, setSettled] = useState(false);
  const [name, setName] = useState(startName);
  const [kind, setKind] = useState<ApplyKind | null>(preselect);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const box = useRef<HTMLInputElement>(null);

  const stage: "signin" | "name" | "kind" | "going" = !signedIn ? "signin" : !name ? "name" : !kind ? "kind" : "going";
  const lastNoni = lines.map((l) => l.from).lastIndexOf("noni");

  useLayoutEffect(() => {
    window.scrollTo({ top: document.documentElement.scrollHeight });
  }, [lines, settled]);

  useEffect(() => {
    if (stage === "name" && settled) box.current?.focus({ preventScroll: true });
  }, [stage, settled]);

  const say = (mine: string, noni: string | null) => {
    setSettled(false);
    setLines((prev) => [...prev, { from: "me", text: mine }, ...(noni ? [{ from: "noni" as const, text: noni }] : [])]);
  };

  /** Step one: Google, then back to this page signed in. */
  const signIn = async () => {
    setBusy(true);
    setError(null);
    const next = preselect ? `/apply?as=${preselect}` : "/apply";
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

  /** On to the real chat, carrying what was said here. */
  const go = (who: string, as: ApplyKind) => {
    window.location.assign(
      `/apply?as=${as}&name=${encodeURIComponent(who)}&asked=1${askedName ? "&named=1" : ""}`,
    );
  };

  const sendName = () => {
    const who = draft.trim().replace(/\s+/g, " ").slice(0, 60);
    if (!who || !settled) return;
    setName(who);
    setDraft("");
    say(who, askKind(firstName(who)));
  };

  const pickKind = (k: ApplyKind) => {
    if (!settled || kind) return;
    setKind(k);
    say(KIND_ANSWER[k], null);
    go(name, k);
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#fbfbfc] font-ops">
      <style>{`@keyframes chat-dot { 0%, 80%, 100% { opacity: .25; transform: translateY(0) } 40% { opacity: 1; transform: translateY(-3px) } }`}</style>
      <header className="sticky top-0 z-10 flex items-center gap-[9px] bg-[#fbfbfc]/85 px-5 py-4 backdrop-blur sm:px-7">
        <Link href="/" className="flex items-center gap-[9px] no-underline">
          <Image src="/brand/noni-logo.svg" alt="" width={26} height={26} />
          <span className="text-[18px] font-bold tracking-[-0.6px] text-ink">noni</span>
        </Link>
        <span className="flex-1" />
        <Link href="/login" className="text-[14px] font-bold text-slate-500 no-underline hover:text-ink">
          Log in
        </Link>
      </header>

      <main className="mx-auto flex w-full max-w-[720px] flex-1 flex-col gap-7 px-5 pb-[220px] pt-6">
        {lines.map((line, i) =>
          line.from === "me" ? (
            <div key={i} className="flex justify-end animate-om-rise">
              <p className="m-0 max-w-[80%] rounded-[22px] bg-[#eef1f5] px-[18px] py-3 text-[16px] font-medium leading-[1.5] text-ink">
                {line.text}
              </p>
            </div>
          ) : (
            <NoniLine key={i} text={line.text} live={i === lastNoni && !settled} onDone={() => setSettled(true)} />
          ),
        )}
        {error ? <p className="m-0 pl-[46px] text-[14px] font-semibold text-danger">{error}</p> : null}
      </main>

      <div className="fixed inset-x-0 bottom-0 bg-gradient-to-t from-[#fbfbfc] via-[#fbfbfc] to-transparent pb-5 pt-10">
        <div className="mx-auto flex w-full max-w-[720px] flex-col gap-3 px-5">
          {stage === "kind" && settled ? (
            <div className="flex flex-wrap gap-2 animate-om-rise">
              {(["company", "creator"] as const).map((k) => (
                <button
                  key={k}
                  type="button"
                  onClick={() => pickKind(k)}
                  className="inline-flex cursor-pointer items-center gap-2 rounded-full border-[1.5px] border-blue-500 bg-blue-500 px-5 py-2.5 text-[15px] font-bold text-white shadow-[0_2px_8px_rgba(37,99,235,0.12)] transition-[transform,background-color] duration-150 hover:-translate-y-px hover:bg-blue-600 active:scale-[0.97]"
                >
                  {k === "company" ? <Building2 size={17} strokeWidth={2.4} /> : <Video size={17} strokeWidth={2.4} />}
                  {KIND_ANSWER[k]}
                </button>
              ))}
            </div>
          ) : null}

          {stage === "signin" && settled ? (
            <button
              type="button"
              disabled={busy}
              onClick={() => void signIn()}
              className="inline-flex cursor-pointer items-center justify-center gap-2.5 self-start rounded-full border-[1.5px] border-line bg-white px-6 py-3.5 text-[16px] font-bold text-ink shadow-[0_8px_24px_rgba(15,23,42,0.08)] transition-[transform,box-shadow] duration-150 hover:-translate-y-px hover:shadow-[0_12px_28px_rgba(15,23,42,0.12)] active:scale-[0.98] disabled:opacity-60 animate-om-rise"
            >
              <GoogleLogo />
              {busy ? "Opening Google…" : "Continue with Google"}
            </button>
          ) : null}

          {stage === "name" ? (
            <div
              onClick={() => box.current?.focus()}
              className="flex cursor-text items-center gap-2 rounded-[28px] border-[1.5px] border-slate-300 bg-white py-2.5 pl-5 pr-2.5 shadow-[0_8px_30px_rgba(15,23,42,0.10)] transition-[border-color,box-shadow] duration-150 focus-within:border-blue-500 focus-within:shadow-[0_0_0_4px_rgba(59,130,246,0.15),0_8px_30px_rgba(15,23,42,0.10)]"
            >
              <input
                ref={box}
                value={draft}
                disabled={!settled}
                autoComplete="given-name"
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    sendName();
                  }
                }}
                placeholder={settled ? "Your name" : "Noni is writing…"}
                className="min-h-[28px] flex-1 border-none bg-transparent py-1.5 text-[16.5px] font-medium text-ink caret-blue-500 outline-none placeholder:text-slate-500"
              />
              <button
                type="button"
                aria-label="Send"
                onClick={sendName}
                disabled={!settled || !draft.trim()}
                className="inline-flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-full border-none bg-ink text-white transition-[opacity,transform] duration-150 active:scale-90 disabled:cursor-default disabled:opacity-25"
              >
                <ArrowUp size={19} strokeWidth={2.5} />
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
