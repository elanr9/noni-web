"use client";

import { Mic } from "lucide-react";
import { useEffect, useState, useTransition, type ReactNode } from "react";

import {
  answerBrainSurvey,
  completeBrainSurvey,
  getBrainSurvey,
  listBrainFacts,
  saveBrainSurveyStep,
  transcribeBrainAnswer,
  type BrainResult,
} from "@/app/admin/brain/knowledge-actions";
import { ConflictCard, FactRow, SourceExcerpts } from "@/components/admin/brain/FactParts";
import { useVoiceRecorder } from "@/components/admin/brain/useVoiceRecorder";
import { Card, Chip, Label, Pill, ProgressBar, TextArea } from "@/components/kit";
import {
  coveragePercent,
  reviewQueue,
  sourceLabel,
  surveyResumeStep,
  type FactsList,
  type SurveyAnswerResult,
  type SurveyQuestion,
  type SurveyState,
} from "@/lib/admin/brain-model";

/* The part of onboarding that learns the company, also reachable from the
   Company Brain page: a review of what the scan found (step 0), the founder
   questions one per screen (steps 1 to n), then what Noni knows and what is
   missing (step n + 1). Every answer is saved as it is given with the step
   to return to, so a refresh or a later visit resumes in place. */

const REVIEW_PAGE = 6;
const BIG_PILL = { padding: "15px 22px", fontSize: 15 } as const;

export interface SurveySummary {
  coverage: number;
  missing: string[];
}

export interface BrainSurveyProps {
  /** Fetched on the server when the page can; otherwise the survey loads itself. */
  initialSurvey?: BrainResult<SurveyState>;
  initialFacts?: BrainResult<FactsList>;
  /** Buttons under the closing summary. */
  renderDone: (summary: SurveySummary) => ReactNode;
  /** Shown beside "Try again" when the questions cannot be loaded. */
  fallback?: ReactNode;
}

function startStep(state: SurveyState): number {
  /* A finished survey reopens on its first question, to revise answers. */
  return state.survey.completed_at ? 1 : surveyResumeStep(state);
}

function QuietButton({ children, onClick }: { children: ReactNode; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="cursor-pointer border-none bg-transparent p-2 text-[13.5px] font-bold text-slate-400"
    >
      {children}
    </button>
  );
}

function Heading({ children }: { children: ReactNode }) {
  return (
    <h1 className="m-0 text-[26px] font-bold leading-[1.2] tracking-[-0.6px] text-ink sm:text-[28px]">
      {children}
    </h1>
  );
}

function savedLine(result: SurveyAnswerResult): string {
  if (result.extract_error) return "Saved · facts arrive with the next scan";
  const n = result.facts.length;
  const added = n === 0 ? "Saved" : `Saved · ${n} ${n === 1 ? "fact" : "facts"} added`;
  return result.conflicts > 0
    ? `${added} · ${result.conflicts} ${result.conflicts === 1 ? "conflict" : "conflicts"} to settle`
    : added;
}

/* ── Step 0: what the scan found ───────────────────────────────────────── */

function ReviewStep({
  facts,
  factsError,
  onReload,
  onNext,
}: {
  facts: FactsList | null;
  factsError: string | null;
  onReload: () => void;
  onNext: () => void;
}) {
  const [shown, setShown] = useState(REVIEW_PAGE);
  const queue = facts ? reviewQueue(facts) : [];
  const conflicts = facts?.conflicts ?? [];
  const total = facts ? facts.groups.reduce((n, g) => n + g.facts.length, 0) : 0;
  const left = conflicts.length + queue.length;

  return (
    <div>
      <Heading>Check what we found</Heading>
      {facts ? (
        <p className="mb-0 mt-[9px] text-[14.5px] font-semibold text-slate-400">
          {total === 0
            ? "Nothing found yet"
            : left === 0
              ? `${total} ${total === 1 ? "fact" : "facts"}, all confirmed`
              : `${total} ${total === 1 ? "fact" : "facts"} · ${left} to check`}
        </p>
      ) : null}
      {factsError ? (
        <div className="mt-4 flex flex-wrap items-center gap-2.5">
          <span className="text-[13.5px] font-semibold text-danger">{factsError}</span>
          <Pill size="sm" variant="tint" onClick={onReload}>
            Try again
          </Pill>
        </div>
      ) : null}
      {facts && left > 0 ? (
        <Card pad={0} className="mt-[22px] divide-y divide-line">
          {conflicts.map((c) => (
            <ConflictCard key={c.id} conflict={c} list={facts} onChanged={onReload} />
          ))}
          {queue.slice(0, shown).map((f) => (
            <FactRow key={f.id} fact={f} onChanged={onReload} />
          ))}
          {queue.length > shown ? (
            <div className="px-5 py-3 text-center">
              <QuietButton onClick={() => setShown((n) => n + REVIEW_PAGE)}>
                {queue.length - shown > REVIEW_PAGE
                  ? `Show ${REVIEW_PAGE} more of ${queue.length - shown}`
                  : `Show ${queue.length - shown} more`}
              </QuietButton>
            </div>
          ) : null}
        </Card>
      ) : null}
      {facts || factsError ? (
        <Pill onClick={onNext} className="mt-[26px] w-full" style={BIG_PILL}>
          Start questions
        </Pill>
      ) : (
        <p className="mb-0 mt-4 text-[14px] font-semibold text-slate-400">Loading…</p>
      )}
    </div>
  );
}

