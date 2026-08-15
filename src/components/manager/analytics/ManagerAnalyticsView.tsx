"use client";

/* The /manager Analytics tab: stat strip, then the Graph | Calendar
   segmented toggle switching between the explorer and the daily-activity
   calendar, never both at once, following the admin AnalyticsView. Cards
   the company admin has not unlocked are omitted entirely: sign-ups need
   viewSignups, anything in dollars needs viewFinancials, and dollars also
   start on the Stripe connect day (mobile analytics.tsx semantics). */
import { CalendarDays, ChartColumn } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useState } from "react";

import { Card, PageHead } from "@/components/kit";
import type { ManagerAccess } from "@/lib/admin/types";

import {
  fmtViews,
  formatMoney,
  moneyOn,
  type ManagerAnalytics,
} from "./derive";
import { ManagerDailyActivity } from "./ManagerDailyActivity";
import { ManagerExplorer } from "./ManagerExplorer";

type ViewMode = "Graph" | "Calendar";

const MODES: Array<{ mode: ViewMode; icon: LucideIcon }> = [
  { mode: "Graph", icon: ChartColumn },
  { mode: "Calendar", icon: CalendarDays },
];

interface StatCell {
  label: string;
  value: string;
  delta: string;
}

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

export function ManagerAnalyticsView({
  data,
  access,
}: {
  data: ManagerAnalytics;
  access: ManagerAccess;
}) {
  const [mode, setMode] = useState<ViewMode>("Graph");
  const { posts, days, totals, payouts, gate } = data;
  const showSignups = access.viewSignups;
  const showFinancials = access.viewFinancials;

  const empty = posts.length === 0 && (!showSignups || totals.signups === 0);

  const paidOutCents =
    gate.connectedDay !== null
      ? payouts
          .filter((p) => moneyOn(gate, p.day))
          .reduce((n, p) => n + p.amountCents, 0)
      : 0;

  const pct = (delta: number | null): string =>
    delta !== null ? `${delta >= 0 ? "+" : ""}${delta}% vs prior 30 days` : "";

  const stats: StatCell[] = [
    { label: "Views", value: fmtViews(totals.views), delta: pct(totals.viewsDeltaPct) },
    {
      label: "Posts",
      value: String(totals.posts),
      delta: totals.postsThisWeek > 0 ? `+${totals.postsThisWeek} this week` : "",
    },
    ...(showSignups
      ? [
          {
            label: "Sign-ups attributed",
            value: totals.signups.toLocaleString("en-US"),
            delta: pct(totals.signupsDeltaPct),
          },
        ]
      : []),
    ...(showFinancials
      ? [
          {
            label: "Paid to creators",
            value:
              gate.connectedDay !== null ? formatMoney(paidOutCents) : "Not tracked",
            delta: gate.sinceLabel !== null ? `since ${gate.sinceLabel}` : "",
          },
        ]
      : []),
  ];

  return (
    <div>
      <PageHead
        title="Analytics"
        sub="Views and daily activity across every post and creator."
        right={empty ? undefined : <ModeToggle mode={mode} onSelect={setMode} />}
      />
      {empty ? (
        <Card pad={22} className="py-14 text-center">
          <p className="m-0 text-[16px] font-bold text-ink">No numbers yet</p>
          <p className="mx-auto mb-0 mt-1.5 max-w-[360px] text-[13.5px] font-semibold text-slate-400">
            Metrics start landing the day the first post goes live.
          </p>
        </Card>
      ) : (
        <>
          <Card pad={22} className="mb-3.5 flex flex-wrap gap-[18px]">
            {stats.map((s) => (
              <span key={s.label} className="min-w-[140px] flex-1">
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
            <ManagerExplorer
              posts={posts}
              gate={gate}
              showFinancials={showFinancials}
            />
          ) : (
            <ManagerDailyActivity
              days={days}
              posts={posts}
              gate={gate}
              showSignups={showSignups}
              showFinancials={showFinancials}
            />
          )}
        </>
      )}
    </div>
  );
}
