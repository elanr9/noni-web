"use client";

/* The filters × sort × range analytics engine (the Graph branch of
   AnalyticsPage in AdminAnalytics.jsx). One card: Filters (Format +
   Creator, composable, count badge), Sort by, time range; every
   combination re-derives the view through @/lib/admin/analytics. Top
   creators rank #1/#2/#3 and click through to /admin/team/{memberId}. */
import { ArrowRight, Images, Play } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import {
  AreaChart,
  Avatar,
  BarRow,
  Card,
  FiltersDropdown,
  Label,
  SortDropdown,
} from "@/components/kit";
import {
  ALL_CREATORS,
  ALL_FORMATS,
  barMax,
  creatorShare,
  creatorsWithViews,
  filterPosts,
  fmtViews,
  formatBreakdown,
  formatCounts,
  formatShare,
  RANGES,
  rangeData,
  scaleSeries,
  SORTS,
  topCreators,
  type CreatorBar,
  type Range,
  type SortMode,
} from "@/lib/admin/analytics";
import type { AdminPost, Member } from "@/lib/admin/types";

function CreatorRankRow({
  rank,
  bar,
  max,
  onOpen,
}: {
  rank: number;
  bar: CreatorBar;
  max: number;
  onOpen: () => void;
}) {
  return (
    <div
      role="button"
      onClick={onOpen}
      className="group -mx-3 flex cursor-pointer items-center gap-[13px] rounded-[12px] px-3 py-2.5 transition-colors duration-[160ms] ease-om hover:bg-fill-quiet"
    >
      <span
        className={`w-[30px] text-[14px] font-extrabold ${
          rank === 1 ? "text-blue-700" : "text-slate-400"
        }`}
      >
        #{rank}
      </span>
      <Avatar name={bar.member.name} size={30} />
      <span className="w-[110px] whitespace-nowrap text-[13.5px] font-bold text-ink">
        {bar.member.name}
      </span>
      <span className="h-2.5 flex-1 overflow-hidden bg-fill-quiet rounded-pill">
        <span
          className="block h-full bg-blue-500 rounded-pill"
          style={{ width: `${Math.round((100 * bar.views) / max)}%` }}
        />
      </span>
      <span className="w-[78px] whitespace-nowrap text-right text-[13px] font-bold text-ink">
        {fmtViews(bar.views)} views
      </span>
      <span className="w-[96px] text-right">
        <span className="hidden items-center justify-end gap-[5px] whitespace-nowrap text-[12px] font-bold text-blue-700 animate-om-fade group-hover:inline-flex">
          View profile <ArrowRight size={12} />
        </span>
      </span>
    </div>
  );
}

export function AnalyticsExplorer({
  posts,
  creators,
  weeklyViews,
}: {
  posts: AdminPost[];
  creators: Member[];
  weeklyViews: number[];
}) {
  const router = useRouter();
  const [range, setRange] = useState<Range>("Last 7 days");
  const [sortBy, setSortBy] = useState<SortMode>("Views over time");
  const [formatF, setFormatF] = useState(ALL_FORMATS);
  const [creatorF, setCreatorF] = useState(ALL_CREATORS);

  const ranked = creatorsWithViews(creators);
  const formats = formatCounts(posts);
  const fmtShare = formatShare(formats, formatF);
  const { share: crShare } = creatorShare(ranked, creatorF);
  const chart = rangeData(range, scaleSeries(weeklyViews, fmtShare * crShare));
  const bars = topCreators(ranked, creatorF, fmtShare);
  const maxCr = barMax(bars.map((b) => b.views));
  const shownPosts = filterPosts(posts, { format: formatF, creator: creatorF });
  const fmtEntries = formatBreakdown(formats, formatF, crShare);
  const maxFmt = barMax(fmtEntries.map((e) => e.value));

  const fmtSuffix = formatF !== ALL_FORMATS ? " · " + formatF : "";
  const crSuffix = creatorF !== ALL_CREATORS ? " · " + creatorF : "";

  return (
    <Card pad={22}>
      <div className="mb-5 flex flex-wrap items-center gap-2">
        <Label className="flex-1">Explore</Label>
        <FiltersDropdown
          formatF={formatF}
          creatorF={creatorF}
          creatorNames={ranked.map((p) => p.name)}
          onFormat={setFormatF}
          onCreator={setCreatorF}
        />
        <SortDropdown prefix="Sort by" options={SORTS} value={sortBy} onSelect={setSortBy} />
        <SortDropdown prefix="" options={RANGES} value={range} onSelect={setRange} />
      </div>
      <div key={sortBy + range + formatF + creatorF} className="animate-om-rise">
        {sortBy === "Views over time" ? (
          <div>
            <Label className="mb-3 block">
              Views · {range.toLowerCase()}
              {fmtSuffix}
              {crSuffix}
            </Label>
            <AreaChart series={chart.data} labels={chart.labels} vb={300} />
          </div>
        ) : null}
        {sortBy === "Top creators" ? (
          <div>
            <Label className="mb-2.5 block">Top creators{fmtSuffix}</Label>
            {bars.map((bar, i) => (
              <CreatorRankRow
                key={bar.member.id}
                rank={i + 1}
                bar={bar}
                max={maxCr}
                onOpen={() => router.push(`/admin/team/${bar.member.id}`)}
              />
            ))}
          </div>
        ) : null}
        {sortBy === "Top posts" ? (
          <div>
            <Label className="mb-3.5 block">
              Top posts{fmtSuffix}
              {crSuffix}
            </Label>
            {shownPosts.length === 0 ? (
              <p className="m-0 text-[14px] font-semibold text-slate-400">
                No posts match these filters.
              </p>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {shownPosts.map((q) => {
                  const Icon = q.format === "Video" ? Play : Images;
                  return (
                    <div
                      key={q.id}
                      className="flex items-center gap-[13px] rounded-[14px] border border-line p-3.5"
                    >
                      <span className="inline-flex h-14 w-[42px] shrink-0 items-center justify-center bg-blue-100 rounded-[10px]">
                        <Icon size={15} className="text-blue-700" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[14px] font-bold text-ink">
                          {q.title}
                        </span>
                        <span className="mt-0.5 block text-[12.5px] font-semibold text-slate-400">
                          {q.creator} · {q.format} · {q.publishedAt}
                        </span>
                      </span>
                      <span className="text-[14px] font-bold text-ink">{fmtViews(q.viewsN)}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ) : null}
        {sortBy === "Formats" ? (
          <div>
            <Label className="mb-4 block">Posts by format{crSuffix}</Label>
            <div className="flex max-w-[720px] flex-col gap-[15px]">
              {fmtEntries.map((e) => (
                <BarRow key={e.format} label={e.format} value={e.value} max={maxFmt} />
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </Card>
  );
}
