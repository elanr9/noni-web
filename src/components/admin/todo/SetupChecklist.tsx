"use client";

import { ArrowRight, Check, Lock } from "lucide-react";

import { Card, Chip, Label, Pill } from "@/components/kit";
import { useNavigate } from "@/components/motion/NavProgress";
import type { SetupStep } from "@/lib/admin/setup";

/* The setup to-do card on the Onboarding tab. The steps run in order: the
   first unfinished one is the only one with a button, the ones after it
   are locked until it is done, and finished ones show a green check. The
   card fills the screen under the page title and the rows share its
   height, so there is no empty space below and nothing scrolls. A row is
   its title and nothing else. */
export function SetupChecklist({
  companyName,
  steps,
  doneCount,
}: {
  companyName: string;
  steps: SetupStep[];
  doneCount: number;
}) {
  const { go, pending } = useNavigate();
  const current = steps.findIndex((s) => !s.done);

  return (
    <Card pad={0} className="flex min-h-[calc(100dvh-232px)] flex-col">
      <div data-tour="onb-progress" className="px-7 pb-4 pt-[22px]">
        <div className="flex items-center gap-2.5">
          <Label className="flex-1">Set up {companyName}</Label>
          <span className="text-[13px] font-bold text-slate-500">
            {doneCount} of {steps.length} done
          </span>
        </div>
        <div className="mt-[11px] h-[7px] overflow-hidden bg-fill-quiet rounded-pill">
          <span
            className="block h-full bg-blue-500 rounded-pill transition-[width] duration-[400ms] ease-om"
            style={{
              width: `${(doneCount / Math.max(steps.length, 1)) * 100}%`,
            }}
          />
        </div>
      </div>
      <div className="om-stagger flex flex-1 flex-col">
        {steps.map((s, i) => {
          const isCurrent = i === current;
          const locked = !s.done && !isCurrent;
          return (
            <div
              key={s.key}
              data-tour={i === 0 ? "onb-first-step" : undefined}
              aria-disabled={locked || undefined}
              className={`flex min-h-[64px] flex-1 flex-wrap items-center gap-x-[18px] gap-y-3 px-7 py-3 ${
                isCurrent ? "bg-blue-100/40" : ""
              } ${i === steps.length - 1 ? "rounded-b-[inherit]" : "border-b border-line"}`}
            >
              <span
                className={`inline-flex h-10 w-10 shrink-0 items-center justify-center text-[15px] font-extrabold rounded-pill ${
                  s.done
                    ? "bg-green-soft"
                    : isCurrent
                      ? "bg-blue-500 text-white"
                      : "bg-fill-quiet text-slate-400"
                }`}
              >
                {s.done ? <Check size={15} className="text-green" /> : i + 1}
              </span>
              <span className="min-w-[200px] flex-1">
                <span
                  className={`block font-bold tracking-[-0.2px] ${
                    isCurrent ? "text-[20px]" : "text-[17px]"
                  } ${
                    s.done
                      ? "text-ink line-through decoration-slate-400"
                      : locked
                        ? "text-slate-400"
                        : "text-ink"
                  }`}
                >
                  {s.title}
                </span>
              </span>
              {s.done ? (
                <Chip tone="green">Done</Chip>
              ) : isCurrent ? (
                <Pill
                  icon={ArrowRight}
                  loading={pending}
                  onClick={() => go(s.href)}
                >
                  {s.action}
                </Pill>
              ) : (
                <span className="inline-flex items-center gap-1.5 text-[12.5px] font-bold text-slate-400">
                  <Lock size={13} />
                  After step {current + 1}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
}
