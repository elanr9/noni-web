"use client";

import type { CSSProperties, ReactNode } from "react";

export type ChipTone = "blue" | "green" | "amber" | "slate";

const TONES: Record<ChipTone, string> = {
  blue: "bg-blue-100 text-blue-700",
  green: "bg-green-soft text-green",
  amber: "bg-amber-soft text-amber",
  slate: "bg-fill-quiet text-slate-500",
};

export function Chip({
  children,
  tone = "blue",
  className = "",
  style,
}: {
  children: ReactNode;
  tone?: ChipTone;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap px-[11px] py-[5px] text-[12px] font-bold rounded-pill ${TONES[tone]} ${className}`}
      style={style}
    >
      {children}
    </span>
  );
}
