"use client";

import {
  Check,
  ChevronLeft,
  ChevronRight,
  Link2,
  Mail,
  MessageCircle,
  Play,
  Plus,
  Search,
  SlidersHorizontal,
  Undo2,
  X,
} from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from "react";

import { refreshScout, startScout, updateScoutCreator, writeScoutMessage } from "@/app/admin/scout/actions";
import { Burst } from "@/components/admin/brain/BrainConfirm";
import { Card, Chip, Modal, PageHead, Pill, SortDropdown } from "@/components/kit";
import {
  ACTIVE_RUN,
  NO_FILTERS,
  SCOUT_SORTS,
  SIZE_BANDS,
  compact,
  filterCount,
  joinUrl,
  matchesText,
  searchText,
  lastPosted,
  passes,
  perWeek,
  profileUrl,
  rankOf,
  sortScout,
  type ScoutCreator,
  type ScoutData,
  type ScoutFilters,
  searchFromFilters,
  type ScoutPlatform,
  type ScoutSort,
  type ScoutStatus,
} from "@/lib/scout";

/* Scout: creators Noni found for this company. One screen, no scroll:
   a run's progress on top, then the board paged eight at a time, sorted
   and filtered by what a company picks on: size, how often they post,
   engagement, who they are.
   Message copies Noni's drafted DM (with the creator's own join link) and
   opens their profile, so the company sends it from its own account. */

const TABS = [
  { key: "match", label: "Matches", has: ["match"] },
  { key: "contacted", label: "Contacted", has: ["contacted", "replied"] },
  { key: "applied", label: "Applied", has: ["applied"] },
  { key: "joined", label: "Joined", has: ["joined"] },
  { key: "skipped", label: "Skipped", has: ["skipped", "passed"] },
] as const satisfies ReadonlyArray<{ key: string; label: string; has: readonly ScoutStatus[] }>;
type TabKey = (typeof TABS)[number]["key"];

/* Two full rows on a laptop (4 or 3 across); a phone pages eight. */
function usePerPage(): number {
  const [n, setN] = useState(8);
  useEffect(() => {
    const lg = window.matchMedia("(min-width: 1024px)");
    const xl = window.matchMedia("(min-width: 1280px)");
    const set = () => setN(xl.matches ? 8 : lg.matches ? 6 : 8);
    set();
    lg.addEventListener("change", set);
    xl.addEventListener("change", set);
    return () => {
      lg.removeEventListener("change", set);
      xl.removeEventListener("change", set);
    };
  }, []);
  return n;
}

function PlatformMark({ platform, size = 13 }: { platform: ScoutPlatform; size?: number }) {
  return platform === "tiktok" ? (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-label="TikTok" className="shrink-0 fill-ink">
      <path d="M16.6 5.82A4.28 4.28 0 0 1 15.54 3h-3.09v12.4a2.59 2.59 0 1 1-2.59-2.59c.27 0 .53.04.77.12V9.77a5.7 5.7 0 0 0-.77-.05 5.68 5.68 0 1 0 5.68 5.68V9.01a7.35 7.35 0 0 0 4.3 1.38V7.3a4.3 4.3 0 0 1-3.24-1.48Z" />
    </svg>
  ) : (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-label="Instagram" className="shrink-0 fill-none stroke-ink" strokeWidth={2.2}>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.6" className="fill-ink" />
    </svg>
  );
}

function Face({ c, size }: { c: ScoutCreator; size: number }) {
  const [broken, setBroken] = useState(false);
  const letter = (c.name || c.handle).replace(/[^a-z0-9]/i, "").slice(0, 1).toUpperCase() || "?";
  return c.avatar_url && !broken ? (
    <Image
      src={c.avatar_url}
      alt=""
      width={size}
      height={size}
      onError={() => setBroken(true)}
      className="shrink-0 rounded-full bg-fill-quiet object-cover"
      style={{ width: size, height: size }}
    />
  ) : (
    <span
      className="flex shrink-0 items-center justify-center rounded-full bg-fill-quiet text-[13px] font-bold text-slate-500"
      style={{ width: size, height: size }}
    >
      {letter}
    </span>
  );
}

function Cover({ url, cover, views, className = "" }: { url: string; cover: string | null; views: number | null; className?: string }) {
  const [broken, setBroken] = useState(false);
  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      onClick={(e) => e.stopPropagation()}
      className={`group/cover relative block overflow-hidden rounded-[10px] bg-fill-quiet ${className}`}
    >
      {cover && !broken ? (
        <Image
          src={cover}
          alt=""
          fill
          sizes="(min-width: 1024px) 110px, 30vw"
          onError={() => setBroken(true)}
          className="object-cover transition-transform duration-300 group-hover/cover:scale-105"
        />
      ) : (
        <span className="flex h-full w-full items-center justify-center text-slate-300">
          <Play size={18} />
        </span>
      )}
      {views !== null ? (
        <span className="absolute bottom-1 left-1 inline-flex items-center gap-0.5 rounded-full bg-black/55 px-1.5 py-[1px] text-[10.5px] font-bold text-white">
          <Play size={8} className="fill-white" />
          {compact(views)}
        </span>
      ) : null}
    </a>
  );
}

function scoreTone(score: number | null): "green" | "blue" | "slate" {
  if (score === null) return "slate";
  return score >= 80 ? "green" : score >= 60 ? "blue" : "slate";
}

