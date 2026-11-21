"use client";

import { ArrowRight, Check, Lock } from "lucide-react";

import { useNavigate } from "@/components/motion/NavProgress";
import type { SetupStep } from "@/lib/admin/setup";

/* The Onboarding tab. One thing is the main event: the step that is up
   next, on a dark card with what it gets the company and one big button.
   Under it the whole road is a strip of steps: done ones checked, the
   current one lit, the rest locked until it is done. */
export function SetupChecklist({
  steps,
  doneCount,
}: {
  steps: SetupStep[];
  doneCount: number;
}) {
  const { go, pending } = useNavigate();
  const current = steps.findIndex((s) => !s.done);
  const step = steps[current] ?? null;
  const pct = doneCount / Math.max(steps.length, 1);
  const R = 34;
  const C = 2 * Math.PI * R;

  return (
    <div className="flex flex-col gap-4">
      {step ? (
        <div
          data-tour="onb-first-step"
          className="relative overflow-hidden bg-ink-900 px-8 py-8 text-white shadow-raised rounded-ops-md animate-om-rise"
        >
          <span
            aria-hidden
            className="pointer-events-none absolute -right-24 -top-32 h-[340px] w-[340px] rounded-full bg-blue-500/35 blur-3xl"
          />
          <span
            aria-hidden
            className="pointer-events-none absolute -bottom-40 left-1/3 h-[260px] w-[260px] rounded-full bg-blue-400/15 blur-3xl"
          />
          <div className="relative flex flex-wrap items-center gap-x-8 gap-y-6">
            <div className="min-w-[260px] flex-1">
              <span className="inline-flex items-center gap-2 bg-white/10 px-3 py-1 text-[12px] font-bold uppercase tracking-[0.6px] text-blue-200 rounded-pill">
                <span className="h-1.5 w-1.5 animate-pulse bg-blue-300 rounded-pill" />
                Up next · step {current + 1} of {steps.length}
              </span>
              <h2 className="display mb-0 mt-4 text-[34px] font-bold leading-[1.08] tracking-[-1px]">
                {step.title}
              </h2>
              <p className="mb-0 mt-2.5 max-w-[520px] text-[16px] font-semibold leading-[1.5] text-white/70">
                {step.sub} <span className="text-white">{step.payoff}</span>
              </p>
              <button
                type="button"
                disabled={pending}
                onClick={() => go(step.href)}
                className="group mt-6 inline-flex cursor-pointer items-center gap-2.5 border-none bg-white px-7 py-3.5 text-[16px] font-bold text-ink shadow-[0_10px_30px_rgba(27,166,238,0.35)] transition-transform duration-150 rounded-pill hover:-translate-y-0.5 active:scale-[0.98] disabled:opacity-70"
              >
                {pending ? <span className="om-spinner" /> : null}
                {step.action}
                <ArrowRight
                  size={18}
                  className="transition-transform duration-150 group-hover:translate-x-0.5"
                />
              </button>
            </div>
            <div
              data-tour="onb-progress"
              className="relative hidden h-[112px] w-[112px] shrink-0 items-center justify-center sm:flex"
              aria-label={`${doneCount} of ${steps.length} steps done`}
            >
              <svg viewBox="0 0 80 80" className="absolute inset-0 h-full w-full -rotate-90">
                <circle cx="40" cy="40" r={R} fill="none" strokeWidth="6" className="stroke-white/12" />
                <circle
                  cx="40"
                  cy="40"
                  r={R}
                  fill="none"
                  strokeWidth="6"
                  strokeLinecap="round"
                  strokeDasharray={C}
                  strokeDashoffset={C * (1 - pct)}
                  className="stroke-blue-400 transition-[stroke-dashoffset] duration-700 ease-om"
                />
              </svg>
              <span className="text-center">
                <span className="block text-[26px] font-bold leading-none tracking-[-0.6px]">
                  {doneCount}/{steps.length}
                </span>
                <span className="mt-1 block text-[11px] font-bold uppercase tracking-[0.5px] text-white/55">
                  done
                </span>
              </span>
            </div>
          </div>
        </div>
      ) : null}

      <div
        className="grid gap-2.5"
        style={{ gridTemplateColumns: `repeat(${steps.length}, minmax(0, 1fr))` }}
      >
        {steps.map((s, i) => {
          const isCurrent = i === current;
          const locked = !s.done && !isCurrent;
          return (
            <div
              key={s.key}
              aria-current={isCurrent ? "step" : undefined}
              aria-disabled={locked || undefined}
              className={`flex min-w-0 items-center gap-2.5 border px-3.5 py-3 rounded-ops-md ${
                isCurrent
                  ? "border-blue-300 bg-blue-50 shadow-card"
                  : "border-line bg-white"
              }`}
            >
              <span
                className={`inline-flex h-7 w-7 shrink-0 items-center justify-center text-[12.5px] font-extrabold rounded-pill ${
                  s.done
                    ? "bg-green-soft text-green"
                    : isCurrent
                      ? "bg-blue-500 text-white"
                      : "bg-fill-quiet text-slate-400"
                }`}
              >
                {s.done ? <Check size={14} strokeWidth={3} /> : locked ? <Lock size={12} /> : i + 1}
              </span>
              <span className="min-w-0">
                <span
                  className={`block truncate text-[13.5px] font-bold ${
                    locked ? "text-slate-400" : "text-ink"
                  }`}
                >
                  {s.short}
                </span>
                <span
                  className={`block truncate text-[11.5px] font-semibold ${
                    s.done ? "text-green" : isCurrent ? "text-blue-700" : "text-slate-400"
                  }`}
                >
                  {s.done ? "Done" : isCurrent ? "Up next" : "Locked"}
                </span>
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
