"use client";

/* Daily-activity month calendar plus the day-detail modal, consumed by the
   Company detail Analytics tab. Each day badge shows sign-ups and sales;
   clicking a day with data opens the modal. */
import { useState } from "react";

import { Card, Label, MonthCal } from "@/components/kit";
import { postsOnDay } from "@/lib/ops/analytics";
import type { CompanyDays, Post } from "@/lib/ops/types";

import { DayModal } from "./DayModal";

export type DailyActivityProps = {
  companyId: string;
  companyName: string;
  days: CompanyDays;
  posts: Post[];
};

export function DailyActivity({
  companyId,
  companyName,
  days,
  posts,
}: DailyActivityProps) {
  const [day, setDay] = useState<number | null>(null);
  const companyDays = days[companyId] || {};
  const dayData = day !== null ? companyDays[day] : undefined;

  return (
    <>
      <Card pad={22}>
        <div className="mb-3 flex items-baseline gap-2.5">
          <Label className="flex-1">Daily activity · August 2026</Label>
          <span className="text-[12px] font-semibold text-slate-400">
            sign-ups · sales · click a day
          </span>
        </div>
        <MonthCal days={companyDays} onPick={setDay} />
      </Card>
      {day !== null && dayData ? (
        <DayModal
          title={`August ${day} · ${companyName}`}
          data={dayData}
          posts={postsOnDay(posts, companyId, day)}
          onClose={() => setDay(null)}
        />
      ) : null}
    </>
  );
}
