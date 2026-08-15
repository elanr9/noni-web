"use client";

import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Images,
  LayoutList,
  Play,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { Segmented } from "@/components/admin/posts/Segmented";
import { Card, Chip, PageHead, Pill } from "@/components/kit";

import { getWeekPosts } from "@/app/manager/briefs/actions";
import { AvatarStack, FormatThumb, ProgressBar, StatPill } from "./bits";
import {
  briefWeekRangeLabel,
  fmtSales,
  fmtViews,
  formatLabel,
  postedDayMeta,
  upcomingWeekDropDate,
  type BriefWeekStats,
  type BriefWeekStatus,
  type BriefWeekSummary,
  type WeekPostItem,
} from "./lib";

/* Briefs index: week list plus calendar view, ported from the mobile
   calendar tab. A week is one shared pool of posts for the whole roster. */

const VIEWS = [
  { value: "List", label: "List", icon: LayoutList },
  { value: "Calendar", label: "Calendar", icon: CalendarDays },
] as const;
type BriefsViewMode = (typeof VIEWS)[number]["value"];

type WeekCardData = {
  key: string;
  /** Null for the synthesized upcoming week with no draft campaign yet. */
  campaignId: string | null;
  label: string;
  range: string;
  status: BriefWeekStatus;
  dayOfWeek: number | null;
  video: { done: number; target: number };
  slideshow: { done: number; target: number };
  stats: BriefWeekStats | null;
};

function rangeLine(card: WeekCardData): string {
  const phrase =
    card.status === "next"
      ? "opens Sunday"
      : card.status === "current"
        ? "in progress"
        : "complete";
  return `${card.range} · ${phrase}`;
}

function stepperStatus(card: WeekCardData): string {
  if (card.status === "next") return "Opens Sunday";
  if (card.status === "current" && card.dayOfWeek !== null) {
    return `Day ${card.dayOfWeek} of 7`;
  }
  return "Done";
}

function LaneSummaryCard({
  icon,
  label,
  done,
  target,
}: {
  icon: "video" | "images";
  label: string;
  done: number;
  target: number;
}) {
  return (
    <Card pad={14} className="flex-1">
      <span className="flex items-center gap-2">
        {icon === "video" ? (
          <Play size={14} className="text-blue-700" />
        ) : (
          <Images size={14} className="text-blue-700" />
        )}
        <span className="text-[12px] font-bold text-slate-400">{label}</span>
      </span>
      <span className="mt-2 block text-[19px] font-bold tracking-[-0.3px] text-ink">
        {done}
        <span className="text-[13px] font-bold text-slate-400"> of {target}</span>
      </span>
      <span className="mt-2 block">
        <ProgressBar done={done} target={target} />
      </span>
    </Card>
  );
}

