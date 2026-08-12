"use client";

import type { CSSProperties, ReactNode } from "react";

export interface CardProps {
  children: ReactNode;
  /** Padding in px, default 20. Use 0 for row lists that pad themselves. */
  pad?: number;
  onClick?: () => void;
  /** Hover raise used by clickable cards (company cards, post cards). */
  lift?: boolean;
  className?: string;
  style?: CSSProperties;
}

export function Card({
  children,
  pad = 20,
  onClick,
  lift = false,
  className = "",
  style,
}: CardProps) {
  return (
    <div
      onClick={onClick}
      role={onClick ? "button" : undefined}
      className={`border border-line bg-white shadow-card rounded-ops-md ${
        onClick ? "cursor-pointer" : ""
      } ${
        lift
          ? "transition-[transform,box-shadow,border-color] duration-200 ease-om hover:-translate-y-[3px] hover:border-blue-300 hover:shadow-raised"
          : ""
      } ${className}`}
      style={{ padding: pad, ...style }}
    >
      {children}
    </div>
  );
}
