"use client";

import { fmtK } from "@/lib/ops/mock-data";

export interface AreaChartProps {
  series: number[];
  /** ViewBox height, default 240. */
  vb?: number;
  labels?: string[];
  yFmt?: (v: number) => string;
}

const DEFAULT_LABELS = ["May 25", "Jun 8", "Jun 22", "Jul 6", "Jul 20", "Aug 3"];

export function AreaChart({
  series,
  vb = 240,
  labels = DEFAULT_LABELS,
  yFmt = (v) => fmtK(v * 1000),
}: AreaChartProps) {
  if (series.length === 0) return null;

  const W = 640;
  const H = vb;
  const P = { t: 14, r: 10, b: 26, l: 42 };
  const max = Math.max(...series) * 1.15 || 1;
  const iw = W - P.l - P.r;
  const ih = H - P.t - P.b;
  const step = Math.max(series.length - 1, 1);
  const pts: Array<[number, number]> = series.map((v, i) => [
    P.l + (iw * i) / step,
    P.t + ih * (1 - v / max),
  ]);
  const line = pts
    .map((p, i) => (i ? "L" : "M") + p[0].toFixed(1) + " " + p[1].toFixed(1))
    .join(" ");
  const last = pts[pts.length - 1];

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="block h-auto w-full">
      {[0, 0.5, 1].map((f, i) => (
        <g key={i}>
          <line
            x1={P.l}
            x2={W - P.r}
            y1={P.t + ih * f}
            y2={P.t + ih * f}
            className="stroke-line"
            strokeWidth="1"
          />
          <text
            x={P.l - 8}
            y={P.t + ih * f + 4}
            textAnchor="end"
            className="fill-slate-400 text-[11px] font-semibold"
          >
            {yFmt(max * (1 - f))}
          </text>
        </g>
      ))}
      <path
        d={`${line} L ${(P.l + iw).toFixed(1)} ${P.t + ih} L ${P.l} ${P.t + ih} Z`}
        className="fill-blue-500"
        fillOpacity={0.1}
      />
      <path
        d={line}
        fill="none"
        className="stroke-blue-500"
        strokeWidth="2.5"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      <circle cx={last[0]} cy={last[1]} r="4.5" className="fill-blue-500" stroke="#fff" strokeWidth="2" />
      {labels.map((w, i) => (
        <text
          key={w + i}
          x={P.l + iw * (labels.length > 1 ? i / (labels.length - 1) : 0)}
          y={H - 6}
          textAnchor="middle"
          className="fill-slate-400 text-[11px] font-semibold"
        >
          {w}
        </text>
      ))}
    </svg>
  );
}
