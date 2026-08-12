"use client";

import {
  AtSign,
  ChevronLeft,
  Images,
  Link as LinkIcon,
  Music2,
  Play,
} from "lucide-react";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";

import { Card } from "@/components/kit";
import { fmtK, money } from "@/lib/ops/mock-data";
import type { PlatformStats, Post } from "@/lib/ops/types";

function PRow({ label, value, last }: { label: string; value: string; last?: boolean }) {
  return (
    <div
      className={`flex items-center gap-2.5 py-[9px] ${last ? "" : "border-b border-line"}`}
    >
      <span className="flex-1 text-[13px] font-semibold text-slate-400">{label}</span>
      <span className="text-[13.5px] font-bold text-ink">{value}</span>
    </div>
  );
}

function PlatformCard({
  name,
  icon,
  stats,
}: {
  name: string;
  icon: ReactNode;
  stats: PlatformStats;
}) {
  return (
    <Card pad={18}>
      <div className="mb-1.5 flex items-center gap-2">
        {icon}
        <span className="text-[13.5px] font-bold text-ink">{name}</span>
      </div>
      <PRow label="Views" value={fmtK(stats.views)} />
      <PRow label="Likes" value={fmtK(stats.likes)} />
      <PRow label="Saves" value={fmtK(stats.saves)} last />
    </Card>
  );
}

export function PostDetail({ post }: { post: Post }) {
  const router = useRouter();

  return (
    <div className="animate-om-rise">
      <button
        type="button"
        onClick={() => router.back()}
        className="mb-3.5 inline-flex cursor-pointer items-center gap-1.5 whitespace-nowrap border border-line bg-white px-[13px] py-[7px] text-[12.5px] font-bold text-ink rounded-pill"
      >
        <ChevronLeft size={14} className="text-ink" />
        All posts
      </button>
      <div className="flex items-start gap-[22px]">
        <span className="inline-flex h-[306px] w-[230px] shrink-0 items-center justify-center bg-blue-100 shadow-media rounded-ops-lg">
          {post.format === "Video" ? (
            <Play size={34} className="text-blue-700" />
          ) : (
            <Images size={34} className="text-blue-700" />
          )}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-start gap-3">
            <div className="min-w-0 flex-1">
              <h2 className="m-0 text-[20px] font-bold tracking-[-0.4px] text-ink">
                {post.title}
              </h2>
              <p className="mb-0 mt-1.5 text-[13.5px] font-semibold text-slate-400">
                {post.creator} · {post.format} · posted {post.date}
              </p>
            </div>
            <a
              href={post.link}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-[7px] whitespace-nowrap bg-blue-500 px-[18px] py-2.5 text-[13.5px] font-bold text-white no-underline shadow-accent rounded-pill"
            >
              <LinkIcon size={14} className="text-white" />
              Open post
            </a>
          </div>
          <div className="my-5 flex gap-4 border-b border-line pb-[18px]">
            {(
              [
                ["Views", fmtK(post.viewsN)],
                ["Earned", money(post.earned)],
                ["Sales that day", money(post.sales)],
                ["Sign-ups that day", String(post.signups)],
              ] as const
            ).map(([l, v]) => (
              <span key={l} className="flex-1">
                <span className="block text-[12px] font-semibold text-slate-400">
                  {l}
                </span>
                <span className="mt-1 block text-[22px] font-bold tracking-[-0.4px] text-ink">
                  {v}
                </span>
              </span>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-3.5">
            <PlatformCard
              name="TikTok"
              icon={<Music2 size={15} className="text-ink" />}
              stats={post.tt}
            />
            <PlatformCard
              name="Instagram"
              icon={<AtSign size={15} className="text-ink" />}
              stats={post.ig}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
