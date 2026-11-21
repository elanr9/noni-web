"use client";

import { ArrowRight, ArrowUp, Check } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

import {
  getBrainSnapshot,
  settleBrainSnapshot,
  startBrainIngest,
} from "@/app/admin/brain/knowledge-actions";
import { useNavigate } from "@/components/motion/NavProgress";
import {
  bulletOf,
  needsBullets,
  type CompanySnapshot,
  type SnapshotItem,
  type SnapshotPart,
} from "@/lib/admin/brain-model";

/* The company confirms what Noni knows about it in a short chat: Noni reads
   the summary back one line at a time (what you sell, who it is for, the
   hook, what it does) and each gets one tap, Yes or Not quite. Not quite
   takes the right version in the company's own words. The script is fixed
   here; no model writes the questions. At most four questions. */

type Ask =
  | { kind: "line"; part: Exclude<SnapshotPart, "features">; lead: string; item: SnapshotItem }
  | { kind: "features"; lead: string; items: Array<{ index: number; item: SnapshotItem }> };

const LEADS: Record<Exclude<SnapshotPart, "features">, string> = {
  sells: "You sell",
  audience: "It is for",
  viral: "The moment that sells it on video",
};

/** The questions still open, in order. Lines already confirmed are not asked again. */
function asksOf(snapshot: CompanySnapshot): Ask[] {
  const out: Ask[] = [];
  for (const part of ["sells", "audience", "viral"] as const) {
    const item = snapshot[part];
    if (item && item.status === "open") out.push({ kind: "line", part, lead: LEADS[part], item });
  }
  const features = snapshot.features
    .map((item, index) => ({ item, index }))
    .filter((f) => f.item.status !== "dismissed");
  if (features.some((f) => f.item.status === "open")) {
    out.push({ kind: "features", lead: "And this is what it does", items: features });
  }
  return out;
}

type Turn = { from: "noni"; ask: Ask } | { from: "noni"; text: string } | { from: "me"; text: string };

function Avatar() {
  return (
    <span className="mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white shadow-[0_1px_3px_rgba(15,23,42,0.12)]">
      <Image src="/brand/noni-logo.svg" alt="" width={18} height={18} />
    </span>
  );
}

function NoniSays({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex gap-3.5 animate-om-rise">
      <Avatar />
      <div className="min-w-0 flex-1 pt-[3px] text-[16px] font-medium leading-[1.55] text-ink">
        {children}
      </div>
    </div>
  );
}

function AskBody({ ask }: { ask: Ask }) {
  if (ask.kind === "line") {
    return (
      <>
        <span className="text-slate-500">{ask.lead}:</span>
        <span className="mt-0.5 block text-[19px] font-bold leading-[1.35] tracking-[-0.3px]">
          {/* A chat has room for the whole sentence when there is no bullet yet. */}
          {ask.item.short?.trim() || ask.item.text}
        </span>
      </>
    );
  }
  return (
    <>
      <span className="text-slate-500">{ask.lead}:</span>
      <span className="mt-1 flex flex-col gap-0.5">
        {ask.items.map(({ item, index }) => (
          <span key={index} className="flex items-baseline gap-2 text-[16.5px] font-bold tracking-[-0.2px]">
            <span className="h-1.5 w-1.5 shrink-0 -translate-y-[3px] bg-blue-500 rounded-pill" />
            {bulletOf(item, "features")}
          </span>
        ))}
      </span>
    </>
  );
}

