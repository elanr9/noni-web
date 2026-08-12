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
  type?: "button" | "submit";
  className?: string;
  style?: CSSProperties;
}

const LOOKS: Record<PillVariant, string> = {
  primary: "bg-blue-500 text-white shadow-accent",
  tint: "bg-blue-100 text-blue-700",
  quiet: "bg-fill-quiet text-ink",
  danger: "bg-danger-soft text-danger",
  ghost: "bg-transparent text-slate-500",
};

export function Pill({
  children,
  icon: Icon,
  variant = "primary",
  size = "md",
  onClick,
  disabled = false,
  type = "button",
  className = "",
  style,
}: PillProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      className={`inline-flex cursor-pointer items-center justify-center gap-[7px] whitespace-nowrap border-none font-bold transition-[filter] duration-[160ms] ease-om rounded-pill ${
        size === "sm" ? "px-3.5 py-2 text-[13px]" : "px-[22px] py-3 text-[14.5px]"
      } ${LOOKS[variant]} ${
        disabled ? "pointer-events-none opacity-35" : ""
      } ${className}`}
      style={style}
    >
      {Icon ? <Icon size={size === "sm" ? 14 : 16} /> : null}
      {children}
    </button>
  );
}
