"use client";

import { useState, type ReactNode } from "react";
import { createPortal } from "react-dom";

/* Cursor-following tooltip. Always rendered through a portal on
   document.body: ancestor transforms trap position:fixed otherwise. */
export function HoverPeek({
  label = "View profile",
  onClick,
  children,
  className = "",
}: {
  label?: string;
  onClick?: () => void;
  children: ReactNode;
  className?: string;
}) {
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);

  return (
    <div
      onClick={onClick}
      onMouseMove={(e) => setPos({ x: e.clientX, y: e.clientY })}
      onMouseLeave={() => setPos(null)}
      className={`cursor-pointer ${className}`}
    >
      {children}
      {pos
        ? createPortal(
            <div
              className="pointer-events-none fixed z-[90] whitespace-nowrap bg-ink px-[11px] py-1.5 text-[11.5px] font-bold text-white shadow-raised rounded-pill font-ops"
              style={{ left: pos.x + 14, top: pos.y + 16 }}
            >
              {label}
            </div>,
            document.body,
          )
        : null}
    </div>
  );
}
