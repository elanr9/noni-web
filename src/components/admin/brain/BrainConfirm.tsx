"use client";

import { ArrowRight, ArrowUp, Check } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState, type CSSProperties } from "react";

import {
  getBrainSnapshot,
  settleBrainSnapshot,
  startBrainIngest,
} from "@/app/admin/brain/knowledge-actions";
import { CompanyMark } from "@/components/CompanySwitcher";
import { useNavigate } from "@/components/motion/NavProgress";
import {
  bulletOf,
  needsBullets,
  type CompanySnapshot,
  type SnapshotItem,
  type SnapshotPart,
} from "@/lib/admin/brain-model";
import { themeTextColor } from "@/lib/media-library-shared";

/* The company confirms what Noni understood about it, as a conversation in
   the same full screen chat as the first onboarding (ChatOnboarding): a
   start screen, then Noni says one short thing at a time (what you sell,
   who it is for, the hook, what it does) and the admin taps Yes or types
   what is wrong in the box. A typed answer becomes the company's own words.
   The lines are fixed here and typed out on screen; no model writes them.

   It wears the company's own color (its theme color, read off its site),
   and every answer pays off: the button bursts, the Yes lands with a
   popped check, a dot fills in the header, and the last one throws
   confetti. */

const NONI_BLUE = "#1BA6EE";

/** Dots thrown outward from the middle of whatever it sits in. Remount (new key) to throw again. */
export function Burst({ colors, count = 12, reach = 46 }: { colors: string[]; count?: number; reach?: number }) {
  return (
    <span aria-hidden className="pointer-events-none absolute left-1/2 top-1/2 h-0 w-0">
      {Array.from({ length: count }, (_, i) => {
        const angle = (i / count) * Math.PI * 2 + (i % 2 ? 0.35 : 0);
        const far = reach * (i % 3 === 0 ? 1.35 : i % 3 === 1 ? 1 : 0.7);
        return (
          <span
            key={i}
            className="absolute -left-1 -top-1 h-2 w-2 rounded-full"
            style={
              {
                backgroundColor: colors[i % colors.length],
                "--dx": `${Math.cos(angle) * far}px`,
                "--dy": `${Math.sin(angle) * far}px`,
                animation: `om-spark ${520 + (i % 4) * 90}ms var(--ease-om) ${(i % 5) * 18}ms both`,
              } as CSSProperties
            }
          />
        );
      })}
    </span>
  );
}

type Ask =
  | { kind: "line"; part: Exclude<SnapshotPart, "features">; item: SnapshotItem }
  | { kind: "features"; items: Array<{ index: number; item: SnapshotItem }> };

/** The questions still open, in order. Lines already confirmed are not asked again. */
function asksOf(snapshot: CompanySnapshot): Ask[] {
  const out: Ask[] = [];
  for (const part of ["sells", "audience", "viral"] as const) {
    const item = snapshot[part];
    if (item && item.status === "open") out.push({ kind: "line", part, item });
  }
  const features = snapshot.features
    .map((item, index) => ({ item, index }))
    .filter((f) => f.item.status !== "dismissed");
  if (features.some((f) => f.item.status === "open")) out.push({ kind: "features", items: features });
  return out;
}

const lower = (text: string) => (/^[A-Z][a-z]/.test(text) ? text[0].toLowerCase() + text.slice(1) : text);

/** What Noni says for one question. Short when the summary has a bullet for it. */
function sayOf(ask: Ask): string {
  if (ask.kind === "features") {
    return `It does this:\n${ask.items.map((f) => `•  ${bulletOf(f.item, "features")}`).join("\n")}\n\nAll good?`;
  }
  const short = ask.item.short?.trim();
  if (ask.part === "sells") {
    return short ? `You sell ${lower(short)}. Right?` : `${ask.item.text} Right?`;
  }
  if (ask.part === "audience") {
    return short ? `It is for ${lower(short)}. Right?` : `${ask.item.text} Right?`;
  }
  return `The moment that sells it: ${lower(bulletOf(ask.item, "viral"))}. Right?`;
}

type Turn = { from: "noni" | "me"; text: string; yes?: boolean };

function Avatar() {
  return (
    <span className="mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white shadow-[0_1px_3px_rgba(15,23,42,0.12)]">
      <Image src="/brand/noni-logo.svg" alt="" width={18} height={18} />
    </span>
  );
}

function Typing() {
  return (
    <span className="inline-flex h-7 items-center gap-1" aria-label="Noni is typing">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="h-2 w-2 rounded-full bg-slate-300"
          style={{ animation: `chat-dot 1.1s ${i * 0.15}s infinite ease-in-out` }}
        />
      ))}
    </span>
  );
}

