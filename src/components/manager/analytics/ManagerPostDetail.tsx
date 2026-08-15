"use client";

/* Post detail for /manager/analytics, following the admin PostDetailCard:
   back arrow, stat cells, TikTok vs Instagram columns, Open post link.
   Money cells follow the manager access gate and the Stripe connect day:
   with financials off the Earned cell is omitted entirely; with financials
   on but the post predating the connect day it reads Not tracked, exactly
   like the mobile PostDetail. */
import { AtSign, ChevronLeft, Music2, Share2 } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { Pill } from "@/components/kit";

import {
  fmtViews,
  formatMoney,
  moneyOn,
  shortDayLabel,
  type ManagerAnalyticsPost,
  type MoneyGate,
  type PlatformStats,
} from "./derive";

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
          <span className="flex-1 text-[12.5px] font-semibold text-slate-400">
            {label}
          </span>
          <span className="text-[14px] font-bold text-ink">{fmtViews(value)}</span>
        </div>
      ))}
    </div>
  );
}

export function ManagerPostDetail({
  post,
  gate,
  showFinancials,
  onBack,
}: {
  post: ManagerAnalyticsPost;
  gate: MoneyGate;
  showFinancials: boolean;
  onBack: () => void;
}) {
  const money = showFinancials && moneyOn(gate, post.day);
  const stats: Array<[string, string]> = [
    ["Total views", fmtViews(post.views)],
    ...(showFinancials
      ? ([
          ["Earned", money ? formatMoney(post.earnedCents) : "Not tracked"],
        ] as Array<[string, string]>)
      : []),
    ["Posted", shortDayLabel(post.day)],
  ];
  return (
    <div>
      <div className="mb-3.5 flex items-center gap-3">
        <button
          type="button"
          onClick={onBack}
          aria-label="Back"
          className="inline-flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center border border-line bg-white rounded-pill"
        >
          <ChevronLeft size={16} className="text-ink" />
        </button>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[17px] font-bold tracking-[-0.4px] text-ink">
            {post.title}
          </span>
          <span className="mt-0.5 block text-[12.5px] font-semibold text-slate-400">
            {post.creatorFirst} · {post.format} · {shortDayLabel(post.day)}
          </span>
        </span>
        <Pill
          size="sm"
          variant="tint"
          icon={Share2}
          disabled={post.postUrl === null}
          onClick={() => {
            if (post.postUrl !== null) {
              window.open(post.postUrl, "_blank", "noopener,noreferrer");
            }
          }}
        >
          Open post
        </Pill>
      </div>
      <div className="mb-3.5 flex flex-wrap gap-3.5 rounded-[14px] bg-fill-quiet px-4 py-3.5">
        {stats.map(([label, value]) => (
          <span key={label} className="min-w-[90px] flex-1">
            <span className="block text-[11.5px] font-semibold text-slate-400">
              {label}
            </span>
            <span className="mt-[3px] block text-[19px] font-bold tracking-[-0.4px] text-ink">
              {value}
            </span>
          </span>
        ))}
      </div>
      <div className="flex flex-col gap-3.5 sm:flex-row">
        <PlatformCol name="TikTok" icon={Music2} stats={post.tiktok} />
        <PlatformCol name="Instagram" icon={AtSign} stats={post.instagram} />
      </div>
    </div>
  );
}
