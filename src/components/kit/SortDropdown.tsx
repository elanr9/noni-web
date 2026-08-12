"use client";

import { Check, ChevronDown } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export interface SortDropdownProps<T extends string> {
  options: readonly T[];
  value: T;
  onSelect: (option: T) => void;
  /** Trigger label. Pass "" to show the current value instead (range picker). */
  prefix?: string;
  /** Menu alignment relative to the trigger, default right. */
  align?: "left" | "right";
}

export function SortDropdown<T extends string>({
  options,
  value,
  onSelect,
  prefix = "Sort",
  align = "right",
}: SortDropdownProps<T>) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const out = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    window.addEventListener("mousedown", out);
    return () => window.removeEventListener("mousedown", out);
  }, []);

  return (
    <div ref={ref} className="relative inline-block">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="inline-flex cursor-pointer items-center gap-[7px] whitespace-nowrap border border-line bg-white px-3.5 py-2 text-[13px] font-bold text-ink shadow-card rounded-pill"
      >
        <span className="whitespace-nowrap">{prefix ? prefix : value}</span>
        <ChevronDown size={13} className="text-slate-400" />
      </button>
      {open ? (
        <div
          className={`absolute top-[calc(100%+6px)] z-[70] min-w-40 border border-line bg-white p-1.5 shadow-raised rounded-[14px] [animation:om-pop_160ms_var(--ease-om)_both] ${
            align === "right" ? "right-0 origin-top-right" : "left-0 origin-top-left"
          }`}
        >
          {options.map((o) => (
            <button
              key={o}
              type="button"
              onClick={() => {
                onSelect(o);
                setOpen(false);
              }}
              className="flex w-full cursor-pointer items-center gap-2.5 whitespace-nowrap border-none bg-transparent px-3 py-2 text-left text-[13px] font-bold text-ink rounded-[10px] hover:bg-fill-quiet"
            >
              <span className="flex-1">{o}</span>
              {value === o ? <Check size={13} className="text-blue-700" /> : null}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
