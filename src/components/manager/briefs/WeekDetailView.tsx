"use client";

import {
  CheckCircle2,
  ChevronRight,
  Images,
  LayoutList,
  Play,
  Plus,
  Search,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState, useSyncExternalStore } from "react";

import { Avatar, Card, Label, Modal, PageHead, Pill } from "@/components/kit";

import { publishWeek, saveWeekTargets } from "@/app/manager/briefs/actions";
import { FormatThumb, PostTypeChip, ProgressBar } from "./bits";
import {
  addDays,
  aiScore,
  briefWeekMonday,
  briefWeekRangeLabel,
  briefWeekStatus,
  dayTitle,
  familyOf,
  fmtSales,
  fmtViews,
  formatLabel,
  isBeforeNotifyCutoff,
  isoDate,
  postedDayMeta,
  progressLine,
  rowStateOf,
  weekdayShort,
  type BriefWeekStats,
  type Campaign,
  type CampaignBriefItem,
  type GridRowState,
  type PublishResult,
  type WeekPostItem,
} from "./lib";

/* One week's detail. Next week is the planning entry: an empty state until
   week setup stamps the grid, then lanes, split chips and the stamped rows.
   Live weeks keep the grid. Done weeks open the past-brief archive. */

type Lane = "video" | "photo_carousel";

/* The in-progress strip dismissal persists per week in localStorage, like
   the mobile AsyncStorage flag. Read through an external store so the SSR
   pass renders the strip and the client syncs after hydration. */
const STRIP_EVENT = "noni-week-strip-dismissed";

function subscribeStrip(callback: () => void): () => void {
  window.addEventListener(STRIP_EVENT, callback);
  return () => window.removeEventListener(STRIP_EVENT, callback);
}

function BriefGridRow({
  index,
  item,
  state,
  onOpen,
}: {
  index: number;
  item: CampaignBriefItem;
  state: GridRowState;
  onOpen: () => void;
}) {
  const brief = item.briefs;
  const typeLabel = brief.post_types?.label ?? "Post";
  const indexLabel = String(index).padStart(2, "0");

  if (state === "killed") {
    return (
      <div className="flex items-center gap-2.5 bg-fill-quiet p-3.5 rounded-[11px]">
        <span className="w-5 text-[12px] font-bold text-slate-300">{indexLabel}</span>
        <span className="min-w-0 flex-1">
          <span className="block text-[13px] font-bold text-slate-500">
            Left empty on purpose
          </span>
          <span className="mt-0.5 block text-[12px] leading-snug text-slate-400">
            {brief.kill_reason ?? ""}
          </span>
        </span>
        <PostTypeChip label={typeLabel} />
      </div>
    );
  }

  if (state === "empty") {
    return (
      <button
        type="button"
        onClick={onOpen}
        className="flex w-full cursor-pointer items-center gap-2.5 border-[1.5px] border-dashed border-line bg-transparent p-3.5 text-left rounded-[11px] transition-colors duration-[160ms] ease-om hover:border-blue-300"
      >
        <span className="w-5 text-[12px] font-bold text-slate-300">{indexLabel}</span>
        <span className="flex min-w-0 flex-1 flex-col gap-2">
          <span>
            <PostTypeChip label={typeLabel} />
          </span>
          <span className="flex items-center gap-1.5">
            <Search size={13} className="shrink-0 text-slate-400" />
            <span className="truncate text-[13px] font-semibold text-slate-500">
              {brief.search_phrase
                ? `"${brief.search_phrase}"`
                : "Add a search phrase"}
            </span>
          </span>
        </span>
        <Plus size={18} className="shrink-0 text-slate-400" />
      </button>
    );
  }

  const score = state === "complete" ? aiScore(brief) : null;
  const statusLine =
    state === "partial"
      ? progressLine(brief)
      : state === "filled"
        ? "Needs review"
        : score !== null
          ? `AI score ${score}`
          : "Reviewed";

  return (
    <button
      type="button"
      onClick={onOpen}
      className="flex w-full cursor-pointer items-center gap-2.5 border border-line bg-white p-3.5 text-left shadow-card rounded-[11px] transition-[border-color] duration-[160ms] ease-om hover:border-blue-300"
    >
      <span className="w-5 text-[12px] font-bold text-slate-300">{indexLabel}</span>
      <span className="flex min-w-0 flex-1 flex-col gap-1.5">
        <span className="line-clamp-2 text-[14.5px] font-bold leading-snug tracking-[-0.2px] text-ink">
          {brief.title}
        </span>
        <span className="flex items-center gap-2.5">
          <PostTypeChip label={typeLabel} />
          <span
            className={`truncate text-[12px] ${
              state === "partial"
                ? "font-semibold text-slate-500"
                : state === "filled"
                  ? "font-bold text-amber"
                  : "font-bold text-green"
            }`}
          >
            {statusLine}
          </span>
        </span>
      </span>
      {state === "complete" ? (
        <CheckCircle2 size={19} className="shrink-0 text-green" />
      ) : (
        <ChevronRight size={16} className="shrink-0 text-slate-300" />
      )}
    </button>
  );
}