/* ── Steps 1 to n: one founder question ────────────────────────────────── */

function QuestionStep({
  question,
  index,
  total,
  text,
  onText,
  note,
  pending,
  error,
  onSave,
  onSkip,
  onBack,
}: {
  question: SurveyQuestion;
  index: number;
  total: number;
  text: string;
  onText: (text: string) => void;
  /** What the previous answer changed. */
  note: string | null;
  pending: boolean;
  error: string | null;
  onSave: () => void;
  onSkip: () => void;
  onBack: () => void;
}) {
  const [showSource, setShowSource] = useState(false);
  const [transcribing, setTranscribing] = useState(false);
  const [voiceError, setVoiceError] = useState<string | null>(null);

  const voice = useVoiceRecorder((audio) => {
    setVoiceError(null);
    setTranscribing(true);
    void transcribeBrainAnswer({ audio }).then((result) => {
      setTranscribing(false);
      if (!result.ok) {
        setVoiceError(result.error);
        return;
      }
      onText([text.trim(), result.text].filter(Boolean).join("\n\n"));
    });
  });

  const suggestion = question.suggestion;
  const fromSuggestion = Boolean(suggestion && !question.answer && text.trim() === suggestion.text.trim());
  const drafted = suggestion && !question.answer ? suggestion.sources : [];
  const unchanged = Boolean(question.answer && text.trim() === question.answer.answer.trim());
  const busy = pending || transcribing || voice.recording;
  const problem = error ?? voiceError ?? voice.error;

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <Label>{`Question ${index + 1} of ${total}`}</Label>
        {question.optional ? (
          <span className="text-[11.5px] font-semibold text-slate-400">Optional</span>
        ) : null}
        {note ? (
          <Chip tone="green" style={{ padding: "3px 9px", fontSize: 11.5 }} className="ml-auto">
            {note}
          </Chip>
        ) : null}
      </div>
      <Heading>{question.question}</Heading>
      <div className="mt-[22px]">
        <TextArea
          value={text}
          rows={6}
          autoFocus
          disabled={transcribing || pending}
          placeholder={voice.recording ? "Listening…" : question.hint}
          onChange={(e) => onText(e.target.value)}
        />
      </div>
      <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-2">
        {drafted.length > 0 ? (
          <>
            <span className="text-[12.5px] font-semibold text-slate-400">
              {`Drafted ${sourceLabel(drafted[0]).replace(/^From/, "from")}`}
            </span>
            <button
              type="button"
              onClick={() => setShowSource((v) => !v)}
              className="cursor-pointer border-none bg-transparent p-0 text-[12.5px] font-bold text-blue-700"
            >
              {showSource ? "Hide source" : "Show source"}
            </button>
          </>
        ) : null}
        <span className="flex-1" />
        {question.accepts.includes("voice") ? (
          <Pill
            size="sm"
            variant={voice.recording ? "danger" : "tint"}
            icon={Mic}
            disabled={transcribing || pending}
            onClick={voice.recording ? voice.stop : () => void voice.start()}
          >
            {voice.recording ? "Stop" : transcribing ? "Writing it down…" : "Speak"}
          </Pill>
        ) : null}
      </div>
      {showSource && drafted.length > 0 ? (
        <div className="mt-3 animate-om-rise">
          <SourceExcerpts sources={drafted} />
        </div>
      ) : null}
      {problem ? (
        <p className="mb-0 mt-3 text-[13px] font-semibold text-danger">{problem}</p>
      ) : null}
      <Pill
        onClick={unchanged ? onSkip : onSave}
        disabled={!text.trim() || busy}
        className="mt-[22px] w-full"
        style={BIG_PILL}
      >
        {pending ? "Saving…" : unchanged ? "Keep answer" : fromSuggestion ? "Confirm" : "Save answer"}
      </Pill>
      <div className="mt-2 flex items-center justify-center gap-3">
        <QuietButton onClick={onBack}>Back</QuietButton>
        {unchanged ? null : <QuietButton onClick={onSkip}>Skip</QuietButton>}
      </div>
    </div>
  );
}

