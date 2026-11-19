"use client";

import { ClipboardPaste, FileText, Link2, Loader2, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";

import {
  getBrainContext,
  getBrainIngestStatus,
  listBrainFacts,
  startBrainIngest,
  uploadBrainDocument,
  type BrainResult,
} from "@/app/admin/brain/knowledge-actions";
import {
  ConflictCard,
  FactEditorModal,
  FactRow,
  QuestionCard,
} from "@/components/admin/brain/FactParts";
import { Segmented } from "@/components/admin/posts/Segmented";
import { Card, Chip, Field, FileDrop, Label, Pill, ProgressBar, TextArea } from "@/components/kit";
import {
  BRAIN_SECTIONS,
  BRAIN_UPLOAD_ACCEPT,
  brainUploadProblem,
  coveragePercent,
  failedInputLabel,
  scanLine,
  scanSteps,
  sectionFacts,
  type BrainContext,
  type BrainSection,
  type FactsList,
  type IngestState,
} from "@/lib/admin/brain-model";

/* The Company Brain on the fact model: coverage and what is missing, the
   conflicts and questions that need a person, the records by type, the ways
   to add knowledge, and a view of what a generator is told. Data comes from
   the brain-facts, brain-ingest and brain-context edge functions through
   src/app/admin/brain/knowledge-actions.ts. */

const POLL_MS = 4000;
const SECTION_PAGE = 5;
const CHIP_STYLE = { padding: "3px 9px", fontSize: 11.5 } as const;

function isStore(url: string): boolean {
  return /(^|\/\/|\.)(apps\.apple\.com|play\.google\.com)(\/|$)/i.test(url.trim());
}

/* ── Coverage ──────────────────────────────────────────────────────────── */

function CoverageCard({
  list,
  ingest,
  offerLegacy,
  website,
  busy,
  onImportLegacy,
  onScan,
}: {
  list: FactsList;
  ingest: IngestState | null;
  offerLegacy: boolean;
  website: string;
  busy: boolean;
  onImportLegacy: () => void;
  onScan: () => void;
}) {
  const router = useRouter();
  const pct = coveragePercent(list.coverage);
  const facts = list.groups.flatMap((g) => g.facts);
  const confirmed = facts.filter((f) => f.status === "confirmed").length;
  const sources = ingest?.summary.sources ?? 0;
  const empty = facts.length === 0;

  return (
    <Card pad={0}>
      <div data-tour="brain-docs" className="px-5 py-[18px]">
        <div className="flex flex-wrap items-baseline gap-x-2.5 gap-y-1">
          <span className="text-[34px] font-bold leading-none tracking-[-1px] text-ink">{`${pct}%`}</span>
          <span className="text-[13.5px] font-semibold text-slate-400">covered</span>
          <span className="flex-1" />
          <span className="text-[13px] font-semibold text-slate-500">
            {empty
              ? "Nothing in the brain yet"
              : `${facts.length} ${facts.length === 1 ? "fact" : "facts"} · ${confirmed} confirmed${
                  sources > 0 ? ` · ${sources} ${sources === 1 ? "source" : "sources"}` : ""
                }`}
          </span>
        </div>
        <ProgressBar value={pct} label="Brain coverage" className="mt-3" />
        <div className="mt-3.5 flex flex-wrap items-center gap-2">
          <Pill size="sm" onClick={() => router.push("/admin/brain/survey")}>
            Answer founder questions
          </Pill>
          {empty && website.trim() ? (
            <Pill size="sm" variant="tint" disabled={busy} onClick={onScan}>
              Scan site
            </Pill>
          ) : null}
          {offerLegacy ? (
            <Pill size="sm" variant="tint" disabled={busy} onClick={onImportLegacy}>
              Import earlier brain
            </Pill>
          ) : null}
        </div>
      </div>
      {list.missing.length > 0 ? (
        <div className="border-t border-line px-5 py-3.5">
          <Label>{`Missing · ${list.missing.length}`}</Label>
          <ul className="m-0 mt-1.5 list-none p-0">
            {list.missing.map((item) => (
              <li
                key={item}
                className="flex items-start gap-2.5 py-[4px] text-[13.5px] font-semibold leading-[1.5] text-ink"
              >
                <span className="mt-[7px] h-1.5 w-1.5 shrink-0 bg-amber rounded-pill" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </Card>
  );
}

/* ── Scan state, shown wherever a scan was started ─────────────────────── */

function IngestLine({ ingest, error }: { ingest: IngestState | null; error: string | null }) {
  const run = ingest?.ingest ?? null;
  if (!run && !error) return null;
  const steps = scanSteps(run);
  const done = steps.filter((s) => s.state === "done").length;
  const failed = run?.progress.failed ?? [];
  return (
    <div className="border-t border-line px-5 py-3">
      {error ? (
        <p className="m-0 text-[13px] font-semibold text-danger">{error}</p>
      ) : run ? (
        <>
          <div className="flex items-center gap-2 text-[13px] font-bold text-ink">
            {run.status === "running" ? (
              <Loader2 size={13} className="shrink-0 animate-spin text-blue-500" />
            ) : null}
            <span role="status">{scanLine(ingest)}</span>
          </div>
          {run.status === "running" ? (
            <ProgressBar
              value={((done + 0.5) / steps.length) * 100}
              label="Scan progress"
              className="mt-2"
            />
          ) : null}
          {run.status === "failed" && run.error ? (
            <p className="m-0 mt-1 text-[13px] font-semibold text-danger">{run.error}</p>
          ) : null}
          {failed.map((f) => (
            <p key={f.input} className="m-0 mt-1 text-[13px] font-semibold text-amber">
              {`${failedInputLabel(f.input)} could not be read`}
            </p>
          ))}
        </>
      ) : null}
    </div>
  );
}

/* ── Add knowledge ─────────────────────────────────────────────────────── */

const ADD_MODES = [
  { value: "paste", label: "Text", icon: ClipboardPaste },
  { value: "file", label: "File", icon: FileText },
  { value: "link", label: "Link", icon: Link2 },
] as const;

type AddMode = (typeof ADD_MODES)[number]["value"];

function AddKnowledgeCard({
  ingest,
  onStarted,
}: {
  ingest: IngestState | null;
  onStarted: (state: IngestState) => void;
}) {
  const [mode, setMode] = useState<AddMode>("paste");
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const [link, setLink] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const run = (action: () => Promise<BrainResult<IngestState>>, after: () => void) => {
    if (pending) return;
    setError(null);
    startTransition(async () => {
      const result = await action();
      if (!result.ok) {
        setError(result.error);
        return;
      }
      after();
      onStarted(result.data);
    });
  };

  const addText = () =>
    run(
      () => startBrainIngest({ texts: [{ title, text }] }),
      () => {
        setTitle("");
        setText("");
      },
    );

  const addLink = () =>
    run(
      () => startBrainIngest(isStore(link) ? { appStoreUrls: [link] } : { website: link }),
      () => setLink(""),
    );

  const addFile = (file: File) => {
    const problem = brainUploadProblem(file);
    if (problem) {
      setError(problem);
      return;
    }
    const formData = new FormData();
    formData.set("file", file);
    run(
      () => uploadBrainDocument(formData),
      () => {},
    );
  };

  return (
    <Card pad={0} className="mt-3.5">
      <div className="flex flex-wrap items-center gap-2.5 px-5 py-4">
        <Label className="flex-1">Add knowledge</Label>
        <div className="max-w-full overflow-x-auto">
          <Segmented options={ADD_MODES} value={mode} onSelect={setMode} />
        </div>
      </div>
      <div className="border-t border-line px-5 py-4">
        {mode === "paste" ? (
          <div className="flex flex-col gap-3">
            <Field label="Title" value={title} onChange={(e) => setTitle(e.target.value)} optional />
            <TextArea
              label="Text"
              value={text}
              rows={6}
              disabled={pending}
              onChange={(e) => setText(e.target.value)}
            />
            <div className="flex justify-end">
              <Pill size="sm" disabled={!text.trim() || pending} onClick={addText}>
                {pending ? "Adding…" : "Add text"}
              </Pill>
            </div>
          </div>
        ) : null}
        {mode === "file" ? (
          <FileDrop
            accept={BRAIN_UPLOAD_ACCEPT}
            label="Choose a file"
            busyLabel="Uploading…"
            busy={pending}
            onFile={addFile}
          />
        ) : null}
        {mode === "link" ? (
          <div className="flex flex-col gap-3">
            <Field label="Link" type="url" value={link} onChange={(e) => setLink(e.target.value)} />
            <div className="flex justify-end">
              <Pill size="sm" disabled={!link.trim() || pending} onClick={addLink}>
                {pending ? "Starting…" : "Read link"}
              </Pill>
            </div>
          </div>
        ) : null}
      </div>
      <IngestLine ingest={ingest} error={error} />
    </Card>
  );
}

/* ── Records by type ───────────────────────────────────────────────────── */

function FactSection({
  section,
  list,
  onChanged,
}: {
  section: BrainSection;
  list: FactsList;
  onChanged: () => void;
}) {
  const [all, setAll] = useState(false);
  const [adding, setAdding] = useState(false);
  const facts = sectionFacts(list.groups, section);
  const shown = all ? facts : facts.slice(0, SECTION_PAGE);

  return (
    <Card pad={0} className="mt-3.5">
      <div className="flex items-center gap-2.5 px-5 py-4">
        <Label>{section.title}</Label>
        <span className="flex-1 text-[12.5px] font-semibold text-slate-400">
          {facts.length > 0 ? facts.length : ""}
        </span>
        <Pill size="sm" variant="tint" icon={Plus} onClick={() => setAdding(true)}>
          Add
        </Pill>
      </div>
      {facts.length === 0 ? (
        <p className="m-0 border-t border-line px-5 py-3.5 text-[13.5px] font-semibold text-slate-400">
          Nothing yet
        </p>
      ) : (
        <div className="divide-y divide-line border-t border-line">
          {shown.map((fact) => (
            <FactRow key={fact.id} fact={fact} onChanged={onChanged} />
          ))}
        </div>
      )}
      {facts.length > SECTION_PAGE ? (
        <div className="border-t border-line px-5 py-2.5 text-center">
          <button
            type="button"
            onClick={() => setAll((v) => !v)}
            className="cursor-pointer border-none bg-transparent p-1.5 text-[13px] font-bold text-slate-400"
          >
            {all ? "Show fewer" : `Show all ${facts.length}`}
          </button>
        </div>
      ) : null}
      {adding ? (
        <FactEditorModal
          types={section.types}
          onClose={() => setAdding(false)}
          onSaved={() => {
            setAdding(false);
            onChanged();
          }}
        />
      ) : null}
    </Card>
  );
}

/* ── What the AI sees ──────────────────────────────────────────────────── */

function ContextBlock({ label, text }: { label: string; text: string }) {
  return (
    <div>
      <Label>{label}</Label>
      <p className="mb-0 mt-1.5 whitespace-pre-wrap text-[13px] font-semibold leading-[1.6] text-ink [overflow-wrap:anywhere]">
        {text.trim() || "Nothing"}
      </p>
    </div>
  );
}

function AiContextCard() {
  const [topic, setTopic] = useState("");
  const [context, setContext] = useState<BrainContext | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const show = () => {
    if (pending) return;
    setError(null);
    startTransition(async () => {
      const result = await getBrainContext({ topic });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setContext(result.data.context);
    });
  };

  return (
    <Card pad={0} className="mt-3.5">
      <div className="px-5 py-4">
        <Label>What the AI sees</Label>
        <div className="mt-3 flex flex-wrap items-end gap-2.5">
          <div className="min-w-[200px] flex-1">
            <Field label="Brief topic" value={topic} onChange={(e) => setTopic(e.target.value)} />
          </div>
          <Pill size="sm" disabled={pending} onClick={show} className="mb-[5px]">
            {pending ? "Assembling…" : "Show context"}
          </Pill>
        </div>
        {error ? <p className="m-0 mt-2.5 text-[13px] font-semibold text-danger">{error}</p> : null}
      </div>
      {context ? (
        <div className="flex flex-col gap-4 border-t border-line px-5 py-4 animate-om-rise">
          <div className="flex flex-wrap items-center gap-2">
            <Chip tone={context.coverage < 0.3 ? "amber" : "green"} style={CHIP_STYLE}>
              {`${coveragePercent(context.coverage)}% covered`}
            </Chip>
            {context.conflicts.length > 0 ? (
              <Chip tone="amber" style={CHIP_STYLE}>
                {`${context.conflicts.length} disputed`}
              </Chip>
            ) : null}
          </div>
          <ContextBlock label="Always told" text={context.core} />
          <ContextBlock label="Rules" text={context.constraints} />
          <ContextBlock label="Found for this topic" text={context.retrieved} />
          {context.approvedClaims.length > 0 ? (
            <ContextBlock
              label="Claims it may state"
              text={context.approvedClaims
                .map((c) => (c.qualifier ? `${c.wording} (${c.qualifier})` : c.wording))
                .join("\n")}
            />
          ) : null}
          {context.demoMoments.length > 0 ? (
            <ContextBlock
              label="Demo moments"
              text={context.demoMoments
                .map((d) => [d.title, d.user_action, d.end_state].filter(Boolean).join(": "))
                .join("\n")}
            />
          ) : null}
          {context.conflicts.length > 0 ? (
            <ContextBlock label="Told to avoid" text={context.conflicts.join("\n")} />
          ) : null}
          {context.missing.length > 0 ? (
            <ContextBlock label="Missing" text={context.missing.join("\n")} />
          ) : null}
        </div>
      ) : null}
    </Card>
  );
}

/* ── The view ──────────────────────────────────────────────────────────── */

export function KnowledgeView({
  initialFacts,
  initialIngest,
  hasLegacy,
  website,
}: {
  initialFacts: BrainResult<FactsList>;
  initialIngest: BrainResult<IngestState>;
  /** Old brain content exists (docs, features, research, references). */
  hasLegacy: boolean;
  website: string;
}) {
  const [list, setList] = useState<FactsList | null>(initialFacts.ok ? initialFacts.data : null);
  const [listError, setListError] = useState<string | null>(
    initialFacts.ok ? null : initialFacts.error,
  );
  const [ingest, setIngest] = useState<IngestState | null>(
    initialIngest.ok ? initialIngest.data : null,
  );
  const [startError, setStartError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const reload = async () => {
    const result = await listBrainFacts();
    if (!result.ok) {
      setListError(result.error);
      return;
    }
    setListError(null);
    setList(result.data);
  };

  const running = ingest?.ingest?.status === "running";

  /* Poll a running scan; when it stops, read the records it produced. */
  useEffect(() => {
    if (!running) return;
    const id = window.setInterval(() => {
      void getBrainIngestStatus().then((result) => {
        if (!result.ok) return;
        setIngest(result.data);
        if (result.data.ingest?.status !== "running") {
          void listBrainFacts().then((facts) => {
            if (facts.ok) setList(facts.data);
          });
        }
      });
    }, POLL_MS);
    return () => window.clearInterval(id);
  }, [running]);

  const start = (input: Parameters<typeof startBrainIngest>[0]) => {
    if (pending) return;
    setStartError(null);
    startTransition(async () => {
      const result = await startBrainIngest(input);
      if (!result.ok) {
        setStartError(result.error);
        return;
      }
      setIngest(result.data);
    });
  };

  if (!list) {
    return (
      <Card className="mt-3.5">
        <Label>Brain</Label>
        <p className="mb-0 mt-2 text-[14px] font-semibold text-danger">
          {listError ?? "The brain could not be read."}
        </p>
        <Pill
          size="sm"
          variant="tint"
          className="mt-3"
          disabled={pending}
          onClick={() => startTransition(reload)}
        >
          {pending ? "Trying…" : "Try again"}
        </Pill>
      </Card>
    );
  }

  const legacyImported = ingest?.ingest?.progress.done.includes("legacy") ?? false;
  const attention = list.conflicts.length + list.questions.length;
  const onChanged = () => void reload();

  return (
    <div className="mt-3.5">
      <CoverageCard
        list={list}
        ingest={ingest}
        offerLegacy={hasLegacy && !legacyImported && !running}
        website={website}
        busy={pending || running}
        onImportLegacy={() => start({ importLegacy: true })}
        onScan={() => start({ website, importLegacy: hasLegacy })}
      />
      {startError ? (
        <p className="mb-0 mt-2.5 text-[13px] font-semibold text-danger">{startError}</p>
      ) : null}
      {listError ? (
        <p className="mb-0 mt-2.5 text-[13px] font-semibold text-danger">{listError}</p>
      ) : null}

      {attention > 0 ? (
        <Card pad={0} className="mt-3.5">
          <div className="px-5 py-4">
            <Label>{`Needs your answer · ${attention}`}</Label>
          </div>
          <div className="divide-y divide-line border-t border-line">
            {list.conflicts.map((c) => (
              <ConflictCard key={c.id} conflict={c} list={list} onChanged={onChanged} />
            ))}
            {list.questions.map((q) => (
              <QuestionCard key={q.id} question={q} onChanged={onChanged} />
            ))}
          </div>
        </Card>
      ) : null}

      {BRAIN_SECTIONS.map((section) => (
        <FactSection key={section.id} section={section} list={list} onChanged={onChanged} />
      ))}

      <AddKnowledgeCard ingest={ingest} onStarted={setIngest} />
      <AiContextCard />
    </div>
  );
}
