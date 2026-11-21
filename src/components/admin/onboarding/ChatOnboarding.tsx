"use client";

import { ArrowUp, Check, Loader2 } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";

import { getBrainIngestStatus } from "@/app/admin/brain/knowledge-actions";
import { finishChatOnboarding, startOnboardingScan } from "@/app/onboarding/actions";
import { SnapshotReview } from "@/components/admin/brain/SnapshotReview";
import { GetTheApp } from "@/components/GetTheApp";
import { RestartOnboardingButton } from "@/components/RestartOnboardingButton";
import type { IngestState } from "@/lib/admin/brain-model";
import {
  loadChat,
  sendTurn,
  type ChatAnswer,
  type ChatMessage,
  type ChatProgress,
  type ChatSource,
  type SlotSpec,
} from "@/lib/onboarding-chat";

/* Onboarding as a conversation: Noni asks what a UGC agency asks a new
   client, one message at a time, streamed as it is written. Answers are
   chips for choices and the composer for anything written; a draft from the
   site can be confirmed in one tap. The site is read while they talk, shown
   as a quiet activity line in the thread. */

const POLL_MS = 3000;

/** A site as people say it: www.inkbound.ai. */
function wwwHost(url: string): string {
  const host = url.trim().replace(/^https?:\/\//i, "").replace(/\/.*$/, "").toLowerCase();
  if (!host) return "";
  return host.startsWith("www.") ? host : `www.${host}`;
}

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

function AssistantMessage({ text, streaming }: { text: string; streaming?: boolean }) {
  return (
    <div className="flex gap-3.5 animate-om-rise">
      <Avatar />
      <div className="min-w-0 flex-1 pt-[3px] text-[17px] font-medium leading-[1.6] tracking-[-0.1px] text-ink">
        {text ? (
          <p className="m-0 whitespace-pre-wrap">
            {text}
            {streaming ? <span className="ml-0.5 inline-block h-[18px] w-[2px] translate-y-[3px] animate-pulse bg-ink" /> : null}
          </p>
        ) : (
          <Typing />
        )}
      </div>
    </div>
  );
}

function UserMessage({ text }: { text: string }) {
  return (
    <div className="flex justify-end animate-om-rise">
      <p className="m-0 max-w-[80%] whitespace-pre-wrap rounded-[22px] bg-[#eef1f5] px-[18px] py-3 text-[16px] font-medium leading-[1.5] text-ink">
        {text}
      </p>
    </div>
  );
}

/* The site scan, as a line in the thread, the way an assistant shows a tool. */
function ScanLine({ scan, site }: { scan: IngestState | null; site: string }) {
  const run = scan?.ingest;
  if (!run) return null;
  const host = wwwHost(site);
  const done = run.status === "done";
  const failed = run.status === "failed";
  const pages = scan.summary.sources;
  return (
    <div className="flex items-center gap-2 pl-[46px] text-[14px] font-semibold text-slate-400 animate-om-fade">
      {done ? (
        <Check size={15} className="text-green" />
      ) : failed ? (
        <span className="text-amber">!</span>
      ) : (
        <Loader2 size={15} className="animate-spin text-blue-500" />
      )}
      <span>
        {failed
          ? `Could not finish reading ${host}`
          : done
            ? `Read ${host}${pages ? ` · ${pages} ${pages === 1 ? "page" : "pages"}` : ""}`
            : `Reading ${host}${pages ? ` · ${pages} ${pages === 1 ? "page" : "pages"}` : ""}`}
      </span>
    </div>
  );
}

function Chip({
  label,
  selected,
  onClick,
  disabled,
  wide = false,
  multi = false,
}: {
  label: string;
  selected?: boolean;
  onClick: () => void;
  disabled?: boolean;
  /** A full-width card for a sentence-long choice. */
  wide?: boolean;
  /** Pick-any: shows a check box. */
  multi?: boolean;
}) {
  if (wide) {
    return (
      <button
        type="button"
        disabled={disabled}
        onClick={onClick}
        className={`flex w-full cursor-pointer items-center gap-3 rounded-[18px] border-[1.5px] px-[18px] py-3.5 text-left text-[15.5px] font-bold leading-[1.4] shadow-[0_1px_2px_rgba(15,23,42,0.06),0_2px_8px_rgba(37,99,235,0.08)] transition-[background,border-color,transform,box-shadow] duration-150 ease-om hover:-translate-y-px hover:shadow-[0_4px_14px_rgba(37,99,235,0.16)] active:translate-y-0 active:scale-[0.99] ${
          selected
            ? "border-blue-900 bg-blue-900 text-white"
            : "border-blue-500 bg-blue-500 text-white hover:border-blue-600 hover:bg-blue-600"
        }`}
      >
        {multi ? (
          <span
            className={`inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-[6px] border-[1.5px] ${
              selected ? "border-white bg-white text-blue-900" : "border-white/70 bg-transparent"
            }`}
          >
            {selected ? <Check size={13} strokeWidth={3} /> : null}
          </span>
        ) : null}
        <span className="flex-1">{label}</span>
      </button>
    );
  }
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`cursor-pointer rounded-full border-[1.5px] px-[18px] py-2.5 text-[15px] font-bold shadow-[0_1px_2px_rgba(15,23,42,0.06),0_2px_8px_rgba(37,99,235,0.08)] transition-[background,border-color,transform,box-shadow] duration-150 ease-om hover:-translate-y-px hover:shadow-[0_4px_14px_rgba(37,99,235,0.16)] active:translate-y-0 active:scale-[0.97] disabled:cursor-default disabled:opacity-50 ${
        selected
          ? "border-blue-900 bg-blue-900 text-white"
          : "border-blue-500 bg-blue-500 text-white hover:border-blue-600 hover:bg-blue-600"
      }`}
    >
      {selected ? <Check size={15} strokeWidth={3} className="-ml-0.5 mr-1.5 inline-block -translate-y-px" /> : null}
      {label}
    </button>
  );
}

