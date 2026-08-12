"use client";

/* The scope × filters × sort × range analytics engine (OpsOverview graph
   block + CompanyExplorer in the prototype). One component for both
   surfaces: Overview renders it platform-wide with the scope dropdown,
   the company Analytics tab renders it scoped inside its own card. */
import { Images, Play } from "lucide-react";
import { useState } from "react";

import {
  AreaChart,
  BarRow,
  Card,
  FiltersDropdown,
  HoverPeek,
  Label,
  SortDropdown,
} from "@/components/kit";
import {
  ALL_CREATORS,
  ALL_FORMATS,
  barMax,
  creatorShare,
  creatorsInScope,
  filterPosts,
  formatBreakdown,
  formatShare,
  formatsInScope,
  RANGES,
  rangeData,
  scaleSeries,
  seriesInScope,
  SORTS,
  topCreators,
  type Range,
  type SortMode,
} from "@/lib/ops/analytics";
import { fmtK } from "@/lib/ops/mock-data";
import type { Company, Person, Post } from "@/lib/ops/types";

export type AnalyticsExplorerProps = {
  /** Company id to scope to, or null for platform-wide. */
  scope?: string | null;
  /** Show the company scope dropdown (Overview: true, company tab: false). */
  showScopeDropdown?: boolean;
  posts: Post[];
  people: Person[];
  companies: Company[];
  onOpenProfile?: (person: Person) => void;
  onOpenPost?: (post: Post) => void;
  /** Makes scope controlled: the dropdown reports picks here and renders
      the scope prop as its value. */
  onScopeChange?: (scope: string | null) => void;
  /** Makes the time range controlled (Overview mirrors it in the title). */
  range?: Range;
  onRangeChange?: (range: Range) => void;
  /** Initial range when uncontrolled, default "Last 12 weeks" (company tab). */
  defaultRange?: Range;
};

const ALL_COMPANIES = "All companies";

