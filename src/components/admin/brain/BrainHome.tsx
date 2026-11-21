"use client";

import {
  ArrowUp,
  AtSign,
  Camera,
  Check,
  Mic,
  Music2,
  Paperclip,
  Pencil,
  Plus,
  Square,
  X,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState, useTransition, type ReactNode } from "react";

import {
  addInspirationAccount,
  removeInspirationAccount,
  saveCompanyLogo,
  transcribeBrainNote,
  type BrainActionResult,
} from "@/app/admin/brain/actions";
import {
  getBrainIngestStatus,
  getBrainSnapshot,
  settleBrainSnapshot,
  startBrainIngest,
  uploadBrainDocument,
  type BrainResult,
} from "@/app/admin/brain/knowledge-actions";
import { useVoiceRecorder } from "@/components/admin/brain/useVoiceRecorder";
import { Segmented } from "@/components/admin/posts/Segmented";
import { CompanyMark, useCompanies } from "@/components/CompanySwitcher";
import { Card, Pill, Tabs } from "@/components/kit";
import {
  BRAIN_UPLOAD_ACCEPT,
  brainUploadProblem,
  scanSteps,
  type CompanySnapshot,
  type IngestState,
  type SnapshotItem,
  type SnapshotPart,
} from "@/lib/admin/brain-model";
import type { InspirationAccount, Platform } from "@/lib/admin/types";
import { COMPANY_LOGO_ACCEPT, validateCompanyLogo } from "@/lib/company-logo";

/* Company Brain as a company sees it, on one screen with no scrolling: three
   tabs (About: what you sell, who it is for and the moment that sells it;
   Features: what it does; Accounts: the accounts you like) over one box to
   tell Noni something new. Screenshots live in the Media library, not here.
   Nothing to review, score or check off: Noni keeps the detail on its side,
   on the full brain page the Noni team uses. */

const TABS = ["About", "Features", "Accounts"] as const;
type BrainTab = (typeof TABS)[number];

const POLL_MS = 4000;

const PLATFORMS = [
  { value: "tiktok", label: "TikTok", icon: Music2 },
  { value: "instagram", label: "Instagram", icon: AtSign },
] as const;

function isLink(text: string): boolean {
  return /^(https?:\/\/)?[a-z0-9-]+(\.[a-z0-9-]+)+(\/\S*)?$/i.test(text.trim());
}

function isStore(url: string): boolean {
  return /(^|\/\/|\.)(apps\.apple\.com|play\.google\.com)(\/|$)/i.test(url.trim());
}

const FIELD =
  "box-border w-full border border-line bg-white px-3.5 py-2.5 font-semibold text-ink outline-none rounded-ops-sm focus:border-blue-500 focus:[box-shadow:var(--ring-focus)]";

/* ── One line of the summary ───────────────────────────────────────────── */

function IconButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className="inline-flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center border-none bg-transparent text-slate-400 rounded-pill hover:bg-fill-quiet hover:text-ink"
    >
      {children}
    </button>
  );
}

function ItemEditor({
  item,
  withTitle,
  busy,
  onSave,
  onCancel,
}: {
  item: SnapshotItem;
  withTitle: boolean;
  busy: boolean;
  onSave: (title: string, text: string) => void;
  onCancel: () => void;
}) {
  const [title, setTitle] = useState(item.title);
  const [text, setText] = useState(item.text);
  return (
    <div className="flex flex-col gap-2 animate-om-rise">
      {withTitle ? (
        <input
          aria-label="Name"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className={`${FIELD} text-[14.5px]`}
        />
      ) : null}
      <textarea
        aria-label="Text"
        value={text}
        rows={3}
        autoFocus
        onChange={(e) => setText(e.target.value)}
        className={`${FIELD} resize-y text-[15px] leading-[1.5]`}
      />
      <div className="flex gap-2">
        <Pill
          size="sm"
          icon={Check}
          disabled={!text.trim() || busy}
          onClick={() => onSave(title, text)}
        >
          {busy ? "Saving…" : "Save"}
        </Pill>
        <Pill size="sm" variant="quiet" onClick={onCancel}>
          Cancel
        </Pill>
      </div>
    </div>
  );
}

type Slot = { part: SnapshotPart; index?: number };
const slotKey = (s: Slot) => (s.index === undefined ? s.part : `${s.part}:${s.index}`);

