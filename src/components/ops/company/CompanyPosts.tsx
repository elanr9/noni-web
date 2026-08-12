"use client";

import { Images, Play } from "lucide-react";
import { useRouter } from "next/navigation";

import { Card, HoverPeek } from "@/components/kit";
import { fmtK, money, SEED_POSTS } from "@/lib/ops/mock-data";
import type { Company } from "@/lib/ops/types";

export function CompanyPosts({ company }: { company: Company }) {
  const router = useRouter();
  const posts = SEED_POSTS.filter((q) => q.company === company.id).sort(
    (a, b) => b.viewsN - a.viewsN,
  );

  return (
    <div className="grid grid-cols-2 gap-3.5">
      {posts.map((q) => (
        <HoverPeek
          key={q.id}
          label="View post"
          onClick={() => router.push(`/ops/posts/${q.id}`)}
        >
          <Card pad={16} className="flex items-center gap-3.5">
            <span className="inline-flex h-[72px] w-[54px] shrink-0 items-center justify-center bg-blue-100 rounded-ops-sm">
              {q.format === "Video" ? (
                <Play size={17} className="text-blue-700" />
              ) : (
                <Images size={17} className="text-blue-700" />
              )}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block overflow-hidden text-ellipsis whitespace-nowrap text-[14.5px] font-bold text-ink">
                {q.title}
              </span>
              <span className="mt-[3px] block text-[12.5px] font-semibold text-slate-400">
                {q.creator} · {q.date}
              </span>
              <span className="mt-[5px] block text-[12px] font-semibold text-slate-400">
                TikTok {fmtK(q.tt.views)} · IG {fmtK(q.ig.views)}
              </span>
            </span>
            <span className="text-right">
              <span className="block text-[16px] font-bold text-ink">
                {fmtK(q.viewsN)}
              </span>
              <span className="mt-0.5 block text-[12.5px] font-bold text-green">
                {money(q.earned)}
              </span>
            </span>
          </Card>
        </HoverPeek>
      ))}
    </div>
  );
}
