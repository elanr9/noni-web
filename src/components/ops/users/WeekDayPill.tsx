"use client";

export interface WeekDayPillProps {
  /** Day of month shown on the pill. */
  day: number;
  selected: boolean;
  /** Marks the day with a dot when a brief or a post exists on it. */
  hasContent: boolean;
  onSelect: (day: number) => void;
}

/** Flexing day pill for the briefs-browser week strip.
    Reused by the company-admin briefs browser. */
export function WeekDayPill({ day, selected, hasContent, onSelect }: WeekDayPillProps) {
  return (
    <button
      type="button"
      onClick={() => onSelect(day)}
      className={`flex flex-1 cursor-pointer flex-col items-center gap-1 border-none pb-[7px] pt-[9px] transition-colors duration-[160ms] ease-om rounded-ops-sm ${
        selected ? "bg-blue-100" : "bg-fill-quiet"
      }`}
    >
      <span className={`text-[13px] font-bold ${selected ? "text-blue-700" : "text-ink"}`}>
        {day}
      </span>
      <span
        className={`h-[5px] w-[5px] rounded-pill ${
          hasContent ? (selected ? "bg-blue-500" : "bg-slate-400") : "bg-transparent"
        }`}
      />
    </button>
  );
}