function PastWeekBody({
  dropDate,
  posts,
  stats,
  showSales,
}: {
  dropDate: string;
  posts: WeekPostItem[];
  stats: BriefWeekStats | null;
  showSales: boolean;
}) {
  const [fmt, setFmt] = useState<0 | 1 | 2>(0);
  const [day, setDay] = useState<string | null>(null);

  const viewsPerDay =
    stats?.viewsPerDay ?? posts.reduce((sum, p) => sum + p.views, 0) / 7;
  const salesCents =
    stats?.salesCents ?? posts.reduce((sum, p) => sum + p.salesCents, 0);
  const postCount = stats?.posts ?? posts.length;
  const filtered =
    fmt === 0
      ? posts
      : posts.filter((p) =>
          fmt === 1 ? p.format === "video" : p.format === "photo_carousel",
        );
  const monday = briefWeekMonday(dropDate);
  const counts = new Map<string, number>();
  for (const p of posts) {
    counts.set(p.postedDay, (counts.get(p.postedDay) ?? 0) + 1);
  }

  /* One day of the finished week: what each creator posted and what it
     sold, ported from the mobile week-day screen. */
  if (day !== null) {
    const dayPosts = posts.filter((p) => p.postedDay === day);
    const daySales = dayPosts.reduce((sum, p) => sum + p.salesCents, 0);
    const subtitleParts = [`${dayPosts.length} posts`];
    if (showSales) subtitleParts.push(`${fmtSales(daySales)} in sales`);
    return (
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div>
            <span className="block text-[16px] font-bold tracking-[-0.3px] text-ink">
              {dayTitle(day)}
            </span>
            <span className="block text-[12.5px] font-semibold text-slate-400">
              {subtitleParts.join(" · ")}
            </span>
          </div>
          <Pill variant="quiet" size="sm" onClick={() => setDay(null)}>
            Back to week
          </Pill>
        </div>
        {dayPosts.length === 0 ? (
          <p className="m-0 text-[13px] font-semibold text-slate-400">
            No posts on this day.
          </p>
        ) : (
          dayPosts.map((p) => (
            <Card key={p.postId} pad={12} className="flex items-center gap-3">
              <Avatar name={p.creatorName} size={34} />
              <FormatThumb format={p.format} width={34} height={46} />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[13.5px] font-bold text-ink">
                  {p.title}
                </span>
                <span className="mt-0.5 block truncate text-[11.5px] font-semibold text-slate-400">
                  {p.creatorName} · {formatLabel(p.format)}
                </span>
              </span>
              <span className="shrink-0 text-right">
                <span className="block text-[14px] font-bold text-ink">
                  {fmtViews(p.views)}
                </span>
                {showSales ? (
                  <span className="block text-[11px] font-bold text-green">
                    {fmtSales(p.salesCents)}
                  </span>
                ) : null}
              </span>
            </Card>
          ))
        )}
      </div>
    );
  }

  const statCards: { label: string; value: string; money?: boolean }[] = [
    { label: "Views/day", value: fmtViews(viewsPerDay) },
  ];
  if (showSales) {
    statCards.push({ label: "Sales", value: fmtSales(salesCents), money: true });
  }
  statCards.push({ label: "Posts", value: String(postCount) });

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-3 gap-2">
        {statCards.map((s) => (
          <Card key={s.label} pad={12}>
            <span
              className={`block text-[19px] font-bold tracking-[-0.4px] ${
                s.money ? "text-green" : "text-ink"
              }`}
            >
              {s.value}
            </span>
            <span className="mt-0.5 block text-[11px] font-bold uppercase tracking-[0.3px] text-slate-400">
              {s.label}
            </span>
          </Card>
        ))}
      </div>

      <div className="scrollbar-none flex gap-1.5 overflow-x-auto pb-0.5">
        {Array.from({ length: 7 }, (_, i) => {
          const d = addDays(monday, i);
          const iso = isoDate(d);
          const n = counts.get(iso) ?? 0;
          return (
            <button
              key={iso}
              type="button"
              onClick={() => setDay(iso)}
              className="flex shrink-0 cursor-pointer flex-col items-center gap-0.5 border border-line bg-white px-3 py-2 shadow-card rounded-ops-sm transition-[border-color] duration-[160ms] ease-om hover:border-blue-300"
            >
              <span className="text-[11px] font-bold tracking-[0.3px] text-slate-400">
                {weekdayShort(d).toUpperCase()}
              </span>
              <span className="text-[15px] font-bold text-ink">{d.getDate()}</span>
              <span className="text-[10.5px] font-semibold text-blue-700">
                {n} posts
              </span>
            </button>
          );
        })}
      </div>

      <div className="flex gap-1 self-start bg-fill-quiet p-[3px] rounded-pill">
        {(["All", "Videos", "Slideshows"] as const).map((label, i) => (
          <button
            key={label}
            type="button"
            onClick={() => setFmt(i as 0 | 1 | 2)}
            className={`cursor-pointer whitespace-nowrap border-none px-[13px] py-[7px] text-[12.5px] font-bold transition-colors duration-[160ms] ease-om rounded-pill ${
              fmt === i ? "bg-white text-ink shadow-card" : "bg-transparent text-slate-400"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-2">
        {filtered.map((p) => (
          <Card key={p.postId} pad={12} className="flex items-center gap-3">
            <FormatThumb format={p.format} />
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[13.5px] font-bold text-ink">
                {p.title}
              </span>
              <span className="mt-0.5 block truncate text-[11.5px] font-semibold text-slate-400">
                {p.creatorName} · {formatLabel(p.format)} ·{" "}
                {postedDayMeta(p.postedDay)}
              </span>
            </span>
            <span className="shrink-0 text-right">
              <span className="block text-[14px] font-bold text-ink">
                {fmtViews(p.views)}
              </span>
              {showSales ? (
                <span className="block text-[11px] font-bold text-green">
                  {fmtSales(p.salesCents)}
                </span>
              ) : null}
            </span>
          </Card>
        ))}
      </div>
      {showSales ? (
        <p className="m-0 text-[12.5px] leading-relaxed text-slate-400">
          Sales show because sales tracking is on in Settings.
        </p>
      ) : null}
    </div>
  );
}

export function WeekDetailView({
  campaign,
  weekNumber,
  items,
  posts,
  stats,
  showSales,
}: {
  campaign: Campaign;
  weekNumber: number | null;
  items: CampaignBriefItem[];
  posts: WeekPostItem[] | null;
  stats: BriefWeekStats | null;
  showSales: boolean;
}) {
  const router = useRouter();
  const [lane, setLane] = useState<Lane>("video");
  const [typeFilter, setTypeFilter] = useState<string | null>(null);
  const [targetsOpen, setTargetsOpen] = useState(false);
  const [videoText, setVideoText] = useState(String(campaign.video_target ?? 20));
  const [slideshowText, setSlideshowText] = useState(
    String(campaign.slideshow_target ?? 10),
  );
  const [targetsSaving, setTargetsSaving] = useState(false);
  const [publishOpen, setPublishOpen] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [publishResult, setPublishResult] = useState<PublishResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const stripKey = `noni.weekStrip.dismissed:${campaign.id}`;
  const stripDismissed = useSyncExternalStore(
    subscribeStrip,
    () => window.localStorage.getItem(stripKey) === "1",
    () => false,
  );
  function dismissStrip() {
    window.localStorage.setItem(stripKey, "1");
    window.dispatchEvent(new Event(STRIP_EVENT));
  }

  const editable = campaign.status === "draft";
  const hasStampedPosts = items.some((i) => i.briefs.post_type_id !== null);
  const needsWeekSetup = editable && !hasStampedPosts;
  const { status, dayOfWeek } = briefWeekStatus(campaign);
  const isDone = status === "done";

  const rows = useMemo(
    () =>
      items.map((item) => ({
        item,
        family: familyOf(item) as Lane,
        state: rowStateOf(item),
      })),
    [items],
  );

  const videoRows = rows.filter((r) => r.family === "video");
  const slideshowRows = rows.filter((r) => r.family === "photo_carousel");
  const doneCount = (list: typeof rows) =>
    list.filter(
      (r) => r.state === "filled" || r.state === "complete" || r.state === "killed",
    ).length;
  const activeRows = lane === "video" ? videoRows : slideshowRows;
  const visibleRows = typeFilter
    ? activeRows.filter((r) => r.item.briefs.post_types?.key === typeFilter)
    : activeRows;

  const typeSplit = useMemo<Record<string, number>>(
    () =>
      campaign.type_split && typeof campaign.type_split === "object" && !Array.isArray(campaign.type_split)
        ? (campaign.type_split as Record<string, number>)
        : {},
    [campaign],
  );
  const splitChips = useMemo(() => {
    const counts = new Map<string, { label: string; actual: number }>();
    for (const row of rows) {
      const t = row.item.briefs.post_types;
      if (!t || t.family !== lane) continue;
      const entry = counts.get(t.key) ?? { label: t.label, actual: 0 };
      entry.actual += 1;
      counts.set(t.key, entry);
    }
    for (const [key, planned] of Object.entries(typeSplit)) {
      if (planned > 0 && !counts.has(key)) {
        const anyRow = items.find((i) => i.briefs.post_types?.key === key);
        if (anyRow?.briefs.post_types?.family === lane) {
          counts.set(key, { label: anyRow.briefs.post_types.label, actual: 0 });
        }
      }
    }
    return [...counts.entries()].map(([key, entry]) => ({
      key,
      label: entry.label,
      actual: entry.actual,
      planned: typeSplit[key] ?? 0,
    }));
  }, [rows, typeSplit, lane, items]);

  const leftCount = rows.filter(
    (r) => r.state !== "complete" && r.state !== "killed",
  ).length;
  const phase: "in_progress" | "complete" =
    rows.length > 0 && leftCount === 0 ? "complete" : "in_progress";
  const videoTarget = campaign.video_target ?? 20;
  const slideshowTarget = campaign.slideshow_target ?? 10;

  const metaSuffix =
    status === "next"
      ? " · opens Sunday"
      : status === "current" && dayOfWeek !== null
        ? ` · day ${dayOfWeek} of 7`
        : " · done";
  const subtitle =
    campaign.drop_date !== null
      ? isDone
        ? `${briefWeekRangeLabel(campaign.drop_date)} · complete`
        : `${briefWeekRangeLabel(campaign.drop_date)}${metaSuffix}`
      : undefined;

  async function saveTargets() {
    setTargetsSaving(true);
    setError(null);
    const result = await saveWeekTargets(
      campaign.id,
      Number.parseInt(videoText, 10) || 0,
      Number.parseInt(slideshowText, 10) || 0,
    );
    setTargetsSaving(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setTargetsOpen(false);
    router.refresh();
  }

  async function publish() {
    setPublishing(true);
    setError(null);
    const result = await publishWeek(campaign.id);
    setPublishing(false);
    setPublishOpen(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setPublishResult(result);
    router.refresh();
  }

  const gridActive = editable && hasStampedPosts && rows.length > 0;
  const showFooter = gridActive && !(phase === "in_progress" && stripDismissed);
  const madeCount = rows.length - leftCount;

  return (
    <div>
      <PageHead
        title={weekNumber !== null ? `Week ${weekNumber}` : campaign.name}
        sub={subtitle}
        onBack={() => router.push("/manager/briefs")}
        right={
          gridActive && phase === "in_progress" && stripDismissed ? (
            <span className="whitespace-nowrap bg-white px-[11px] py-1.5 text-[12px] font-bold text-blue-700 shadow-card rounded-pill">
              {madeCount} of {rows.length} posts
            </span>
          ) : undefined
        }
      />

      {error ? (
        <p className="mb-3 text-[13px] font-semibold text-danger">{error}</p>
      ) : null}

      {needsWeekSetup ? (
        <Card pad={22} className="flex max-w-[460px] flex-col items-start gap-4">
          <span className="inline-flex h-[52px] w-[52px] items-center justify-center bg-blue-100 rounded-pill">
            <LayoutList size={24} className="text-blue-700" />
          </span>
          <span className="text-[18px] font-bold tracking-[-0.3px] text-ink">
            Not planned yet
          </span>
          <p className="m-0 text-[13.5px] text-slate-500">
            Set the ratio, split the types, and the stamped rows appear.
          </p>
          <Pill onClick={() => router.push("/manager/briefs/setup")}>
            {weekNumber === null ? "Start week" : `Start week ${weekNumber}`}
          </Pill>
        </Card>
      ) : isDone && campaign.drop_date !== null ? (
        <PastWeekBody
          dropDate={campaign.drop_date}
          posts={posts ?? []}
          stats={stats}
          showSales={showSales}
        />
      ) : (
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-2.5 sm:flex-row">
            {(
              [
                {
                  key: "video" as Lane,
                  label: "Videos",
                  done: doneCount(videoRows),
                  target: videoTarget,
                },
                {
                  key: "photo_carousel" as Lane,
                  label: "Slideshows",
                  done: doneCount(slideshowRows),
                  target: slideshowTarget,
                },
              ] as const
            ).map((l) => (
              <button
                key={l.key}
                type="button"
                onClick={() => {
                  setLane(l.key);
                  setTypeFilter(null);
                }}
                className={`flex flex-1 cursor-pointer flex-col gap-2 border bg-white p-3.5 text-left shadow-card rounded-[11px] transition-colors duration-[160ms] ease-om ${
                  lane === l.key ? "border-blue-500" : "border-line"
                }`}
              >
                <span className="flex items-center gap-2">
                  {l.key === "video" ? (
                    <Play size={14} className="text-blue-700" />
                  ) : (
                    <Images size={14} className="text-blue-700" />
                  )}
                  <span className="text-[12px] font-bold text-slate-400">
                    {l.label}
                  </span>
                </span>
                <span className="text-[18px] font-bold tracking-[-0.3px] text-ink">
                  {l.done}
                  <span className="text-[13px] font-bold text-slate-400">
                    {" "}
                    of {l.target}
                  </span>
                </span>
                <ProgressBar done={l.done} target={l.target} />
              </button>
            ))}
          </div>

          {editable ? (
            <div className="-mt-1 flex justify-end">
              <button
                type="button"
                onClick={() => setTargetsOpen(true)}
                className="cursor-pointer border-none bg-transparent text-[12.5px] font-bold text-blue-700"
              >
                Edit targets
              </button>
            </div>
          ) : null}

          {splitChips.length > 0 ? (
            <div className="scrollbar-none flex gap-1.5 overflow-x-auto pb-0.5">
              {splitChips.map((chip) => {
                const on = typeFilter === chip.key;
                return (
                  <button
                    key={chip.key}
                    type="button"
                    onClick={() => setTypeFilter(on ? null : chip.key)}
                    className={`shrink-0 cursor-pointer whitespace-nowrap border-none px-[13px] py-[7px] text-[12px] font-bold transition-colors duration-[160ms] ease-om rounded-pill ${
                      on ? "bg-blue-100 text-blue-700" : "bg-fill-quiet text-slate-500"
                    }`}
                  >
                    {chip.label} {chip.actual}
                    {chip.planned > 0 ? ` of ${chip.planned}` : ""}
                  </button>
                );
              })}
            </div>
          ) : null}

          <div className="flex flex-col gap-2.5">
            {visibleRows.map((row, i) => (
              <BriefGridRow
                key={row.item.brief_id}
                index={i + 1}
                item={row.item}
                state={row.state}
                onOpen={() => router.push(`/manager/briefs/${row.item.brief_id}`)}
              />
            ))}
            {visibleRows.length === 0 ? (
              <p className="m-0 py-8 text-center text-[13.5px] text-slate-400">
                No posts on this side yet.
              </p>
            ) : null}
          </div>

          {showFooter ? (
            phase === "in_progress" ? (
              <div className="flex items-center gap-2.5 border border-line bg-white p-3 shadow-card rounded-[11px]">
                <span className="inline-flex h-[26px] min-w-[26px] items-center justify-center bg-blue-500 px-[7px] text-[13px] font-bold text-white rounded-pill">
                  {leftCount}
                </span>
                <span className="flex-1 text-[13px] font-semibold leading-snug text-slate-500">
                  {leftCount} posts left this week. Publish opens when every
                  row is complete.
                </span>
                <button
                  type="button"
                  aria-label="Dismiss"
                  onClick={dismissStrip}
                  className="inline-flex h-[26px] w-[26px] shrink-0 cursor-pointer items-center justify-center border-none bg-transparent rounded-pill"
                >
                  <X size={16} className="text-slate-400" />
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-stretch gap-2">
                <Pill disabled={publishing} onClick={() => setPublishOpen(true)}>
                  {publishing ? "Publishing…" : "Publish to creators"}
                </Pill>
                <p className="m-0 text-center text-[12px] leading-relaxed text-slate-400">
                  {campaign.drop_date !== null &&
                  isBeforeNotifyCutoff(campaign.drop_date)
                    ? "Before Sunday 8:00 PM EST, so creators are notified on schedule."
                    : "Creators are notified immediately."}
                </p>
              </div>
            )
          ) : null}
        </div>
      )}

      {targetsOpen ? (
        <Modal title="Edit targets" onClose={() => setTargetsOpen(false)}>
          <div className="flex flex-col gap-4">
            <label className="flex flex-col gap-[7px]">
              <Label>Videos</Label>
              <input
                inputMode="numeric"
                maxLength={2}
                value={videoText}
                onChange={(e) => setVideoText(e.target.value.replace(/[^\d]/g, ""))}
                className="w-full border border-line bg-white px-3.5 py-3 text-[14.5px] font-semibold text-ink outline-none rounded-ops-sm focus:border-blue-500 focus:[box-shadow:var(--ring-focus)]"
              />
            </label>
            <label className="flex flex-col gap-[7px]">
              <Label>Slideshows</Label>
              <input
                inputMode="numeric"
                maxLength={2}
                value={slideshowText}
                onChange={(e) =>
                  setSlideshowText(e.target.value.replace(/[^\d]/g, ""))
                }
                className="w-full border border-line bg-white px-3.5 py-3 text-[14.5px] font-semibold text-ink outline-none rounded-ops-sm focus:border-blue-500 focus:[box-shadow:var(--ring-focus)]"
              />
            </label>
            <div className="flex justify-end gap-2.5">
              <Pill variant="quiet" onClick={() => setTargetsOpen(false)}>
                Cancel
              </Pill>
              <Pill disabled={targetsSaving} onClick={() => void saveTargets()}>
                {targetsSaving ? "Saving…" : "Save"}
              </Pill>
            </div>
          </div>
        </Modal>
      ) : null}

      {publishOpen ? (
        <Modal title="Publish to creators?" onClose={() => setPublishOpen(false)}>
          <p className="m-0 text-[14px] leading-relaxed text-slate-500">
            Every creator gets their week from these {items.length} posts.
          </p>
          <div className="mt-5 flex justify-end gap-2.5">
            <Pill variant="quiet" onClick={() => setPublishOpen(false)}>
              Cancel
            </Pill>
            <Pill disabled={publishing} onClick={() => void publish()}>
              {publishing ? "Publishing…" : "Publish"}
            </Pill>
          </div>
        </Modal>
      ) : null}

      {publishResult ? (
        <Modal
          title={publishResult.scheduled ? "Campaign scheduled" : "Campaign is live"}
          onClose={() => setPublishResult(null)}
        >
          <p className="m-0 text-[14px] leading-relaxed text-slate-500">
            {publishResult.assignments_written} assignments across{" "}
            {publishResult.creators} creators.{" "}
            {publishResult.scheduled
              ? "Creators get the push Sunday at 8PM Eastern."
              : "Notifications are on the way."}
          </p>
          <div className="mt-5 flex justify-end">
            <Pill onClick={() => setPublishResult(null)}>Done</Pill>
          </div>
        </Modal>
      ) : null}

    </div>
  );
}
