"use client";

import type { LucideIcon } from "lucide-react";
import type { CSSProperties, ReactNode } from "react";

export type PillVariant = "primary" | "tint" | "quiet" | "danger" | "ghost";
export type PillSize = "sm" | "md";

export interface PillProps {
  children: ReactNode;
  icon?: LucideIcon;
  variant?: PillVariant;
  size?: PillSize;
  onClick?: () => void;
  /** Renders at 35% opacity and ignores pointer events (prototype gating). */
  disabled?: boolean;
  /** Shows a spinner in place of the icon and ignores presses. */
  loading?: boolean;
  type?: "button" | "submit";
  className?: string;
  style?: CSSProperties;
}

const LOOKS: Record<PillVariant, string> = {
  primary:
    "bg-blue-500 text-white shadow-accent hover:-translate-y-px hover:bg-blue-400 hover:shadow-[0_12px_26px_rgba(27,166,238,0.38)]",
  tint: "bg-blue-100 text-blue-700 hover:-translate-y-px hover:bg-blue-200",
  quiet: "bg-fill-quiet text-ink hover:-translate-y-px hover:bg-line",
  danger: "bg-danger-soft text-danger hover:-translate-y-px hover:brightness-95",
  ghost: "bg-transparent text-slate-500 hover:bg-fill-quiet hover:text-ink",
};

export function Pill({
  children,
  icon: Icon,
  variant = "primary",
  size = "md",
  onClick,
  disabled = false,
  loading = false,
  type = "button",
  className = "",
  style,
}: PillProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      aria-busy={loading || undefined}
      className={`group/pill inline-flex cursor-pointer items-center justify-center gap-[7px] whitespace-nowrap border-none font-bold transition-transform duration-[90ms] rounded-pill active:translate-y-0 active:scale-[0.96] ${
        size === "sm" ? "px-3.5 py-2 text-[13px]" : "px-[22px] py-3 text-[14.5px]"
      } ${LOOKS[variant]} ${
        disabled ? "pointer-events-none opacity-35" : ""
      } ${loading ? "pointer-events-none" : ""} ${className}`}
      style={style}
    >
      {loading ? (
        <span className="om-spinner" />
      ) : Icon ? (
        <Icon
          size={size === "sm" ? 14 : 16}
          className="transition-transform duration-200 ease-om group-hover/pill:translate-x-0.5"
        />
      ) : null}
      {children}
    </button>
  );
}
