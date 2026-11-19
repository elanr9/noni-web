"use client";

export interface ProgressBarProps {
  /** 0 to 100. */
  value: number;
  /** Read out by screen readers, e.g. "Brain coverage". */
  label: string;
  tone?: "blue" | "green";
  className?: string;
}

export function ProgressBar({ value, label, tone = "blue", className = "" }: ProgressBarProps) {
  const pct = Math.max(0, Math.min(100, Math.round(value)));
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={pct}
      className={`h-2 w-full overflow-hidden bg-fill-quiet rounded-pill ${className}`}
    >
      <div
        className={`h-full rounded-pill transition-[width] duration-300 ease-om ${
          tone === "green" ? "bg-green" : "bg-blue-500"
        }`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
