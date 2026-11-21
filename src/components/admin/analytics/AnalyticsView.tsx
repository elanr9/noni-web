"use client";

/* The Analytics tab. One screen, no scrolling:
   - the six numbers a founder steers by for the chosen period, each
     against the period before it;
   - Trend: views against sign-ups (or the rate, or revenue) by day, week
     or month, beside what is and is not working;
   - Posts, Creators, Formats: ranked tables with a verdict per post;
   - Calendar: the month view with a card per day. */
import { ArrowRight, Sparkles, TrendingDown, TrendingUp } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import { Card, FiltersDropdown, PageHead, SortDropdown, Tabs } from "@/components/kit";
import {
  ANALYTICS_TABS,
  bucketize,
  defaultGrain,
  fmtCount,
  fmtMoney,
  fmtRate,
  fmtSignups,
  GRAINS,
  groupRows,
  highlights,
  onePer,
  pctChange,
  per1k,
  RANGES,
  rankPosts,
  ratio,
  totalsOf,
  windowFor,
  type AnalyticsTab,
  type Grain,
  type Highlight,
  type InsightsData,
  type Range,
} from "@/lib/admin/insights";
import type { AdminPost, DayActivityMap, PostFormat } from "@/lib/admin/types";

import { DailyActivity } from "./DailyActivity";
import { GroupTable, PostsTable } from "./InsightTables";
import { COMPARE, TrendChart, type Compare } from "./TrendChart";

const TABS = ANALYTICS_TABS;
type Tab = AnalyticsTab;

const ALL_FORMATS = "All formats";
const ALL_CREATORS = "All creators";

interface Kpi {
  label: string;
  value: string;
  /** Whole-percent change against the period before, when there is one. */
  change: number | null;
  /** True when a lower number is the better one (cost). */
  lowerIsBetter?: boolean;
  sub?: string;
}

function KpiTile({ kpi, versus }: { kpi: Kpi; versus: string }) {
  const good = kpi.change !== null && (kpi.lowerIsBetter ? kpi.change <= 0 : kpi.change >= 0);
  const Arrow = kpi.change !== null && kpi.change < 0 ? TrendingDown : TrendingUp;
  return (
    <span className="min-w-0 flex-1">
      <span className="block truncate text-[12px] font-semibold text-slate-400">{kpi.label}</span>
      <span className="mt-1 block text-[24px] font-bold tracking-[-0.6px] text-ink">{kpi.value}</span>
      <span className="mt-0.5 flex h-[18px] items-center gap-1 text-[12px] font-semibold text-slate-400">
        {kpi.change !== null ? (
          <>
            <span className={`inline-flex items-center gap-1 font-bold ${good ? "text-green" : "text-danger"}`}>
              <Arrow size={12} />
              {kpi.change >= 0 ? "+" : ""}
              {kpi.change}%
            </span>
            <span className="truncate">vs {versus}</span>
          </>
        ) : null}
      </span>
      <span className="block h-[18px] truncate text-[12px] font-semibold text-slate-400">
        {kpi.sub ?? ""}
      </span>
    </span>
  );
}

const TONE_ICON: Record<Highlight["tone"], { icon: LucideIcon; className: string }> = {
  good: { icon: TrendingUp, className: "bg-green-soft text-green" },
  bad: { icon: TrendingDown, className: "bg-amber-soft text-amber" },
  info: { icon: Sparkles, className: "bg-blue-100 text-blue-700" },
};

function Segmented<T extends string>({
  options,
  value,
  onSelect,
}: {
  options: readonly T[];
  value: T;
  onSelect: (option: T) => void;
}) {
  return (
    <div className="flex gap-1 bg-fill-quiet p-[3px] rounded-pill">
      {options.map((o) => (
        <button
          key={o}
          type="button"
          onClick={() => onSelect(o)}
          className={`cursor-pointer whitespace-nowrap border-none px-3 py-[6px] text-[12.5px] font-bold transition-colors duration-[160ms] ease-om rounded-pill ${
            value === o ? "bg-white text-ink shadow-card" : "bg-transparent text-slate-400"
          }`}
        >
          {o}
        </button>
      ))}
    </div>
  );
}

