"use client";

import { Check, ChevronDown } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { Label } from "./Label";

export interface FiltersDropdownProps {
  formatF: string;
  creatorF: string;
  creatorNames: readonly string[];
  onFormat: (format: string) => void;
  onCreator: (creator: string) => void;
  formatOptions?: readonly string[];
}

function Item({ label, on, pick }: { label: string; on: boolean; pick: () => void }) {
  return (
    <button
      type="button"
      onClick={pick}
      className="flex w-full cursor-pointer items-center gap-2.5 whitespace-nowrap border-none bg-transparent px-3 py-2 text-left text-[13px] font-bold text-ink rounded-[10px] hover:bg-fill-quiet"
    >
      <span className="flex-1">{label}</span>
      {on ? <Check size={13} className="text-blue-700" /> : null}
    </button>
  );
}

export function FiltersDropdown({
  formatF,
  creatorF,
  creatorNames,
  onFormat,
  onCreator,
  formatOptions = ["All formats", "Video", "Carousel"],
}: FiltersDropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const out = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    window.addEventListener("mousedown", out);
    return () => window.removeEventListener("mousedown", out);
  }, []);

  const n =
    (formatF !== "All formats" ? 1 : 0) + (creatorF !== "All creators" ? 1 : 0);

  return (
    <div ref={ref} className="relative inline-block">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={`inline-flex cursor-pointer items-center gap-[7px] whitespace-nowrap border border-line px-3.5 py-2 text-[13px] font-bold shadow-card rounded-pill ${
          n ? "bg-blue-100 text-blue-700" : "bg-white text-ink"
        }`}
      >
        Filters{n ? " · " + n : ""}
        <ChevronDown size={13} className={n ? "text-blue-700" : "text-slate-400"} />
      </button>
      {open ? (
        <div className="absolute left-0 top-[calc(100%+6px)] z-[70] min-w-[210px] origin-top-left border border-line bg-white p-1.5 shadow-raised rounded-[14px] [animation:om-pop_160ms_var(--ease-om)_both]">
          <Label className="block px-3 pb-1 pt-2">Format</Label>
          {formatOptions.map((f) => (
            <Item key={f} label={f} on={formatF === f} pick={() => onFormat(f)} />
          ))}
          <Label className="mt-1.5 block border-t border-line px-3 pb-1 pt-2.5">
            Creator
          </Label>
          {["All creators", ...creatorNames].map((c) => (
            <Item key={c} label={c} on={creatorF === c} pick={() => onCreator(c)} />
          ))}
        </div>
      ) : null}
    </div>
  );
}
