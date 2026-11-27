"use client";

import {
  Camera,
  Check,
  Pencil,
  X,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState, useTransition, type ReactNode } from "react";

import {
} from "@/app/admin/brain/actions";
import {
  getBrainIngestStatus,
  getBrainSnapshot,
  settleBrainSnapshot,
  startBrainIngest,
  type BrainResult,
} from "@/app/admin/brain/knowledge-actions";
import { CompanyMark, useCompanies } from "@/components/CompanySwitcher";
import { LogoCropModal } from "@/components/company/LogoCropModal";
import { Card, Pill } from "@/components/kit";
import {
  bulletOf,
  needsBullets,
  scanSteps,
  type CompanySnapshot,
  type IngestState,
  type SnapshotItem,
  type SnapshotPart,
} from "@/lib/admin/brain-model";
import { COMPANY_LOGO_ACCEPT, validateCompanyLogo } from "@/lib/company-logo";

/* Company Brain as a company sees it, on one screen with no scrolling: four
   labelled bullets (you sell, it is for, the hook, it does), each a few
   words and fixed by clicking it. Screenshots live in the Media library, not here.
   Nothing to review, score or check off: Noni keeps the detail on its side,
   on the full brain page the Noni team uses. */

const POLL_MS = 4000;




const FIELD =
  "box-border w-full border border-line bg-white px-3.5 py-2.5 font-semibold text-ink outline-none rounded-ops-sm focus:border-blue-500 focus:[box-shadow:var(--ring-focus)]";

/* ── One line of the summary ───────────────────────────────────────────── */


type Slot = { part: SnapshotPart; index?: number };
const slotKey = (s: Slot) => (s.index === undefined ? s.part : `${s.part}:${s.index}`);

/* ── The summary: four labelled bullets ────────────────────────────────── */

function BulletEditor({
  value,
  busy,
  onSave,
  onCancel,
}: {
  value: string;
  busy: boolean;
  onSave: (text: string) => void;
  onCancel: () => void;
}) {
  const [text, setText] = useState(value);
  return (
    <form
      className="flex min-w-0 flex-1 items-center gap-2 animate-om-rise"
      onSubmit={(e) => {
        e.preventDefault();
        if (text.trim() && !busy) onSave(text.trim());
      }}
    >
      <input
        aria-label="Edit"
        value={text}
        autoFocus
        maxLength={90}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Escape") onCancel();
        }}
        className={`${FIELD} min-w-0 flex-1 py-2 text-[15px]`}
      />
      <Pill size="sm" type="submit" disabled={!text.trim() || busy}>
        {busy ? "Saving…" : "Save"}
      </Pill>
      <Pill size="sm" variant="ghost" onClick={onCancel}>
        Cancel
      </Pill>
    </form>
  );
}