/** One Noni message. The newest one types itself out after a beat of dots. */
function NoniMessage({ text, live, onDone }: { text: string; live: boolean; onDone?: () => void }) {
  const [shown, setShown] = useState(live ? 0 : text.length);
  const done = useRef(onDone);
  useEffect(() => {
    done.current = onDone;
  }, [onDone]);
  useEffect(() => {
    if (!live) return;
    let n = 0;
    let timer = 0;
    const tick = () => {
      n = Math.min(text.length, n + 2);
      setShown(n);
      if (n >= text.length) done.current?.();
      else timer = window.setTimeout(tick, 14);
    };
    timer = window.setTimeout(tick, 450);
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
          <Typing />
        )}
      </div>
    </div>
  );
}

export function BrainConfirm({
  companyName,
  logoPath,
  themeColor,
  snapshot: initial,
}: {
  companyName: string;
  logoPath: string | null;
  /** The company's own color; Noni blue when it has none. */
  themeColor: string | null;
  snapshot: CompanySnapshot | null;
}) {
  const accent = themeColor ?? NONI_BLUE;
  const onAccent = themeTextColor(accent);
  const sparks = [accent, "#22C55E", "#FBBF24", accent];
  /* Bumped on every win, so the burst under the answer row throws again. */
  const [wins, setWins] = useState(0);
  const { go, pending: leaving } = useNavigate();
  const [snapshot, setSnapshot] = useState(initial);
  const [started, setStarted] = useState(false);
  /* The questions are fixed when the chat starts, so answering one does not reshuffle the rest. */
  const [asks, setAsks] = useState<Ask[]>(() => (initial ? asksOf(initial) : []));
  const [at, setAt] = useState(0);
  const [turns, setTurns] = useState<Turn[]>([]);
  /* True once the newest Noni message has finished typing; the answer box waits for it. */
  const [settled, setSettled] = useState(false);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const end = useRef<HTMLDivElement>(null);
  const box = useRef<HTMLTextAreaElement>(null);

  /* What people call the company: the product name Noni found, else the company's. */
  const name = initial?.sells?.title?.trim() || companyName;

  /* A summary written before bullets gets them while the start screen is up. */
  const upgraded = useRef(false);
  useEffect(() => {
    if (upgraded.current || !initial || !needsBullets(initial)) return;
    upgraded.current = true;
    void getBrainSnapshot().then((result) => {
      if (!result.ok || !result.data) return;
      const fresh = result.data;
      setSnapshot(fresh);
      setAsks((prev) => (prev.length ? asksOf(fresh) : prev));
    });
  }, [initial]);

  useEffect(() => {
    end.current?.scrollIntoView({ block: "end", behavior: "smooth" });
  }, [turns.length, settled]);

  const total = asks.length;
  const ask = started ? (asks[at] ?? null) : null;
  const finished = started && at >= total;

  const say = (text: string, mine?: string) => {
    setSettled(false);
    setTurns((prev) => [
      ...prev,
      ...(mine ? [{ from: "me" as const, text: mine, yes: mine === "Yes" }] : []),
      { from: "noni" as const, text },
    ]);
  };

  const start = () => {
    setStarted(true);
    if (snapshot === null) say("I have not read your site yet. Add it in Company Brain first.");
    else if (asks.length === 0) say("You already confirmed everything.");
    else say(sayOf(asks[0]));
  };

  /* After an answer: the next question, or the sign-off. */
  const advance = (mine: string, fixed: boolean) => {
    const next = asks[at + 1];
    const lead = fixed ? "Fixed. " : "";
    setWins((n) => n + 1);
    say(next ? `${lead}${sayOf(next)}` : `${lead}${name} is locked in.`, mine);
    setAt((n) => n + 1);
    setDraft("");
  };

  /* Confirms every open line of this question as written. */
  const confirm = async (current: Ask): Promise<string | null> => {
    const slots =
      current.kind === "line"
        ? [{ part: current.part as SnapshotPart }]
        : current.items
            .filter((f) => f.item.status === "open")
            .map((f) => ({ part: "features" as SnapshotPart, index: f.index }));
    for (const slot of slots) {
      const result = await settleBrainSnapshot({ ...slot, decision: "confirm" });
      if (!result.ok) return result.error;
      setSnapshot(result.data);
    }
    return null;
  };

  const yes = () => {
    if (!ask || busy || !settled) return;
    setBusy(true);
    setError(null);
    void confirm(ask).then((problem) => {
      setBusy(false);
      if (problem) setError(problem);
      else advance("Yes", false);
    });
  };

  /* A typed answer replaces the line with the company's own words. A note
     on the feature list goes to Noni to read, and the list is confirmed. */
  const send = () => {
    const words = draft.trim();
    if (!ask || !words || busy || !settled) return;
    setBusy(true);
    setError(null);
    const work =
      ask.kind === "line"
        ? settleBrainSnapshot({
            part: ask.part,
            decision: "confirm",
            title: ask.item.title,
            text: words,
          }).then((result) => {
            if (result.ok) setSnapshot(result.data);
            return result.ok ? null : result.error;
          })
        : startBrainIngest({ texts: [{ title: "What the product does", text: words }] }).then(
            (result) => (result.ok ? confirm(ask) : result.error),
          );
    void work.then((problem) => {
      setBusy(false);
      if (problem) setError(problem);
      else advance(words, true);
    });
  };

  const answering = ask !== null && settled;
  const lastNoni = turns.map((t) => t.from).lastIndexOf("noni");

  return (
    <div className="flex min-h-screen flex-col bg-[#fbfbfc] font-ops">
      <style>{`@keyframes chat-dot { 0%, 80%, 100% { opacity: .25; transform: translateY(0) } 40% { opacity: 1; transform: translateY(-3px) } }`}</style>
      <header className="sticky top-0 z-10 flex items-center gap-[9px] bg-[#fbfbfc]/85 px-5 py-4 backdrop-blur sm:px-7">
        <Image src="/brand/noni-logo.svg" alt="" width={26} height={26} />
        <span className="text-[18px] font-bold tracking-[-0.6px] text-ink">noni</span>
        <span className="flex-1" />
        {started && total > 0 ? (
          <span className="flex items-center gap-1.5" aria-label={`${Math.min(at, total)} of ${total} answered`}>
            {asks.map((_, i) =>
              i < at ? (
                <span
                  key={`done-${i}`}
                  className="inline-flex h-6 w-6 items-center justify-center rounded-full animate-om-check"
                  style={{ backgroundColor: accent, color: onAccent }}
                >
                  <Check size={13} strokeWidth={3.5} />
                </span>
              ) : (
                <span
                  key={i}
                  className={`h-6 w-6 rounded-full border-2 bg-white ${i === at ? "" : "border-line"}`}
                  style={i === at ? { borderColor: accent } : undefined}
                />
              ),
            )}
          </span>
        ) : null}
      </header>

      {!started ? (
        <main className="mx-auto flex w-full max-w-[720px] flex-1 flex-col items-center justify-center gap-7 px-5 pb-24 text-center">
          <span className="overflow-hidden rounded-[22px] shadow-[0_10px_30px_rgba(15,23,42,0.12)] animate-om-check">
            <CompanyMark name={companyName} logoPath={logoPath} size={84} />
          </span>
          <h1 className="display m-0 text-[56px] font-bold leading-[1.02] tracking-[-2px] text-ink animate-om-rise">
            Let&apos;s talk <span style={{ color: accent }}>{name}</span>!
          </h1>
          <button
            type="button"
            onClick={start}
            className="group inline-flex cursor-pointer items-center gap-2 rounded-full border-none px-9 py-[18px] text-[18px] font-bold transition-[transform,box-shadow,filter] duration-150 hover:-translate-y-0.5 hover:brightness-105 active:translate-y-0 active:scale-[0.96] animate-om-rise"
            style={{
              backgroundColor: accent,
              color: onAccent,
              boxShadow: `0 12px 28px color-mix(in srgb, ${accent} 38%, transparent)`,
            }}
          >
            Get started
            <ArrowRight size={19} className="transition-transform duration-150 group-hover:translate-x-1" />
          </button>
        </main>
      ) : (
        <main
          className="mx-auto flex w-full max-w-[720px] flex-1 flex-col gap-7 px-5 pt-6"
          style={{ paddingBottom: ask ? 190 : 48 }}
        >
          {turns.map((turn, i) =>
            turn.from === "me" ? (
              <div key={i} className="flex justify-end animate-om-rise">
                {turn.yes ? (
                  <p
                    className="m-0 inline-flex items-center gap-1.5 rounded-[22px] px-[18px] py-3 text-[16px] font-bold leading-[1.5] animate-om-bounce"
                    style={{ backgroundColor: accent, color: onAccent }}
                  >
                    <Check size={16} strokeWidth={3.5} className="animate-om-check" />
                    Yes
                  </p>
                ) : (
                  <p className="m-0 max-w-[80%] whitespace-pre-wrap rounded-[22px] bg-[#eef1f5] px-[18px] py-3 text-[16px] font-medium leading-[1.5] text-ink animate-om-bounce">
                    {turn.text}
                  </p>
                )}
              </div>
            ) : (
              <NoniMessage
                key={i}
                text={turn.text}
                live={i === lastNoni && !settled}
                onDone={() => setSettled(true)}
              />
            ),
          )}
          {error ? (
            <p className="m-0 pl-[46px] text-[14px] font-semibold text-danger">{error}</p>
          ) : null}
          {(finished || snapshot === null) && settled ? (
            <div className="flex items-center gap-4 pl-[46px] animate-om-rise">
              {finished && total > 0 ? (
                <span
                  className="relative inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full animate-om-check"
                  style={{ backgroundColor: "#22C55E", color: "#FFFFFF" }}
                >
                  <Burst colors={sparks} count={26} reach={120} />
                  <Check size={24} strokeWidth={3.5} />
                </span>
              ) : null}
              <button
                type="button"
                disabled={leaving}
                onClick={() => go(snapshot === null ? "/admin/brain" : "/admin")}
                className="group inline-flex cursor-pointer items-center gap-2 rounded-full border-none px-7 py-4 text-[16px] font-bold transition-transform duration-150 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.96] disabled:opacity-60"
                style={{ backgroundColor: accent, color: onAccent }}
              >
                {snapshot === null ? "Open Company Brain" : "Done"}
                <ArrowRight size={17} className="transition-transform duration-150 group-hover:translate-x-1" />
              </button>
            </div>
          ) : null}
          <div ref={end} />
        </main>
      )}

      {ask ? (
        <div className="fixed inset-x-0 bottom-0 bg-gradient-to-t from-[#fbfbfc] via-[#fbfbfc] to-transparent pb-5 pt-10">
          <div className="mx-auto flex w-full max-w-[720px] flex-col gap-3 px-5">
            {answering ? (
              <div className="flex flex-wrap gap-2 animate-om-rise">
                <button
                  type="button"
                  disabled={busy}
                  onClick={yes}
                  className="relative inline-flex cursor-pointer items-center gap-1.5 rounded-full border-none px-7 py-3 text-[16px] font-bold transition-[transform,filter] duration-150 ease-om hover:-translate-y-0.5 hover:brightness-105 active:translate-y-0 active:scale-[0.94] disabled:cursor-default disabled:opacity-60"
                  style={{
                    backgroundColor: accent,
                    color: onAccent,
                    boxShadow: `0 8px 20px color-mix(in srgb, ${accent} 32%, transparent)`,
                  }}
                >
                  {wins > 0 ? <Burst key={wins} colors={sparks} /> : null}
                  <Check size={16} strokeWidth={3.5} />
                  Yes
                </button>
              </div>
            ) : null}
            <div
              onClick={() => box.current?.focus()}
              className="flex cursor-text items-end gap-2 rounded-[28px] border-[1.5px] border-slate-300 bg-white py-2.5 pl-5 pr-2.5 shadow-[0_8px_30px_rgba(15,23,42,0.10)] transition-[border-color,box-shadow] duration-150 hover:border-slate-400 focus-within:shadow-[0_0_0_4px_rgba(15,23,42,0.06),0_8px_30px_rgba(15,23,42,0.10)]"
              style={{ borderColor: draft.trim() ? accent : undefined }}
            >
              <textarea
                ref={box}
                autoComplete="off"
                autoCorrect="off"
                {...{ writingsuggestions: "false" }}
                data-gramm="false"
                data-1p-ignore="true"
                data-lpignore="true"
                value={draft}
                disabled={busy || !settled}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    send();
                  }
                }}
                placeholder={busy || !settled ? "Noni is writing…" : "No? Type what is wrong"}
                rows={1}
                className="max-h-[220px] min-h-[28px] flex-1 resize-none self-center border-none bg-transparent py-1.5 text-[16.5px] font-medium leading-[1.5] text-ink caret-blue-500 outline-none placeholder:text-slate-500"
              />
              <button
                type="button"
                aria-label="Send"
                onClick={send}
                disabled={busy || !settled || !draft.trim()}
                className="inline-flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-full border-none transition-[opacity,transform] duration-150 hover:scale-105 active:scale-90 disabled:cursor-default disabled:opacity-25"
                style={{ backgroundColor: accent, color: onAccent }}
              >
                <ArrowUp size={19} strokeWidth={2.5} />
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
