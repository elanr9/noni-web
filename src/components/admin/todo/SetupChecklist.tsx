"use client";

import { ArrowRight, Check } from "lucide-react";

import { Card, Pill } from "@/components/kit";
import { useNavigate } from "@/components/motion/NavProgress";
import type { SetupStep } from "@/lib/admin/setup";

/* The Onboarding tab, in the system's own terms: one flat white card. The
   step that is up next gets the big type and the only button, and no
   other words; under a
   hairline the whole road is a single numbered line, done steps checked
   and the ones after the current step greyed out until it is done. No
   colour beyond the one accent, nothing decorative. */
export function SetupChecklist({ steps }: { steps: SetupStep[] }) {
  const { go, pending } = useNavigate();
  const current = steps.findIndex((s) => !s.done);
  const step = steps[current] ?? null;

  return (
    <Card pad={0}>
      {step ? (
        <div data-tour="onb-first-step" className="px-8 pb-8 pt-7">
          <span className="text-[13px] font-bold text-blue-700">
            Step {current + 1} of {steps.length}
          </span>
          <h2 className="display mb-0 mt-2 text-[32px] font-bold leading-[1.1] tracking-[-0.8px] text-ink">
            {step.title}
          </h2>
          <Pill
            icon={ArrowRight}
            loading={pending}
            onClick={() => go(step.href)}
            className="mt-6"
          >
            {step.action}
          </Pill>
        </div>
      ) : null}

      <ol
        data-tour="onb-progress"
        className="m-0 flex list-none items-start border-t border-line px-8 py-5"
      >
        {steps.map((s, i) => {
          const isCurrent = i === current;
          const locked = !s.done && !isCurrent;
          return (
            <li
              key={s.key}
              aria-current={isCurrent ? "step" : undefined}
              className="flex min-w-0 flex-1 flex-col gap-2 last:flex-none"
            >
              <span className="flex items-center">
                <span
                  className={`inline-flex h-7 w-7 shrink-0 items-center justify-center text-[12.5px] font-extrabold rounded-pill ${
                    s.done
                      ? "bg-blue-500 text-white"
                      : isCurrent
                        ? "border-2 border-blue-500 bg-white text-blue-700"
                        : "bg-fill-quiet text-slate-400"
                  }`}
                >
                  {s.done ? <Check size={14} strokeWidth={3} /> : i + 1}
                </span>
                {i < steps.length - 1 ? (
                  <span
                    className={`mx-2 h-[2px] flex-1 rounded-pill ${
                      s.done ? "bg-blue-500" : "bg-line"
                    }`}
                  />
                ) : null}
              </span>
              <span
                className={`truncate pr-3 text-[13px] font-bold ${
                  locked ? "text-slate-400" : "text-ink"
                }`}
              >
                {s.short}
              </span>
            </li>
          );
        })}
      </ol>
    </Card>
  );
}