export function AnalyticsView({
  insights,
  posts,
  dayActivity,
  initialTab = "Trend",
  initialRange = "Last 30 days",
}: {
  /** Where the page opens; the dev preview uses these. */
  initialTab?: Tab;
  initialRange?: Range;
  insights: InsightsData;
  /** The calendar tab's month of posts and day totals. */
  posts: AdminPost[];
  dayActivity: DayActivityMap;
}) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>(initialTab);
  const [range, setRange] = useState<Range>(initialRange);
  const [grain, setGrain] = useState<Grain>(defaultGrain(initialRange));
  const [compare, setCompare] = useState<Compare>("Sign-ups");
  const [formatF, setFormatF] = useState(ALL_FORMATS);
  const [creatorF, setCreatorF] = useState(ALL_CREATORS);

  const { signupsOn, salesOn } = insights;

  const view = useMemo(() => {
    const win = windowFor(insights.days, range);
    const cur = totalsOf(win.current);
    const prev = win.previous.length > 0 ? totalsOf(win.previous) : null;
    const from = win.current[0]?.day ?? insights.today;
    return { win, cur, prev, from, rows: rankPosts(insights.posts, from, insights.today) };
  }, [insights, range]);
  const { win, cur, prev, from } = view;

  const windowDays = win.current;
  const buckets = useMemo(() => bucketize(windowDays, grain), [windowDays, grain]);

  const creators = useMemo(() => {
    const seen = new Map<string, string>();
    for (const p of insights.posts) if (p.creatorId) seen.set(p.creator, p.creatorId);
    return seen;
  }, [insights.posts]);

  const filtered = useMemo(
    () =>
      formatF === ALL_FORMATS && creatorF === ALL_CREATORS
        ? view.rows
        : rankPosts(insights.posts, from, insights.today, {
            format: formatF === ALL_FORMATS ? null : (formatF as PostFormat),
            creatorId: creatorF === ALL_CREATORS ? null : (creators.get(creatorF) ?? null),
          }),
    [view.rows, insights, from, formatF, creatorF, creators],
  );

  const notes = useMemo(() => highlights(view.rows, signupsOn), [view.rows, signupsOn]);

  const change = (pick: (t: typeof cur) => number | null) =>
    prev ? pctChange(pick(cur), pick(prev)) : null;
  const dash = "–";
  const kpis: Kpi[] = [
    { label: "Views", value: fmtCount(cur.views), change: change((t) => t.views) },
    {
      label: "Sign-ups",
      value: signupsOn ? fmtSignups(cur.signups) : dash,
      change: signupsOn ? change((t) => t.signups) : null,
      sub: signupsOn && cur.codedSignups > 0 ? `${fmtSignups(cur.codedSignups)} on a code` : undefined,
    },
    {
      label: "Sign-ups per 1k views",
      value: signupsOn ? fmtRate(per1k(cur.signups, cur.views)) : dash,
      change: signupsOn ? change((t) => per1k(t.signups, t.views)) : null,
      sub: signupsOn ? onePer(cur.views, cur.signups) : undefined,
    },
    {
      label: "Revenue",
      value: salesOn ? fmtMoney(cur.salesCents) : dash,
      change: salesOn ? change((t) => t.salesCents) : null,
      sub: salesOn && cur.sales > 0 ? `${cur.sales} ${cur.sales === 1 ? "sale" : "sales"}` : undefined,
    },
    {
      label: "Revenue per 1k views",
      value: salesOn ? fmtMoney(per1k(cur.salesCents, cur.views)) : dash,
      change: salesOn ? change((t) => per1k(t.salesCents, t.views)) : null,
    },
    {
      label: "Cost per sign-up",
      value: signupsOn ? fmtMoney(ratio(cur.spendCents, cur.signups)) : dash,
      change: signupsOn ? change((t) => ratio(t.spendCents, t.signups)) : null,
      lowerIsBetter: true,
      sub: cur.spendCents > 0 ? `${fmtMoney(cur.spendCents)} to creators` : undefined,
    },
  ];

  const hasData = insights.posts.length > 0;
  const compareOptions = salesOn ? COMPARE : COMPARE.slice(0, 2);
  const showFilters = tab === "Posts" || tab === "Creators" || tab === "Formats";

  return (
    <div>
      <PageHead
        title="Analytics"
        right={
          <>
            {showFilters ? (
              <FiltersDropdown
                formatF={formatF}
                creatorF={creatorF}
                creatorNames={[...creators.keys()].sort()}
                onFormat={setFormatF}
                onCreator={setCreatorF}
              />
            ) : null}
            {tab === "Calendar" ? null : (
              <SortDropdown
                prefix=""
                options={RANGES}
                value={range}
                onSelect={(r) => {
                  setRange(r);
                  setGrain(defaultGrain(r));
                }}
              />
            )}
          </>
        }
      />

      <div data-tour="analytics-stats">
        <Card pad={20} className="mb-3.5 flex gap-4">
          {kpis.map((k) => (
            <KpiTile key={k.label} kpi={k} versus={win.versus} />
          ))}
        </Card>
      </div>

      <Tabs
        tabs={TABS}
        active={tab}
        onSelect={setTab}
        className="!mb-3 min-h-[38px]"
        right={
          tab === "Trend" && hasData ? (
            <Segmented options={GRAINS} value={grain} onSelect={setGrain} />
          ) : null
        }
      />

      <div data-tour="analytics-explorer">
        {tab === "Calendar" ? (
          <DailyActivity dayActivity={dayActivity} posts={posts} />
        ) : (
          <Card pad={22} key={tab + range} className="animate-om-rise">
            {!hasData ? (
              <div className="py-14 text-center">
                <p className="m-0 text-[16px] font-bold text-ink">No posts yet</p>
              </div>
            ) : tab === "Trend" ? (
              <div className="flex gap-7">
                <div className="min-w-0 flex-1">
                  {signupsOn ? (
                    <div className="mb-3 flex items-center gap-2.5">
                      <Segmented
                        options={compareOptions}
                        value={compareOptions.includes(compare) ? compare : "Sign-ups"}
                        onSelect={setCompare}
                      />
                    </div>
                  ) : null}
                  <TrendChart
                    buckets={buckets}
                    compare={compareOptions.includes(compare) ? compare : "Sign-ups"}
                    showCompare={signupsOn}
                    showRevenue={salesOn}
                  />
                  {signupsOn ? null : (
                    <Link
                      href="/admin/billing"
                      className="mt-3 flex items-center gap-2 border border-line px-4 py-3 text-[13px] font-bold text-ink no-underline rounded-[14px] hover:bg-fill-quiet"
                    >
                      <span className="flex-1">
                        Connect sales data
                      </span>
                      <span className="inline-flex items-center gap-1 text-blue-700">
                        Billing <ArrowRight size={13} />
                      </span>
                    </Link>
                  )}
                </div>
                <div className="w-[292px] shrink-0">
                  <span className="mb-3 block text-[12.5px] font-bold text-ink">What works</span>
                  {notes.length === 0 ? (
                    <p className="m-0 text-[13px] font-semibold leading-normal text-slate-400">
                      Nothing stands out in this period yet.
                    </p>
                  ) : (
                    <div className="flex flex-col gap-3.5">
                      {notes.map((note) => {
                        const { icon: Icon, className } = TONE_ICON[note.tone];
                        return (
                          <div key={note.title} className="flex gap-3">
                            <span
                              className={`inline-flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-[9px] ${className}`}
                            >
                              <Icon size={14} />
                            </span>
                            <span className="min-w-0 flex-1">
                              <span className="block text-[13px] font-bold text-ink">{note.title}</span>
                              <span className="mt-0.5 block text-[12.5px] font-semibold leading-[1.45] text-slate-500">
                                {note.body}
                              </span>
                            </span>
                          </div>
                        );
                      })}
                      <button
                        type="button"
                        onClick={() => setTab("Posts")}
                        className="inline-flex cursor-pointer items-center gap-1 self-start border-none bg-transparent p-0 text-[12.5px] font-bold text-blue-700"
                      >
                        See every post <ArrowRight size={12} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : tab === "Posts" ? (
              <PostsTable
                key={formatF + creatorF}
                rows={filtered}
                showSignups={signupsOn}
                showRevenue={salesOn}
              />
            ) : (
              <GroupTable
                key={tab + formatF + creatorF}
                rows={groupRows(filtered, tab === "Creators" ? "creator" : "format")}
                noun={tab === "Creators" ? "Creator" : "Format"}
                showSignups={signupsOn}
                showRevenue={salesOn}
                onOpen={
                  tab === "Creators"
                    ? (g) => {
                        if (creators.get(g.label) === g.key) router.push(`/admin/team/${g.key}`);
                      }
                    : undefined
                }
              />
            )}
          </Card>
        )}
      </div>
    </div>
  );
}
