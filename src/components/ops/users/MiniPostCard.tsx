"use client";

import { Images, Link as LinkIcon, Play } from "lucide-react";

import { fmtK, money } from "@/lib/ops/mock-data";
import type { Post } from "@/lib/ops/types";

export interface MiniPostCardProps {
  post: Post;
}

/** Compact post card used in the briefs browser: thumbnail glyph, title,
    "Aug N · creator · views · $earned" and an external Open link.
    Reused by the company-admin briefs browser. */
export function MiniPostCard({ post }: MiniPostCardProps) {
  const Glyph = post.format === "Video" ? Play : Images;
  return (
    <div className="flex items-center gap-[11px] bg-fill-quiet px-3 py-2.5 rounded-ops-sm">
      <span className="inline-flex h-11 w-[34px] shrink-0 items-center justify-center bg-blue-100 rounded-[9px]">
        <Glyph size={13} className="text-blue-700" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block overflow-hidden text-ellipsis whitespace-nowrap text-[13px] font-bold text-ink">
          {post.title}
        </span>
        <span className="mt-px block text-[11.5px] font-semibold text-slate-400">
          Aug {post.day} · {post.creator} · {fmtK(post.viewsN)} views · {money(post.earned)}
        </span>
      </span>
      <a
        href={post.link}
        target="_blank"
        rel="noreferrer"
        className="inline-flex items-center gap-[5px] whitespace-nowrap border border-line bg-white px-[13px] py-[7px] text-[12px] font-bold text-ink no-underline rounded-pill"
      >
        <LinkIcon size={12} className="text-ink" />
        Open
      </a>
    </div>
  );
}
