"use client";

/* Day-detail modal for the daily-activity calendar (DayModal in the
   prototype): sales / sign-ups / downloads plus that day's posts. */
import { Images, Play } from "lucide-react";

import { Label, Modal } from "@/components/kit";
import { fmtK, money } from "@/lib/ops/mock-data";
import type { DayActivity, Post } from "@/lib/ops/types";

function Cell({ label, value }: { label: string; value: string }) {
  return (
    <span className="flex-1">
      <span className="block text-[12px] font-semibold text-slate-400">{label}</span>
      <span className="mt-1 block text-[22px] font-bold tracking-[-0.4px] text-ink">{value}</span>
    </span>
  );
}

export function DayModal({
  title,
  data,
  posts,
  onClose,
}: {
  title: string;
  data: DayActivity;
  posts: Post[];
  onClose: () => void;
}) {
  return (
    <Modal title={title} onClose={onClose}>
      <div className="flex gap-3.5 border-b border-line pb-4">
        <Cell label="Sales" value={money(data.sales)} />
        <Cell label="Sign-ups" value={String(data.signups)} />
        <Cell label="Downloads" value={String(data.downloads)} />
      </div>
      <Label className="mb-2.5 mt-4 block">Posted that day</Label>
      {posts.length === 0 ? (
        <p className="m-0 text-[13.5px] font-semibold text-slate-400">
          No posts published this day.
        </p>
      ) : (
        <div className="flex flex-col gap-2.5">
          {posts.map((q) => {
            const Icon = q.format === "Video" ? Play : Images;
            return (
              <div key={q.id} className="flex items-center gap-[11px]">
                <span className="inline-flex h-11 w-[34px] shrink-0 items-center justify-center bg-blue-100 rounded-[9px]">
                  <Icon size={13} className="text-blue-700" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[13px] font-bold text-ink">{q.title}</span>
                  <span className="mt-px block text-[11.5px] font-semibold text-slate-400">
                    {q.creator} · {q.format}
                  </span>
                </span>
                <span className="text-[13px] font-bold text-ink">{fmtK(q.viewsN)}</span>
              </div>
            );
          })}
        </div>
      )}
    </Modal>
  );
}