export function BriefsIndexView({
  weeks,
  managers,
  meId,
  showSales,
}: {
  weeks: BriefWeekSummary[];
  managers: Array<{ id: string; name: string }>;
  meId: string;
  showSales: boolean;
}) {
  const router = useRouter();
  const [view, setView] = useState<BriefsViewMode>("List");
  const [wi, setWi] = useState<number | null>(null);
  const [postsCache, setPostsCache] = useState<Record<string, WeekPostItem[]>>({});

  const cards = useMemo<WeekCardData[]>(() => {
    const list: WeekCardData[] = weeks.map((w) => ({
      key: w.campaign.id,
      campaignId: w.campaign.id,
      label: `Week ${w.weekNumber}`,
      range:
        w.campaign.drop_date === null
          ? ""
          : briefWeekRangeLabel(w.campaign.drop_date),
      status: w.status,
      dayOfWeek: w.dayOfWeek,
      video: { done: w.videoDone, target: w.videoTarget },
      slideshow: { done: w.slideshowDone, target: w.slideshowTarget },
      stats: w.stats,
    }));
    if (list.length > 0 && !list.some((c) => c.status === "next")) {
      list.unshift({
        key: "upcoming",
        campaignId: null,
        label: `Week ${Math.max(...weeks.map((w) => w.weekNumber)) + 1}`,
        range: briefWeekRangeLabel(upcomingWeekDropDate()),
        status: "next",
        dayOfWeek: null,
        video: { done: 0, target: 0 },
        slideshow: { done: 0, target: 0 },
        stats: null,
      });
    }
    return list;
  }, [weeks]);

  const managerPeople = useMemo(
    () =>
      [...managers].sort((a, b) =>
        a.id === meId ? -1 : b.id === meId ? 1 : 0,
      ),
    [managers, meId],
  );

  const defaultWi = Math.max(
    0,
    cards.findIndex((c) => c.status !== "next"),
  );
  const selIdx = Math.min(wi ?? defaultWi, Math.max(0, cards.length - 1));
  const cw = cards[selIdx];

  /* Calendar posts load lazily per week, cached like mobile. */
  useEffect(() => {
    if (view !== "Calendar" || !cw || cw.status === "next") return;
    const id = cw.campaignId;
    if (id === null || postsCache[id] !== undefined) return;
    let cancelled = false;
    void getWeekPosts(id).then((res) => {
      if (cancelled) return;
      setPostsCache((prev) => ({
        ...prev,
        [id]: res.ok ? res.posts : [],
      }));
    });
    return () => {
      cancelled = true;
    };
  }, [view, cw, postsCache]);

  function openCard(card: WeekCardData) {
    if (card.campaignId === null) {
      router.push("/manager/briefs/setup");
      return;
    }
    router.push(`/manager/briefs/week/${card.campaignId}`);
  }

  if (weeks.length === 0) {
    return (
      <div>
        <PageHead
          title="Briefs"
          sub="A week is one shared pool of posts for the whole roster."
        />
        <Card pad={22} className="flex max-w-[460px] flex-col items-start gap-4">
          <span className="inline-flex h-[52px] w-[52px] items-center justify-center bg-blue-100 rounded-pill">
            <LayoutList size={24} className="text-blue-700" />
          </span>
          <span className="text-[20px] font-bold tracking-[-0.4px] text-ink">
            Start your first brief!
          </span>
          <Pill onClick={() => router.push("/manager/briefs/setup")}>
            Start week 1
          </Pill>
        </Card>
      </div>
    );
  }

  const cwPosts = cw?.campaignId != null ? postsCache[cw.campaignId] : undefined;

  return (
    <div>
      <PageHead
        title="Briefs"
        sub="A week is one shared pool of posts for the whole roster."
        right={<Segmented options={VIEWS} value={view} onSelect={setView} />}
      />

      {view === "Calendar" && cw ? (
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              aria-label="Earlier week"
              disabled={selIdx === cards.length - 1}
              onClick={() => setWi(Math.min(cards.length - 1, selIdx + 1))}
              className="inline-flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center border border-line bg-white shadow-card rounded-pill disabled:opacity-35"
            >
              <ChevronLeft size={15} className="text-ink" />
            </button>
            <div className="flex min-w-0 flex-1 flex-col items-center">
              <span className="truncate text-[14.5px] font-bold tracking-[-0.2px] text-ink">
                {cw.label} · {cw.range}
              </span>
              <span className="text-[11.5px] font-semibold text-slate-400">
                {stepperStatus(cw)}
              </span>
            </div>
            <button
              type="button"
              aria-label="Later week"
              disabled={selIdx === 0}
              onClick={() => setWi(Math.max(0, selIdx - 1))}
              className="inline-flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center border border-line bg-white shadow-card rounded-pill disabled:opacity-35"
            >
              <ChevronRight size={15} className="text-ink" />
            </button>
          </div>

          <div className="flex flex-col gap-2.5 sm:flex-row">
            <LaneSummaryCard
              icon="video"
              label="Videos"
              done={cw.video.done}
              target={cw.video.target}
            />
            <LaneSummaryCard
              icon="images"
              label="Slideshows"
              done={cw.slideshow.done}
              target={cw.slideshow.target}
            />
          </div>

          {cw.status === "next" ? (
            <p className="m-0 text-[13px] text-slate-400">
              Nothing recorded yet. The brief opens Sunday.
            </p>
          ) : cwPosts === undefined ? (
            <p className="m-0 text-[13px] font-semibold text-slate-400">
              Loading posts…
            </p>
          ) : cwPosts.length === 0 ? (
            <p className="m-0 text-[13px] font-semibold text-slate-400">
              No posts made from this week yet.
            </p>
          ) : (
            <div className="flex flex-col gap-2">
              {cwPosts.map((p) => (
                <Card key={p.postId} pad={12} className="flex items-center gap-3">
                  <FormatThumb format={p.format} />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[13.5px] font-bold text-ink">
                      {p.title}
                    </span>
                    <span className="mt-[2px] block truncate text-[11.5px] font-semibold text-slate-400">
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
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-2.5">
          {cards.map((card) => (
            <Card
              key={card.key}
              pad={16}
              lift
              onClick={() => openCard(card)}
              className="flex flex-col gap-3.5"
            >
              <div className="flex items-center gap-2.5">
                <div className="min-w-0 flex-1">
                  <span className="block truncate text-[17px] font-bold tracking-[-0.3px] text-ink">
                    {card.label}
                  </span>
                  <span className="mt-[2px] flex items-center gap-[7px]">
                    {card.status !== "next" ? (
                      <span
                        className={`h-2 w-2 shrink-0 rounded-pill ${
                          card.status === "done" ? "bg-green" : "bg-amber"
                        }`}
                      />
                    ) : null}
                    <span className="truncate text-[13px] font-semibold text-slate-400">
                      {rangeLine(card)}
                    </span>
                  </span>
                </div>
                {card.status === "next" ? (
                  <Chip tone="blue">Next week</Chip>
                ) : (
                  <span className="hidden sm:block">
                    <AvatarStack people={managerPeople} />
                  </span>
                )}
                <ChevronRight size={16} className="shrink-0 text-slate-300" />
              </div>

              {card.status === "next" ? (
                <p className="m-0 text-[12.5px] text-slate-400">
                  Not planned yet. Opens Sunday, click to start it.
                </p>
              ) : card.stats !== null ? (
                <div className="flex flex-wrap items-center gap-1.5">
                  <StatPill
                    value={fmtViews(card.stats.viewsPerDay)}
                    unit="views/day"
                  />
                  {showSales ? (
                    <StatPill value={fmtSales(card.stats.salesCents)} unit="sales" />
                  ) : null}
                  <StatPill value={String(card.stats.posts)} unit="posts" />
                </div>
              ) : null}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
