"use client";

/* The filters x sort x range analytics engine for /manager/analytics,
   following the admin AnalyticsExplorer surface but running the mobile
   app's real-data math: the views series buckets actual post_metrics
   snapshots through buildViewsSeries instead of a synthetic weekly wave.
   Clicking a top post swaps the card to the post detail with a back
   arrow, same as the mobile Graph mode. */
import { Images, Play } from "lucide-react";
import Link from "next/link";
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
  ANALYTICS_RANGES,
  buildViewsSeries,
  fmtViews,
  formatMoney,
  moneyOn,
  shortDayLabel,
  type AnalyticsRange,
  type ManagerAnalyticsPost,
  type MoneyGate,
} from "./derive";
import { ManagerPostDetail } from "./ManagerPostDetail";

const SORTS = ["Views over time", "Top creators", "Top posts", "Formats"] as const;
type SortMode = (typeof SORTS)[number];

const ALL_FORMATS = "All formats";
const ALL_CREATORS = "All creators";
const FORMAT_LABELS = ["Video", "Carousel"] as const;

interface CreatorRank {
  id: string;
  name: string;
  views: number;
}

function CreatorRankRow({
  rank,
  id,
  name,
  views,
  max,
}: {
  rank: number;
  id: string;
  name: string;
  views: number;
  max: number;
}) {
  return (
    <Link
      href={`/manager/creators/${id}`}
      className="flex items-center gap-[13px] py-2.5 rounded-[11px] transition-colors duration-[160ms] ease-om hover:bg-fill-quiet"
    >
      <span
        className={`w-[30px] text-[14px] font-extrabold ${
          rank === 1 ? "text-blue-700" : "text-slate-400"
        }`}
      >
        #{rank}
      </span>
      <Avatar name={name} size={30} />
      <span className="w-[110px] truncate whitespace-nowrap text-[13.5px] font-bold text-ink">
        {name}
      </span>
      <span className="h-2.5 flex-1 overflow-hidden bg-fill-quiet rounded-pill">
        <span
          className="block h-full bg-blue-500 rounded-pill"
          style={{ width: `${Math.round((100 * views) / max)}%` }}
        />
      </span>
      <span className="w-[78px] whitespace-nowrap text-right text-[13px] font-bold text-ink">
        {fmtViews(views)} views
      </span>
    </Link>
  );
}