const KIND_LABEL = { ugc: "UGC", creator: "Creator", niche: "In the niche" } as const;
const GENDER_LABEL = { female: "Women", male: "Men" } as const;
const AGE_LABEL = { "18-24": "18 to 24", "25-34": "25 to 34", "35+": "35 and up" } as const;

/* Which number the current sort is ranking on, so the card can light it. */
const SORT_STAT: Record<ScoutSort, "followers" | "posts" | "engagement" | null> = {
  Best: null,
  Smallest: "followers",
  Biggest: "followers",
  "Most active": "posts",
  "Most engaged": "engagement",
};

function Stats({ c, lit, accent, wide = false }: { c: ScoutCreator; lit: "followers" | "posts" | "engagement" | null; accent: string; wide?: boolean }) {
  const cells: { key: string; value: string; label: string }[] = [
    { key: "followers", value: c.followers !== null ? compact(c.followers) : "", label: "Followers" },
    { key: "posts", value: perWeek(c.posts_per_week), label: wide ? "Posts a week" : "Posts/wk" },
    { key: "engagement", value: c.engagement_rate !== null ? `${c.engagement_rate}%` : "", label: wide ? "Engagement" : "Eng. rate" },
    ...(wide
      ? [
          { key: "last", value: lastPosted(c.last_post_at), label: "Last post" },
          { key: "views", value: c.median_views !== null ? compact(c.median_views) : "", label: "Median views" },
        ]
      : []),
  ];
  return (
    <div className={`grid gap-1.5 ${wide ? "grid-cols-3 sm:grid-cols-5" : "grid-cols-3"}`}>
      {cells.map((x) => (
        <span key={x.key} className="flex min-w-0 flex-col rounded-[10px] bg-fill-quiet px-2 py-1.5">
          <span
            className="truncate text-[14px] font-bold tabular-nums leading-[1.25] text-ink"
            style={lit === x.key && x.value ? { color: accent } : undefined}
          >
            {x.value || <span className="text-slate-300">·</span>}
          </span>
          <span className="truncate text-[10px] font-semibold leading-[1.3] text-slate-400">{x.label}</span>
        </span>
      ))}
    </div>
  );
}

function ago(iso: string | null): string {
  if (!iso) return "";
  const d = Math.floor((Date.now() - Date.parse(iso)) / 86_400_000);
  return d <= 0 ? "today" : d === 1 ? "yesterday" : `${d}d ago`;
}

function messageFor(c: ScoutCreator, link: string): string {
  return (c.dm ?? "").replace(/\{link\}/g, link).trim();
}

/* ------------------------------------------------------------------ card */

