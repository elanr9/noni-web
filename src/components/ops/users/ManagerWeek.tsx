"use client";

import { useState } from "react";

import { AreaChart, Card, Label, SortDropdown } from "@/components/kit";
import { COMPANY_DAYS, fmtK, moneyK } from "@/lib/ops/mock-data";

const METRICS = ["Views", "Revenue", "Sign-ups"] as const;
type Metric = (typeof METRICS)[number];

/* Aug 5–11, the week the console's mock data centers on. */
const DAYS = [5, 6, 7, 8, 9, 10, 11];

/** This-week chart with a metric dropdown, shown on campaign-manager profiles. */
export function ManagerWeek({ companyId }: { companyId: string }) {
  const [metric, setMetric] = useState<Metric>("Views");
  const d = COMPANY_DAYS[companyId] ?? {};
  const pickV = (day: number): number => {
    const x = d[day];
    if (!x) return 0;
    return metric === "Views" ? x.views : metric === "Revenue" ? x.sales : x.signups;
  };
  const series = DAYS.map(pickV);
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
        <AreaChart
          series={series}
          labels={["Aug 5", "Aug 7", "Aug 9", "Aug 11"]}
          vb={210}
          yFmt={yFmt}
        />
      </div>
    </Card>
  );
}
