"use client";

/* Daily-activity month calendar for /manager/analytics, following the
   admin DailyActivity surface (bordered cells, blue badge, post dots,
   dimmed future days, inline day card with post drill-in) but drawn from
   the mobile app's day list (YYYY-MM-DD keys over the last 84 days) so a
   manager-specific calendar can gate each badge part: sign-ups render only
   with viewSignups, money only with viewFinancials and only from the
   Stripe connect day, exactly like the mobile MonthCal. */
import { ChevronRight, Images, Play, X } from "lucide-react";
import { useState } from "react";

import { Card, Label } from "@/components/kit";

import {
  fmtViews,
  formatMoney,
  localDayKey,
  moneyOn,
  shortDayLabel,
  type ManagerAnalyticsDay,
  type ManagerAnalyticsPost,
  type MoneyGate,
} from "./derive";
import { ManagerPostDetail } from "./ManagerPostDetail";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function DayDetail({
  day,
  posts,
  gate,
  showSignups,
  showFinancials,
  onOpenPost,
  onClose,
}: {
  day: ManagerAnalyticsDay;
  posts: ManagerAnalyticsPost[];
  gate: MoneyGate;
  showSignups: boolean;
  showFinancials: boolean;
  onOpenPost: (post: ManagerAnalyticsPost) => void;
  onClose: () => void;
}) {
  const money = showFinancials && moneyOn(gate, day.day);
  const title = shortDayLabel(day.day);
  const stats: Array<[string, string]> = [
    ["Views", fmtViews(day.views)],
    ...(showSignups ? ([["Sign-ups", String(day.signups)]] as Array<[string, string]>) : []),
    ...(money ? ([["Sales", formatMoney(day.salesCents)]] as Array<[string, string]>) : []),
  ];
  return (
    <div>
      <div className="mb-3.5 flex items-center gap-2.5">
        <span className="flex-1 text-[18px] font-bold tracking-[-0.4px] text-ink">
          {title}
        </span>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="inline-flex h-[30px] w-[30px] cursor-pointer items-center justify-center border-none bg-fill-quiet rounded-pill"
        >
          <X size={14} className="text-slate-500" />
        </button>
      </div>
      <div className="mb-3.5 flex gap-3.5 rounded-[14px] bg-fill-quiet px-4 py-3.5">
        {stats.map(([label, value]) => (
          <span key={label} className="min-w-0 flex-1">
            <span className="block text-[11.5px] font-semibold text-slate-400">
              {label}
            </span>
            <span className="mt-[3px] block text-[19px] font-bold tracking-[-0.4px] text-ink">
              {value}
            </span>
          </span>
        ))}
      </div>
      {showFinancials && gate.connectedDay !== null && !money ? (
        <p className="mb-3 mt-0 text-[12.5px] font-semibold text-slate-400">
          No money data for this day. Stripe was connected {gate.sinceLabel ?? ""}.
        </p>
      ) : null}
      <Label className="mb-1 block">Posted {title}</Label>
      {posts.length === 0 ? (
        <p className="mb-1 mt-2 text-[13.5px] font-semibold text-slate-400">
          Nothing posted this day.
        </p>
      ) : (
        posts.map((q) => {
          const Icon = q.format === "Video" ? Play : Images;
          const postMoney = showFinancials && moneyOn(gate, q.day);
          return (
            <div
              key={q.id}
              role="button"
              onClick={() => onOpenPost(q)}
              className="-mx-2.5 flex cursor-pointer items-center gap-3 rounded-[12px] px-2.5 py-[11px] transition-colors duration-[160ms] ease-om hover:bg-fill-quiet"
            >
              <span className="inline-flex h-12 w-9 shrink-0 items-center justify-center bg-blue-100 rounded-[9px]">
                <Icon size={14} className="text-blue-700" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[13.5px] font-bold text-ink">
                  {q.title}
                </span>
                <span className="mt-0.5 block text-[12px] font-semibold text-slate-400">
                  {q.creatorFirst} · {q.format}
                </span>
              </span>
              <span className="text-right">
                <span className="block text-[14px] font-bold text-ink">
                  {fmtViews(q.views)}
                </span>
                {postMoney ? (
                  <span className="block text-[11.5px] font-bold text-green">
                    {formatMoney(q.earnedCents)}
                  </span>
                ) : null}
              </span>
              <ChevronRight size={15} className="text-slate-400" />
            </div>
          );
        })
      )}
    </div>
  );
}

