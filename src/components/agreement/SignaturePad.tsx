"use client";

import { useRef, type PointerEvent } from "react";

/* The box a creator scribbles their signature in. The drawing is SVG path
   data in a 320 by 120 box (M and L commands only): what the server stores
   and the signed copy draws back. */

const W = 320;
const H = 120;

/** A scribble counts once it has some length to it, not a single tap. */
export function isDrawn(path: string): boolean {
  return (path.match(/L/g) ?? []).length >= 8;
}

export function SignaturePad({ value, onChange }: { value: string; onChange: (path: string) => void }) {
  const drawing = useRef(false);
  /* Moves can arrive faster than renders, so the growing path is kept here too. */
  const path = useRef(value);

  const point = (e: PointerEvent<SVGSVGElement>) => {
    const box = e.currentTarget.getBoundingClientRect();
    const x = Math.min(W, Math.max(0, ((e.clientX - box.left) / box.width) * W));
    const y = Math.min(H, Math.max(0, ((e.clientY - box.top) / box.height) * H));
    return `${Math.round(x * 10) / 10} ${Math.round(y * 10) / 10}`;
  };
  const push = (next: string) => {
    path.current = next;
    onChange(next);
  };

  return (
    <div>
      <div className={`relative overflow-hidden rounded-[14px] border-2 bg-white ${value ? "border-blue-400" : "border-line"}`}>
        {value ? null : (
          <span className="pointer-events-none absolute inset-0 flex items-center justify-center text-[15px] font-semibold text-slate-300">
            Sign here
          </span>
        )}
        <span className="pointer-events-none absolute bottom-[26px] left-4 right-4 h-px bg-line" />
        <svg
          viewBox={`0 0 ${W} ${H}`}
          preserveAspectRatio="none"
          role="img"
          aria-label="Draw your signature"
          className="relative block h-[140px] w-full cursor-crosshair touch-none"
          onPointerDown={(e) => {
            e.currentTarget.setPointerCapture(e.pointerId);
            drawing.current = true;
            push(`${path.current ? `${path.current} ` : ""}M${point(e)}`);
          }}
          onPointerMove={(e) => {
            if (drawing.current) push(`${path.current} L${point(e)}`);
          }}
          onPointerUp={() => {
            drawing.current = false;
          }}
          onPointerCancel={() => {
            drawing.current = false;
          }}
        >
          <path d={value || "M0 0"} fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" className="text-ink" vectorEffect="non-scaling-stroke" />
        </svg>
      </div>
      {value ? (
        <button type="button" onClick={() => push("")} className="mt-1 cursor-pointer border-0 bg-transparent p-1 text-[13px] font-bold text-blue-600">
          Clear
        </button>
      ) : null}
    </div>
  );
}
