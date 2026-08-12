"use client";

import { useState } from "react";

import { AreaChart, Card, Label, SortDropdown } from "@/components/kit";
import { fmtK, moneyK } from "@/lib/ops/mock-data";
import type { DayActivity } from "@/lib/ops/types";

const METRICS = ["Views", "Revenue", "Sign-ups"] as const;
type Metric = (typeof METRICS)[number];

/** Sun–Sat days of the current week, clamped to the current month. */
function currentWeekDays(now: Date): number[] {
  const sunday = now.getDate() - now.getDay();
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const days: number[] = [];
  for (let d = sunday; d < sunday + 7; d++) {
    if (d >= 1 && d <= daysInMonth) days.push(d);
  }
  return days;
}

/** This-week chart with a metric dropdown, shown on campaign-manager profiles. */
export function ManagerWeek({ days }: { days: Record<number, DayActivity> }) {
  const [metric, setMetric] = useState<Metric>("Views");
  const now = new Date();
  const weekDays = currentWeekDays(now);
  const month = now.toLocaleString("en-US", { month: "short" });
  const pickV = (day: number): number => {
    const x = days[day];
    if (!x) return 0;
    return metric === "Views" ? x.views : metric === "Revenue" ? x.sales : x.signups;
  };
  const series = weekDays.map(pickV);
  const labels = weekDays
    .filter((_, i) => i % 2 === 0)
    .map((d) => `${month} ${d}`);
  const yFmt =
    metric === "Views"
      ? (v: number) => fmtK(v)
      : metric === "Revenue"
        ? (v: number) => moneyK(Math.round(v))
        : (v: number) => String(Math.round(v));
  return (
    <Card pad={22}>
      <div className="mb-3 flex items-center gap-2.5">
        <Label className="flex-1">This week</Label>
        <SortDropdown prefix="" options={METRICS} value={metric} onSelect={setMetric} />
      </div>
      <div key={metric} className="animate-om-rise">
        <AreaChart series={series} labels={labels} vb={210} yFmt={yFmt} />
      </div>
    </Card>
  );
}