export function BrainConfirm({
  companyName,
  snapshot: initial,
}: {
  companyName: string;
  snapshot: CompanySnapshot | null;
}) {
  const { go, pending: leaving } = useNavigate();
  const [snapshot, setSnapshot] = useState(initial);
  /* The questions are fixed when the chat opens, so answering one does not reshuffle the rest. */
  const [asks, setAsks] = useState<Ask[]>(() => (initial ? asksOf(initial) : []));
  const [at, setAt] = useState(0);
  const [past, setPast] = useState<Turn[]>([]);
  const [fixing, setFixing] = useState(false);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const end = useRef<HTMLDivElement>(null);

  /* A summary written before bullets gets them before the first question is read out. */
  const upgraded = useRef(false);
  useEffect(() => {
    if (upgraded.current || !initial || !needsBullets(initial)) return;
    upgraded.current = true;
    void getBrainSnapshot().then((result) => {
      if (!result.ok || !result.data) return;
      setSnapshot(result.data);
      setAsks((prev) => (prev.length && at === 0 ? asksOf(result.data!) : prev));
    });
  }, [initial, at]);

  useEffect(() => {
    end.current?.scrollIntoView({ block: "end", behavior: "smooth" });
  }, [past.length, fixing]);

  const ask = asks[at] ?? null;
  const total = asks.length;

  const next = (said: string) => {
    if (!ask) return;
    setPast((prev) => [...prev, { from: "noni", ask }, { from: "me", text: said }]);
    setFixing(false);
    setDraft("");
    setAt((n) => n + 1);
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
    if (!ask || busy) return;
    setBusy(true);
    setError(null);
    void confirm(ask).then((problem) => {
      setBusy(false);
      if (problem) setError(problem);
      else next("Yes, that's right");
    });
  };

  /* A fixed line becomes the company's own words. A note about the features
     goes to Noni as something new to read, and the list is confirmed. */
  const fix = () => {
    const words = draft.trim();
    if (!ask || !words || busy) return;
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
      else next(words);
    });
  };

  const done = snapshot !== null && !ask;

  return (
    <div className="mx-auto flex max-w-[680px] flex-col">
      <div className="mb-5 flex items-center gap-3">
        <h1 className="display m-0 flex-1 text-[22px] font-bold tracking-[-0.5px] text-ink">
          What Noni knows about {companyName}
        </h1>
        {total > 0 ? (
          <span className="flex items-center gap-2.5">
            <span className="text-[12.5px] font-bold text-slate-400">
              {Math.min(at, total)} of {total}
            </span>
            <span className="h-1.5 w-24 overflow-hidden bg-line rounded-pill">
              <span
                className="block h-full bg-blue-500 transition-[width] duration-500 ease-om rounded-pill"
                style={{ width: `${(Math.min(at, total) / total) * 100}%` }}
              />
            </span>
          </span>
        ) : null}
      </div>

      <div className="flex flex-col gap-5">
        {snapshot === null ? (
          <NoniSays>
            I have not read your website yet, so there is nothing to check. Open Company Brain and
            give me your site first.
          </NoniSays>
        ) : (
          <NoniSays>
            {total > 0
              ? `I read your website. Here is what I picked up, ${total === 1 ? "one thing" : `${total} quick things`}. Tell me if I got each one right.`
              : "You have already checked everything I know. Nothing left to confirm."}
          </NoniSays>
        )}

        {past.map((turn, i) =>
          turn.from === "me" ? (
            <div key={i} className="flex justify-end animate-om-rise">
              <p className="m-0 max-w-[80%] whitespace-pre-wrap bg-[#eef1f5] px-[18px] py-2.5 text-[15.5px] font-medium leading-[1.5] text-ink rounded-[22px]">
                {turn.text}
              </p>
            </div>
          ) : "ask" in turn ? (
            <NoniSays key={i}>
              <AskBody ask={turn.ask} />
            </NoniSays>
          ) : (
            <NoniSays key={i}>{turn.text}</NoniSays>
          ),
        )}

        {ask ? (
          <div key={at} className="flex flex-col gap-3">
            <NoniSays>
              <AskBody ask={ask} />
            </NoniSays>
            {fixing ? (
              <form
                className="ml-[46px] flex items-end gap-2 border-[1.5px] border-slate-300 bg-white py-2 pl-4 pr-2 rounded-[26px] focus-within:border-blue-500 animate-om-rise"
                onSubmit={(e) => {
                  e.preventDefault();
                  fix();
                }}
              >
                <input
                  aria-label="The right version"
                  value={draft}
                  autoFocus
                  disabled={busy}
                  onChange={(e) => setDraft(e.target.value)}
                  placeholder={
                    ask.kind === "line" ? "Say it the way you would" : "What did I get wrong or miss?"
                  }
                  className="min-w-0 flex-1 self-center border-none bg-transparent py-1 text-[15.5px] font-medium text-ink outline-none placeholder:text-slate-400"
                />
                <button
                  type="submit"
                  aria-label="Send"
                  disabled={!draft.trim() || busy}
                  className="inline-flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center border-none bg-ink text-white rounded-pill disabled:cursor-default disabled:opacity-25"
                >
                  {busy ? <span className="om-spinner" /> : <ArrowUp size={16} strokeWidth={2.6} />}
                </button>
              </form>
            ) : (
              <div className="ml-[46px] flex flex-wrap gap-2 animate-om-rise">
                <button
                  type="button"
                  disabled={busy}
                  onClick={yes}
                  className="inline-flex cursor-pointer items-center gap-1.5 border-none bg-blue-500 px-5 py-2.5 text-[15px] font-bold text-white rounded-pill active:scale-[0.97] disabled:opacity-60"
                >
                  {busy ? <span className="om-spinner" /> : <Check size={15} strokeWidth={3} />}
                  Yes, that&apos;s right
                </button>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => setFixing(true)}
                  className="cursor-pointer border border-line bg-white px-5 py-2.5 text-[15px] font-bold text-ink rounded-pill active:scale-[0.97] disabled:opacity-60"
                >
                  Not quite
                </button>
              </div>
            )}
          </div>
        ) : null}

        {done && total > 0 ? (
          <NoniSays>
            That is everything. Every brief your creators get is written from this, and you can
            change any of it later in Company Brain.
          </NoniSays>
        ) : null}

        {error ? (
          <p className="m-0 ml-[46px] text-[13px] font-semibold text-danger">{error}</p>
        ) : null}

        {!ask ? (
          <div className="ml-[46px] animate-om-rise">
            <button
              type="button"
              disabled={leaving}
              onClick={() => go(snapshot === null ? "/admin/brain" : "/admin")}
              className="inline-flex cursor-pointer items-center gap-2 border-none bg-ink px-6 py-3 text-[15px] font-bold text-white rounded-pill active:scale-[0.98] disabled:opacity-60"
            >
              {snapshot === null ? "Open Company Brain" : "Back to setup"}
              <ArrowRight size={16} />
            </button>
          </div>
        ) : null}
        <div ref={end} />
      </div>
    </div>
  );
}
