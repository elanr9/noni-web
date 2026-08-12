"use client";

import type { CSSProperties, ReactNode } from "react";

/** Uppercase micro label (KLabel in the prototype). */
export function Label({
  children,
  className = "",
  style,
}: {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <span
      className={`text-[11px] font-extrabold uppercase tracking-[0.9px] text-slate-400 ${className}`}
      style={style}
    >
      {children}
    </span>
  );
}
