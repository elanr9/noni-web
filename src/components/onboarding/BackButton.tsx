"use client";

import { ArrowLeft } from "lucide-react";

/** The back arrow at the left of every full screen onboarding step's header. */
export function BackButton({ onClick, disabled }: { onClick: () => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      aria-label="Back"
      disabled={disabled}
      onClick={onClick}
      className="-ml-1.5 mr-1 inline-flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-full border-[1.5px] border-line bg-white text-ink transition-[transform,border-color] duration-150 hover:-translate-x-0.5 hover:border-slate-400 active:scale-90 disabled:cursor-default disabled:opacity-40"
    >
      <ArrowLeft size={18} strokeWidth={2.5} />
    </button>
  );
}
