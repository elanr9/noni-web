"use client";

export interface BarRowProps {
  label: string;
  value: number;
  max: number;
  suffix?: string;
}

export function BarRow({ label, value, max, suffix }: BarRowProps) {
  return (
    <div className="flex items-center gap-3">
      <span className="w-[74px] text-[13px] font-semibold text-slate-500">{label}</span>
      <span className="h-2.5 flex-1 overflow-hidden bg-fill-quiet rounded-pill">
        <span
          className="block h-full bg-blue-500 rounded-pill"
          style={{ width: `${Math.round((100 * value) / max)}%` }}
        />
      </span>
      <span className="w-[70px] text-right text-[13px] font-bold text-ink">
        {value}
        {suffix || ""}
      </span>
    </div>
  );
}
