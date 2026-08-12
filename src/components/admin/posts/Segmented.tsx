"use client";

import type { LucideIcon } from "lucide-react";

export interface SegmentedOption<T extends string> {
  value: T;
  label: string;
  icon: LucideIcon;
}

/* The prototype's white-pill segmented control (Grid | Calendar on Posts,
   TikTok | Instagram on Company Brain): quiet track, white raised active. */
export function Segmented<T extends string>({
  options,
  value,
  onSelect,
}: {
  options: ReadonlyArray<SegmentedOption<T>>;
  value: T;
  onSelect: (value: T) => void;
}) {
  return (
    <div className="flex gap-1 bg-fill-quiet p-[3px] rounded-pill">
      {options.map((o) => {
        const Icon = o.icon;
        const active = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            onClick={() => onSelect(o.value)}
            className={`inline-flex cursor-pointer items-center gap-1.5 whitespace-nowrap border-none px-[13px] py-[7px] text-[12.5px] font-bold transition-colors duration-[160ms] ease-om rounded-pill ${
              active ? "bg-white text-ink shadow-card" : "bg-transparent text-slate-400"
            }`}
          >
            <Icon size={13} /> {o.label}
          </button>
        );
      })}
    </div>
  );
}
