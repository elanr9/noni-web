"use client";

import { ArrowUp, ArrowUpRight, Building2, CalendarDays, Check, Video } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";

import { finishLead, saveLeadAnswer, type LeadField } from "@/app/apply/company/actions";
import { Burst } from "@/components/admin/brain/BrainConfirm";
import { NoniLine } from "@/components/apply/WelcomeChat";
import { ASK_NAME, askKind, KIND_ANSWER } from "@/lib/welcome-chat";

/* Get started, signed out. One conversation, no account:
   name, then company or creator.
   - Creator: on to the creator chat as a guest (/apply?as=creator); Google
     is its last step.
   - Company: the questions the call needs, saved on a lead as they are
     answered (app/apply/company/actions): work email, company, website
     and role, nothing else; the rest is asked on the call. It ends on a
     button that opens the founders' booking page in a new tab. Companies never make an account here; ops invites them
     after the call (/ops/leads). */

type Line = { from: "noni" | "me"; text: string };
type Option = { value: string; label: string };
type Ask = {
  key: "name" | "kind" | LeadField;
  kind: "text" | "email" | "choice" | "multi";
  text: (c: Ctx) => string;
  placeholder?: string;
  options?: Option[];
};
type Ctx = { first: string; company: string };

const BLUE = "#3B82F6";

const ASKS: Ask[] = [
  { key: "name", kind: "text", text: () => ASK_NAME, placeholder: "Your name" },
  { key: "kind", kind: "choice", text: (c) => askKind(c.first, true) },
  { key: "email", kind: "email", text: (c) => `What's your work email, ${c.first}?`, placeholder: "you@company.com" },
  { key: "company", kind: "text", text: () => "What's the company called?", placeholder: "Company name" },
  { key: "website", kind: "text", text: (c) => `What's ${c.company || "the company"}'s website?`, placeholder: "yourcompany.com" },
  {
    key: "role",
    kind: "choice",
    text: () => "What's your role there?",
    options: ["Founder", "Marketing", "Growth", "Something else"].map((v) => ({ value: v, label: v })),
  },
];

const KIND_OPTIONS: Option[] = [
  { value: "company", label: KIND_ANSWER.company },
  { value: "creator", label: KIND_ANSWER.creator },
];