function PostThumb({ post, size }: { post: Post; size: "md" | "sm" }) {
  const Icon = post.format === "Video" ? Play : Images;
  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center bg-blue-100 ${
        size === "md" ? "h-14 w-[42px] rounded-[10px]" : "h-11 w-[34px] rounded-[9px]"
      }`}
    >
      <Icon size={size === "md" ? 15 : 13} className="text-blue-700" />
    </span>
  );
}

export function AnalyticsExplorer({
  scope: scopeProp = null,
  showScopeDropdown = false,
  posts,
  people,
  companies,
  onOpenProfile,
  onOpenPost,
  onScopeChange,
  range: rangeProp,
  onRangeChange,
  defaultRange = "Last 12 weeks",
}: AnalyticsExplorerProps) {
  const [scopeState, setScopeState] = useState<string | null>(scopeProp);
  const [rangeState, setRangeState] = useState<Range>(defaultRange);
  const [sortBy, setSortBy] = useState<SortMode>("Views over time");
  const [formatF, setFormatF] = useState(ALL_FORMATS);
  const [creatorF, setCreatorF] = useState(ALL_CREATORS);

  const scope = showScopeDropdown && !onScopeChange ? scopeState : scopeProp;
  const range = rangeProp ?? rangeState;
  const setRange = (r: Range) => {
    setRangeState(r);
    onRangeChange?.(r);
  };
  const pickScope = (id: string | null) => {
    setScopeState(id);
    setCreatorF(ALL_CREATORS);
    onScopeChange?.(id);
  };

  const active = companies.filter((c) => c.status === "Active");
  const companyName = (id: string) =>
    companies.find((c) => c.id === id)?.name ?? "";
  const scopeLabel = scope ? companyName(scope) : ALL_COMPANIES;
  const scopeCreators = creatorsInScope(people, scope);
  const formats = formatsInScope(companies, scope);
  const fmtShare = formatShare(formats, formatF);
  const { share: crShare } = creatorShare(scopeCreators, creatorF);
  const chart = rangeData(range, scaleSeries(seriesInScope(companies, scope), fmtShare * crShare));
  const barCreators = topCreators(scopeCreators, creatorF, fmtShare);
  const maxCr = barMax(barCreators.map((b) => b.value));
  const shownPosts = filterPosts(posts, { scope, format: formatF, creator: creatorF });
  const fmtEntries = formatBreakdown(formats, formatF, crShare);
  const maxFmt = barMax(fmtEntries.map((e) => e.value));

  const fmtSuffix = formatF !== ALL_FORMATS ? " · " + formatF : "";
  const crSuffix = creatorF !== ALL_CREATORS ? " · " + creatorF : "";

  const controls = (
    <div
      className={`flex flex-wrap items-center gap-2 ${showScopeDropdown ? "mb-[22px]" : "mb-[18px]"}`}
    >
      {showScopeDropdown ? (
        <>
          <SortDropdown
            prefix=""
            align="left"
            options={[ALL_COMPANIES, ...active.map((c) => c.name)]}
            value={scopeLabel}
            onSelect={(label) =>
              pickScope(label === ALL_COMPANIES ? null : (active.find((c) => c.name === label)?.id ?? null))
            }
          />
          <span className="flex-1" />
        </>
      ) : null}
      <FiltersDropdown
        formatF={formatF}
        creatorF={creatorF}
        creatorNames={scopeCreators.map((p) => p.name)}
        onFormat={setFormatF}
        onCreator={setCreatorF}
      />
      <SortDropdown prefix="Sort by" options={SORTS} value={sortBy} onSelect={setSortBy} />
      {showScopeDropdown ? null : <span className="flex-1" />}
      <SortDropdown prefix="" options={RANGES} value={range} onSelect={setRange} />
    </div>
  );

  const graph = (
    <div key={sortBy + (scope ?? "all") + range + formatF + creatorF} className="animate-om-rise">
      {sortBy === "Views over time" ? (
        <div>
          <div className="mb-3 flex items-center gap-2.5">
            <Label className="flex-1">Views</Label>
            {showScopeDropdown ? null : (
              <span className="text-[12.5px] font-semibold text-slate-400">
                {formatF !== ALL_FORMATS ? formatF + " · " : ""}
                {creatorF !== ALL_CREATORS
                  ? creatorF
                  : formatF === ALL_FORMATS
                    ? scopeLabel
                    : ""}
              </span>
            )}
          </div>
          <AreaChart series={chart.data} labels={chart.labels} vb={showScopeDropdown ? 300 : 250} />
        </div>
      ) : null}
      {sortBy === "Top creators" ? (
        <div>
          <Label className={`block ${showScopeDropdown ? "mb-[18px]" : "mb-3.5"}`}>
            Top creators{showScopeDropdown ? " · " + scopeLabel : ""}
            {fmtSuffix}
          </Label>
          <div className={`flex flex-col ${showScopeDropdown ? "max-w-[720px]" : ""}`}>
            {barCreators.map(({ person, value }) => (
              <HoverPeek key={person.id} onClick={() => onOpenProfile?.(person)}>
                <div className="-mx-1.5 rounded-[10px] px-1.5 py-[7px] transition-colors duration-[160ms] ease-om hover:bg-fill-quiet">
                  <BarRow label={person.name.split(" ")[0]} value={value} max={maxCr} suffix="k" />
                </div>
              </HoverPeek>
            ))}
          </div>
        </div>
      ) : null}
      {sortBy === "Top posts" ? (
        <div>
          <Label className={`block ${showScopeDropdown ? "mb-4" : "mb-3.5"}`}>
            Top posts{showScopeDropdown ? " · " + scopeLabel : ""}
            {fmtSuffix}
            {crSuffix}
          </Label>
          {shownPosts.length === 0 ? (
            <p className="m-0 text-[14px] font-semibold text-slate-400">
              No posts match these filters.
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {shownPosts.map((q) => (
                <HoverPeek key={q.id} label="View post" onClick={() => onOpenPost?.(q)}>
                  {showScopeDropdown ? (
                    <Card pad={14} className="flex items-center gap-[13px]">
                      <PostThumb post={q} size="md" />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[14px] font-bold text-ink">
                          {q.title}
                        </span>
                        <span className="mt-0.5 block text-[12.5px] font-semibold text-slate-400">
                          {q.creator} · {q.format} · {companyName(q.company)}
                        </span>
                      </span>
                      <span className="text-[14px] font-bold text-ink">{fmtK(q.viewsN)}</span>
                    </Card>
                  ) : (
                    <div className="flex items-center gap-[13px] rounded-[14px] border border-line px-3.5 py-3">
                      <PostThumb post={q} size="md" />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[14px] font-bold text-ink">
                          {q.title}
                        </span>
                        <span className="mt-0.5 block text-[12.5px] font-semibold text-slate-400">
                          {q.creator} · {q.format}
                        </span>
                      </span>
                      <span className="text-[14px] font-bold text-ink">{fmtK(q.viewsN)}</span>
                    </div>
                  )}
                </HoverPeek>
              ))}
            </div>
          )}
        </div>
      ) : null}
      {sortBy === "Formats" ? (
        <div>
          <Label className={`block ${showScopeDropdown ? "mb-[18px]" : "mb-3.5"}`}>
            Posts by format{showScopeDropdown ? " · " + scopeLabel : ""}
            {crSuffix}
          </Label>
          <div
            className={`flex flex-col ${
              showScopeDropdown ? "max-w-[720px] gap-[15px]" : "max-w-[640px] gap-[13px]"
            }`}
          >
            {fmtEntries.map((e) => (
              <BarRow key={e.format} label={e.format} value={e.value} max={maxFmt} />
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );

  if (showScopeDropdown)
    return (
      <div>
        {controls}
        {graph}
      </div>
    );
  return (
    <Card pad={22}>
      {controls}
      {graph}
    </Card>
  );
}
