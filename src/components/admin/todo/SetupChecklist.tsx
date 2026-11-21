"use client";

import { ArrowRight, Check, Lock } from "lucide-react";
import { useRouter } from "next/navigation";

import { Card, Chip, Label, Pill } from "@/components/kit";
import type { SetupStep } from "@/lib/admin/setup";

/* The setup to-do card on the Onboarding tab. The steps run in order: the
   first unfinished one is the only one with a button, the ones after it
   are locked until it is done, and finished ones show a green check. */
export function SetupChecklist({
  companyName,
  steps,
  doneCount,
}: {
  companyName: string;
  steps: SetupStep[];
  doneCount: number;
}) {
  const router = useRouter();
  const current = steps.findIndex((s) => !s.done);

  return (
    <Card pad={0}>
      <div data-tour="onb-progress" className="px-5 pb-3.5 pt-[18px]">
        <div className="flex items-center gap-2.5">
          <Label className="flex-1">Set up {companyName}</Label>
          <span className="text-[13px] font-bold text-slate-500">
            {doneCount} of {steps.length} done
          </span>
        </div>
        <div className="mt-[11px] h-[7px] overflow-hidden bg-fill-quiet rounded-pill">
          <span
            className="block h-full bg-blue-500 rounded-pill transition-[width] duration-[400ms] ease-om"
            style={{ width: `${(doneCount / Math.max(steps.length, 1)) * 100}%` }}
          />
        </div>
      </div>
      {steps.map((s, i) => {
        const isCurrent = i === current;
        const locked = !s.done && !isCurrent;
        return (
          <div
            key={s.key}
            data-tour={i === 0 ? "onb-first-step" : undefined}
            aria-disabled={locked || undefined}
            className={`flex flex-wrap items-center gap-x-[15px] gap-y-3 px-5 ${
              isCurrent ? "bg-blue-100/40 py-5" : "py-4"
            } ${i === steps.length - 1 ? "rounded-b-[inherit]" : "border-b border-line"}`}
          >
            <span
              className={`inline-flex h-[34px] w-[34px] shrink-0 items-center justify-center text-[14px] font-extrabold rounded-pill ${
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
                className={`block text-[15px] font-bold ${
                  s.done
                    ? "text-ink line-through decoration-slate-400"
                    : locked
                      ? "text-slate-400"
                      : "text-ink"
                }`}
              >
                {s.title}
              </span>
              {locked || s.done ? null : (
                <span className="mt-0.5 block text-[13px] font-semibold leading-[1.45] text-slate-400">
                  {s.sub}
                </span>
              )}
            </span>
            {s.done ? (
              <Chip tone="green">Done</Chip>
            ) : isCurrent ? (
              <Pill icon={ArrowRight} onClick={() => router.push(s.href)}>
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
    </Card>
  );
}