/* ── Step n + 1: what Noni knows now ───────────────────────────────────── */

function SummaryStep({
  summary,
  facts,
  error,
  children,
}: {
  summary: SurveySummary;
  facts: FactsList | null;
  error: string | null;
  children: ReactNode;
}) {
  const pct = coveragePercent(summary.coverage);
  const known = (facts?.groups ?? []).filter((g) => g.facts.length > 0);
  const total = known.reduce((n, g) => n + g.facts.length, 0);
  const confirmed = known.reduce(
    (n, g) => n + g.facts.filter((f) => f.status === "confirmed").length,
    0,
  );

  return (
    <div>
      <Heading>What Noni knows now</Heading>
      <Card className="mt-[22px]">
        <div className="flex items-baseline gap-2">
          <span className="text-[34px] font-bold leading-none tracking-[-1px] text-ink">{`${pct}%`}</span>
          <span className="text-[13.5px] font-semibold text-slate-400">covered</span>
        </div>
        <ProgressBar value={pct} label="Brain coverage" className="mt-3" />
        {facts ? (
          <p className="mb-0 mt-3 text-[13.5px] font-semibold text-slate-500">
            {`${total} ${total === 1 ? "fact" : "facts"} · ${confirmed} confirmed`}
            {facts.conflicts.length > 0
              ? ` · ${facts.conflicts.length} ${facts.conflicts.length === 1 ? "conflict" : "conflicts"} open`
              : ""}
          </p>
        ) : null}
        {known.length > 0 ? (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {known.map((g) => (
              <Chip key={g.entity_type} tone="slate" style={{ padding: "3px 9px", fontSize: 11.5 }}>
                {`${g.label} ${g.facts.length}`}
              </Chip>
            ))}
          </div>
        ) : null}
      </Card>
      {summary.missing.length > 0 ? (
        <Card pad={0} className="mt-3.5">
          <div className="px-5 pb-1 pt-4">
            <Label>{`Still missing · ${summary.missing.length}`}</Label>
          </div>
          <ul className="m-0 list-none px-5 pb-3.5 pt-1">
            {summary.missing.map((item) => (
              <li
                key={item}
                className="flex items-start gap-2.5 py-[5px] text-[13.5px] font-semibold leading-[1.5] text-ink"
              >
                <span className="mt-[7px] h-1.5 w-1.5 shrink-0 bg-amber rounded-pill" />
                {item}
              </li>
            ))}
          </ul>
        </Card>
      ) : null}
      {error ? <p className="mb-0 mt-3 text-[13px] font-semibold text-danger">{error}</p> : null}
      <div className="mt-[22px]">{children}</div>
    </div>
  );
}

/* ── The flow ──────────────────────────────────────────────────────────── */

