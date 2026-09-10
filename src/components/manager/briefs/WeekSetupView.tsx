"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import { Card, Label, PageHead, Pill } from "@/components/kit";

import { startWeek } from "@/app/manager/briefs/actions";
import {
  BRIEF_WEEK_DAYS,
  briefWeekRangeLabel,
  dayChipLabel,
  DEFAULT_SLIDESHOWS_PER_DAY,
  DEFAULT_VIDEOS_PER_DAY,
  nextSunday,
  startDayOptions,
} from "./lib";

/* Start week: the manager picks how many posts each creator makes a day
   and the start day; one row per slot is stamped for the week. Each post
   suggests its kind when opened. Ported from the mobile week-setup screen. */

function parsePerDay(text: string): number {
  const n = Number.parseInt(text, 10);
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.min(99, n));
}

function plural(n: number, one: string, many: string): string {
  return `${n} ${n === 1 ? one : many}`;
}

function PerDayInput({
  label,
  sub,
  value,
  onChange,
}: {
  label: string;
  sub: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="flex flex-1 flex-col gap-[7px]">
      <Label>{label}</Label>
      <input
        inputMode="numeric"
        maxLength={2}
        value={value}
        onChange={(e) => onChange(e.target.value.replace(/[^\d]/g, ""))}
        className="w-full border border-line bg-white px-3.5 py-3 text-[14.5px] font-semibold text-ink outline-none rounded-ops-sm focus:border-blue-500 focus:[box-shadow:var(--ring-focus)]"
      />
      <span className="text-[11.5px] font-semibold text-slate-400">{sub}</span>
    </label>
  );
}

export function WeekSetupView({ weekNumber }: { weekNumber: number }) {
  const router = useRouter();
  const [videosText, setVideosText] = useState(String(DEFAULT_VIDEOS_PER_DAY));
  const [slideshowsText, setSlideshowsText] = useState(
    String(DEFAULT_SLIDESHOWS_PER_DAY),
  );
  const [dropDate, setDropDate] = useState(nextSunday);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const dayOptions = useMemo(() => startDayOptions(), []);
  const videosPerDay = parsePerDay(videosText);
  const slideshowsPerDay = parsePerDay(slideshowsText);
  const perDay = videosPerDay + slideshowsPerDay;
  const videosWeekly = videosPerDay * BRIEF_WEEK_DAYS;
  const slideshowsWeekly = slideshowsPerDay * BRIEF_WEEK_DAYS;
  const totalRows = videosWeekly + slideshowsWeekly;

  async function submit() {
    if (submitting || totalRows === 0) return;
    setSubmitting(true);
    setError(null);
    const result = await startWeek({ dropDate, videosPerDay, slideshowsPerDay });
    if (result.ok) {
      router.push(`/manager/briefs/week/${result.campaignId}`);
      return;
    }
    setError(result.error);
    setSubmitting(false);
  }

  return (
    <div>
      <PageHead
        title={`Week ${weekNumber} · ${briefWeekRangeLabel(dropDate)}`}
        sub="Week setup"
        onBack={() => router.push("/manager/briefs")}
      />

      <Card pad={22} className="flex max-w-[640px] flex-col gap-4">
        <Label>Posts a day</Label>
        <p className="m-0 text-[13px] leading-relaxed text-slate-500">
          How many should each creator post a day? That is the whole setup.
        </p>
        <div className="flex flex-col gap-2.5 sm:flex-row">
          <PerDayInput
            label="Videos a day"
            sub="Reels"
            value={videosText}
            onChange={setVideosText}
          />
          <PerDayInput
            label="Slideshows a day"
            sub="Photo carousels"
            value={slideshowsText}
            onChange={setSlideshowsText}
          />
        </div>
        <p className="m-0 text-[13px] leading-relaxed text-slate-500">
          {totalRows === 0
            ? "Pick at least one post a day."
            : `${plural(perDay, "post", "posts")} a day, ${totalRows} this week: ${plural(videosWeekly, "video", "videos")} and ${plural(slideshowsWeekly, "slideshow", "slideshows")}. Each post suggests its kind when you open it.`}
        </p>

        <Label className="mt-2">Start day</Label>
        <div className="flex flex-wrap gap-2">
          {dayOptions.map((iso) => {
            const selected = iso === dropDate;
            return (
              <button
                key={iso}
                type="button"
                onClick={() => setDropDate(iso)}
                className={`cursor-pointer whitespace-nowrap border-none px-3.5 py-2.5 text-[13px] font-bold transition-colors duration-[160ms] ease-om rounded-pill ${
                  selected
                    ? "bg-blue-100 text-blue-700"
                    : "bg-fill-quiet text-slate-500"
                }`}
              >
                {dayChipLabel(iso)}
              </button>
            );
          })}
        </div>
        <p className="m-0 text-[12.5px] text-slate-400">
          {`Runs ${briefWeekRangeLabel(dropDate)}. The clock starts when the first post goes live.`}
        </p>

        {error ? (
          <p className="m-0 text-[13px] font-semibold text-danger">{error}</p>
        ) : null}

        <div className="mt-1 flex items-center gap-2.5">
          <Pill variant="quiet" onClick={() => router.push("/manager/briefs")}>
            Back
          </Pill>
          <Pill disabled={submitting || totalRows === 0} onClick={() => void submit()}>
            {submitting ? "Creating rows…" : `Create ${plural(totalRows, "row", "rows")}`}
          </Pill>
        </div>
      </Card>
    </div>
  );
}
