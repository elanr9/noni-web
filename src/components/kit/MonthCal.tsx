"use client";

import { moneyK } from "@/lib/ops/mock-data";
import type { DayActivity } from "@/lib/ops/types";

export interface MonthCalProps {
  /** Day of month → that day's activity; days without data are inert. */
  days: Record<number, DayActivity>;
  onPick: (day: number) => void;
  /** Weekday index of the 1st (0 = Sunday). Aug 1, 2026 is a Saturday. */
  firstWeekday?: number;
  daysInMonth?: number;
  /** Highlighted day, default 12 (prototype "today"). */
  today?: number;
  /** "ops" (default) keeps the centered cells with the green sign-ups pill.
      "admin" matches the admin prototype: bordered left-aligned cells, a
      blue "+sign-ups · $sales" badge, post dots and dimmed future days. */
  variant?: "ops" | "admin";
  /** Days with posts published, drawn as a blue dot next to the day number.
      Admin variant only. */
  postDays?: ReadonlySet<number>;
}

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function MonthCal({
  days,
  onPick,
  firstWeekday = 6,
  daysInMonth = 31,
  today = 12,
  variant = "ops",
  postDays,
}: MonthCalProps) {
  const cells: Array<number | null> = [
    ...Array<null>(firstWeekday).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  return (
    <div>
      <div className="mb-1.5 grid grid-cols-7 gap-1">
        {WEEKDAYS.map((d) => (
          <span
            key={d}
            className="text-center text-[10.5px] font-extrabold uppercase tracking-[0.7px] text-slate-400"
          >
            {d}
          </span>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {cells.map((d, i) => {
          if (d === null) return <span key={"e" + i} />;
          const data = days[d];
          if (variant === "admin") {
            const future = d > today;
            return (
              <button
                key={d}
                type="button"
                onClick={data ? () => onPick(d) : undefined}
                className={`flex min-h-16 flex-col items-start gap-[3px] rounded-[12px] border border-solid border-line bg-white px-[9px] py-2 text-left transition-colors duration-[160ms] ease-om ${
                  data ? "cursor-pointer hover:bg-blue-100" : "cursor-default"
                } ${future ? "opacity-40" : ""}`}
              >
                <span className="flex items-center gap-1 text-[12.5px] font-bold text-ink">
                  {d}
                  {postDays?.has(d) ? (
                    <span className="h-1.5 w-1.5 bg-blue-500 rounded-pill" />
                  ) : null}
                </span>
                {data ? (
                  <span className="whitespace-nowrap text-[11px] font-bold text-blue-700">
                    +{data.signups} · ${data.sales.toLocaleString("en-US")}
                  </span>
                ) : null}
              </button>
            );
          }
          const isToday = d === today;
          return (
            <button
              key={d}
              type="button"
              onClick={data ? () => onPick(d) : undefined}
              className={`flex min-h-16 flex-col items-center justify-center gap-1 border-none transition-colors duration-[160ms] ease-om rounded-ops-sm ${
                isToday ? "bg-blue-100" : "bg-transparent"
              } ${data ? "cursor-pointer hover:bg-fill-quiet" : "cursor-default"}`}
            >
              <span
                className={`text-[13.5px] font-bold ${isToday ? "text-blue-700" : "text-ink"}`}
              >
                {d}
              </span>
              {data ? (
                <span className="flex items-center gap-1">
                  <span className="bg-green-soft px-[7px] py-px text-[10.5px] font-bold text-green rounded-pill">
                    {data.signups}
                  </span>
                  <span className="text-[10.5px] font-bold text-slate-400">
                    {moneyK(data.sales)}
                  </span>
                </span>
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}