export function BrainSurvey({ initialSurvey, initialFacts, renderDone, fallback }: BrainSurveyProps) {
  const [survey, setSurvey] = useState<SurveyState | null>(
    initialSurvey?.ok ? initialSurvey.data : null,
  );
  const [loadError, setLoadError] = useState<string | null>(
    initialSurvey && !initialSurvey.ok ? initialSurvey.error : null,
  );
  const [facts, setFacts] = useState<FactsList | null>(initialFacts?.ok ? initialFacts.data : null);
  const [factsError, setFactsError] = useState<string | null>(
    initialFacts && !initialFacts.ok ? initialFacts.error : null,
  );
  const [step, setStep] = useState(initialSurvey?.ok ? startStep(initialSurvey.data) : 0);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [note, setNote] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<SurveySummary | null>(null);
  const [pending, startTransition] = useTransition();

  const applySurvey = (result: BrainResult<SurveyState>) => {
    if (!result.ok) {
      setLoadError(result.error);
      return;
    }
    setLoadError(null);
    setSurvey(result.data);
    setStep(startStep(result.data));
  };

  const applyFacts = (result: BrainResult<FactsList>) => {
    if (!result.ok) {
      setFactsError(result.error);
      return;
    }
    setFactsError(null);
    setFacts(result.data);
  };

  const loadSurvey = () => getBrainSurvey().then(applySurvey);
  const loadFacts = () => listBrainFacts().then(applyFacts);

  /* Onboarding mounts this with nothing fetched; the brain page hands both in. */
  const needSurvey = !initialSurvey;
  const needFacts = !initialFacts;
  useEffect(() => {
    let live = true;
    if (needSurvey) {
      void getBrainSurvey().then((result) => {
        if (live) applySurvey(result);
      });
    }
    if (needFacts) {
      void listBrainFacts().then((result) => {
        if (live) applyFacts(result);
      });
    }
    return () => {
      live = false;
    };
  }, [needSurvey, needFacts]);

  if (!survey) {
    return (
      <div>
        <Heading>A few questions about your company</Heading>
        {loadError ? (
          <>
            <p className="mb-0 mt-3 text-[14px] font-semibold text-danger">{loadError}</p>
            <div className="mt-5 flex flex-wrap items-center gap-2.5">
              <Pill
                variant="tint"
                onClick={() => {
                  setLoadError(null);
                  void loadSurvey();
                }}
              >
                Try again
              </Pill>
              {fallback ?? null}
            </div>
          </>
        ) : (
          <p className="mb-0 mt-3 text-[14px] font-semibold text-slate-400">Loading…</p>
        )}
      </div>
    );
  }

  const questions = survey.questions;
  const last = questions.length + 1;
  const at = Math.max(0, Math.min(last, step));

  const finish = async () => {
    const [done] = await Promise.all([completeBrainSurvey(), loadFacts()]);
    if (done.ok) {
      setSummary({ coverage: done.data.coverage, missing: done.data.missing });
      setError(null);
    } else {
      /* The answers are saved either way; show the last numbers we have. */
      setSummary({ coverage: survey.coverage, missing: survey.missing });
      setError(done.error);
    }
    setStep(last);
  };

  const goTo = (next: number, save: boolean) => {
    setError(null);
    if (next >= last) {
      startTransition(finish);
      return;
    }
    if (save) void saveBrainSurveyStep(next);
    setStep(next);
  };

  const dashes = (
    <div className="mb-[26px] flex gap-1.5">
      {questions.map((q, i) => (
        <span
          key={q.key}
          className={`h-1 flex-1 rounded-pill transition-colors duration-[160ms] ease-om ${
            i < at ? "bg-blue-500" : "bg-line"
          }`}
        />
      ))}
    </div>
  );

  if (at === 0) {
    return (
      <div key="review" className="animate-om-rise">
        {dashes}
        <ReviewStep
          facts={facts}
          factsError={factsError}
          onReload={() => void loadFacts()}
          onNext={() => {
            setNote(null);
            goTo(1, true);
          }}
        />
      </div>
    );
  }

  if (at === last) {
    const shownSummary = summary ?? { coverage: survey.coverage, missing: survey.missing };
    return (
      <div key="summary" className="animate-om-rise">
        <SummaryStep summary={shownSummary} facts={facts} error={error}>
          {renderDone(shownSummary)}
        </SummaryStep>
      </div>
    );
  }

  const question = questions[at - 1];
  const text = drafts[question.key] ?? question.answer?.answer ?? question.suggestion?.text ?? "";

  const save = () => {
    if (pending || !text.trim()) return;
    setError(null);
    startTransition(async () => {
      const result = await answerBrainSurvey({ key: question.key, answer: text, step: at + 1 });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      const saved = result.data;
      setSurvey((s) =>
        s
          ? {
              ...s,
              coverage: saved.coverage,
              missing: saved.missing,
              questions: s.questions.map((q) =>
                q.key === question.key
                  ? {
                      ...q,
                      answer: {
                        answer: text.trim(),
                        fact_ids: saved.answer?.fact_ids ?? saved.facts.map((f) => f.id),
                      },
                    }
                  : q,
              ),
            }
          : s,
      );
      setNote(savedLine(saved));
      if (at + 1 >= last) await finish();
      else setStep(at + 1);
    });
  };

  return (
    <div key={question.key} className="animate-om-rise">
      {dashes}
      <QuestionStep
        question={question}
        index={at - 1}
        total={questions.length}
        text={text}
        onText={(value) => setDrafts((d) => ({ ...d, [question.key]: value }))}
        note={note}
        pending={pending}
        error={error}
        onSave={save}
        onSkip={() => {
          setNote(null);
          goTo(at + 1, true);
        }}
        onBack={() => {
          setNote(null);
          goTo(at - 1, false);
        }}
      />
    </div>
  );
}