/* ── The summary ───────────────────────────────────────────────────────── */

function Summary({
  snapshot,
  part,
  onChange,
}: {
  snapshot: CompanySnapshot;
  /** Which half to show: the three summary lines, or the feature tiles. */
  part: "about" | "features";
  onChange: (next: CompanySnapshot) => void;
}) {
  const [editing, setEditing] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const settle = (slot: Slot, decision: "confirm" | "dismiss", title?: string, text?: string) => {
    if (pending) return;
    setError(null);
    startTransition(async () => {
      const result = await settleBrainSnapshot({ ...slot, decision, title, text });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setEditing(null);
      onChange(result.data);
    });
  };

  const line = (slot: Slot, label: string, item: SnapshotItem | null, hero = false) => {
    if (!item || item.status === "dismissed") return null;
    const key = slotKey(slot);
    return (
      <div
        key={key}
        className={`group flex items-start gap-3 px-6 py-4 ${
          hero ? "bg-blue-50" : ""
        }`}
      >
        <div className="min-w-0 flex-1">
          <span
            className={`mb-1.5 flex items-center gap-1.5 text-[12px] font-bold uppercase tracking-[0.5px] ${
              hero ? "text-blue-700" : "text-slate-400"
            }`}
          >
            {hero ? <Zap size={13} /> : null}
            {label}
          </span>
          {editing === key ? (
            <ItemEditor
              item={item}
              withTitle={false}
              busy={pending}
              onSave={(title, text) => settle(slot, "confirm", title, text)}
              onCancel={() => setEditing(null)}
            />
          ) : (
            <p className="m-0 text-[16.5px] font-bold leading-[1.45] tracking-[-0.2px] text-ink">
              {item.text}
            </p>
          )}
        </div>
        {editing === key ? null : (
          <span className="opacity-0 transition-opacity duration-150 group-hover:opacity-100 focus-within:opacity-100">
            <IconButton label="Edit" onClick={() => setEditing(key)}>
              <Pencil size={14} />
            </IconButton>
          </span>
        )}
      </div>
    );
  };

  const features = snapshot.features
    .map((item, index) => ({ item, index }))
    .filter((f) => f.item.status !== "dismissed");

  return (
    <Card pad={0} className="overflow-hidden">
      <div className="divide-y divide-line">
        {part === "about" ? line({ part: "sells" }, "What you sell", snapshot.sells) : null}
        {part === "about" ? line({ part: "audience" }, "Who it is for", snapshot.audience) : null}
        {part === "about"
          ? line({ part: "viral" }, "The moment that sells it", snapshot.viral, true)
          : null}
        {part === "features" && features.length === 0 ? (
          <p className="m-0 px-6 py-5 text-[13.5px] font-semibold text-slate-400">
            No features yet. Tell Noni about one below.
          </p>
        ) : null}
        {part === "features" && features.length > 0 ? (
          <div className="px-5 py-5">
            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
              {features.map(({ item, index }) => {
                const slot: Slot = { part: "features", index };
                const key = slotKey(slot);
                return (
                  <div
                    key={key}
                    className="group flex items-start gap-1 bg-off-white px-4 py-3.5 rounded-ops-sm"
                  >
                    <div className="min-w-0 flex-1">
                      {editing === key ? (
                        <ItemEditor
                          item={item}
                          withTitle
                          busy={pending}
                          onSave={(title, text) => settle(slot, "confirm", title, text)}
                          onCancel={() => setEditing(null)}
                        />
                      ) : (
                        <>
                          <span className="block text-[14.5px] font-bold text-ink">
                            {item.title}
                          </span>
                          <span className="mt-0.5 line-clamp-3 block text-[13px] font-semibold leading-[1.45] text-slate-500">
                            {item.text}
                          </span>
                        </>
                      )}
                    </div>
                    {editing === key ? null : (
                      <span className="-mr-2 -mt-1.5 flex opacity-0 transition-opacity duration-150 group-hover:opacity-100 focus-within:opacity-100">
                        <IconButton label="Edit" onClick={() => setEditing(key)}>
                          <Pencil size={13} />
                        </IconButton>
                        <IconButton label="Remove" onClick={() => settle(slot, "dismiss")}>
                          <X size={14} />
                        </IconButton>
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ) : null}
      </div>
      {error ? (
        <p className="m-0 border-t border-line px-6 py-3 text-[13px] font-semibold text-danger">
          {error}
        </p>
      ) : null}
    </Card>
  );
}

/* ── Before there is a summary ─────────────────────────────────────────── */

function Waiting({ title, steps }: { title: string; steps?: ReturnType<typeof scanSteps> }) {
  return (
    <Card pad={28} className="flex flex-col items-center text-center">
      <span className="om-spinner text-blue-500" />
      <p className="mb-0 mt-4 text-[18px] font-bold tracking-[-0.2px] text-ink">{title}</p>
      {steps ? (
        <div className="mt-4 flex flex-col gap-1.5 text-left">
          {steps.map((step) => (
            <span
              key={step.label}
              className={`flex items-center gap-2 text-[13.5px] font-semibold ${
                step.state === "waiting" ? "text-slate-300" : "text-slate-500"
              }`}
            >
              <span
                className={`inline-flex h-4 w-4 items-center justify-center rounded-pill ${
                  step.state === "done"
                    ? "bg-green-soft text-green"
                    : step.state === "active"
                      ? "bg-blue-100 text-blue-700"
                      : "bg-fill-quiet"
                }`}
              >
                {step.state === "done" ? <Check size={10} strokeWidth={3} /> : null}
              </span>
              {step.label}
            </span>
          ))}
        </div>
      ) : null}
    </Card>
  );
}

function ReadSite({
  website,
  busy,
  error,
  onRead,
}: {
  website: string;
  busy: boolean;
  error: string | null;
  onRead: (url: string) => void;
}) {
  const [url, setUrl] = useState(website);
  return (
    <Card pad={28} className="text-center">
      <p className="m-0 text-[20px] font-bold tracking-[-0.3px] text-ink">
        Noni has not read your site yet
      </p>
      <p className="mx-auto mb-0 mt-1.5 max-w-[420px] text-[14px] font-semibold leading-[1.5] text-slate-400">
        Give Noni your website and it learns what you sell in about a minute.
      </p>
      <form
        className="mx-auto mt-5 flex max-w-[460px] items-center gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          if (url.trim() && !busy) onRead(url);
        }}
      >
        <input
          aria-label="Website"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="yourcompany.com"
          className={`${FIELD} rounded-pill px-4 text-[14.5px]`}
        />
        <Pill type="submit" disabled={!url.trim() || busy}>
          {busy ? "Starting…" : "Read my site"}
        </Pill>
      </form>
      {error ? (
        <p className="mb-0 mt-3 text-[13px] font-semibold text-danger">{error}</p>
      ) : null}
    </Card>
  );
}

/* ── Tell Noni ─────────────────────────────────────────────────────────── */

type NoteState = "idle" | "sending" | "reading" | "done";

function TellNoni({
  state,
  onSend,
  onReset,
}: {
  state: NoteState;
  onSend: (action: () => Promise<BrainResult<IngestState>>) => Promise<string | null>;
  onReset: () => void;
}) {
  const [text, setText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [hearing, setHearing] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const voice = useVoiceRecorder((audio) => {
    setHearing(true);
    void transcribeBrainNote(audio).then((result) => {
      if (result.ok) setText((prev) => [prev.trim(), result.text].filter(Boolean).join(" "));
      else setError(result.error);
      setHearing(false);
    });
  });

  const busy = state === "sending" || hearing;

  const send = async (action: () => Promise<BrainResult<IngestState>>, after?: () => void) => {
    if (busy) return;
    setError(null);
    const problem = await onSend(action);
    if (problem) setError(problem);
    else after?.();
  };

  const submit = () => {
    const value = text.trim();
    if (!value) return;
    void send(
      () =>
        isLink(value)
          ? startBrainIngest(isStore(value) ? { appStoreUrls: [value] } : { website: value })
          : startBrainIngest({ texts: [{ text: value }] }),
      () => setText(""),
    );
  };

  const addFile = (file: File | null) => {
    if (!file) return;
    const problem = brainUploadProblem(file);
    if (problem) {
      setError(problem);
      return;
    }
    const formData = new FormData();
    formData.set("file", file);
    void send(() => uploadBrainDocument(formData));
  };

  const status =
    state === "sending"
      ? "Sending…"
      : state === "reading"
        ? "Noni is reading it"
        : state === "done"
          ? "Got it. Noni knows this now."
          : hearing
            ? "Writing down what you said…"
            : voice.recording
              ? "Listening. Tap stop when you are done."
              : null;

  return (
    <div>
      <div className="flex items-end gap-1 border border-line bg-white py-2 pl-2 pr-2 shadow-card rounded-[26px] focus-within:border-blue-300">
        <IconButton
          label={voice.recording ? "Stop" : "Speak"}
          onClick={() => {
            setError(null);
            if (voice.recording) voice.stop();
            else if (!busy) void voice.start();
          }}
        >
          {voice.recording ? (
            <Square size={13} className="fill-danger text-danger" />
          ) : (
            <Mic size={16} />
          )}
        </IconButton>
        <IconButton label="Add a file" onClick={() => fileRef.current?.click()}>
          <Paperclip size={16} />
        </IconButton>
        <input
          ref={fileRef}
          type="file"
          accept={BRAIN_UPLOAD_ACCEPT}
          className="hidden"
          onChange={(e) => {
            addFile(e.target.files?.[0] ?? null);
            e.target.value = "";
          }}
        />
        <textarea
          aria-label="Tell Noni something new"
          value={text}
          rows={1}
          disabled={busy || voice.recording}
          onChange={(e) => {
            setText(e.target.value);
            if (state === "done") onReset();
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              submit();
            }
          }}
          placeholder={
            status ?? "Tell Noni something new: a feature, a price change, a link…"
          }
          className="box-border block max-h-[84px] min-w-0 flex-1 resize-none self-center border-none bg-transparent px-2 py-1 text-[15px] font-semibold leading-[1.45] text-ink outline-none [field-sizing:content] placeholder:text-slate-300"
        />
        <button
          type="button"
          aria-label="Send"
          disabled={!text.trim() || busy}
          onClick={submit}
          className="inline-flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center border-none bg-blue-500 text-white rounded-pill transition-opacity duration-150 disabled:cursor-default disabled:opacity-30"
        >
          <ArrowUp size={16} strokeWidth={2.6} />
        </button>
      </div>
      {error ?? voice.error ?? (text && status) ? (
        <p
          role="status"
          className={`mb-0 ml-4 mt-1.5 flex items-center gap-1.5 text-[12.5px] font-semibold ${
            error ?? voice.error ? "text-danger" : state === "done" ? "text-green" : "text-slate-400"
          }`}
        >
          {error ?? voice.error ?? status}
        </p>
      ) : state === "done" ? (
        <p role="status" className="mb-0 ml-4 mt-1.5 flex items-center gap-1.5 text-[12.5px] font-semibold text-green">
          <Check size={13} strokeWidth={3} /> Got it. Noni knows this now.
        </p>
      ) : null}
    </div>
  );
}

/* ── Shared heading ────────────────────────────────────────────────────── */

function SectionHead({ title, sub, right }: { title: string; sub: string; right: ReactNode }) {
  return (
    <div className="mb-2.5 flex items-end gap-3">
      <div className="min-w-0 flex-1">
        <h2 className="m-0 text-[17px] font-bold tracking-[-0.2px] text-ink">{title}</h2>
        <p className="mb-0 mt-0.5 text-[13.5px] font-semibold text-slate-400">{sub}</p>
      </div>
      {right}
    </div>
  );
}

/* ── Accounts you like ─────────────────────────────────────────────────── */

function Accounts({
  accounts,
  run,
}: {
  accounts: InspirationAccount[];
  run: (action: () => Promise<BrainActionResult>) => void;
}) {
  const [adding, setAdding] = useState(false);
  const [handle, setHandle] = useState("");
  const [platform, setPlatform] = useState<Platform>("tiktok");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const add = () => {
    const value = handle.trim();
    if (!value || pending) return;
    setError(null);
    startTransition(async () => {
      const result = await addInspirationAccount({ platform, handle: value });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setHandle("");
      setAdding(false);
    });
  };

  return (
    <div>
      <SectionHead
        title="Accounts you like"
        sub="Noni studies their best posts so your briefs copy what works."
        right={
          adding ? null : (
            <Pill size="sm" variant="tint" icon={Plus} onClick={() => setAdding(true)}>
              Add
            </Pill>
          )
        }
      />
      {adding ? (
        <div className="mb-2.5 flex flex-wrap items-center gap-2 animate-om-rise">
          <Segmented options={PLATFORMS} value={platform} onSelect={setPlatform} />
          <input
            aria-label="Handle"
            value={handle}
            autoFocus
            onChange={(e) => setHandle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") add();
              if (e.key === "Escape") setAdding(false);
            }}
            placeholder="@handle"
            className={`${FIELD} min-w-[160px] flex-1 rounded-pill px-4 text-[13.5px]`}
            style={{ width: "auto" }}
          />
          <Pill size="sm" onClick={add} disabled={!handle.trim() || pending}>
            {pending ? "Finding their posts…" : "Add"}
          </Pill>
          <Pill size="sm" variant="ghost" onClick={() => setAdding(false)}>
            Cancel
          </Pill>
        </div>
      ) : null}
      {error ? <p className="mb-2.5 mt-0 text-[13px] font-semibold text-danger">{error}</p> : null}
      {accounts.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {accounts.map((a) => (
            <span
              key={a.platform + a.handle}
              className="inline-flex items-center gap-2 border border-line bg-white py-1.5 pl-3.5 pr-1.5 text-[13.5px] font-bold text-ink shadow-card rounded-pill"
            >
              {a.platform === "tiktok" ? (
                <Music2 size={14} className="text-slate-400" />
              ) : (
                <AtSign size={14} className="text-slate-400" />
              )}
              {a.handle}
              <button
                type="button"
                aria-label={`Remove ${a.handle}`}
                onClick={() =>
                  run(() => removeInspirationAccount({ platform: a.platform, handle: a.handle }))
                }
                className="inline-flex h-6 w-6 cursor-pointer items-center justify-center border-none bg-transparent text-slate-400 rounded-pill hover:bg-fill-quiet hover:text-ink"
              >
                <X size={12} />
              </button>
            </span>
          ))}
        </div>
      ) : adding ? null : (
        <p className="m-0 text-[13.5px] font-semibold text-slate-400">None yet.</p>
      )}
    </div>
  );
}

/* ── The page ──────────────────────────────────────────────────────────── */

export function BrainHome({
  companyName,
  logoPath,
  website,
  snapshot: initialSnapshot,
  ingest: initialIngest,
  accounts,
  staff = false,
}: {
  companyName: string;
  logoPath: string | null;
  website: string;
  /** The stored summary, null until one has been written. */
  snapshot: CompanySnapshot | null;
  ingest: BrainResult<IngestState>;
  accounts: InspirationAccount[];
  /** The Noni team also gets a link to the full brain. */
  staff?: boolean;
}) {
  const [snapshot, setSnapshot] = useState(initialSnapshot);
  const [ingest, setIngest] = useState<IngestState | null>(
    initialIngest.ok ? initialIngest.data : null,
  );
  const [writing, setWriting] = useState(false);
  const [note, setNote] = useState<NoteState>("idle");
  const [tab, setTab] = useState<BrainTab>("About");
  const [error, setError] = useState<string | null>(null);
  const [starting, setStarting] = useState(false);
  const [, startTransition] = useTransition();

  const [logo, setLogo] = useState(logoPath);
  const [logoBusy, setLogoBusy] = useState(false);
  const logoRef = useRef<HTMLInputElement>(null);
  const { setActiveLogo } = useCompanies();

  const running = ingest?.ingest?.status === "running";
  const knowsSomething = (ingest?.summary.facts ?? 0) > 0;
  const hasSnapshot = snapshot !== null;

  /* Poll a running read; when it stops, the note box says so. */
  useEffect(() => {
    if (!running) return;
    const id = window.setInterval(() => {
      void getBrainIngestStatus().then((result) => {
        if (!result.ok) return;
        setIngest(result.data);
        if (result.data.ingest?.status !== "running") {
          setNote((n) => (n === "reading" ? "done" : n));
        }
      });
    }, POLL_MS);
    return () => window.clearInterval(id);
  }, [running]);

  /* Noni has read the site but no summary is stored yet: write it once. */
  useEffect(() => {
    if (hasSnapshot || running || !knowsSomething) return;
    let live = true;
    const timer = window.setTimeout(() => {
      setWriting(true);
      void getBrainSnapshot().then((result) => {
        if (!live) return;
        if (result.ok) setSnapshot(result.data);
        else setError(result.error);
        setWriting(false);
      });
    }, 0);
    return () => {
      live = false;
      window.clearTimeout(timer);
    };
  }, [hasSnapshot, running, knowsSomething]);

  const run = (action: () => Promise<BrainActionResult>) => {
    setError(null);
    startTransition(async () => {
      const result = await action();
      if (!result.ok) setError(result.error);
    });
  };

  const readSite = (url: string) => {
    if (starting) return;
    setError(null);
    setStarting(true);
    void startBrainIngest({ website: url }).then((result) => {
      if (result.ok) setIngest(result.data);
      else setError(result.error);
      setStarting(false);
    });
  };

  const sendNote = async (
    action: () => Promise<BrainResult<IngestState>>,
  ): Promise<string | null> => {
    setNote("sending");
    const result = await action();
    if (!result.ok) {
      setNote("idle");
      return result.error;
    }
    setIngest(result.data);
    setNote(result.data.ingest?.status === "running" ? "reading" : "done");
    return null;
  };

  const pickLogo = (file: File | null) => {
    if (!file || logoBusy) return;
    const invalid = validateCompanyLogo(file);
    if (invalid) {
      setError(invalid);
      return;
    }
    setError(null);
    setLogoBusy(true);
    const formData = new FormData();
    formData.set("logo", file);
    void saveCompanyLogo(formData).then((result) => {
      if (result.ok) {
        setLogo(result.path);
        setActiveLogo(result.path);
      } else setError(result.error);
      setLogoBusy(false);
    });
  };

  return (
    <div className="mx-auto max-w-[980px]">
      <div className="mb-4 flex items-center gap-3.5">
        <button
          type="button"
          aria-label="Change logo"
          title="Change logo"
          onClick={() => logoRef.current?.click()}
          className="group relative shrink-0 cursor-pointer overflow-hidden border-none bg-transparent p-0 rounded-ops-sm"
        >
          <CompanyMark name={companyName} logoPath={logo} size={46} />
          <span
            className={`absolute inset-0 flex items-center justify-center bg-ink/55 text-white transition-opacity duration-150 ${
              logoBusy ? "opacity-100" : "opacity-0 group-hover:opacity-100"
            }`}
          >
            {logoBusy ? <span className="om-spinner" /> : <Camera size={16} />}
          </span>
        </button>
        <input
          ref={logoRef}
          type="file"
          accept={COMPANY_LOGO_ACCEPT}
          className="hidden"
          onChange={(e) => {
            pickLogo(e.target.files?.[0] ?? null);
            e.target.value = "";
          }}
        />
        <div className="min-w-0 flex-1">
          <h1 className="display m-0 text-[24px] font-bold leading-[1.1] tracking-[-0.6px] text-ink">
            {companyName}
          </h1>
          <p className="mb-0 mt-1 text-[13.5px] font-semibold text-slate-400">
            What Noni knows about you. Every brief is written from this.
          </p>
        </div>
      </div>

      <Tabs
        tabs={TABS}
        active={tab}
        onSelect={setTab}
        className="mb-3"
        right={
          staff ? (
            <Link
              href="/admin/brain/full"
              className="text-[12.5px] font-bold text-slate-400 no-underline hover:text-blue-700"
            >
              Noni team: full brain
            </Link>
          ) : null
        }
      />

      <div key={tab} className="animate-om-rise">
        {tab === "Accounts" ? (
          <Card pad={22}>
            <Accounts accounts={accounts} run={run} />
          </Card>
        ) : snapshot ? (
          <Summary
            snapshot={snapshot}
            part={tab === "About" ? "about" : "features"}
            onChange={setSnapshot}
          />
        ) : running ? (
          <Waiting title="Noni is reading your site" steps={scanSteps(ingest?.ingest ?? null)} />
        ) : writing || knowsSomething ? (
          <Waiting title="Noni is writing your summary" />
        ) : (
          <ReadSite website={website} busy={starting} error={null} onRead={readSite} />
        )}
        {error ? (
          <p className="mb-0 mt-2.5 text-[13px] font-semibold text-danger">{error}</p>
        ) : null}
      </div>

      <div className="mt-4">
        <TellNoni state={note} onSend={sendNote} onReset={() => setNote("idle")} />
      </div>
    </div>
  );
}