function wwwHost(url: string): string {
  const host = url.trim().replace(/^https?:\/\//i, "").replace(/\/.*$/, "").toLowerCase();
  if (!host) return "";
  return host.startsWith("www.") ? host : `www.${host}`;
}

/** The founders' booking page with their name and email filled in. */
function bookingLink(url: string, name: string, email: string): string {
  try {
    const u = new URL(url);
    if (name) u.searchParams.set("name", name);
    if (email) u.searchParams.set("email", email);
    return u.toString();
  } catch {
    return url;
  }
}

function firstOf(name: string): string {
  return name.trim().split(/\s+/)[0] ?? name;
}

export function GetStartedChat({
  bookingUrl,
  startName = "",
}: {
  bookingUrl: string | null;
  /** No longer used: the calendar opens in its own tab. */
  host?: string;
  /** Already said (a signed-in person who picked company): skip name and kind. */
  startName?: string;
}) {
  const router = useRouter();
  const skip = startName ? 2 : 0;
  const [step, setStep] = useState(skip);
  const [ctx, setCtx] = useState<Ctx>({ first: firstOf(startName), company: "" });
  const [fullName, setFullName] = useState(startName);
  const [email, setEmail] = useState("");
  const [lines, setLines] = useState<Line[]>(() =>
    startName
      ? [
          { from: "noni", text: ASK_NAME },
          { from: "me", text: startName },
          { from: "noni", text: askKind(firstOf(startName), true) },
          { from: "me", text: KIND_ANSWER.company },
          { from: "noni", text: ASKS[2].text({ first: firstOf(startName), company: "" }) },
        ]
      : [{ from: "noni", text: ASK_NAME }],
  );
  const [settled, setSettled] = useState(false);
  const [draft, setDraft] = useState("");
  const [picked, setPicked] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [leadId, setLeadId] = useState<string | null>(null);
  const [phase, setPhase] = useState<"asking" | "call" | "booked" | "leaving">("asking");
  const box = useRef<HTMLInputElement>(null);

  const ask = phase === "asking" ? ASKS[step] : null;
  const lastNoni = lines.map((l) => l.from).lastIndexOf("noni");
  const typed = ask && (ask.kind === "text" || ask.kind === "email");

  useLayoutEffect(() => {
    window.scrollTo({ top: document.documentElement.scrollHeight, behavior: "smooth" });
  }, [lines, settled, phase]);

  useEffect(() => {
    if (typed && settled) box.current?.focus({ preventScroll: true });
  }, [typed, settled, step]);

  const next = useCallback(
    (mine: string, nextCtx: Ctx) => {
      const n = step + 1;
      setSettled(false);
      setDraft("");
      setPicked([]);
      if (n >= ASKS.length) {
        setLines((l) => [
          ...l,
          { from: "me", text: mine },
          { from: "noni", text: `That's everything, ${nextCtx.first}. Last step: pick a time for a quick call with the founders.` },
        ]);
        setStep(n);
        return;
      }
      setLines((l) => [...l, { from: "me", text: mine }, { from: "noni", text: ASKS[n].text(nextCtx) }]);
      setStep(n);
    },
    [step],
  );

  const answer = async (value: string | string[], shown: string) => {
    if (!ask || busy || !settled) return;
    setError(null);

    if (ask.key === "name") {
      const who = String(value).trim().replace(/\s+/g, " ").slice(0, 60);
      if (!who) return;
      setFullName(who);
      const c = { ...ctx, first: firstOf(who) };
      setCtx(c);
      next(who, c);
      return;
    }
    if (ask.key === "kind") {
      if (value === "creator") {
        setLines((l) => [...l, { from: "me", text: shown }]);
        setPhase("leaving");
        router.push(`/apply?as=creator&name=${encodeURIComponent(fullName)}&asked=1&named=1`);
        return;
      }
      next(shown, ctx);
      return;
    }

    setBusy(true);
    const stored = ask.key === "website" ? wwwHost(String(value)) : value;
    const r = await saveLeadAnswer({ id: leadId, name: fullName, field: ask.key, value: stored });
    setBusy(false);
    if (!r.ok) {
      setError(r.error);
      return;
    }
    setLeadId(r.id);
    let c = ctx;
    if (ask.key === "email") setEmail(String(value).trim().toLowerCase());
    if (ask.key === "company") {
      c = { ...ctx, company: String(value).trim() };
      setCtx(c);
    }
    next(ask.key === "website" ? String(stored) : shown, c);
    if (step + 1 >= ASKS.length) void finishLead(r.id);
  };

  const send = () => {
    const text = draft.trim();
    if (!text) return;
    void answer(text, text);
  };

  /* A Noni line has typed out. After the closing line the calendar comes in. */
  const onTyped = () => {
    setSettled(true);
    if (phase === "asking" && step >= ASKS.length) setPhase("call");
  };

  const chips = ask && (ask.kind === "choice" || ask.kind === "multi") && settled ? (ask.key === "kind" ? KIND_OPTIONS : ask.options ?? []) : [];

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

      <main className="mx-auto flex w-full max-w-[720px] flex-1 flex-col gap-7 px-5 pb-[240px] pt-6">
        {lines.map((line, i) =>
          line.from === "me" ? (
            <div key={i} className="flex justify-end animate-om-rise">
              <p className="m-0 max-w-[80%] rounded-[22px] bg-[#eef1f5] px-[18px] py-3 text-[16px] font-medium leading-[1.5] text-ink">
                {line.text}
              </p>
            </div>
          ) : (
            <NoniLine key={i} text={line.text} live={i === lastNoni && !settled} onDone={onTyped} />
          ),
        )}
        {phase === "leaving" ? <NoniLine text="" live={false} onDone={() => {}} /> : null}

        {phase === "call" && bookingUrl ? (
          <div className="pl-[46px] animate-om-rise">
            <a
              href={bookingLink(bookingUrl, fullName, email)}
              target="_blank"
              rel="noreferrer"
              className="group inline-flex items-center gap-2 rounded-full bg-blue-500 px-7 py-4 text-[16px] font-bold text-white no-underline shadow-[0_10px_24px_rgba(59,130,246,0.3)] transition-transform duration-150 hover:-translate-y-0.5 active:scale-[0.96]"
            >
              <CalendarDays size={18} strokeWidth={2.4} />
              Book a call
              <ArrowUpRight size={18} className="transition-transform duration-150 group-hover:translate-x-0.5" />
            </a>
          </div>
        ) : null}
        {phase === "call" && !bookingUrl ? (
          <p className="m-0 pl-[46px] text-[16px] font-semibold text-slate-500">We&apos;ll email {email} today to set up the call.</p>
        ) : null}

        {phase === "booked" ? (
          <div className="flex flex-col items-center gap-5 py-10 text-center animate-om-rise">
            <span className="relative inline-flex h-20 w-20 items-center justify-center rounded-full bg-[#22C55E] text-white animate-om-check">
              <Burst colors={[BLUE, "#22C55E", "#FBBF24", BLUE]} count={30} reach={170} />
              <Check size={40} strokeWidth={3.5} />
            </span>
            <h1 className="display m-0 text-[40px] font-bold leading-[1.08] tracking-[-1.4px] text-ink">
              You&apos;re booked, {ctx.first}!
            </h1>
            <p className="m-0 text-[17px] font-semibold text-slate-500">The invite is in {email}.</p>
          </div>
        ) : null}

        {error ? <p className="m-0 pl-[46px] text-[14px] font-semibold text-danger">{error}</p> : null}
      </main>

      {phase === "asking" && ask ? (
        <div className="fixed inset-x-0 bottom-0 bg-gradient-to-t from-[#fbfbfc] via-[#fbfbfc] to-transparent pb-5 pt-10">
          <div className="mx-auto flex w-full max-w-[720px] flex-col gap-3 px-5">
            {chips.length ? (
              <div className="flex flex-wrap gap-2 animate-om-rise">
                {chips.map((o) => {
                  const on = picked.includes(o.value);
                  return (
                    <button
                      key={o.value}
                      type="button"
                      disabled={busy}
                      onClick={() => {
                        if (ask.kind === "multi") {
                          setPicked((p) => (p.includes(o.value) ? p.filter((v) => v !== o.value) : [...p, o.value]));
                        } else {
                          void answer(o.value, o.label);
                        }
                      }}
                      className={`inline-flex cursor-pointer items-center gap-2 rounded-full border-[1.5px] px-5 py-2.5 text-[15px] font-bold transition-[transform,background-color,color] duration-150 hover:-translate-y-px active:scale-[0.97] disabled:opacity-60 ${
                        ask.kind === "multi"
                          ? on
                            ? "border-blue-500 bg-blue-500 text-white"
                            : "border-line bg-white text-ink hover:border-blue-500"
                          : "border-blue-500 bg-blue-500 text-white hover:bg-blue-600"
                      }`}
                    >
                      {ask.key === "kind" ? (
                        o.value === "company" ? <Building2 size={17} strokeWidth={2.4} /> : <Video size={17} strokeWidth={2.4} />
                      ) : ask.kind === "multi" && on ? (
                        <Check size={16} strokeWidth={3} />
                      ) : null}
                      {o.label}
                    </button>
                  );
                })}
                {ask.kind === "multi" ? (
                  <button
                    type="button"
                    disabled={busy || picked.length === 0}
                    onClick={() =>
                      void answer(
                        picked,
                        (ask.options ?? []).filter((o) => picked.includes(o.value)).map((o) => o.label).join(", "),
                      )
                    }
                    className="inline-flex cursor-pointer items-center gap-2 rounded-full border-none bg-ink px-5 py-2.5 text-[15px] font-bold text-white transition-[transform,opacity] duration-150 active:scale-[0.97] disabled:cursor-default disabled:opacity-30"
                  >
                    Continue
                  </button>
                ) : null}
              </div>
            ) : null}

            {typed ? (
              <div
                onClick={() => box.current?.focus()}
                className="flex cursor-text items-center gap-2 rounded-[28px] border-[1.5px] border-slate-300 bg-white py-2.5 pl-5 pr-2.5 shadow-[0_8px_30px_rgba(15,23,42,0.10)] transition-[border-color,box-shadow] duration-150 focus-within:border-blue-500 focus-within:shadow-[0_0_0_4px_rgba(59,130,246,0.15),0_8px_30px_rgba(15,23,42,0.10)]"
              >
                {ask.key === "website" && draft && !/^(https?:\/\/)?www\./i.test(draft) ? (
                  <span className="text-[16.5px] font-medium text-slate-400">www.</span>
                ) : null}
                <input
                  ref={box}
                  value={draft}
                  disabled={!settled || busy}
                  type={ask.kind === "email" ? "email" : "text"}
                  inputMode={ask.kind === "email" ? "email" : ask.key === "website" ? "url" : "text"}
                  autoComplete={ask.key === "name" ? "given-name" : ask.kind === "email" ? "email" : ask.key === "company" ? "organization" : "off"}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      send();
                    }
                  }}
                  placeholder={settled ? ask.placeholder : "Noni is writing…"}
                  className="min-h-[28px] flex-1 border-none bg-transparent py-1.5 text-[16.5px] font-medium text-ink caret-blue-500 outline-none placeholder:text-slate-500"
                />
                <button
                  type="button"
                  aria-label="Send"
                  onClick={send}
                  disabled={!settled || busy || !draft.trim()}
                  className="inline-flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-full border-none bg-ink text-white transition-[opacity,transform] duration-150 active:scale-90 disabled:cursor-default disabled:opacity-25"
                >
                  <ArrowUp size={19} strokeWidth={2.5} />
                </button>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}

