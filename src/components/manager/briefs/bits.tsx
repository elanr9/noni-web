"use client";

import { Images, Play } from "lucide-react";

import { Avatar } from "@/components/kit";

import type { BriefFormat } from "./lib";

/* Small shared pieces for the Briefs pages, styled after the admin kit. */

/** Mobile's StatPill: bold value plus a quiet unit. */
export function StatPill({ value, unit }: { value: string; unit: string }) {
  return (
    <span className="inline-flex items-baseline gap-1 whitespace-nowrap bg-fill-quiet px-[11px] py-[5px] rounded-pill">
      <span className="text-[12.5px] font-bold text-ink">{value}</span>
      <span className="text-[11px] font-semibold text-slate-400">{unit}</span>
    </span>
  );
}

/** Post type chip: quiet tint keyed off the type label. */
export function PostTypeChip({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center whitespace-nowrap bg-blue-100 px-[9px] py-[3px] text-[11px] font-bold text-blue-700 rounded-pill">
      {label}
    </span>
  );
}

/** Overlapping manager avatars, like the mobile AvatarStack. */
export function AvatarStack({
  people,
}: {
  people: Array<{ id: string; name: string }>;
}) {
  const shown = people.slice(0, 4);
  return (
    <span className="flex items-center">
      {shown.map((p, i) => (
        <span
          key={p.id}
          className="rounded-pill border-2 border-white"
          style={{ marginLeft: i === 0 ? 0 : -8 }}
        >
          <Avatar name={p.name} size={26} />
        </span>
      ))}
      {people.length > shown.length ? (
        <span className="ml-1 text-[11.5px] font-bold text-slate-400">
          +{people.length - shown.length}
        </span>
      ) : null}
    </span>
  );
}

/** Format thumbnail used on post rows, like the mobile Thumb. */
export function FormatThumb({
  format,
  width = 38,
  height = 50,
}: {
  format: BriefFormat;
  width?: number;
  height?: number;
}) {
  return (
    <span
      className="inline-flex shrink-0 items-center justify-center bg-blue-100 rounded-[9px]"
      style={{ width, height }}
    >
      {format === "photo_carousel" ? (
        <Images size={14} className="text-blue-700" />
      ) : (
        <Play size={14} className="text-blue-700" />
      )}
    </span>
  );
}

/** Quiet track progress bar for the lane cards. */
export function ProgressBar({ done, target }: { done: number; target: number }) {
  const pct = target > 0 ? Math.min(100, Math.round((done / target) * 100)) : 0;
  return (
    <span className="block h-[6px] w-full overflow-hidden bg-fill-quiet rounded-pill">
      <span
        className="block h-full bg-blue-500 rounded-pill transition-[width] duration-200 ease-om"
        style={{ width: `${pct}%` }}
      />
    </span>
  );
}