export function ManagerExplorer({
  posts,
  gate,
  showFinancials,
}: {
  posts: ManagerAnalyticsPost[];
  gate: MoneyGate;
  showFinancials: boolean;
}) {
  const [range, setRange] = useState<AnalyticsRange>("Last 7 days");
  const [sortBy, setSortBy] = useState<SortMode>("Views over time");
  const [formatF, setFormatF] = useState<string>(ALL_FORMATS);
  const [creatorF, setCreatorF] = useState<string>(ALL_CREATORS);
  const [post, setPost] = useState<ManagerAnalyticsPost | null>(null);

  const creators: CreatorRank[] = (() => {
    const map = new Map<string, CreatorRank>();
    for (const p of posts) {
      if (p.creatorId === null) continue;
      const entry =
        map.get(p.creatorId) ?? { id: p.creatorId, name: p.creatorName, views: 0 };
      entry.views += p.views;
      map.set(p.creatorId, entry);
    }
    return [...map.values()].sort((a, b) => b.views - a.views);
  })();

  const byFormat = (p: ManagerAnalyticsPost) =>
    formatF === ALL_FORMATS || p.format === formatF;
  const byCreator = (p: ManagerAnalyticsPost) =>
    creatorF === ALL_CREATORS || p.creatorName === creatorF;
  const filtered = posts.filter((p) => byFormat(p) && byCreator(p));

  const selectedCreator = creators.find((c) => c.name === creatorF);
  const ranked = (selectedCreator ? [selectedCreator] : creators)
    .map((c) => ({
      ...c,
      views: posts
        .filter((p) => p.creatorId === c.id && byFormat(p))
        .reduce((n, p) => n + p.views, 0),
    }))
    .sort((a, b) => b.views - a.views);
  const maxCr = Math.max(...ranked.map((c) => c.views), 1);

  const topPosts = [...filtered].sort((a, b) => b.views - a.views);

  const fmtEntries = FORMAT_LABELS.filter(
    (k) => formatF === ALL_FORMATS || k === formatF,
  ).map((k) => ({
    label: k,
    count: posts.filter((p) => p.format === k && byCreator(p)).length,
  }));
  const maxFmt = Math.max(...fmtEntries.map((f) => f.count), 1);

  const fmtSuffix = formatF !== ALL_FORMATS ? " · " + formatF : "";
  const crSuffix = selectedCreator ? " · " + selectedCreator.name.split(" ")[0] : "";

  const chart = buildViewsSeries(filtered, range);

  if (post !== null) {
    return (
      <Card pad={22} key={post.id} className="animate-om-rise">
        <ManagerPostDetail
          post={post}
          gate={gate}
          showFinancials={showFinancials}
          onBack={() => setPost(null)}
        />
      </Card>
    );
  }

  return (
    <Card pad={22}>
      <div className="mb-5 flex flex-wrap items-center gap-2">
        <Label className="flex-1">Explore</Label>
        <FiltersDropdown
          formatF={formatF}
          creatorF={creatorF}
          creatorNames={creators.map((c) => c.name)}
          onFormat={setFormatF}
          onCreator={setCreatorF}
        />
        <SortDropdown prefix="Sort by" options={SORTS} value={sortBy} onSelect={setSortBy} />
        <SortDropdown prefix="" options={ANALYTICS_RANGES} value={range} onSelect={setRange} />
      </div>
      <div key={sortBy + range + formatF + creatorF} className="animate-om-rise">
        {sortBy === "Views over time" ? (
          <div>
            <Label className="mb-3 block">
              Views · {range.toLowerCase()}
              {fmtSuffix}
              {crSuffix}
            </Label>
            <AreaChart
              series={chart.points}
              labels={chart.labels}
              vb={240}
              yFmt={fmtViews}
            />
          </div>
        ) : null}
        {sortBy === "Top creators" ? (
          <div>
            <Label className="mb-2.5 block">Top creators{fmtSuffix}</Label>
            {ranked.length === 0 ? (
              <p className="m-0 text-[14px] font-semibold text-slate-400">
                No creators with views yet.
              </p>
            ) : (
              ranked.map((c, i) => (
                <CreatorRankRow
                  key={c.id}
                  rank={i + 1}
                  id={c.id}
                  name={c.name}
                  views={c.views}
                  max={maxCr}
                />
              ))
            )}
          </div>
        ) : null}
        {sortBy === "Top posts" ? (
          <div>
            <Label className="mb-3.5 block">
              Top posts{fmtSuffix}
              {crSuffix}
            </Label>
            {topPosts.length === 0 ? (
              <p className="m-0 text-[14px] font-semibold text-slate-400">
                No posts match these filters.
              </p>
            ) : (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {topPosts.map((q) => {
                  const Icon = q.format === "Video" ? Play : Images;
                  const money = showFinancials && moneyOn(gate, q.day);
                  return (
                    <div
                      key={q.id}
                      role="button"
                      onClick={() => setPost(q)}
                      className="flex cursor-pointer items-center gap-[13px] rounded-[14px] border border-line p-3.5 transition-colors duration-[160ms] ease-om hover:bg-fill-quiet"
                    >
                      <span className="inline-flex h-14 w-[42px] shrink-0 items-center justify-center bg-blue-100 rounded-[10px]">
                        <Icon size={15} className="text-blue-700" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[14px] font-bold text-ink">
                          {q.title}
                        </span>
                        <span className="mt-0.5 block text-[12.5px] font-semibold text-slate-400">
                          {q.creatorFirst} · {q.format} · {shortDayLabel(q.day)}
                        </span>
                      </span>
                      <span className="text-right">
                        <span className="block text-[14px] font-bold text-ink">
                          {fmtViews(q.views)}
                        </span>
                        {money ? (
                          <span className="block text-[11.5px] font-bold text-green">
                            {formatMoney(q.earnedCents)}
                          </span>
                        ) : null}
                      </span>
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
                <BarRow key={e.label} label={e.label} value={e.count} max={maxFmt} />
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </Card>
  );
}

