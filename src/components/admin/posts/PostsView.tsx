"use client";

import { CalendarDays, ChevronRight, Images, LayoutGrid, Play } from "lucide-react";
import { useState } from "react";

import { DailyActivity } from "@/components/admin/analytics/DailyActivity";
import { PostDetailCard } from "@/components/admin/analytics/PostDetailCard";
import { fmtK, money } from "@/components/admin/posts/format";
import { Segmented } from "@/components/admin/posts/Segmented";
import { Card, PageHead } from "@/components/kit";
import type { AdminPost, DayActivityMap } from "@/lib/admin/types";

/* Posts tab (PostsPage in AdminSetupTabs.jsx): Grid | Calendar toggle.
   Grid cards hover-lift and click into the post detail; Calendar reuses
   the shared daily-activity component with its inline day drill-in. */

const VIEWS = [
  { value: "Grid", label: "Grid", icon: LayoutGrid },
  { value: "Calendar", label: "Calendar", icon: CalendarDays },
] as const;
type PostsViewMode = (typeof VIEWS)[number]["value"];

export function PostsView({
  posts,
  dayActivity,
}: {
  posts: AdminPost[];
  dayActivity: DayActivityMap;
}) {
  const [view, setView] = useState<PostsViewMode>("Grid");
  const [sel, setSel] = useState<AdminPost | null>(null);

  if (sel && view === "Grid") {
    return (
      <div>
        <PageHead title="Posts" />
        <Card pad={22}>
          <PostDetailCard post={sel} onBack={() => setSel(null)} />
        </Card>
      </div>
    );
  }

  return (
    <div>
      <PageHead
        title="Posts"
        sub="Every post your creators publish, with views and earnings on each."
        right={
          <div data-tour="posts-view-toggle">
            <Segmented
              options={VIEWS}
              value={view}
              onSelect={(v) => {
                setView(v);
                setSel(null);
              }}
            />
          </div>
        }
      />
      <div data-tour="posts-grid">
        {view === "Calendar" ? (
          <DailyActivity dayActivity={dayActivity} posts={posts} />
        ) : posts.length === 0 ? (
          <Card pad={22}>
            <p className="m-0 text-[13.5px] font-semibold text-slate-400">
              No posts yet. They appear here the moment your creators publish.
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-2 gap-3.5">
            {posts.map((p) => (
              <Card
                key={p.id}
                pad={16}
                lift
                onClick={() => setSel(p)}
                className="group flex items-center gap-3.5"
              >
                <span className="inline-flex h-[62px] w-[46px] shrink-0 items-center justify-center bg-blue-100 rounded-[10px]">
                  {p.format === "Video" ? (
                    <Play size={16} className="text-blue-700" />
                  ) : (
                    <Images size={16} className="text-blue-700" />
                  )}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block overflow-hidden text-ellipsis whitespace-nowrap text-[14px] font-bold text-ink">
                    {p.title}
                  </span>
                  <span className="mt-[3px] block overflow-hidden text-ellipsis whitespace-nowrap text-[12.5px] font-semibold text-slate-400">
                    {p.creator} · {p.publishedAt} · TikTok {fmtK(p.tt.views)} · IG{" "}
                    {fmtK(p.ig.views)}
                  </span>
                </span>
                <span className="shrink-0 text-right">
                  <span className="block text-[15px] font-bold text-ink">
                    {fmtK(p.viewsN)}
                  </span>
                  <span className="block text-[12px] font-semibold text-green">
                    {money(p.earned)}
                  </span>
                </span>
                <ChevronRight
                  size={15}
                  className="shrink-0 text-blue-700 opacity-0 transition-opacity duration-[160ms] ease-om group-hover:opacity-100"
                />
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