export function ChatOnboarding({
  companyId,
  email,
  initialScan,
  canRestart = false,
  source,
  done,
}: {
  /** Another conversation in the same format (the apply chat). With one,
      there is no company yet: no site scan, and `done` is what the end shows. */
  source?: ChatSource;
  done?: React.ReactNode;
  /** Testing accounts get a restart button in the header. */
  canRestart?: boolean;
  companyId?: string;
  email: string;
  initialScan?: IngestState | null;
}) {
  const router = useRouter();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [pending, setPending] = useState<SlotSpec | null>(null);
  const [streaming, setStreaming] = useState<string | null>(null);
  const [busy, setBusy] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [picked, setPicked] = useState<string[]>([]);
  const [scan, setScan] = useState<IngestState | null>(initialScan ?? null);
  const [site, setSite] = useState("");
  const [name, setName] = useState("");
  const [finishing, setFinishing] = useState(false);
  const [lastAnswer, setLastAnswer] = useState<ChatAnswer | null>(null);
  const [progress, setProgress] = useState<ChatProgress | null>(null);
  const box = useRef<HTMLTextAreaElement>(null);
  const composer = useRef<HTMLDivElement>(null);
  /* The thread always clears the answer area, however tall it gets. */
  const [composerH, setComposerH] = useState(160);

  const scanRuns = scan?.ingest?.status === "running";

  /* Keep the newest words in view while they stream. */
  useLayoutEffect(() => {
    window.scrollTo({ top: document.documentElement.scrollHeight });
  }, [messages, streaming, pending, composerH]);

  useEffect(() => {
    const el = composer.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setComposerH(el.offsetHeight));
    ro.observe(el);
    return () => ro.disconnect();
  });

  /* A new question puts the cursor in the box, so it reads as a place to
     type. Phones only for written questions, so the keyboard does not cover
     the buttons. */
  useEffect(() => {
    if (!pending || busy || pending.kind === "summary" || pending.kind === "done") return;
    const fine = window.matchMedia("(pointer: fine)").matches;
    if (fine || pending.kind === "text") box.current?.focus({ preventScroll: true });
  }, [pending, busy]);

  /* The composer grows with what is typed. */
  useLayoutEffect(() => {
    const el = box.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 220)}px`;
  }, [draft, pending]);

  useEffect(() => {
    if (!scanRuns) return;
    const id = window.setInterval(() => {
      void getBrainIngestStatus().then((r) => {
        if (r.ok) setScan(r.data);
      });
    }, POLL_MS);
    return () => window.clearInterval(id);
  }, [scanRuns]);

  const turn = useCallback(async (answer: ChatAnswer | null) => {
    setError(null);
    setBusy(true);
    setPending(null);
    setStreaming("");
    try {
      let text = "";
      const next = await sendTurn(
        answer,
        (piece) => {
          text += piece;
          setStreaming(text);
        },
        setProgress,
        source,
      );
      setMessages((m) => [...m, { role: "assistant", text: text.trim(), slot: next?.key ?? "end" }]);
      setPending(next);
      setPicked([]);
      setDraft("");
      setLastAnswer(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Noni could not answer. Try again.");
      setLastAnswer(answer);
    } finally {
      setStreaming(null);
      setBusy(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [source?.endpoint]);

  /* Open: pick the conversation up where it was, or start it. */
  useEffect(() => {
    let live = true;
    void loadChat(source)
      .then((state) => {
        if (!live) return;
        setName(state.first_name);
        if (state.progress) setProgress(state.progress);
        if (state.messages.length) {
          setMessages(state.messages);
          setPending(state.pending);
          setBusy(false);
        } else void turn(null);
      })
      .catch((e: unknown) => {
        if (!live) return;
        setError(e instanceof Error ? e.message : "The conversation could not be loaded.");
        setBusy(false);
      });
    return () => {
      live = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [turn]);

  const answer = (value: string | string[], text: string) => {
    if (!pending || busy) return;
    const a: ChatAnswer = { slot: pending.key, value, text };
    setMessages((m) => [...m, { role: "user", text, slot: pending.key }]);
    if (pending.key === "website" && companyId) {
      const url = text.trim();
      setSite(url);
      /* Show the read starting at once; the server's state replaces this. */
      setScan({
        started: true,
        ingest: { status: "running", phase: "crawl", progress: { done: [], failed: [], notes: [] }, error: null },
        summary: { sources: 0, sources_pending: 0, facts: 0, facts_confirmed: 0, conflicts_open: 0, coverage: 0, missing: [] },
      });
      void startOnboardingScan(companyId, { website: url }).then((r) => {
        if (r.ok) setScan(r.data);
        else setScan(null);
      });
    }
    void turn(a);
  };

  const send = () => {
    let text = draft.trim();
    if (!text || !pending) return;
    /* The box shows "www." in front; whatever they typed becomes www.domain. */
    if (pending.key === "website") text = wwwHost(text);
    if (pending.kind === "multi") return answer(picked.length ? picked : [text], text);
    answer(text, text);
  };

  const finish = async () => {
    if (!companyId) return;
    setFinishing(true);
    const r = await finishChatOnboarding(companyId);
    if (!r.ok) {
      setFinishing(false);
      setError(r.error);
      return;
    }
    router.push("/admin?tour=1");
  };

  const scanAfter = messages.findIndex((m) => m.role === "user" && m.slot === "website");
  const choice = pending && (pending.kind === "choice" || pending.kind === "multi") && !busy;
  const composerOn = pending && pending.kind !== "summary" && pending.kind !== "done";

  return (
    <div className="flex min-h-screen flex-col bg-[#fbfbfc] font-ops">
      <style>{`@keyframes chat-dot { 0%, 80%, 100% { opacity: .25; transform: translateY(0) } 40% { opacity: 1; transform: translateY(-3px) } }`}</style>
      <header className="sticky top-0 z-10 flex items-center gap-[9px] bg-[#fbfbfc]/85 px-5 py-4 backdrop-blur sm:px-7">
        <Image src="/brand/noni-logo.svg" alt="" width={26} height={26} />
        <span className="text-[18px] font-bold tracking-[-0.6px] text-ink">noni</span>
        <span className="flex-1" />
        {canRestart ? <RestartOnboardingButton variant="pill" /> : null}
        {progress && progress.total > 0 ? (
          <span className="flex items-center gap-2.5" aria-label={`${progress.at} of ${progress.total} answered`}>
            <span className="hidden text-[13px] font-semibold text-slate-400 sm:inline">
              {progress.at >= progress.total ? "Done" : `${progress.total - progress.at} to go`}
            </span>
            <span className="h-1.5 w-24 overflow-hidden rounded-full bg-line sm:w-32">
              <span
                className="block h-full rounded-full bg-blue-500 transition-[width] duration-500 ease-om-spring"
                style={{ width: `${Math.round((progress.at / progress.total) * 100)}%` }}
              />
            </span>
          </span>
        ) : null}
      </header>

      <main
        className="mx-auto flex w-full max-w-[720px] flex-1 flex-col gap-7 px-5 pt-6"
        style={{ paddingBottom: (composerOn ? composerH : 0) + 48 }}
      >
        {messages.map((m, i) => (
          <div key={i} className="flex flex-col gap-3">
            {m.role === "assistant" ? <AssistantMessage text={m.text} /> : <UserMessage text={m.text} />}
            {i === scanAfter ? <ScanLine scan={scan} site={site || m.text} /> : null}
          </div>
        ))}
        {streaming !== null ? <AssistantMessage text={streaming} streaming /> : null}

        {pending?.kind === "summary" && !busy ? (
          <div className="pl-[46px] animate-om-rise">
            <SnapshotReview
              compact
              refreshKey={scan?.ingest ? `${scan.ingest.status}:${scan.ingest.phase}:${scan.summary.sources}` : undefined}
              scanning={scanRuns}
              pending={busy}
              onDone={() => answer("done", "Looks right")}
            />
          </div>
        ) : null}

        {pending?.kind === "done" && !busy && done ? (
          <div className="pl-[46px] animate-om-rise">{done}</div>
        ) : null}

        {pending?.kind === "done" && !busy && !done ? (
          <div className="flex flex-col gap-4 pl-[46px] animate-om-rise">
            <button
              type="button"
              onClick={() => void finish()}
              disabled={finishing}
              className="w-full cursor-pointer rounded-full border-none bg-ink px-6 py-4 text-[16px] font-bold text-white transition-transform duration-150 active:scale-[0.98] disabled:opacity-60 sm:w-auto sm:self-start"
            >
              {finishing ? "Opening Noni…" : "Open Noni"}
            </button>
            <div className="rounded-[20px] border border-line bg-white p-5">
              <GetTheApp email={email} name={name} source="onboarding" look="ops" showOpenApp={false} onDownload={() => {}} />
            </div>
          </div>
        ) : null}

        {error ? (
          <div className="flex items-center gap-3 pl-[46px] text-[14px] font-semibold text-danger">
            <span>{error}</span>
            {lastAnswer || messages.length === 0 ? (
              <button
                type="button"
                className="cursor-pointer rounded-full border border-line bg-white px-3 py-1.5 text-[13px] font-bold text-ink"
                onClick={() => {
                  if (lastAnswer) setMessages((m) => m.slice(0, -1));
                  void turn(lastAnswer);
                }}
              >
                Try again
              </button>
            ) : null}
          </div>
        ) : null}
      </main>

      {composerOn ? (
        <div ref={composer} className="fixed inset-x-0 bottom-0 bg-gradient-to-t from-[#fbfbfc] via-[#fbfbfc] to-transparent pb-5 pt-10">
          <div className="mx-auto flex w-full max-w-[720px] flex-col gap-3 px-5">
            {choice && pending.options ? (
              <div
                className={`animate-om-rise ${
                  /* Sentences read better as a stack of cards than as pills. */
                  pending.options.some((o) => o.label.length > 28) ? "flex flex-col items-stretch gap-2" : "flex flex-wrap gap-2"
                }`}
              >
                {pending.options.map((o) => (
                  <Chip
                    key={o.value}
                    label={o.label}
                    wide={pending.options!.some((x) => x.label.length > 28)}
                    multi={pending.kind === "multi"}
                    selected={picked.includes(o.value)}
                    onClick={() => {
                      if (pending.kind === "multi") {
                        setPicked((p) => (p.includes(o.value) ? p.filter((x) => x !== o.value) : [...p, o.value]));
                      } else answer(o.value, o.label);
                    }}
                  />
                ))}
                {pending.kind === "multi" && picked.length ? (
                  <button
                    type="button"
                    onClick={() =>
                      answer(
                        picked,
                        pending.options!.filter((o) => picked.includes(o.value)).map((o) => o.label).join(", "),
                      )
                    }
                    className="cursor-pointer rounded-full border-none bg-ink px-6 py-2.5 text-[15px] font-bold text-white shadow-[0_4px_14px_rgba(15,23,42,0.18)] active:scale-[0.97]"
                  >
                    Continue
                  </button>
                ) : null}
              </div>
            ) : null}
            {pending.kind === "text" && pending.draft && !busy ? (
              <div className="flex flex-wrap gap-2 animate-om-rise">
                <button
                  type="button"
                  onClick={() =>
                    pending.key === "website"
                      ? answer(wwwHost(pending.draft!), wwwHost(pending.draft!))
                      : answer(pending.draft!, pending.draft!)
                  }
                  className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border-none bg-blue-500 px-4 py-2.5 text-[15px] font-bold text-white active:scale-[0.97]"
                >
                  <Check size={16} strokeWidth={3} />
                  {pending.key === "website" ? `Yes, ${wwwHost(pending.draft)}` : "That's right"}
                </button>
                {pending.key !== "website" ? (
                  <Chip
                    label="Let me edit it"
                    onClick={() => {
                      setDraft(pending.draft!);
                      box.current?.focus();
                    }}
                  />
                ) : null}
              </div>
            ) : null}
            <div
              onClick={() => box.current?.focus()}
              className="flex cursor-text items-end gap-2 rounded-[28px] border-[1.5px] border-slate-300 bg-white py-2.5 pl-5 pr-2.5 shadow-[0_8px_30px_rgba(15,23,42,0.10)] transition-[border-color,box-shadow] duration-150 hover:border-slate-400 focus-within:border-blue-500 focus-within:shadow-[0_0_0_4px_rgba(59,130,246,0.15),0_8px_30px_rgba(15,23,42,0.10)]"
            >
              {pending.key === "website" ? (
                <span className="-mr-2 select-none self-center py-2 text-[16px] font-medium text-slate-400">www.</span>
              ) : null}
              <textarea
                ref={box}
                /* Keep browser AI writing help, autofill and extensions out of
                   the chat box: they popped grey suggestion boxes over it. */
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="sentences"
                {...{ writingsuggestions: "false" }}
                data-gramm="false"
                data-gramm_editor="false"
                data-enable-grammarly="false"
                data-1p-ignore="true"
                data-lpignore="true"
                value={draft}
                disabled={busy}
                onChange={(e) =>
                  setDraft(
                    pending.key === "website"
                      ? e.target.value.replace(/^\s*(https?:\/\/)?(www\.)?/i, "")
                      : e.target.value,
                  )
                }
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    send();
                  }
                }}
                placeholder={
                  busy
                    ? "Noni is writing…"
                    : pending.kind === "text"
                      ? pending.key === "website"
                        ? "yourcompany.com"
                        : pending.placeholder || "Type your answer here"
                      : pending.placeholder || "Or type it in your own words"
                }
                rows={pending.kind === "text" && pending.key !== "website" ? 2 : 1}
                className="max-h-[220px] min-h-[28px] flex-1 resize-none self-center border-none bg-transparent py-1.5 text-[16.5px] font-medium leading-[1.5] text-ink caret-blue-500 outline-none placeholder:text-slate-500"
              />
              <button
                type="button"
                aria-label="Send"
                onClick={send}
                disabled={busy || !draft.trim()}
                className="inline-flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-full border-none bg-ink text-white transition-[opacity,transform] duration-150 active:scale-90 disabled:cursor-default disabled:opacity-25"
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
