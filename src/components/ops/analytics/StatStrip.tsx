"use client";

/* Inline stat strip with deltas (StatInline / Stat in the prototype). The
   consumer supplies the wrapper: Overview adds the hairline divider below,
   the company Analytics tab wraps it in a Card. */
import type { ReactNode } from "react";

export type StatStripStat = {
  label: string;
  value: string;
  delta?: string;
};

export type StatStripProps = {
  stats: StatStripStat[];
  right?: ReactNode;
  /** "lg" = Overview strip (30px values), "md" = in-card strip (24px). */
  size?: "lg" | "md";
  className?: string;
};

export function StatStrip({ stats, right, size = "lg", className = "" }: StatStripProps) {
  const lg = size === "lg";
  return (
    <div className={`flex items-start gap-[18px] ${className}`}>
      {stats.map((s) => (
        <span key={s.label} className="min-w-0 flex-1">
          <span
            className={`block font-semibold text-slate-400 ${lg ? "text-[13px]" : "text-[12px]"}`}
          >
            {s.label}
          </span>
          <span
            className={`block font-bold text-ink ${
              lg
                ? "mb-1 mt-1.5 text-[30px] tracking-[-0.7px]"
                : "mb-[3px] mt-[5px] text-[24px] tracking-[-0.5px]"
            }`}
          >
            {s.value}
          </span>
          {s.delta ? (
            <span
              className={`font-semibold ${lg ? "text-[12.5px]" : "text-[12px]"} ${
                s.delta.startsWith("+") ? "text-green" : "text-slate-400"
              }`}
            >
              {s.delta}
            </span>
          ) : null}
        </span>
      ))}
      {right}
    </div>
  );
}