function CreatorCard({
  c,
  accent,
  link,
  lit,
  onOpen,
  onMove,
}: {
  c: ScoutCreator;
  accent: string;
  link: string;
  lit: "followers" | "posts" | "engagement" | null;
  onOpen: () => void;
  onMove: (status: ScoutStatus) => void;
}) {
  const [burst, setBurst] = useState(false);
  const covers = c.videos.slice(0, 3);
  const rank = rankOf(c);
  const posted = lastPosted(c.last_post_at);
  const under = [c.kind ? KIND_LABEL[c.kind] : null, posted ? (posted === "Today" ? "Posted today" : `Posted ${posted} ago`) : null]
    .filter(Boolean)
    .join(" · ");

  const message = () => {
    const text = messageFor(c, link);
    // No message yet: it is written when they are opened.
    if (!text) {
      onOpen();
      return;
    }
    if (text) void navigator.clipboard?.writeText(text).catch(() => undefined);
    window.open(profileUrl(c.platform, c.handle), "_blank", "noopener");
    setBurst(true);
    window.setTimeout(() => onMove("contacted"), 650);
  };

  return (
    <Card pad={0} lift onClick={onOpen} className="relative flex h-full min-h-0 cursor-pointer flex-col overflow-hidden">
      <div className="grid h-[150px] grid-cols-3 gap-1 p-1.5 pb-0 lg:h-auto lg:min-h-[72px] lg:flex-1">
        {covers.length
          ? covers.map((v) => <Cover key={v.url} url={v.url} cover={v.cover} views={v.views} className="h-full" />)
          : [0, 1, 2].map((i) => <span key={i} className="rounded-[10px] bg-fill-quiet" />)}
      </div>

      <div className="flex shrink-0 flex-col gap-2 px-3.5 pb-3 pt-2.5">
        <div className="flex items-center gap-2.5">
          <Face c={c} size={30} />
          <span className="min-w-0 flex-1">
            <span className="flex items-center gap-1.5 text-[14px] font-bold text-ink">
              <PlatformMark platform={c.platform} />
              <span className="truncate">@{c.handle}</span>
            </span>
            <span className="block truncate text-[12px] font-semibold text-slate-400">{under || c.name || ""}</span>
          </span>
          {rank !== null ? <Chip tone={scoreTone(rank)}>{rank}</Chip> : null}
        </div>

        {c.source !== "link" ? <Stats c={c} lit={lit} accent={accent} /> : null}

        <p className="m-0 line-clamp-2 min-h-[36px] text-[13px] font-semibold leading-[1.38] text-slate-600">
          {c.why ?? (c.source === "link" ? "Applied with your join link" : "")}
        </p>

        <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
          {c.status === "match" ? (
            <>
              <span className="relative flex-1">
                <Pill size="sm" icon={burst ? Check : MessageCircle} onClick={message} className="w-full" style={{ backgroundColor: accent, boxShadow: "none" }}>
                  {burst ? "Copied" : "Message"}
                </Pill>
                {burst ? <Burst colors={[accent, "#FFC53D", "#2FD27A"]} count={10} reach={38} /> : null}
              </span>
              {c.email && c.email_body ? (
                <a
                  href={`mailto:${c.email}?subject=${encodeURIComponent(c.email_subject ?? "")}&body=${encodeURIComponent((c.email_body ?? "").replace(/\{link\}/g, link))}`}
                  onClick={() => window.setTimeout(() => onMove("contacted"), 400)}
                  aria-label="Email"
                  className="flex h-[33px] w-[33px] items-center justify-center rounded-full bg-fill-quiet text-ink transition-transform active:scale-95"
                >
                  <Mail size={15} />
                </a>
              ) : null}
              <button
                type="button"
                aria-label="Skip"
                onClick={() => onMove("skipped")}
                className="flex h-[33px] w-[33px] cursor-pointer items-center justify-center rounded-full border-none bg-fill-quiet text-slate-500 transition-transform hover:text-ink active:scale-95"
              >
                <X size={15} />
              </button>
            </>
          ) : null}

          {c.status === "contacted" || c.status === "replied" ? (
            <>
              <span className="flex-1 text-[12px] font-bold text-slate-400">
                {c.status === "replied" ? "Replied" : `Sent ${ago(c.contacted_at)}`}
              </span>
              {c.status === "contacted" ? (
                <Pill size="sm" variant="tint" icon={Check} onClick={() => onMove("replied")}>
                  Replied
                </Pill>
              ) : null}
              <button
                type="button"
                aria-label="Not interested"
                onClick={() => onMove("passed")}
                className="flex h-[33px] w-[33px] cursor-pointer items-center justify-center rounded-full border-none bg-fill-quiet text-slate-500 hover:text-ink"
              >
                <X size={15} />
              </button>
            </>
          ) : null}

          {c.status === "applied" ? (
            <>
              <Pill size="sm" icon={Check} onClick={() => onMove("joined")} className="flex-1" style={{ backgroundColor: accent, boxShadow: "none" }}>
                Accept
              </Pill>
              <button
                type="button"
                aria-label="Pass"
                onClick={() => onMove("passed")}
                className="flex h-[33px] w-[33px] cursor-pointer items-center justify-center rounded-full border-none bg-fill-quiet text-slate-500 hover:text-ink"
              >
                <X size={15} />
              </button>
            </>
          ) : null}

          {c.status === "joined" ? <Chip tone="green">Joined {ago(c.joined_at)}</Chip> : null}

          {c.status === "skipped" || c.status === "passed" ? (
            <Pill size="sm" variant="quiet" icon={Undo2} onClick={() => onMove("match")}>
              Back to matches
            </Pill>
          ) : null}
        </div>
      </div>
    </Card>
  );
}

/* ------------------------------------------------------------------ detail */

