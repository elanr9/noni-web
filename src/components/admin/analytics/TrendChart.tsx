"use client";

/* Views over time above the measure they are compared with (sign-ups, the
   sign-up rate, revenue). Two panels on one shared time axis rather than
   two scales on one plot, so neither measure distorts the other. Hovering
   a column reads out every number for that day, week or month. */
import { useEffect, useRef, useState } from "react";

import {
  fmtCount,
  fmtMoney,
  fmtRate,
  fmtSignups,
  per1k,
  type Bucket,
} from "@/lib/admin/insights";

export const COMPARE = [
  "Sign-ups",
  "Sign-ups per 1k views",
  "Revenue",
  "Revenue per 1k views",
] as const;
export type Compare = (typeof COMPARE)[number];

/* Validated as a pair for colour-blind separation and contrast on white. */
const VIEWS_COLOR = "#0f8fd1";
const COMPARE_COLOR = "#7c3aed";

const PAD = { l: 46, r: 8 };
const VIEWS_H = 146;
const COMPARE_H = 104;
const HEAD_H = 24;
const AXIS_H = 22;

function niceMax(v: number): number {
  if (v <= 0) return 1;
  const pow = Math.pow(10, Math.floor(Math.log10(v)));
  for (const step of [1, 2, 2.5, 5, 10]) if (v <= step * pow) return step * pow;
  return 10 * pow;
}

function compareValue(b: Bucket, compare: Compare): number | null {
  if (compare === "Sign-ups") return b.signups;
  if (compare === "Sign-ups per 1k views") return per1k(b.signups, b.views);
  if (compare === "Revenue") return b.salesCents;
  return per1k(b.salesCents, b.views);
}

function fmtCompare(v: number | null, compare: Compare): string {
  if (compare === "Sign-ups") return v === null ? "–" : fmtSignups(v);
  if (compare === "Sign-ups per 1k views") return fmtRate(v);
  return fmtMoney(v);
}

function Panel({
  top,
  height,
  width,
  max,
  fmt,
}: {
  top: number;
  height: number;
  width: number;
  max: number;
  fmt: (v: number) => string;
}) {
  return (
    <g>
      {[0, 0.5, 1].map((f) => (
        <g key={f}>
          <line
            x1={PAD.l}
            x2={width - PAD.r}
            y1={top + height * f}
            y2={top + height * f}
            className="stroke-line"
            strokeWidth="1"
          />
          <text
            x={PAD.l - 8}
            y={top + height * f + 4}
            textAnchor="end"
            className="fill-slate-400 text-[11px] font-semibold"
          >
            {fmt(max * (1 - f))}
          </text>
        </g>
      ))}
    </g>
  );
}

function bar(x: number, w: number, top: number, bottom: number): string {
  const h = bottom - top;
  const r = Math.min(4, w / 2, h);
  return `M${x} ${bottom}V${top + r}Q${x} ${top} ${x + r} ${top}H${x + w - r}Q${x + w} ${top} ${x + w} ${top + r}V${bottom}Z`;
}

