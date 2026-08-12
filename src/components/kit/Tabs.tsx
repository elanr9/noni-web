"use client";

import type { ReactNode } from "react";

export interface TabsProps<T extends string> {
  tabs: readonly T[];
  active: T;
  onSelect: (tab: T) => void;
  /** Slot pinned to the right of the tab row, e.g. a SortDropdown. */
  right?: ReactNode;
  className?: string;
}

export function Tabs<T extends string>({
  tabs,
  active,
  onSelect,
  right,
  className = "",
}: TabsProps<T>) {
  return (
    <div className={`mb-4 flex items-center gap-1 ${className}`}>
      {tabs.map((t) => (
        <button
          key={t}
          type="button"
          onClick={() => onSelect(t)}
          className={`cursor-pointer whitespace-nowrap border-none px-[15px] py-[7px] text-[13px] font-bold transition-colors duration-[160ms] ease-om rounded-pill ${
            active === t ? "bg-blue-100 text-blue-700" : "bg-transparent text-slate-400"
          }`}
        >
          {t}
        </button>
      ))}
      <span className="flex-1" />
      {right ?? null}
    </div>
  );
}
