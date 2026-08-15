"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import { Card, Label, PageHead, Pill } from "@/components/kit";

import { startWeek } from "@/app/manager/briefs/actions";
import {
  briefWeekRangeLabel,
  dayChipLabel,
  DEFAULT_SLIDESHOW_TARGET,
  DEFAULT_VIDEO_TARGET,
  nextSunday,
  scheduleRangeLabel,
  SLOTS_PER_DAY,
  startDayOptions,
} from "./lib";

/* Start week: the manager picks the start day and each lane's target, then
   the grid is stamped from the post types' usual mix. Types stay editable
   on the grid. Ported from the mobile week-setup screen. */

function parseTarget(text: string): number {
  const n = Number.parseInt(text, 10);
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.min(99, n));
}

function TargetInput({
  label,
  value,
  onChange,
}: {
  label: string;
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
    </label>
  );
}

export function WeekSetupView({ weekNumber }: { weekNumber: number }) {
  const router = useRouter();
  const [videoText, setVideoText] = useState(String(DEFAULT_VIDEO_TARGET));
  const [slideshowText, setSlideshowText] = useState(
    String(DEFAULT_SLIDESHOW_TARGET),
  );
  const [dropDate, setDropDate] = useState(nextSunday);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const dayOptions = useMemo(() => startDayOptions(), []);
  const videoTarget = parseTarget(videoText);
  const slideshowTarget = parseTarget(slideshowText);
  const totalPosts = videoTarget + slideshowTarget;

  async function submit() {
    if (submitting || totalPosts === 0) return;
    setSubmitting(true);
    setError(null);
    const result = await startWeek({ dropDate, videoTarget, slideshowTarget });
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
        <Label>Posts</Label>
        <div className="flex flex-col gap-2.5 sm:flex-row">
          <TargetInput label="Videos" value={videoText} onChange={setVideoText} />
          <TargetInput
            label="Slideshows"
            value={slideshowText}
            onChange={setSlideshowText}
          />
        </div>
        <p className="m-0 text-[13px] leading-relaxed text-slate-500">
          {totalPosts === 0
            ? "Set at least one post."
            : `${totalPosts} posts, up to ${SLOTS_PER_DAY} per creator per day: ${scheduleRangeLabel(dropDate, totalPosts)}. Types are stamped from the usual mix and stay editable on the grid.`}
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

        {error ? (
          <p className="m-0 text-[13px] font-semibold text-danger">{error}</p>
        ) : null}

        <div className="mt-1 flex items-center gap-2.5">
          <Pill variant="quiet" onClick={() => router.push("/manager/briefs")}>
            Back
          </Pill>
          <Pill disabled={submitting || totalPosts === 0} onClick={() => void submit()}>
            {submitting ? "Setting up…" : `Start week · ${totalPosts} posts`}
          </Pill>
        </div>
      </Card>
    </div>
  );
}
