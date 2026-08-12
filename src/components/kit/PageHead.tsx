"use client";

import { ChevronLeft } from "lucide-react";
import type { ReactNode } from "react";

export interface PageHeadProps {
  title: ReactNode;
  sub?: ReactNode;
  /** Slot to the right of the title, e.g. a status Chip or action Pill. */
  right?: ReactNode;
  onBack?: () => void;
}

export function PageHead({ title, sub, right, onBack }: PageHeadProps) {
  return (
    <div className="mb-6 flex items-end gap-4">
      {onBack ? (
        <button
          type="button"
          onClick={onBack}
          aria-label="Back"
          className="mb-[2px] inline-flex h-[38px] w-[38px] shrink-0 cursor-pointer items-center justify-center border border-line bg-white shadow-card rounded-pill"
        >
          <ChevronLeft size={18} className="text-ink" />
        </button>
      ) : null}
      <div className="min-w-0 flex-1">
        <h1 className="m-0 text-[26px] font-bold tracking-[-0.5px] text-ink">{title}</h1>
        {sub ? (
          <p className="mb-0 mt-[7px] max-w-[560px] text-[14.5px] font-semibold leading-normal text-slate-400">
            {sub}
          </p>
        ) : null}
      </div>
      {right ? <div className="flex items-center gap-2.5">{right}</div> : null}
    </div>
  );
}