function CreatorModal({
  c,
  accent,
  link,
  onClose,
  onSaveDm,
  onMove,
  onWrite,
}: {
  c: ScoutCreator;
  accent: string;
  link: string;
  onClose: () => void;
  onSaveDm: (dm: string) => void;
  onMove: (status: ScoutStatus) => void;
  /** Writes their first message; called once when a match with none is opened. */
  onWrite: () => void;
}) {
  /* The message is written the moment someone is opened. The modal is
     keyed on it, so it shows the text as soon as it lands. */
  const writing = c.dm === null && c.status === "match";
  const asked = useRef(false);
  useEffect(() => {
    if (!writing || asked.current) return;
    asked.current = true;
    onWrite();
  }, [writing, onWrite]);
  /* Shown with their real link; saved back with the {link} placeholder. */
  const shownDm = (c.dm ?? "").replace(/\{link\}/g, link);
  const [dm, setDmText] = useState(shownDm);
  const [copied, setCopied] = useState(false);
  const dirty = dm !== shownDm;
  const stored = (text: string) => text.split(link).join("{link}");
  const rank = rankOf(c);
  const who = [c.kind ? KIND_LABEL[c.kind] : null, c.gender ? GENDER_LABEL[c.gender] : null, c.age ? AGE_LABEL[c.age] : null, c.on_camera ? "On camera" : null].filter(
    (x): x is string => Boolean(x),
  );

  const send = () => {
    if (dirty) onSaveDm(stored(dm));
    void navigator.clipboard?.writeText(dm.trim()).catch(() => undefined);
    window.open(profileUrl(c.platform, c.handle), "_blank", "noopener");
    setCopied(true);
    if (c.status === "match") window.setTimeout(() => onMove("contacted"), 500);
  };

  return (
    <Modal onClose={() => { if (dirty) onSaveDm(stored(dm)); onClose(); }} width={640}>
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <Face c={c} size={48} />
          <span className="min-w-0 flex-1">
            <a
              href={profileUrl(c.platform, c.handle)}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 text-[18px] font-bold text-ink no-underline hover:underline"
            >
              <PlatformMark platform={c.platform} size={15} />@{c.handle}
            </a>
            <span className="block truncate text-[13px] font-semibold text-slate-400">{c.name ?? ""}</span>
          </span>
          {rank !== null ? <Chip tone={scoreTone(rank)} className="mr-10">{rank}</Chip> : null}
        </div>

        {c.source !== "link" ? <Stats c={c} lit={null} accent={accent} wide /> : null}

        {c.why ? <p className="m-0 text-[14px] font-semibold leading-[1.45] text-ink">{c.why}</p> : null}

        {c.videos.some((v) => v.cover) ? (
          <div className="grid grid-cols-6 gap-1.5">
            {c.videos.filter((v) => v.cover).slice(0, 6).map((v) => (
              <Cover key={v.url} url={v.url} cover={v.cover} views={v.views} className="aspect-[3/4]" />
            ))}
          </div>
        ) : null}

        {c.bio || c.tags.length || who.length ? (
          <div className="flex flex-wrap items-center gap-1.5">
            {who.map((t) => (
              <Chip key={t} tone="blue">
                {t}
              </Chip>
            ))}
            {c.tags.map((t) => (
              <Chip key={t} tone="slate">
                {t}
              </Chip>
            ))}
            {c.bio ? <span className="line-clamp-2 text-[13px] font-semibold text-slate-500">{c.bio}</span> : null}
          </div>
        ) : null}

        {c.dm !== null || c.status === "match" ? (
          <label className="flex flex-col gap-[7px]">
            <span className="text-[12px] font-semibold text-slate-400">Message</span>
            <textarea
              value={dm}
              onChange={(e) => setDmText(e.target.value)}
              rows={4}
              disabled={writing}
              placeholder={writing ? "Writing" : undefined}
              className="box-border w-full resize-none rounded-ops-sm border border-line bg-white px-3.5 py-2.5 text-[14.5px] font-semibold leading-[1.45] text-ink outline-none focus:border-blue-500"
            />
          </label>
        ) : null}

        <div className="flex items-center gap-2.5">
          {c.status === "match" || c.status === "contacted" || c.status === "replied" ? (
            <Pill icon={copied ? Check : MessageCircle} loading={writing} disabled={writing} onClick={send} className="flex-1" style={{ backgroundColor: accent, boxShadow: "none" }}>
              {copied ? "Copied" : "Copy and open profile"}
            </Pill>
          ) : null}
          {c.email && c.email_body ? (
            <a
              href={`mailto:${c.email}?subject=${encodeURIComponent(c.email_subject ?? "")}&body=${encodeURIComponent(c.email_body.replace(/\{link\}/g, link))}`}
              onClick={() => c.status === "match" && window.setTimeout(() => onMove("contacted"), 400)}
              className="inline-flex items-center gap-[7px] rounded-pill bg-fill-quiet px-[22px] py-3 text-[14.5px] font-bold text-ink no-underline"
            >
              <Mail size={16} /> Email
            </a>
          ) : null}
        </div>
      </div>
    </Modal>
  );
}

/* ------------------------------------------------------------------ filters */

const FILTER_GROUPS = [
  { key: "platform", label: "Platform", options: [["tiktok", "TikTok"], ["instagram", "Instagram"]] },
  { key: "size", label: "Followers", options: SIZE_BANDS.map((b) => [b.key, b.label]) },
  { key: "activity", label: "Posting", options: [["week", "Posted this week"], ["often", "3 or more a week"]] },
  { key: "kind", label: "Type", options: [["ugc", "UGC"], ["creator", "Creator"], ["niche", "In the niche"]] },
  { key: "gender", label: "Gender", options: [["female", "Women"], ["male", "Men"]] },
  { key: "age", label: "Age", options: [["18-24", "18 to 24"], ["25-34", "25 to 34"], ["35+", "35 and up"]] },
  { key: "more", label: "More", options: [["camera", "On camera"], ["email", "Has email"]] },
] as const satisfies ReadonlyArray<{ key: keyof ScoutFilters; label: string; options: ReadonlyArray<readonly [string, string]> }>;

