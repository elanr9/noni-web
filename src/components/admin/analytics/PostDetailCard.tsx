"use client";

/* Post detail (PostDetail in AdminAnalytics.jsx): back arrow, total views,
   earned, TikTok vs Instagram views/likes/saves, Open post external link.
   Shared contract: the Posts tab renders the same card. The consumer
   supplies the Card wrapper. */
import { AtSign, ChevronLeft, Music2, Share2 } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { Pill } from "@/components/kit";
import { fmtViews, money } from "@/lib/admin/analytics";
import type { AdminPost, PlatformStats } from "@/lib/admin/types";

function PlatformCol({
  name,
  icon: Icon,
  stats,
}: {
  name: string;
  icon: LucideIcon;
  stats: PlatformStats;
}) {
  const rows: Array<[string, number]> = [
    ["Views", stats.views],
    ["Likes", stats.likes],
    ["Saves", stats.saves],
  ];
  return (
    <div className="min-w-0 flex-1 rounded-[14px] border border-line p-4">
      <div className="mb-2.5 flex items-center gap-2">
        <Icon size={15} className="text-ink" />
        <span className="text-[13.5px] font-bold text-ink">{name}</span>
      </div>
      {rows.map(([label, value]) => (
        <div key={label} className="flex items-baseline gap-2 py-[5px]">
          <span className="flex-1 text-[12.5px] font-semibold text-slate-400">{label}</span>
          <span className="text-[14px] font-bold text-ink">{fmtViews(value)}</span>
        </div>
      ))}
    </div>
  );
}

export function PostDetailCard({
  post,
  onBack,
}: {
  post: AdminPost;
  onBack?: () => void;
}) {
  const stats: Array<[string, string]> = [
    ["Total views", fmtViews(post.viewsN)],
    ["Earned", money(post.earned)],
    ["Posted", post.publishedAt],
  ];
  return (
    <div>
      <div className="mb-3.5 flex items-center gap-3">
        {onBack ? (
          <button
            type="button"
            onClick={onBack}
            aria-label="Back"
            className="inline-flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center border border-line bg-white rounded-pill"
          >
            <ChevronLeft size={16} className="text-ink" />
          </button>
        ) : null}
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[17px] font-bold tracking-[-0.4px] text-ink">
            {post.title}
          </span>
          <span className="mt-0.5 block text-[12.5px] font-semibold text-slate-400">
            {post.creator} · {post.format} · {post.publishedAt}
          </span>
        </span>
        <Pill
          size="sm"
          variant="tint"
          icon={Share2}
          disabled={!post.link}
          onClick={() => window.open(post.link, "_blank", "noopener,noreferrer")}
        >
          Open post
        </Pill>
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
      <div className="flex gap-3.5">
        <PlatformCol name="TikTok" icon={Music2} stats={post.tt} />
        <PlatformCol name="Instagram" icon={AtSign} stats={post.ig} />
      </div>
    </div>
  );
}
