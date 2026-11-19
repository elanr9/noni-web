"use client";

import { Check, Pencil, X } from "lucide-react";
import { useState, useTransition } from "react";

import {
  addBrainFact,
  answerBrainQuestion,
  confirmBrainFact,
  dismissBrainQuestion,
  editBrainFact,
  rejectBrainFact,
  resolveBrainConflict,
} from "@/app/admin/brain/knowledge-actions";
import { Chip, Field, Label, Modal, Pill, TextArea } from "@/components/kit";
import {
  conflictTitle,
  ENTITY_SPECS,
  factDetails,
  factLead,
  factSourceLabel,
  factStatus,
  findFact,
  humanize,
  sourceLabel,
  type BrainConflict,
  type BrainQuestion,
  type EntityType,
  type FactsList,
  type FactView,
  type FieldSpec,
  type SourceDetail,
} from "@/lib/admin/brain-model";

/* The pieces a brain record is shown and changed with, shared by the
   onboarding review and the Company Brain page. Each one calls its action
   and then tells the parent to read the list again. */

const CHIP_STYLE = { padding: "3px 9px", fontSize: 11.5 } as const;

function hostOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

export function SourceExcerpts({ sources }: { sources: SourceDetail[] }) {
  const quoted = sources.filter((s) => s.excerpt?.trim());
  if (quoted.length === 0) return null;
  return (
    <div className="flex flex-col gap-2">
      {quoted.map((s, i) => (
        <div key={i} className="border-l-2 border-line-strong pl-3">
          <p className="m-0 text-[13px] font-semibold leading-[1.55] text-slate-500">
            {s.excerpt.trim()}
          </p>
          {s.url ? (
            <a
              href={s.url}
              target="_blank"
              rel="noreferrer"
              className="text-[12px] font-bold text-blue-700 no-underline hover:underline"
            >
              {hostOf(s.url)}
            </a>
          ) : (
            <span className="text-[12px] font-bold text-slate-400">{sourceLabel(s)}</span>
          )}
        </div>
      ))}
    </div>
  );
}

function TextButton({
  children,
  onClick,
  tone = "slate",
}: {
  children: React.ReactNode;
  onClick: () => void;
  tone?: "slate" | "blue";
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`cursor-pointer border-none bg-transparent p-0 text-[12.5px] font-bold ${
        tone === "blue" ? "text-blue-700" : "text-slate-400 hover:text-slate-500"
      }`}
    >
      {children}
    </button>
  );
}

/* ── One record ────────────────────────────────────────────────────────── */

