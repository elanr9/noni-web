"use client";

/* Daily-activity month calendar with the inline day card and post drill-in
   (MonthCalendar, DayDetail and the calendar branch of AnalyticsPage in
   AdminAnalytics.jsx). Clicking a day opens a card below the calendar,
   never a modal; clicking a post swaps the card to the post detail with a
   back arrow. Shared contract: the Posts tab calendar reuses this whole
   component. */
import { ChevronRight, Images, Play, X } from "lucide-react";
import { useMemo, useState } from "react";

import { Card, Label, MonthCal } from "@/components/kit";
import { fmtViews, money, monthMeta, postsOnDay } from "@/lib/admin/analytics";
import type { AdminPost, DayActivityMap } from "@/lib/admin/types";

import { PostDetailCard } from "./PostDetailCard";

function DayDetail({
  title,
  posts,
  views,
  signups,
  sales,
  onOpenPost,
  onClose,
}: {
  title: string;
  posts: AdminPost[];
  views: number;
  signups: number;
  sales: number;
  onOpenPost: (post: AdminPost) => void;
  onClose: () => void;
}) {
  const stats: Array<[string, string]> = [
    ["Views", fmtViews(views)],
    ["Sign-ups", String(signups)],
    ["Sales", money(sales)],
  ];
  return (
    <div>
      <div className="mb-3.5 flex items-center gap-2.5">
        <span className="flex-1 text-[18px] font-bold tracking-[-0.4px] text-ink">{title}</span>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="inline-flex h-[30px] w-[30px] cursor-pointer items-center justify-center border-none bg-fill-quiet rounded-pill"
        >
          <X size={14} className="text-slate-500" />
        </button>
      </div>
      <div className="mb-3.5 flex gap-3.5 rounded-[14px] bg-fill-quiet px-4 py-3.5">
        {stats.map(([label, value]) => (
          <span key={label} className="min-w-0 flex-1">
            <span className="block text-[11.5px] font-semibold text-slate-400">{label}</span>
            <span className="mt-[3px] block text-[19px] font-bold tracking-[-0.4px] text-ink">
              {value}
            </span>
          </span>
        ))}
      </div>
      <Label className="mb-1 block">Posted {title}</Label>
      {posts.length === 0 ? (
        <p className="mb-1 mt-2 text-[13.5px] font-semibold text-slate-400">
          Nothing posted this day.
        </p>
      ) : (
        posts.map((q) => {
          const Icon = q.format === "Video" ? Play : Images;
          return (
            <div
              key={q.id}
              role="button"
              onClick={() => onOpenPost(q)}
              className="-mx-2.5 flex cursor-pointer items-center gap-3 rounded-[12px] px-2.5 py-[11px] transition-colors duration-[160ms] ease-om hover:bg-fill-quiet"
            >
              <span className="inline-flex h-12 w-9 shrink-0 items-center justify-center bg-blue-100 rounded-[9px]">
                <Icon size={14} className="text-blue-700" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[13.5px] font-bold text-ink">{q.title}</span>
                <span className="mt-0.5 block text-[12px] font-semibold text-slate-400">
                  {q.creator} · {q.format}
                </span>
              </span>
              <span className="text-right">
                <span className="block text-[14px] font-bold text-ink">{fmtViews(q.viewsN)}</span>
                <span className="block text-[11.5px] font-bold text-green">{money(q.earned)}</span>
              </span>
              <ChevronRight size={15} className="text-slate-400" />
            </div>
          );
        })
      )}
    </div>
  );
}

export function DailyActivity({
  dayActivity,
  posts,
}: {
  dayActivity: DayActivityMap;
  posts: AdminPost[];
}) {
  const [day, setDay] = useState<number | null>(null);
  const [post, setPost] = useState<AdminPost | null>(null);
  const month = useMemo(() => monthMeta(new Date()), []);

  /* MonthCal takes the ops day shape; downloads has no admin counterpart. */
  const calDays = useMemo(
    () =>
      Object.fromEntries(
        Object.entries(dayActivity).map(([d, a]) => [
          d,
          { signups: a.signups, sales: a.sales, views: a.views, downloads: 0 },
        ]),
      ),
    [dayActivity],
  );

  /* Prototype dot = posts published that day. */
  const postDays = useMemo(
    () =>
      new Set(
        Object.entries(dayActivity)
          .filter(([, a]) => a.postIds.length > 0)
          .map(([d]) => Number(d)),
      ),
    [dayActivity],
  );

  const activity = day !== null ? dayActivity[day] : undefined;

  return (
    <>
      <Card pad={22}>
        <Label className="mb-3.5 block">Daily activity · {month.name}</Label>
        <MonthCal
          days={calDays}
          onPick={(d) => {
            setDay(d);
            setPost(null);
          }}
          firstWeekday={month.firstWeekday}
          daysInMonth={month.daysInMonth}
          today={month.today}
          variant="admin"
          postDays={postDays}
        />
        <p className="mb-0 mt-2.5 text-[12px] font-semibold text-slate-400">
          Badge = sign-ups and sales that day. Dot = posts published. Click a
          day for the full picture.
        </p>
      </Card>
      {day !== null && activity ? (
        <Card
          key={"d" + day + (post ? post.id : "")}
          pad={22}
          className="mt-3.5 animate-om-rise"
        >
          {post ? (
            <PostDetailCard post={post} onBack={() => setPost(null)} />
          ) : (
            <DayDetail
              title={`${month.short} ${day}`}
              posts={postsOnDay(posts, activity)}
              views={activity.views}
              signups={activity.signups}
              sales={activity.sales}
              onOpenPost={setPost}
              onClose={() => setDay(null)}
            />
          )}
        </Card>
      ) : null}
    </>
  );
}
