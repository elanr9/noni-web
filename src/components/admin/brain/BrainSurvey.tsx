"use client";

import { Check, Loader2, Mic, Sparkles } from "lucide-react";
import { useEffect, useRef, useState, useTransition, type ReactNode } from "react";

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
import { SnapshotReview } from "@/components/admin/brain/SnapshotReview";
import { useVoiceRecorder } from "@/components/admin/brain/useVoiceRecorder";
import { Card, Chip, Label, Pill, ProgressBar, TextArea } from "@/components/kit";
import {
  coveragePercent,
  reviewQueue,
  sourceLabel,
  surveyResumeStep,
  type FactsList,
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
  /** Onboarding: the questions come first, while the site scan runs, and
      the check of what the scan found comes after the last question. */
  reviewLast?: boolean;
  /** True while a scan is running; questions say drafts are on the way. */
  scanning?: boolean;
  /** Changes whenever the scan moves on; drafted answers and facts are
      fetched again, without moving the person off their question. */
  refreshKey?: string;
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
    <h1 className="m-0 text-[28px] font-bold leading-[1.15] tracking-[-0.8px] text-ink sm:text-[34px]">
      {children}
    </h1>
  );
}


/* ── Step 0: what the scan found ───────────────────────────────────────── */

function ReviewStep({
  facts,
  factsError,
  onReload,
  onNext,
  atEnd = false,
  scanning = false,
  pending = false,
}: {
  facts: FactsList | null;
  factsError: string | null;
  onReload: () => void;
  onNext: () => void;
  /** Shown after the questions (onboarding): the button finishes. */
  atEnd?: boolean;
  scanning?: boolean;
  pending?: boolean;
}) {
  const [shown, setShown] = useState(REVIEW_PAGE);
  const queue = facts ? reviewQueue(facts) : [];
  const conflicts = facts?.conflicts ?? [];
  const total = facts ? facts.groups.reduce((n, g) => n + g.facts.length, 0) : 0;
  const left = conflicts.length + queue.length;

  return (
    <div>
      <Heading>{atEnd ? "Last step: check what we found" : "Check what we found"}</Heading>
      {facts ? (
        <p className="mb-0 mt-[9px] text-[16px] font-semibold text-slate-400">
          {total === 0
            ? scanning
              ? "Still reading your site…"
              : "Nothing found yet"
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
        <Pill onClick={onNext} disabled={pending} className="mt-[26px] w-full" style={BIG_PILL}>
          {atEnd ? (pending ? "Saving…" : left > 0 ? "Looks right, finish" : "Finish") : "Start questions"}
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
  scanning = false,
  canBack = true,
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
  scanning?: boolean;
  canBack?: boolean;
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
      {question.why ? (
        <p className="mb-0 mt-2.5 text-[16px] font-semibold leading-[1.5] text-slate-400">{question.why}</p>
      ) : null}
      <div className="mt-[22px]">
        <TextArea
          size="lg"
          value={text}
          rows={7}
          autoFocus
          disabled={transcribing || pending}
          placeholder={voice.recording ? "Listening…" : question.hint}
          onChange={(e) => onText(e.target.value)}
        />
      </div>
      <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-2">
        {drafted.length === 0 && scanning && !question.answer && !text.trim() ? (
          <span className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-blue-700">
            <Loader2 size={13} className="animate-spin" />
            Reading your site. A draft lands here if it has the answer.
          </span>
        ) : null}
        {drafted.length > 0 ? (
          <>
            <span className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-green">
              <Sparkles size={13} />
              {`Drafted ${sourceLabel(drafted[0]).replace(/^From/, "from")}. Edit or confirm.`}
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
        {canBack ? <QuietButton onClick={onBack}>Back</QuietButton> : null}
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

export function BrainSurvey({
  initialSurvey,
  initialFacts,
  renderDone,
  fallback,
  reviewLast = false,
  scanning = false,
  refreshKey,
}: BrainSurveyProps) {
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
  const firstStep = (state: SurveyState) => (reviewLast ? Math.max(1, startStep(state)) : startStep(state));
  const [step, setStep] = useState(initialSurvey?.ok ? firstStep(initialSurvey.data) : 0);
  /* Onboarding shows the scan review after the last question, at step 0. */
  const [reviewingAtEnd, setReviewingAtEnd] = useState(false);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [note, setNote] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<SurveySummary | null>(null);
  const [pending, startTransition] = useTransition();
  const saveQueue = useRef<Promise<void>>(Promise.resolve());

  const applySurvey = (result: BrainResult<SurveyState>) => {
    if (!result.ok) {
      setLoadError(result.error);
      return;
    }
    setLoadError(null);
    setSurvey(result.data);
    setStep(firstStep(result.data));
  };

  /* A scan update: take the new drafts, coverage and anything answered
     elsewhere, keep the person on the question they are on. */
  const mergeSurvey = (result: BrainResult<SurveyState>) => {
    if (!result.ok) return;
    setSurvey((prev) => {
      if (!prev) return result.data;
      const fresh = new Map(result.data.questions.map((q) => [q.key, q]));
      return {
        ...prev,
        coverage: result.data.coverage,
        missing: result.data.missing,
        questions: prev.questions.map((q) => {
          const next = fresh.get(q.key);
          return next ? { ...q, suggestion: next.suggestion, answer: q.answer ?? next.answer } : q;
        }),
      };
    });
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

  /* Each time the scan moves on, pick up its drafts and facts. */
  useEffect(() => {
    if (!refreshKey) return;
    let live = true;
    void getBrainSurvey().then((result) => {
      if (live) mergeSurvey(result);
    });
    void listBrainFacts().then((result) => {
      if (live) applyFacts(result);
    });
    return () => {
      live = false;
    };
  }, [refreshKey]);

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
    await saveQueue.current;
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

  /* Onboarding: after the last question, check the scan's findings first. */
  const toEnd = () => {
    if (reviewLast && !reviewingAtEnd) {
      setReviewingAtEnd(true);
      setStep(0);
      return true;
    }
    return false;
  };

  const goTo = (next: number, save: boolean) => {
    setError(null);
    if (next >= last) {
      if (toEnd()) return;
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
          className={`h-1.5 flex-1 rounded-pill transition-colors duration-[160ms] ease-om ${
            i < at || reviewingAtEnd ? "bg-blue-500" : "bg-line"
          }`}
        />
      ))}
    </div>
  );

  if (at === 0 && reviewingAtEnd) {
    return (
      <div key="snapshot">
        <SnapshotReview
          refreshKey={refreshKey}
          scanning={scanning}
          pending={pending}
          onDone={() => startTransition(finish)}
        />
      </div>
    );
  }

  if (at === 0) {
    return (
      <div key="review" className="animate-om-rise">
        {dashes}
        <ReviewStep
          facts={facts}
          factsError={factsError}
          onReload={() => void loadFacts()}
          atEnd={reviewingAtEnd}
          scanning={scanning}
          pending={pending}
          onNext={() => {
            setNote(null);
            if (reviewingAtEnd) startTransition(finish);
            else goTo(1, true);
          }}
        />
      </div>
    );
  }

  if (at === last && reviewLast) {
    const shownSummary = summary ?? { coverage: survey.coverage, missing: survey.missing };
    return (
      <div key="done" className="animate-om-pop text-center">
        <span className="mx-auto inline-flex h-16 w-16 animate-om-check items-center justify-center bg-green text-white rounded-pill">
          <Check size={30} strokeWidth={3} />
        </span>
        <h1 className="mb-0 mt-6 text-[30px] font-bold leading-[1.15] tracking-[-0.8px] text-ink sm:text-[36px]">
          You&apos;re all set
        </h1>
        <p className="mx-auto mb-0 mt-2.5 max-w-[440px] text-[16px] font-semibold leading-[1.55] text-slate-400">
          Noni knows what you sell and who your videos are for. Your first briefs are built from this.
        </p>
        {error ? <p className="mb-0 mt-3 text-[13px] font-semibold text-danger">{error}</p> : null}
        <div className="mt-8 text-left">{renderDone(shownSummary)}</div>
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

  /* Saving never holds the person up: the answer is marked done and the next
     question shows at once, while saves go out one after another behind it.
     A save that fails brings them back to that question with their words. */
  const save = () => {
    if (!text.trim()) return;
    const key = question.key;
    const answer = text.trim();
    const here = at;
    setError(null);
    setSurvey((s) =>
      s
        ? {
            ...s,
            questions: s.questions.map((q) =>
              q.key === key ? { ...q, answer: { answer, fact_ids: q.answer?.fact_ids ?? [] } } : q,
            ),
          }
        : s,
    );
    saveQueue.current = saveQueue.current.then(async () => {
      const result = await answerBrainSurvey({ key, answer, step: here + 1 });
      if (!result.ok) {
        setDrafts((d) => ({ ...d, [key]: answer }));
        setReviewingAtEnd(false);
        setStep(here);
        setError(`That answer did not save: ${result.error}`);
        return;
      }
      setSurvey((s) => (s ? { ...s, coverage: result.data.coverage, missing: result.data.missing } : s));
    });
    if (here + 1 >= last) {
      if (!toEnd()) startTransition(async () => {
        await saveQueue.current;
        await finish();
      });
    } else setStep(here + 1);
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
        scanning={scanning}
        canBack={!(reviewLast && at === 1)}
      />
    </div>
  );
}