export function ManagerDailyActivity({
  days,
  posts,
  gate,
  showSignups,
  showFinancials,
}: {
  days: ManagerAnalyticsDay[];
  posts: ManagerAnalyticsPost[];
  gate: MoneyGate;
  showSignups: boolean;
  showFinancials: boolean;
}) {
  const [selected, setSelected] = useState<string | null>(null);
  const [post, setPost] = useState<ManagerAnalyticsPost | null>(null);

  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const monthName = now.toLocaleDateString("en-US", { month: "long" });
  const firstWeekday = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = now.getDate();

  const byDay = new Map<string, ManagerAnalyticsDay>();
  for (const d of days) byDay.set(d.day, d);
  const keyOf = (d: number) => localDayKey(new Date(year, month, d));

  const cells: Array<number | null> = [
    ...Array<null>(firstWeekday).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  const legend = [
    ...(showSignups && showFinancials
      ? ["Badge = sign-ups and sales that day."]
      : showSignups
        ? ["Badge = sign-ups that day."]
        : showFinancials
          ? ["Badge = sales that day."]
          : []),
    ...(showFinancials && gate.sinceLabel !== null
      ? [`Money is tracked since ${gate.sinceLabel}.`]
      : []),
    "Dot = posts published.",
    "Click a day for the full picture.",
  ].join(" ");

  const selectedDay =
    selected !== null ? (byDay.get(selected) ?? null) : null;
  const dayPosts =
    selected !== null ? posts.filter((p) => p.day === selected) : [];

  return (
    <>
      <Card pad={22}>
        <Label className="mb-3.5 block">Daily activity · {monthName}</Label>
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
            const key = keyOf(d);
            const data = byDay.get(key);
            const posted = data !== undefined && data.postIds.length > 0;
            const money =
              data !== undefined && showFinancials && moneyOn(gate, key);
            const has =
              data !== undefined &&
              (data.views > 0 ||
                (showSignups && data.signups > 0) ||
                (money && data.salesCents > 0) ||
                posted);
            const future = d > today;
            const badge = [
              ...(showSignups && data !== undefined && data.signups > 0
                ? [`+${data.signups}`]
                : []),
              ...(money && data !== undefined && data.salesCents > 0
                ? [formatMoney(data.salesCents)]
                : []),
            ].join(" · ");
            return (
              <button
                key={d}
                type="button"
                onClick={
                  has
                    ? () => {
                        setSelected(key);
                        setPost(null);
                      }
                    : undefined
                }
                className={`flex min-h-16 flex-col items-start gap-[3px] rounded-[12px] border border-solid bg-white px-[9px] py-2 text-left transition-colors duration-[160ms] ease-om ${
                  selected === key ? "border-blue-500 bg-blue-100" : "border-line"
                } ${has ? "cursor-pointer hover:bg-blue-100" : "cursor-default"} ${
                  future ? "opacity-40" : ""
                }`}
              >
                <span className="flex items-center gap-1 text-[12.5px] font-bold text-ink">
                  {d}
                  {posted ? (
                    <span className="h-1.5 w-1.5 bg-blue-500 rounded-pill" />
                  ) : null}
                </span>
                {badge ? (
                  <span className="whitespace-nowrap text-[11px] font-bold text-blue-700">
                    {badge}
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>
        <p className="mb-0 mt-2.5 text-[12px] font-semibold text-slate-400">
          {legend}
        </p>
      </Card>
      {selectedDay !== null ? (
        <Card
          key={"d" + selectedDay.day + (post ? post.id : "")}
          pad={22}
          className="mt-3.5 animate-om-rise"
        >
          {post !== null ? (
            <ManagerPostDetail
              post={post}
              gate={gate}
              showFinancials={showFinancials}
              onBack={() => setPost(null)}
            />
          ) : (
            <DayDetail
              day={selectedDay}
              posts={dayPosts}
              gate={gate}
              showSignups={showSignups}
              showFinancials={showFinancials}
              onOpenPost={setPost}
              onClose={() => setSelected(null)}
            />
          )}
        </Card>
      ) : null}
    </>
  );
}