export function TrendChart({
  buckets,
  compare,
  showCompare,
  showRevenue,
}: {
  buckets: Bucket[];
  compare: Compare;
  /** False until a sign-up source is connected: only views are drawn. */
  showCompare: boolean;
  showRevenue: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(640);
  const [hover, setHover] = useState<number | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () => setWidth(Math.max(320, Math.round(el.clientWidth)));
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const n = buckets.length;
  if (n === 0) return <div ref={ref} />;

  const iw = width - PAD.l - PAD.r;
  const band = iw / n;
  const barW = Math.max(2, Math.min(24, band - 2));
  const cx = (i: number) => PAD.l + band * (i + 0.5);

  const viewsTop = HEAD_H;
  const viewsBottom = viewsTop + VIEWS_H;
  const compareTop = viewsBottom + (showCompare ? 18 + HEAD_H : 0);
  const compareBottom = compareTop + (showCompare ? COMPARE_H : 0);
  /* With one panel the post dots sit above the date labels. */
  const height = compareBottom + AXIS_H + (showCompare ? 0 : 10);

  const viewsMax = niceMax(Math.max(...buckets.map((b) => b.views)));
  const values = buckets.map((b) => compareValue(b, compare));
  const compareMax = niceMax(Math.max(...values.map((v) => v ?? 0)));
  const isRate = compare.includes("per 1k");
  const cy = (v: number) => compareBottom - (COMPARE_H * v) / compareMax;

  /* A rate is a line broken where a bucket had no views to divide by. */
  let line = "";
  let pen = false;
  values.forEach((v, i) => {
    if (v === null) {
      pen = false;
      return;
    }
    line += `${pen ? "L" : "M"}${cx(i).toFixed(1)} ${cy(v).toFixed(1)}`;
    pen = true;
  });

  /* About six date labels, always including the last bucket. */
  const every = Math.max(1, Math.ceil(n / 6));
  const labelled = (i: number) => (n - 1 - i) % every === 0;

  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const box = e.currentTarget.getBoundingClientRect();
    const i = Math.floor((e.clientX - box.left - PAD.l) / band);
    setHover(i >= 0 && i < n ? i : null);
  };

  const h = hover !== null ? buckets[hover] : null;
  const tipLeft = hover !== null && cx(hover) > width / 2;

  return (
    <div
      ref={ref}
      className="relative select-none"
      onMouseMove={onMove}
      onMouseLeave={() => setHover(null)}
    >
      <svg width={width} height={height} className="block" role="img" aria-label="Views and sign-ups over time">
        {hover !== null ? (
          <rect
            x={PAD.l + band * hover}
            y={viewsTop}
            width={band}
            height={compareBottom - viewsTop}
            className="fill-fill-quiet"
          />
        ) : null}

        <text x={0} y={12} className="fill-ink text-[12.5px] font-bold">
          Views
        </text>
        <circle cx={width - PAD.r - 44} cy={8} r={2.5} className="fill-slate-300" />
        <text x={width - PAD.r} y={12} textAnchor="end" className="fill-slate-400 text-[11px] font-semibold">
          posted
        </text>
        <Panel top={viewsTop} height={VIEWS_H} width={width} max={viewsMax} fmt={fmtCount} />
        {buckets.map((b, i) =>
          b.views > 0 ? (
            <path
              key={b.key}
              d={bar(
                cx(i) - barW / 2,
                barW,
                Math.min(viewsBottom - 1, viewsBottom - (VIEWS_H * b.views) / viewsMax),
                viewsBottom,
              )}
              fill={VIEWS_COLOR}
              opacity={hover === null || hover === i ? 1 : 0.55}
            />
          ) : null,
        )}
        {/* A dot under the views axis marks a bucket where posts went live. */}
        {buckets.map((b, i) =>
          b.posts > 0 ? (
            <circle key={b.key} cx={cx(i)} cy={viewsBottom + 7} r={2.5} className="fill-slate-300" />
          ) : null,
        )}

        {showCompare ? (
          <>
            <text x={0} y={compareTop - HEAD_H + 12} className="fill-ink text-[12.5px] font-bold">
              {compare}
            </text>
            <Panel
              top={compareTop}
              height={COMPARE_H}
              width={width}
              max={compareMax}
              fmt={(v) => fmtCompare(v, compare)}
            />
            {isRate ? (
              <>
                <path
                  d={line}
                  fill="none"
                  stroke={COMPARE_COLOR}
                  strokeWidth="2"
                  strokeLinejoin="round"
                  strokeLinecap="round"
                />
                {values.map((v, i) =>
                  v !== null && (n <= 31 || hover === i) ? (
                    <circle
                      key={buckets[i].key}
                      cx={cx(i)}
                      cy={cy(v)}
                      r={hover === i ? 4.5 : 3}
                      fill={COMPARE_COLOR}
                      stroke="#fff"
                      strokeWidth="2"
                    />
                  ) : null,
                )}
              </>
            ) : (
              values.map((v, i) =>
                v !== null && v > 0 ? (
                  <path
                    key={buckets[i].key}
                    d={bar(cx(i) - barW / 2, barW, Math.min(compareBottom - 1, cy(v)), compareBottom)}
                    fill={COMPARE_COLOR}
                    opacity={hover === null || hover === i ? 1 : 0.55}
                  />
                ) : null,
              )
            )}
          </>
        ) : null}

        {buckets.map((b, i) =>
          labelled(i) ? (
            <text
              key={b.key}
              x={Math.min(Math.max(cx(i), PAD.l + 16), width - 18)}
              y={height - 5}
              textAnchor="middle"
              className="fill-slate-400 text-[11px] font-semibold"
            >
              {b.label}
            </text>
          ) : null,
        )}
      </svg>

      {h && hover !== null ? (
        <div
          className="pointer-events-none absolute top-1 z-10 w-[236px] border border-line bg-white px-3.5 py-3 shadow-raised rounded-[14px]"
          style={tipLeft ? { right: width - cx(hover) + band / 2 + 8 } : { left: cx(hover) + band / 2 + 8 }}
        >
          <div className="mb-1.5 text-[12.5px] font-bold text-ink">{h.title}</div>
          <TipRow color={VIEWS_COLOR} label="Views" value={fmtCount(h.views)} />
          {showCompare ? (
            <>
              <TipRow
                color={compare.startsWith("Sign-ups") ? COMPARE_COLOR : undefined}
                label="Sign-ups"
                value={fmtSignups(h.signups)}
              />
              <TipRow label="Sign-ups per 1k views" value={fmtRate(per1k(h.signups, h.views))} />
            </>
          ) : null}
          {showCompare && showRevenue ? (
            <>
              <TipRow
                color={compare.startsWith("Revenue") ? COMPARE_COLOR : undefined}
                label="Revenue"
                value={fmtMoney(h.salesCents)}
              />
              <TipRow label="Revenue per 1k views" value={fmtMoney(per1k(h.salesCents, h.views))} />
            </>
          ) : null}
          <TipRow label="Posted" value={String(h.posts)} />
        </div>
      ) : null}
    </div>
  );
}

function TipRow({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div className="flex items-center gap-2 py-[3px]">
      <span
        className="h-2 w-2 shrink-0 rounded-[2px]"
        style={{ background: color ?? "transparent" }}
      />
      <span className="flex-1 text-[12px] font-semibold text-slate-500">{label}</span>
      <span className="text-[12.5px] font-bold text-ink">{value}</span>
    </div>
  );
}
