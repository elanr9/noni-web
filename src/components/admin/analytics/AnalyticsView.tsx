"use client";

/* The Analytics tab: stat strip, then the Graph | Calendar segmented toggle
   in the page head switching between the explorer and the daily-activity
   calendar, never both at once (AnalyticsPage in AdminAnalytics.jsx). */
import { CalendarDays, ChartColumn } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useState } from "react";

import { Card, PageHead } from "@/components/kit";
import type { AdminPost, DayActivityMap, Member, Stat, StatStrip } from "@/lib/admin/types";

import { AnalyticsExplorer } from "./AnalyticsExplorer";
import { DailyActivity } from "./DailyActivity";

type ViewMode = "Graph" | "Calendar";

const MODES: Array<{ mode: ViewMode; icon: LucideIcon }> = [
  { mode: "Graph", icon: ChartColumn },
  { mode: "Calendar", icon: CalendarDays },
];

function ModeToggle({
  mode,
  onSelect,
}: {
  mode: ViewMode;
  onSelect: (mode: ViewMode) => void;
}) {
  return (
    <div className="flex gap-1 bg-fill-quiet p-[3px] rounded-pill">
      {MODES.map(({ mode: m, icon: Icon }) => (
        <button
          key={m}
          type="button"
          onClick={() => onSelect(m)}
          className={`inline-flex cursor-pointer items-center gap-1.5 whitespace-nowrap border-none px-[13px] py-[7px] text-[12.5px] font-bold transition-colors duration-[160ms] ease-om rounded-pill ${
            mode === m ? "bg-white text-ink shadow-card" : "bg-transparent text-slate-400"
          }`}
        >
          <Icon size={13} /> {m}
        </button>
      ))}
    </div>
  );
}

export function AnalyticsView({
  statStrip,
  posts,
  creators,
  dayActivity,
  weeklyViews,
}: {
  statStrip: StatStrip;
  posts: AdminPost[];
  creators: Member[];
  dayActivity: DayActivityMap;
  weeklyViews: number[];
}) {
  const [mode, setMode] = useState<ViewMode>("Graph");
  const stats: Stat[] = [
    statStrip.views,
    statStrip.posts,
    statStrip.signups,
    statStrip.paidToCreators,
  ];

  return (
    <div>
      <PageHead
        title="Analytics"
        sub="Views, sign-ups and earnings across every post and creator."
        right={<ModeToggle mode={mode} onSelect={setMode} />}
      />
      <Card pad={22} className="mb-3.5 flex gap-[18px]">
        {stats.map((s) => (
          <span key={s.label} className="min-w-0 flex-1">
            <span className="block whitespace-nowrap text-[12px] font-semibold text-slate-400">
              {s.label}
            </span>
            <span className="mt-1 block text-[24px] font-bold tracking-[-0.6px] text-ink">
              {s.value}
            </span>
            {s.delta ? (
              <span className="mt-0.5 block whitespace-nowrap text-[12px] font-semibold text-slate-400">
                {s.delta}
              </span>
            ) : null}
          </span>
        ))}
      </Card>
      {mode === "Graph" ? (
        <AnalyticsExplorer posts={posts} creators={creators} weeklyViews={weeklyViews} />
      ) : (
        <DailyActivity dayActivity={dayActivity} posts={posts} />
      )}
    </div>
  );
}