export function FactRow({
  fact,
  canEdit = true,
  onChanged,
}: {
  fact: FactView;
  canEdit?: boolean;
  onChanged: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const status = factStatus(fact);
  const lead = factLead(fact);
  const details = factDetails(fact);
  const hasMore = details.length > 0 || fact.source_details.some((s) => s.excerpt?.trim());
  const settled = fact.status === "confirmed" && !fact.overdue && !fact.in_conflict;

  const run = (action: () => Promise<{ ok: boolean; error?: string }>) => {
    if (pending) return;
    setError(null);
    startTransition(async () => {
      const result = await action();
      if (!result.ok) {
        setError(result.error ?? "That did not save.");
        return;
      }
      onChanged();
    });
  };

  return (
    <div className={`px-5 py-3.5 ${pending ? "opacity-50" : ""}`}>
      <div className="flex items-start gap-2.5">
        <span className="min-w-0 flex-1">
          <span className="block text-[14px] font-bold leading-[1.4] text-ink [overflow-wrap:anywhere]">
            {fact.title}
          </span>
          {lead && lead !== fact.title ? (
            <span className="mt-0.5 block text-[13.5px] font-semibold leading-[1.55] text-slate-500 [overflow-wrap:anywhere]">
              {lead}
            </span>
          ) : null}
        </span>
        <Chip tone={status.tone} style={CHIP_STYLE} className="shrink-0">
          {status.label}
        </Chip>
      </div>

      {open ? (
        <div className="mt-3 flex flex-col gap-3 animate-om-rise">
          {details.length > 0 ? (
            <dl className="m-0 grid grid-cols-[minmax(96px,40%)_1fr] gap-x-4 gap-y-1.5">
              {details.map((row) => (
                <div key={row.label} className="contents">
                  <dt className="text-[12.5px] font-semibold text-slate-400">{row.label}</dt>
                  <dd className="m-0 text-[13px] font-semibold leading-[1.5] text-ink [overflow-wrap:anywhere]">
                    {row.value}
                  </dd>
                </div>
              ))}
            </dl>
          ) : null}
          <SourceExcerpts sources={fact.source_details} />
        </div>
      ) : null}

      <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-2">
        <span className="text-[12.5px] font-semibold text-slate-400">
          {factSourceLabel(fact)}
        </span>
        {hasMore ? (
          <TextButton onClick={() => setOpen((v) => !v)} tone="blue">
            {open ? "Hide details" : "Details"}
          </TextButton>
        ) : null}
        <span className="flex-1" />
        {canEdit ? (
          <span className="flex flex-wrap items-center gap-1.5">
            {settled ? null : (
              <Pill
                size="sm"
                variant="tint"
                icon={Check}
                disabled={pending}
                onClick={() => run(() => confirmBrainFact(fact.id))}
              >
                Confirm
              </Pill>
            )}
            <Pill
              size="sm"
              variant="quiet"
              icon={Pencil}
              disabled={pending}
              onClick={() => setEditing(true)}
            >
              Edit
            </Pill>
            <Pill
              size="sm"
              variant="ghost"
              icon={X}
              disabled={pending}
              onClick={() => run(() => rejectBrainFact(fact.id))}
            >
              Wrong
            </Pill>
          </span>
        ) : null}
      </div>
      {error ? (
        <p className="m-0 mt-2 text-[13px] font-semibold text-danger">{error}</p>
      ) : null}
      {editing ? (
        <FactEditorModal
          fact={fact}
          onClose={() => setEditing(false)}
          onSaved={() => {
            setEditing(false);
            onChanged();
          }}
        />
      ) : null}
    </div>
  );
}

/* ── Editor: change a record, or add one ───────────────────────────────── */

type Draft = Record<string, string | string[] | boolean>;

function draftFrom(type: EntityType, data: Record<string, unknown>): Draft {
  const draft: Draft = {};
  for (const field of ENTITY_SPECS[type].fields) {
    const value = data[field.key];
    if (field.kind === "list") {
      draft[field.key] = Array.isArray(value)
        ? value.filter((v): v is string => typeof v === "string")
        : [];
    } else if (field.kind === "bool") {
      draft[field.key] = value === true;
    } else if (field.kind === "int") {
      draft[field.key] = typeof value === "number" && value > 0 ? String(value) : "";
    } else {
      draft[field.key] = typeof value === "string" ? value : "";
    }
  }
  return draft;
}

function dataFrom(type: EntityType, draft: Draft): Record<string, unknown> {
  const data: Record<string, unknown> = {};
  for (const field of ENTITY_SPECS[type].fields) {
    const value = draft[field.key];
    if (field.kind === "list") {
      data[field.key] = (Array.isArray(value) ? value : []).map((v) => v.trim()).filter(Boolean);
    } else if (field.kind === "bool") {
      data[field.key] = value === true;
    } else if (field.kind === "int") {
      const n = Number.parseInt(typeof value === "string" ? value : "", 10);
      data[field.key] = Number.isFinite(n) && n > 0 ? n : 0;
    } else if (field.kind === "enum") {
      /* An unset choice is left out so the record keeps the schema's default. */
      if (typeof value === "string" && value) data[field.key] = value;
    } else {
      data[field.key] = typeof value === "string" ? value.trim() : "";
    }
  }
  return data;
}

/* Fields that hold the record's own name. The editor asks for the name
   once, as the title, and writes it to this field too. */
const NAME_KEYS = ["name", "label", "term"];

function nameKey(type: EntityType): string | undefined {
  return ENTITY_SPECS[type].fields.find((f) => NAME_KEYS.includes(f.key))?.key;
}

const INPUT =
  "w-full border border-line bg-white px-3.5 py-2.5 text-[14px] font-semibold text-ink outline-none rounded-ops-sm focus:border-blue-500 focus:[box-shadow:var(--ring-focus)]";

/* A list is typed one item per box; a new empty box follows the last. */
function ListInput({
  label,
  values,
  onChange,
}: {
  label: string;
  values: string[];
  onChange: (values: string[]) => void;
}) {
  const rows = [...values, ""];
  return (
    <div className="flex flex-col gap-[7px]">
      <Label>{label}</Label>
      {rows.map((value, i) => (
        <input
          key={i}
          value={value}
          aria-label={`${label} ${i + 1}`}
          onChange={(e) => {
            const next = [...rows];
            next[i] = e.target.value;
            while (next.length && next[next.length - 1] === "") next.pop();
            onChange(next);
          }}
          className={INPUT}
        />
      ))}
    </div>
  );
}

function ChoiceRow({
  label,
  options,
  value,
  onSelect,
}: {
  label: string;
  options: readonly string[];
  value: string;
  onSelect: (value: string) => void;
}) {
  return (
    <div className="flex flex-col gap-[7px]">
      <Label>{label}</Label>
      <div className="flex flex-wrap gap-1.5">
        {options.map((option) => (
          <button
            key={option}
            type="button"
            aria-pressed={value === option}
            onClick={() => onSelect(option)}
            className={`cursor-pointer whitespace-nowrap border-none px-3 py-[7px] text-[12.5px] font-bold transition-colors duration-[160ms] ease-om rounded-pill ${
              value === option ? "bg-blue-100 text-blue-700" : "bg-fill-quiet text-slate-500"
            }`}
          >
            {humanize(option)}
          </button>
        ))}
      </div>
    </div>
  );
}

function FieldInput({
  field,
  value,
  onChange,
}: {
  field: FieldSpec;
  value: string | string[] | boolean;
  onChange: (value: string | string[] | boolean) => void;
}) {
  if (field.kind === "list") {
    return (
      <ListInput label={field.label} values={Array.isArray(value) ? value : []} onChange={onChange} />
    );
  }
  if (field.kind === "enum") {
    return (
      <ChoiceRow
        label={field.label}
        options={field.options ?? []}
        value={typeof value === "string" ? value : ""}
        onSelect={onChange}
      />
    );
  }
  if (field.kind === "bool") {
    return (
      <label className="flex cursor-pointer items-center gap-2.5">
        <input
          type="checkbox"
          checked={value === true}
          onChange={(e) => onChange(e.target.checked)}
          className="h-4 w-4 cursor-pointer accent-blue-500"
        />
        <span className="text-[13.5px] font-semibold text-ink">{field.label}</span>
      </label>
    );
  }
  const text = typeof value === "string" ? value : "";
  if (field.kind === "long") {
    return (
      <TextArea
        label={field.label}
        value={text}
        rows={3}
        onChange={(e) => onChange(e.target.value)}
      />
    );
  }
  if (field.kind === "int") {
    return (
      <label className="flex flex-col gap-[7px]">
        <Label>{field.label}</Label>
        <input
          type="number"
          min={0}
          inputMode="numeric"
          value={text}
          onChange={(e) => onChange(e.target.value)}
          className={INPUT}
        />
      </label>
    );
  }
  return <Field label={field.label} value={text} onChange={(e) => onChange(e.target.value)} />;
}

export function FactEditorModal({
  fact,
  types,
  onClose,
  onSaved,
}: {
  /** The record to change. Omit to add one of `types`. */
  fact?: FactView;
  types?: EntityType[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const choices = fact ? [fact.entity_type] : (types ?? []);
  const [type, setType] = useState<EntityType>(choices[0]);
  const [title, setTitle] = useState(fact?.title ?? "");
  const [draft, setDraft] = useState<Draft>(() => draftFrom(choices[0], fact?.data ?? {}));
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const spec = ENTITY_SPECS[type];

  const pickType = (next: EntityType) => {
    setType(next);
    setDraft(draftFrom(next, {}));
  };

  const save = () => {
    if (!title.trim() || pending) return;
    setError(null);
    startTransition(async () => {
      const data = dataFrom(type, draft);
      const named = nameKey(type);
      if (named) data[named] = title.trim();
      const result = fact
        ? await editBrainFact({ factId: fact.id, title, data })
        : await addBrainFact({ entityType: type, title, data });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      onSaved();
    });
  };

  return (
    <Modal title={fact ? `Edit ${spec.one.toLowerCase()}` : "Add to the brain"} onClose={onClose} width={520}>
      <div className="flex flex-col gap-4">
        {!fact && choices.length > 1 ? (
          <div className="flex flex-wrap gap-1.5">
            {choices.map((choice) => (
              <button
                key={choice}
                type="button"
                aria-pressed={type === choice}
                onClick={() => pickType(choice)}
                className={`cursor-pointer whitespace-nowrap border-none px-3 py-[7px] text-[12.5px] font-bold transition-colors duration-[160ms] ease-om rounded-pill ${
                  type === choice ? "bg-blue-100 text-blue-700" : "bg-fill-quiet text-slate-500"
                }`}
              >
                {ENTITY_SPECS[choice].one}
              </button>
            ))}
          </div>
        ) : null}
        <Field label="Name" value={title} onChange={(e) => setTitle(e.target.value)} autoFocus />
        {spec.fields
          .filter((field) => field.key !== nameKey(type))
          .map((field) => (
          <FieldInput
            key={`${type}-${field.key}`}
            field={field}
            value={draft[field.key]}
            onChange={(value) => setDraft((d) => ({ ...d, [field.key]: value }))}
          />
          ))}
        {error ? <p className="m-0 text-[13px] font-semibold text-danger">{error}</p> : null}
        <div className="flex items-center justify-end gap-2.5">
          <Pill size="sm" variant="quiet" onClick={onClose}>
            Cancel
          </Pill>
          <Pill size="sm" onClick={save} disabled={!title.trim() || pending}>
            {pending ? "Saving…" : fact ? "Save and confirm" : "Add"}
          </Pill>
        </div>
      </div>
    </Modal>
  );
}

/* ── A contradiction: both values, pick the true one ───────────────────── */

export function ConflictCard({
  conflict,
  list,
  canEdit = true,
  onChanged,
}: {
  conflict: BrainConflict;
  list: FactsList;
  canEdit?: boolean;
  onChanged: () => void;
}) {
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const resolve = (keepFactId: string | null) => {
    if (pending || !canEdit) return;
    setError(null);
    startTransition(async () => {
      const result = await resolveBrainConflict({ conflictId: conflict.id, keepFactId });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      onChanged();
    });
  };

  return (
    <div className={`px-5 py-4 ${pending ? "opacity-50" : ""}`}>
      <div className="flex flex-wrap items-center gap-2">
        <Chip tone="amber" style={CHIP_STYLE}>
          Sources disagree
        </Chip>
        <span className="text-[12.5px] font-semibold text-slate-400">{conflictTitle(conflict)}</span>
      </div>
      <p className="mb-0 mt-2.5 text-[15px] font-bold text-ink">Which is true?</p>
      <div className="mt-2.5 grid gap-2 sm:grid-cols-2">
        {conflict.values.map((v) => {
          const fact = findFact(list, v.fact_id);
          return (
            <button
              key={v.fact_id}
              type="button"
              disabled={!canEdit || pending}
              onClick={() => resolve(v.fact_id)}
              className="flex cursor-pointer flex-col gap-1 border border-line bg-white px-4 py-3 text-left rounded-[14px] transition-colors duration-[160ms] ease-om hover:border-blue-300 hover:bg-fill-quiet disabled:cursor-default"
            >
              <span className="text-[14px] font-bold leading-[1.4] text-ink [overflow-wrap:anywhere]">
                {v.value}
              </span>
              <span className="text-[12.5px] font-semibold text-slate-400">
                {fact ? factSourceLabel(fact) : "No source"}
              </span>
            </button>
          );
        })}
      </div>
      {canEdit ? (
        <div className="mt-2.5">
          <TextButton onClick={() => resolve(null)}>Neither</TextButton>
        </div>
      ) : null}
      {error ? <p className="m-0 mt-2 text-[13px] font-semibold text-danger">{error}</p> : null}
    </div>
  );
}

/* ── Something a generator wished it knew ──────────────────────────────── */

export function QuestionCard({
  question,
  canEdit = true,
  onChanged,
}: {
  question: BrainQuestion;
  canEdit?: boolean;
  onChanged: () => void;
}) {
  const [answer, setAnswer] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const run = (action: () => Promise<{ ok: boolean; error?: string }>) => {
    if (pending) return;
    setError(null);
    startTransition(async () => {
      const result = await action();
      if (!result.ok) {
        setError(result.error ?? "That did not save.");
        return;
      }
      onChanged();
    });
  };

  return (
    <div className={`px-5 py-4 ${pending ? "opacity-50" : ""}`}>
      <div className="flex flex-wrap items-center gap-2">
        <Chip tone="blue" style={CHIP_STYLE}>
          The AI asked
        </Chip>
        {question.why?.trim() ? (
          <span className="text-[12.5px] font-semibold text-slate-400">{question.why.trim()}</span>
        ) : null}
      </div>
      <p className="mb-0 mt-2.5 text-[15px] font-bold leading-[1.4] text-ink [overflow-wrap:anywhere]">
        {question.question}
      </p>
      {canEdit ? (
        <>
          <div className="mt-2.5">
            <TextArea
              value={answer}
              rows={2}
              placeholder="Your answer"
              disabled={pending}
              onChange={(e) => setAnswer(e.target.value)}
            />
          </div>
          <div className="mt-2.5 flex flex-wrap items-center gap-2">
            <Pill
              size="sm"
              disabled={!answer.trim() || pending}
              onClick={() =>
                run(() => answerBrainQuestion({ questionId: question.id, answer }))
              }
            >
              {pending ? "Saving…" : "Save answer"}
            </Pill>
            <Pill
              size="sm"
              variant="ghost"
              disabled={pending}
              onClick={() => run(() => dismissBrainQuestion(question.id))}
            >
              Dismiss
            </Pill>
          </div>
        </>
      ) : null}
      {error ? <p className="m-0 mt-2 text-[13px] font-semibold text-danger">{error}</p> : null}
    </div>
  );
}
