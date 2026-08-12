"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";

import { Card, Chip, Label } from "@/components/kit";
import { BRIEF_WEEKS, SEED_BRIEFS, SEED_POSTS } from "@/lib/ops/mock-data";

import { MiniPostCard } from "./MiniPostCard";
import { WeekDayPill } from "./WeekDayPill";

function BriefBlock({ label, text }: { label: string; text: string }) {
  return (
    <div className="mt-3">
      <span className="mb-1 block text-[11px] font-extrabold uppercase tracking-[0.7px] text-slate-400">
        {label}
      </span>
      <p className="m-0 text-[13.5px] font-semibold leading-[1.55] text-ink">{text}</p>
    </div>
  );
}

function Arrow({
  dir,
  disabled,
  onStep,
}: {
  dir: -1 | 1;
  disabled: boolean;
  onStep: (dir: -1 | 1) => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => onStep(dir)}
      aria-label={dir < 0 ? "Previous week" : "Next week"}
      className={`inline-flex h-[30px] w-[30px] items-center justify-center border border-line bg-white rounded-pill ${
        disabled ? "cursor-default opacity-35" : "cursor-pointer"
      }`}
    >
      {dir < 0 ? (
        <ChevronLeft size={15} className="text-ink" />
      ) : (
        <ChevronRight size={15} className="text-ink" />
      )}
    </button>
  );
}

export interface ManagerBriefsProps {
  companyId: string;
}

/** Full-width briefs browser: chevron week stepping over Sun–Sat weeks,
    a Full-week + day-pill strip, then posts and briefs scoped to the
    selection. Reused by the company-admin build. */
export function ManagerBriefs({ companyId }: ManagerBriefsProps) {
  const [wi, setWi] = useState(1);
  /* null = full week */
  const [day, setDay] = useState<number | null>(null);
  const week = BRIEF_WEEKS[wi];
  const briefs = SEED_BRIEFS.filter((b) => b.company === companyId);
  const hasContent = (dd: number) =>
    briefs.some((b) => b.day === dd) ||
    SEED_POSTS.some((q) => q.company === companyId && q.day === dd);
  const shownDays = day ? [day] : week.days;
  const shownBriefs = briefs.filter((b) => shownDays.includes(b.day));
  const shownPosts = SEED_POSTS.filter(
    (q) => q.company === companyId && shownDays.includes(q.day),
  );

  const step = (dir: -1 | 1) => {
    setWi(wi + dir);
    setDay(null);
  };

  return (
    <Card pad={22}>
      <div className="mb-3.5 flex items-center gap-2.5">
        <Label className="flex-1">Briefs</Label>
        <Arrow dir={-1} disabled={wi === 0} onStep={step} />
        <span className="min-w-[86px] whitespace-nowrap text-center text-[13px] font-bold text-ink">
          {week.label}
        </span>
        <Arrow dir={1} disabled={wi === BRIEF_WEEKS.length - 1} onStep={step} />
      </div>
      <div className="mb-[18px] flex gap-1.5">
        <button
          type="button"
          onClick={() => setDay(null)}
          className={`cursor-pointer whitespace-nowrap border-none px-4 py-[9px] text-[13px] font-bold transition-colors duration-[160ms] ease-om rounded-ops-sm ${
            day === null ? "bg-blue-100 text-blue-700" : "bg-fill-quiet text-ink"
          }`}
        >
          Full week
        </button>
        {week.days.map((dd) => (
          <WeekDayPill
            key={dd}
            day={dd}
            selected={day === dd}
            hasContent={hasContent(dd)}
            onSelect={setDay}
          />
        ))}
      </div>
      <div key={`${wi}-${day ?? "week"}`} className="animate-om-rise">
        {shownPosts.length ? (
          <div className="mb-[18px]">
            <Label className="mb-2.5 block">
              {day ? `Posted Aug ${day}` : "Posted this week"}
            </Label>
            <div className="grid grid-cols-2 gap-2.5">
              {shownPosts.map((q) => (
                <MiniPostCard key={q.id} post={q} />
              ))}
            </div>
          </div>
        ) : null}
        {shownBriefs.length ? (
          <div>
            <Label className="mb-2.5 block">
              {day ? `Brief for Aug ${day}` : "Briefs this week"}
            </Label>
            <div
              className={`grid gap-3 ${
                shownBriefs.length > 1 ? "grid-cols-2" : "grid-cols-1"
              }`}
            >
              {shownBriefs.map((b) => (
                <div key={b.id} className="border border-line p-[18px] rounded-[14px]">
                  <div className="flex items-center gap-2">
                    <span className="flex-1 text-[15px] font-bold text-ink">{b.title}</span>
                    <span className="whitespace-nowrap text-[12px] font-semibold text-slate-400">
                      Aug {b.day}
                    </span>
                    <Chip tone="slate">{b.format}</Chip>
                    <Chip tone={b.status === "Active" ? "green" : "slate"}>{b.status}</Chip>
                  </div>
                  <BriefBlock label="Hook" text={b.hook} />
                  <BriefBlock label="Script" text={b.script} />
                  <BriefBlock label="Caption" text={b.caption} />
                </div>
              ))}
            </div>
          </div>
        ) : (
          <p className="m-0 text-[13.5px] font-semibold text-slate-400">
            {shownPosts.length
              ? "No brief ran " + (day ? "this day." : "this week.")
              : "Nothing ran " + (day ? `on Aug ${day}.` : "this week.")}
          </p>
        )}
      </div>
    </Card>
  );
}