function Summary({
  snapshot,
  onChange,
}: {
  snapshot: CompanySnapshot;
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

  /* One bullet: click it to fix it. A feature keeps its sentence and takes
     the new words as its name; the other lines become the new words. */
  const bullet = (slot: Slot, item: SnapshotItem) => {
    const key = slotKey(slot);
    const text = bulletOf(item, slot.part);
    if (editing === key) {
      return (
        <BulletEditor
          key={key}
          value={text}
          busy={pending}
          onCancel={() => setEditing(null)}
          onSave={(next) =>
            slot.part === "features"
              ? settle(slot, "confirm", next, item.text)
              : settle(slot, "confirm", item.title, next)
          }
        />
      );
    }
    return (
      <span key={key} className="group flex min-w-0 items-center gap-1">
        <button
          type="button"
          title={item.text}
          onClick={() => setEditing(key)}
          className="-mx-2 min-w-0 cursor-pointer border-none bg-transparent px-2 py-1 text-left text-[16px] font-bold leading-[1.35] tracking-[-0.2px] text-ink rounded-ops-sm hover:bg-fill-quiet"
        >
          {text}
        </button>
        <Pencil
          size={13}
          className="shrink-0 text-slate-300 opacity-0 transition-opacity duration-150 group-hover:opacity-100"
        />
        {slot.part === "features" ? (
          <button
            type="button"
            aria-label={`Remove ${text}`}
            onClick={() => settle(slot, "dismiss")}
            className="inline-flex h-6 w-6 shrink-0 cursor-pointer items-center justify-center border-none bg-transparent text-slate-300 opacity-0 transition-opacity duration-150 rounded-pill hover:bg-fill-quiet hover:text-ink group-hover:opacity-100"
          >
            <X size={13} />
          </button>
        ) : null}
      </span>
    );
  };

  const row = (label: string, children: ReactNode, hero = false) => (
    <div className="flex flex-col gap-1 px-6 py-3.5 sm:flex-row sm:items-baseline sm:gap-5">
      <span
        className={`flex w-[132px] shrink-0 items-center gap-1.5 text-[12px] font-bold uppercase tracking-[0.5px] ${
          hero ? "text-blue-700" : "text-slate-400"
        }`}
      >
        {hero ? <Zap size={12} /> : null}
        {label}
      </span>
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">{children}</div>
    </div>
  );

  const shown = (item: SnapshotItem | null): item is SnapshotItem =>
    item !== null && item.status !== "dismissed";
  const features = snapshot.features
    .map((item, index) => ({ item, index }))
    .filter((f) => f.item.status !== "dismissed");

  return (
    <Card pad={0} className="overflow-hidden">
      <div className="divide-y divide-line">
        {shown(snapshot.sells) ? row("Sells", bullet({ part: "sells" }, snapshot.sells)) : null}
        {shown(snapshot.audience)
          ? row("For", bullet({ part: "audience" }, snapshot.audience))
          : null}
        {shown(snapshot.viral)
          ? row("Hook", bullet({ part: "viral" }, snapshot.viral), true)
          : null}
        {features.length > 0
          ? row(
              "Does",
              features.map(({ item, index }) => bullet({ part: "features", index }, item)),
            )
          : null}
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

/* ── The page ──────────────────────────────────────────────────────────── */

export function BrainHome({
  companyName,
  logoPath,
  website,
  snapshot: initialSnapshot,
  ingest: initialIngest,
  staff = false,
}: {
  companyName: string;
  logoPath: string | null;
  website: string;
  /** The stored summary, null until one has been written. */
  snapshot: CompanySnapshot | null;
  ingest: BrainResult<IngestState>;
  /** The Noni team also gets a link to the full brain. */
  staff?: boolean;
}) {
  const [snapshot, setSnapshot] = useState(initialSnapshot);
  const [ingest, setIngest] = useState<IngestState | null>(
    initialIngest.ok ? initialIngest.data : null,
  );
  const [writing, setWriting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [starting, setStarting] = useState(false);

  const [logo, setLogo] = useState(logoPath);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const logoRef = useRef<HTMLInputElement>(null);
  const { setActiveLogo } = useCompanies();

  const running = ingest?.ingest?.status === "running";
  const knowsSomething = (ingest?.summary.facts ?? 0) > 0;
  const hasSnapshot = snapshot !== null;

  /* Poll a running read. */
  useEffect(() => {
    if (!running) return;
    const id = window.setInterval(() => {
      void getBrainIngestStatus().then((result) => {
        if (!result.ok) return;
        setIngest(result.data);
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

  /* A summary written before bullets gets them once, on the first open. */
  const askedForBullets = useRef(false);
  const lacksBullets = snapshot !== null && needsBullets(snapshot);
  useEffect(() => {
    if (!lacksBullets || askedForBullets.current) return;
    askedForBullets.current = true;
    let live = true;
    void getBrainSnapshot().then((result) => {
      if (live && result.ok && result.data) setSnapshot(result.data);
    });
    return () => {
      live = false;
    };
  }, [lacksBullets]);

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

  const pickLogo = (file: File | null) => {
    if (!file) return;
    const invalid = validateCompanyLogo(file);
    if (invalid) {
      setError(invalid);
      return;
    }
    setError(null);
    setLogoFile(file);
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
              "opacity-0 group-hover:opacity-100"
            }`}
          >
            <Camera size={16} />
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
        {logoFile ? (
          <LogoCropModal
            file={logoFile}
            onClose={() => setLogoFile(null)}
            onSaved={(path) => {
              setLogoFile(null);
              setLogo(path);
              setActiveLogo(path);
            }}
          />
        ) : null}
        <div className="min-w-0 flex-1">
          <h1 className="display m-0 text-[24px] font-bold leading-[1.1] tracking-[-0.6px] text-ink">
            {companyName}
          </h1>
        </div>
        {staff ? (
          <Link href="/admin/brain/full" className="text-[12.5px] font-bold text-slate-400 no-underline hover:text-blue-700">
            Noni team: full brain
          </Link>
        ) : null}
      </div>

      <div className="animate-om-rise">
        {snapshot ? (
          <Summary snapshot={snapshot} onChange={setSnapshot} />
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
    </div>
  );
}