function FilterPanel({
  filters,
  onChange,
  count,
  accent,
  onClose,
  onFindMore,
  finding,
}: {
  filters: ScoutFilters;
  onChange: (f: ScoutFilters) => void;
  /** People left on the open tab with these filters. */
  count: number;
  accent: string;
  onClose: () => void;
  /** Starts a search for the people these filters ask for; absent while one is running. */
  onFindMore?: () => void;
  finding: boolean;
}) {
  const toggle = (group: keyof ScoutFilters, value: string) => {
    const cur = filters[group] as string[];
    onChange({ ...filters, [group]: cur.includes(value) ? cur.filter((x) => x !== value) : [...cur, value] } as ScoutFilters);
  };
  return (
    <Modal title="Filters" onClose={onClose} width={600}>
      <div className="flex flex-col gap-4">
        {FILTER_GROUPS.map((g) => (
          <div key={g.key} className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
            <span className="w-[84px] shrink-0 text-[12px] font-semibold text-slate-400">{g.label}</span>
            <div className="flex flex-wrap gap-1.5">
              {g.options.map(([value, label]) => {
                const on = (filters[g.key] as string[]).includes(value);
                return (
                  <button
                    key={value}
                    type="button"
                    aria-pressed={on}
                    onClick={() => toggle(g.key, value)}
                    className={`cursor-pointer rounded-full border px-3.5 py-1.5 text-[13.5px] font-bold transition-[transform,colors] active:scale-95 ${
                      on ? "border-ink bg-ink text-white" : "border-line bg-white text-slate-500 hover:text-ink"
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
        <div className="mt-1 flex items-center gap-2.5">
          <Pill variant="quiet" disabled={filterCount(filters) === 0} onClick={() => onChange(NO_FILTERS)}>
            Clear
          </Pill>
          {onFindMore && filterCount(filters) > 0 ? (
            <Pill variant="tint" icon={Search} loading={finding} onClick={onFindMore}>
              Find more
            </Pill>
          ) : null}
          <Pill onClick={onClose} className="flex-1" style={{ backgroundColor: accent, boxShadow: "none" }}>
            Show {count.toLocaleString()}
          </Pill>
        </div>
      </div>
    </Modal>
  );
}

/* ------------------------------------------------------------------ new search */

const SIZES = [
  { key: "any", label: "Any size", min: null, max: null },
  { key: "small", label: "Under 10k", min: 300, max: 10_000 },
  { key: "mid", label: "10k to 100k", min: 10_000, max: 100_000 },
  { key: "big", label: "Over 100k", min: 100_000, max: 5_000_000 },
] as const;

function SearchForm({
  accent,
  initialBrief,
  onStarted,
  companyId,
  compactLayout = false,
}: {
  accent: string;
  initialBrief: string;
  onStarted: (d: ScoutData) => void;
  companyId?: string;
  compactLayout?: boolean;
}) {
  const [brief, setBrief] = useState(initialBrief);
  const [platforms, setPlatforms] = useState<ScoutPlatform[]>(["tiktok", "instagram"]);
  const [size, setSize] = useState<(typeof SIZES)[number]["key"]>("any");
  const [seeds, setSeeds] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggle = (p: ScoutPlatform) =>
    setPlatforms((cur) => (cur.includes(p) ? (cur.length > 1 ? cur.filter((x) => x !== p) : cur) : [...cur, p]));

  const go = async () => {
    setBusy(true);
    setError(null);
    const s = SIZES.find((x) => x.key === size)!;
    const r = await startScout({
      companyId,
      brief,
      platforms,
      seeds: seeds.split(/[\s,]+/).filter(Boolean),
      minFollowers: s.min,
      maxFollowers: s.max,
    });
    setBusy(false);
    if (!r.ok) setError(r.error);
    else onStarted(r.data);
  };

  const chip = (on: boolean): string =>
    `inline-flex cursor-pointer items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-[13.5px] font-bold transition-colors ${
      on ? "border-ink bg-ink text-white" : "border-line bg-white text-slate-500 hover:text-ink"
    }`;

  return (
    <div className="flex flex-col gap-4">
      <label className="flex flex-col gap-[7px]">
        <span className="text-[12px] font-semibold text-slate-400">Who should post for you?</span>
        <textarea
          value={brief}
          onChange={(e) => setBrief(e.target.value)}
          rows={compactLayout ? 2 : 3}
          placeholder="College athletes who film their training"
          className="box-border w-full resize-none rounded-ops-sm border border-line bg-white px-3.5 py-3 text-[15px] font-semibold text-ink outline-none focus:border-blue-500"
        />
      </label>
      <div className="flex flex-wrap items-center gap-2">
        {(["tiktok", "instagram"] as const).map((p) => (
          <button key={p} type="button" className={chip(platforms.includes(p))} onClick={() => toggle(p)}>
            {p === "tiktok" ? "TikTok" : "Instagram"}
          </button>
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {SIZES.map((s) => (
          <button key={s.key} type="button" className={chip(size === s.key)} onClick={() => setSize(s.key)}>
            {s.label}
          </button>
        ))}
      </div>
      <input
        value={seeds}
        onChange={(e) => setSeeds(e.target.value)}
        placeholder="Accounts you like, @handle"
        className="box-border w-full rounded-ops-sm border border-line bg-white px-3.5 py-2.5 text-[14.5px] font-semibold text-ink outline-none focus:border-blue-500"
      />
      {error ? <p className="m-0 text-[13px] font-semibold text-danger">{error}</p> : null}
      <Pill icon={Search} loading={busy} onClick={go} style={{ backgroundColor: accent, boxShadow: "none" }}>
        Find creators
      </Pill>
    </div>
  );
}

/* ------------------------------------------------------------------ progress */

const STEPS = ["Searching", "Reading profiles", "Watching videos"];

function stepOf(data: ScoutData): number {
  const r = data.run;
  if (!r) return 0;
  if (r.status === "planning" || r.status === "searching") return 0;
  if (r.status === "enriching") return 1;
  return 2;
}

function Counter({ value, label }: { value: number; label: string }) {
  const [shown, setShown] = useState(value);
  const from = useRef(value);
  useEffect(() => {
    const start = from.current;
    const t0 = performance.now();
    let raf = 0;
    const step = (t: number) => {
      const k = Math.min(1, (t - t0) / 700);
      setShown(Math.round(start + (value - start) * (1 - Math.pow(1 - k, 3))));
      if (k < 1) raf = requestAnimationFrame(step);
      else from.current = value;
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [value]);
  return (
    <span className="flex flex-col">
      <span className="text-[22px] font-bold tabular-nums text-ink">{shown.toLocaleString()}</span>
      <span className="text-[12px] font-semibold text-slate-400">{label}</span>
    </span>
  );
}

function RunStrip({ data, accent }: { data: ScoutData; accent: string }) {
  const r = data.run!;
  const step = stepOf(data);
  const terms = [...(r.plan.tiktok_queries ?? []), ...(r.plan.tiktok_hashtags ?? []).map((h) => `#${h}`), ...(r.plan.instagram_hashtags ?? []).map((h) => `#${h}`)];
  const unique = [...new Set(terms)];
  return (
    <Card pad={0} className="mb-4 flex shrink-0 flex-col gap-4 px-5 py-3.5 md:flex-row md:items-center md:gap-6">
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div className="flex flex-wrap items-center gap-2">
          {STEPS.map((s, i) => (
            <span key={s} className="flex items-center gap-2">
              <span
                className={`flex h-[22px] items-center gap-1.5 rounded-full px-2.5 text-[12.5px] font-bold transition-colors duration-300 ${
                  i < step ? "bg-green-soft text-green" : i === step ? "text-white" : "bg-fill-quiet text-slate-400"
                }`}
                style={i === step ? { backgroundColor: accent } : undefined}
              >
                {i < step ? <Check size={12} strokeWidth={3} className="animate-om-check" /> : i === step ? <span className="om-spinner !h-[10px] !w-[10px]" /> : null}
                {s}
              </span>
              {i < STEPS.length - 1 ? <span className="h-px w-4 bg-line" /> : null}
            </span>
          ))}
        </div>
        {unique.length ? (
          <div className="flex min-w-0 gap-1.5 overflow-hidden [mask-image:linear-gradient(to_right,black_85%,transparent)]">
            {unique.slice(0, 10).map((t) => (
              <span key={t} className="shrink-0 rounded-full bg-fill-quiet px-2.5 py-[3px] text-[12px] font-semibold text-slate-500">
                {t}
              </span>
            ))}
          </div>
        ) : null}
      </div>
      <div className="flex shrink-0 gap-6">
        <Counter value={r.counts.posts ?? 0} label="Posts read" />
        <Counter value={r.counts.accounts ?? 0} label="Accounts" />
        <Counter value={r.counts.matches ?? 0} label="Matches" />
      </div>
    </Card>
  );
}

/* ------------------------------------------------------------------ view */

export function ScoutView({
  initial,
  companyId,
  origin,
  initialOpen = null,
}: {
  initial: ScoutData;
  companyId?: string;
  origin: string;
  /** Dev preview only: a creator to open on load. */
  initialOpen?: string | null;
}) {
  const [data, setData] = useState(initial);
  const [tab, setTab] = useState<TabKey>("match");
  const PER_PAGE = usePerPage();
  const [page, setPage] = useState(0);
  const [open, setOpen] = useState<string | null>(initialOpen);
  const [searching, setSearching] = useState(false);
  const [sort, setSort] = useState<ScoutSort>("Best");
  const [filters, setFilters] = useState<ScoutFilters>(NO_FILTERS);
  const [filtering, setFiltering] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const accent = data.color ?? "#1BA6EE";
  const running = Boolean(data.run && ACTIVE_RUN.includes(data.run.status));

  const pull = useCallback(async () => {
    const r = await refreshScout(companyId);
    if (r.ok) setData(r.data);
  }, [companyId]);

  useEffect(() => {
    if (!running) return;
    const t = window.setInterval(pull, 5000);
    return () => window.clearInterval(t);
  }, [running, pull]);

  const nFilters = filterCount(filters);
  const [finding, setFinding] = useState(false);
  /* Typing narrows the board at once; Enter searches TikTok and Instagram for it. */
  const [query, setQuery] = useState("");
  const typed = query.trim();
  const haystacks = useMemo(() => new Map(data.creators.map((c) => [c.id, searchText(c)])), [data.creators]);

  /* A new search for exactly the people the filters ask for. The filters
     stay on, so the matches land in this view as they are vetted. */
  const findMore = async () => {
    if (finding || running) return;
    setFinding(true);
    setError(null);
    const r = await startScout({ companyId, brief: typed || (data.run?.brief ?? ""), seeds: [], ...searchFromFilters(filters) });
    setFinding(false);
    if (!r.ok) {
      setError(r.error);
      return;
    }
    setData(r.data);
    setFiltering(false);
    setTab("match");
    setPage(0);
  };

  /* Filters narrow every tab, so the counts say what is left. */
  const kept = useMemo(
    () =>
      nFilters || typed
        ? data.creators.filter((c) => (!nFilters || passes(c, filters)) && (!typed || matchesText(haystacks.get(c.id) ?? "", typed)))
        : data.creators,
    [data.creators, filters, nFilters, typed, haystacks],
  );

  const counts = useMemo(() => {
    const m = {} as Record<TabKey, number>;
    for (const t of TABS) m[t.key] = kept.filter((c) => (t.has as readonly ScoutStatus[]).includes(c.status)).length;
    return m;
  }, [kept]);

  /* Contacted and Joined read newest first until a sort is picked. */
  const list = useMemo(() => {
    const t = TABS.find((x) => x.key === tab)!;
    const rows = kept.filter((c) => (t.has as readonly ScoutStatus[]).includes(c.status));
    if (sort === "Best" && (tab === "contacted" || tab === "joined")) {
      return rows.sort((a, b) => Date.parse(b.contacted_at ?? b.created_at) - Date.parse(a.contacted_at ?? a.created_at));
    }
    return sortScout(rows, sort);
  }, [kept, tab, sort]);

  const pages = Math.max(1, Math.ceil(list.length / PER_PAGE));
  const safePage = Math.min(page, pages - 1);
  const shown = list.slice(safePage * PER_PAGE, safePage * PER_PAGE + PER_PAGE);
  const openCreator = data.creators.find((c) => c.id === open) ?? null;

  /* Left and right arrows turn the page. */
  const layered = Boolean(open) || searching || filtering;
  useEffect(() => {
    if (layered || pages < 2) return;
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement | null;
      if (e.metaKey || e.ctrlKey || e.altKey || (el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.isContentEditable))) return;
      if (e.key === "ArrowRight") setPage((p) => Math.min(pages - 1, Math.min(p, pages - 1) + 1));
      if (e.key === "ArrowLeft") setPage((p) => Math.max(0, Math.min(p, pages - 1) - 1));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [layered, pages]);

  const move = async (id: string, status: ScoutStatus) => {
    const now = new Date().toISOString();
    setData((d) => ({
      ...d,
      creators: d.creators.map((c) =>
        c.id === id
          ? { ...c, status, contacted_at: status === "contacted" && !c.contacted_at ? now : c.contacted_at, joined_at: status === "joined" ? now : c.joined_at }
          : c,
      ),
    }));
    const r = await updateScoutCreator({ companyId, id, status });
    if (!r.ok) {
      setError(r.error);
      void pull();
    }
  };

  const write = useCallback(
    async (id: string) => {
      const r = await writeScoutMessage({ companyId, id });
      if (!r.ok) {
        // Never left spinning: an empty message they can type themselves.
        setData((d) => ({ ...d, creators: d.creators.map((c) => (c.id === id && c.dm === null ? { ...c, dm: "" } : c)) }));
        setError(r.error);
        return;
      }
      setData((d) => ({
        ...d,
        creators: d.creators.map((c) => (c.id === id ? { ...c, dm: r.dm ?? "", email_subject: r.email_subject, email_body: r.email_body } : c)),
      }));
    },
    [companyId],
  );

  const saveDm = async (id: string, dm: string) => {
    setData((d) => ({ ...d, creators: d.creators.map((c) => (c.id === id ? { ...c, dm } : c)) }));
    await updateScoutCreator({ companyId, id, dm });
  };

  const copyJoin = () => {
    void navigator.clipboard?.writeText(joinUrl(origin, data.joinSlug)).catch(() => undefined);
    setLinkCopied(true);
    window.setTimeout(() => setLinkCopied(false), 1600);
  };

  const started = (d: ScoutData) => {
    setData(d);
    setSearching(false);
    setTab("match");
    setPage(0);
  };

  const head = (
    <PageHead
      title="Scout"
      right={
        <div className="flex items-center gap-2">
          <Pill variant="quiet" size="sm" icon={linkCopied ? Check : Link2} onClick={copyJoin}>
            {linkCopied ? "Copied" : "Join link"}
          </Pill>
          {data.run ? (
            <form
              className="flex items-center gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                if (typed) void findMore();
              }}
            >
              <label className="flex h-[38px] w-[260px] max-w-[46vw] items-center gap-2 rounded-pill border border-line bg-white px-3.5 shadow-card focus-within:border-blue-500">
                <Search size={15} className="shrink-0 text-slate-400" />
                <input
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setPage(0);
                  }}
                  placeholder="Search creators"
                  className="min-w-0 flex-1 border-none bg-transparent text-[14px] font-semibold text-ink outline-none placeholder:text-slate-400"
                />
              </label>
              <Pill size="sm" icon={Plus} disabled={running} onClick={() => setSearching(true)} style={{ backgroundColor: accent, boxShadow: "none" }}>
                New search
              </Pill>
            </form>
          ) : null}
        </div>
      }
    />
  );

  /* Never searched: the search is the page. */
  if (!data.run && data.creators.length === 0) {
    return (
      <div>
        {head}
        <div className="mx-auto mt-6 max-w-[620px]">
          <Card pad={28}>
            <h2 className="display m-0 mb-5 text-[26px] font-semibold text-ink">Find creators</h2>
            <SearchForm accent={accent} initialBrief="" onStarted={started} companyId={companyId} />
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="page-fit flex flex-col">
      {head}
      {data.run && (running || data.run.status === "failed") ? (
        data.run.status === "failed" ? (
          <Card pad={0} className="mb-4 flex items-center gap-3 px-5 py-3.5">
            <span className="flex-1 text-[14px] font-semibold text-danger">That search stopped. Try again.</span>
            <Pill size="sm" icon={Search} onClick={() => setSearching(true)} style={{ backgroundColor: accent, boxShadow: "none" }}>
              Search again
            </Pill>
          </Card>
        ) : (
          <RunStrip data={data} accent={accent} />
        )
      ) : null}

      <div className="mb-3 flex shrink-0 flex-wrap items-center gap-2">
        <div className="-mx-1 flex w-full min-w-0 gap-2 overflow-x-auto px-1 [scrollbar-width:none] lg:w-auto lg:flex-1">
          {TABS.filter((t) => t.key !== "applied" || counts.applied > 0).map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => {
                setTab(t.key);
                setPage(0);
              }}
              className={`shrink-0 cursor-pointer whitespace-nowrap rounded-full border px-4 py-1.5 text-[13.5px] font-bold transition-colors ${
                tab === t.key ? "border-ink bg-ink text-white" : "border-line bg-white text-slate-500 hover:text-ink"
              }`}
            >
              {t.label} <span className="tabular-nums opacity-70">{counts[t.key]}</span>
            </button>
          ))}
        </div>
        <div className="flex w-full items-center gap-2 lg:w-auto">
          {error ? <span className="text-[13px] font-semibold text-danger">{error}</span> : null}
          <SortDropdown
            options={SCOUT_SORTS}
            value={sort}
            prefix=""
            align="left"
            onSelect={(o) => {
              setSort(o);
              setPage(0);
            }}
          />
          <button
            type="button"
            onClick={() => setFiltering(true)}
            className={`inline-flex cursor-pointer items-center gap-[7px] whitespace-nowrap rounded-pill border border-line px-3.5 py-2 text-[13px] font-bold shadow-card transition-transform active:scale-95 ${
              nFilters ? "text-white" : "bg-white text-ink"
            }`}
            style={nFilters ? { backgroundColor: accent, borderColor: accent } : undefined}
          >
            <SlidersHorizontal size={13} />
            Filters{nFilters ? ` ${nFilters}` : ""}
          </button>
          {pages > 1 ? (
            <span className="ml-auto flex items-center gap-1.5 text-[13px] font-bold text-slate-500 lg:ml-1">
              <button
                type="button"
                aria-label="Previous"
                disabled={safePage === 0}
                onClick={() => setPage(safePage - 1)}
                className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-line bg-white text-ink disabled:cursor-default disabled:opacity-35"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="tabular-nums">
                {safePage + 1} / {pages}
              </span>
              <button
                type="button"
                aria-label="Next"
                disabled={safePage >= pages - 1}
                onClick={() => setPage(safePage + 1)}
                className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-line bg-white text-ink disabled:cursor-default disabled:opacity-35"
              >
                <ChevronRight size={16} />
              </button>
            </span>
          ) : null}
        </div>
      </div>

      {shown.length ? (
        <div
          key={`${tab}-${sort}-${nFilters}-${typed}-${safePage}`}
          className="grid min-h-0 flex-1 grid-cols-1 gap-3 sm:grid-cols-2 lg:auto-rows-[minmax(0,1fr)] lg:grid-cols-3 xl:grid-cols-4"
        >
          {shown.map((c, i) => (
            <div key={c.id} className="h-full min-h-0 animate-om-pop" style={{ animationDelay: `${i * 35}ms` } as CSSProperties}>
              <CreatorCard
                c={c}
                accent={accent}
                link={joinUrl(origin, data.joinSlug, c.code)}
                lit={SORT_STAT[sort]}
                onOpen={() => setOpen(c.id)}
                onMove={(s) => void move(c.id, s)}
              />
            </div>
          ))}
        </div>
      ) : (
        <Card pad={0} className="flex min-h-[240px] flex-1 flex-col items-center justify-center gap-3">
          <span className="text-[14px] font-semibold text-slate-400">
            {nFilters || typed ? "No one matches." : running ? "Nothing here yet." : "Nothing here."}
          </span>
          {nFilters || typed ? (
            <span className="flex items-center gap-2">
              {running ? null : (
                <Pill size="sm" icon={Search} loading={finding} onClick={() => void findMore()} style={{ backgroundColor: accent, boxShadow: "none" }}>
                  Find more
                </Pill>
              )}
              <Pill
                size="sm"
                variant="quiet"
                onClick={() => {
                  setFilters(NO_FILTERS);
                  setQuery("");
                }}
              >
                Clear
              </Pill>
            </span>
          ) : null}
        </Card>
      )}

      {openCreator ? (
        <CreatorModal
          key={`${openCreator.id}-${openCreator.dm === null ? "writing" : "written"}`}
          c={openCreator}
          onWrite={() => void write(openCreator.id)}
          accent={accent}
          link={joinUrl(origin, data.joinSlug, openCreator.code)}
          onClose={() => setOpen(null)}
          onSaveDm={(dm) => void saveDm(openCreator.id, dm)}
          onMove={(s) => void move(openCreator.id, s)}
        />
      ) : null}

      {filtering ? (
        <FilterPanel
          filters={filters}
          onChange={(f) => {
            setFilters(f);
            setPage(0);
          }}
          count={list.length}
          accent={accent}
          onClose={() => setFiltering(false)}
          onFindMore={running ? undefined : () => void findMore()}
          finding={finding}
        />
      ) : null}

      {searching ? (
        <Modal title="New search" onClose={() => setSearching(false)} width={560}>
          <SearchForm accent={accent} initialBrief={data.run?.brief ?? ""} onStarted={started} companyId={companyId} compactLayout />
        </Modal>
      ) : null}
    </div>
  );
}
