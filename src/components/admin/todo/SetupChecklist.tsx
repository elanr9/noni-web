"use client";

import { Check } from "lucide-react";
import { useRouter } from "next/navigation";

import { Card, Chip, Label, Pill } from "@/components/kit";
import type { SetupStep } from "@/lib/admin/setup";

/* The gamified setup to-do card on the Onboarding tab: progress bar,
   numbered rows, green check + strikethrough + Done chip when complete,
   action pill otherwise (HomePage/SetupRow in AdminSetupApp.jsx). */
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
      {steps.map((s, i) => (
        <div
          key={s.key}
          data-tour={i === 0 ? "onb-first-step" : undefined}
          className={`flex items-center gap-[15px] px-5 py-4 ${
            i === steps.length - 1 ? "" : "border-b border-line"
          }`}
        >
          <span
            className={`inline-flex h-[34px] w-[34px] shrink-0 items-center justify-center text-[14px] font-extrabold text-blue-700 rounded-pill ${
              s.done ? "bg-green-soft" : "bg-blue-100"
            }`}
          >
            {s.done ? <Check size={15} className="text-green" /> : i + 1}
          </span>
          <span className="min-w-0 flex-1">
            <span
              className={`block text-[15px] font-bold text-ink ${
                s.done ? "line-through decoration-slate-400" : ""
              }`}
            >
              {s.title}
            </span>
            <span className="mt-0.5 block text-[13px] font-semibold leading-[1.45] text-slate-400">
              {s.sub}
            </span>
          </span>
          {s.done ? (
            <Chip tone="green">Done</Chip>
          ) : (
            <Pill size="sm" variant="tint" onClick={() => router.push(s.href)}>
              {s.action}
            </Pill>
          )}
        </div>
      ))}
    </Card>
  );
}
