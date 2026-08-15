"use client";

import { ExternalLink, Images, MessageCircle, Play } from "lucide-react";
import { useRouter } from "next/navigation";

import { Card, Chip, Label, PageHead, Pill } from "@/components/kit";
import type { ChipTone } from "@/components/kit";
import type {
  CreatorAssignmentRow,
  CreatorProfileData,
} from "@/lib/manager/creators";

import { CreatorAvatar } from "./CreatorAvatar";
import { fmtViews, formatCents, shortDate } from "./format";

/* Creator profile (mobile creator detail screen): stats, streak, wallet,
   the assignments still in flight, and recent posts with their metrics. */

const STATUS_TONES: Record<string, { label: string; tone: ChipTone }> = {
  submitted: { label: "In review", tone: "amber" },
  changes_requested: { label: "Changes requested", tone: "amber" },
  approved: { label: "Approved", tone: "blue" },
  posted: { label: "Posted", tone: "green" },
};

function statusChip(status: string) {
  const known = STATUS_TONES[status];
  if (known) return <Chip tone={known.tone}>{known.label}</Chip>;
  const label = status.replaceAll("_", " ");
  return <Chip tone="slate">{label.charAt(0).toUpperCase() + label.slice(1)}</Chip>;
}

function formatLabel(format: string): string {
  return format === "video" ? "Reel" : "Slideshow";
}

function FormatIcon({ format }: { format: string }) {
  return (
    <span className="inline-flex h-14 w-[42px] shrink-0 items-center justify-center bg-blue-100 rounded-[10px]">
      {format === "video" ? (
        <Play size={15} className="text-blue-700" />
      ) : (
        <Images size={15} className="text-blue-700" />
      )}
    </span>
  );
}

function AssignmentRows({
  rows,
  empty,
  showMetrics,
}: {
  rows: CreatorAssignmentRow[];
  empty: string;
  showMetrics: boolean;
}) {
  if (rows.length === 0) {
    return (
      <p className="m-0 px-5 pb-[18px] pt-1 text-[13.5px] font-semibold text-slate-400">
        {empty}
      </p>
    );
  }
  return (
    <>
      {rows.map((a) => (
        <div
          key={a.id}
          className="flex items-center gap-[13px] border-t border-line px-5 py-[13px]"
        >
          <FormatIcon format={a.briefFormat} />
          <span className="min-w-0 flex-1">
            <span className="block overflow-hidden text-ellipsis whitespace-nowrap text-[14px] font-bold text-ink">
              {a.briefTitle}
            </span>
            <span className="mt-0.5 block text-[12.5px] font-semibold text-slate-400">
              {shortDate(a.scheduledDate)} · {formatLabel(a.briefFormat)}
              {showMetrics
                ? ` · ${fmtViews(a.views)} views · ${fmtViews(a.likes)} likes`
                : ""}
            </span>
          </span>
          {showMetrics && a.postUrl ? (
            <a
              href={a.postUrl}
              target="_blank"
              rel="noreferrer"
              aria-label="Open post"
              onClick={(e) => e.stopPropagation()}
              className="inline-flex h-8 w-8 shrink-0 items-center justify-center bg-fill-quiet text-slate-500 rounded-pill"
            >
              <ExternalLink size={14} />
            </a>
          ) : null}
          {statusChip(a.status)}
        </div>
      ))}
    </>
  );
}

export function CreatorProfile({
  creator,
  viewFinancials,
}: {
  creator: CreatorProfileData;
  viewFinancials: boolean;
}) {
  const router = useRouter();

  const stats: Array<[string, string]> = [
    ["Posts", String(creator.posts)],
    ["Views", fmtViews(creator.views)],
  ];
  if (viewFinancials) stats.push(["Earned", formatCents(creator.earnedCents)]);
  if (creator.streak) {
    stats.push([
      "Current streak",
      creator.streak.current === 1 ? "1 day" : `${creator.streak.current} days`,
    ]);
  }

  return (
    <div>
      <PageHead
        onBack={() => router.push("/manager/creators")}
        title={creator.name}
        sub={`Creator · joined ${shortDate(creator.joined)}`}
        right={
          <div className="flex items-center gap-2.5">
            {creator.status === "Active" ? (
              <Chip tone="green">Active</Chip>
            ) : (
              <Chip tone="amber">Invite sent</Chip>
            )}
            <Pill
              size="sm"
              icon={MessageCircle}
              onClick={() => router.push(`/manager/creators/${creator.id}/chat`)}
            >
              Message
            </Pill>
          </div>
        }
      />

      <div className="grid grid-cols-1 items-start gap-3.5 lg:grid-cols-[300px_1fr]">
        <Card pad={0}>
          <div className="flex items-center gap-3 px-5 py-4">
            <CreatorAvatar name={creator.name} url={creator.avatarUrl} size={42} />
            <span className="min-w-0">
              <span className="block text-[15px] font-bold text-ink">
                {creator.name}
              </span>
              <span className="mt-0.5 block text-[12px] font-semibold text-slate-400">
                Creator
              </span>
            </span>
          </div>
          {(
            [
              ["Phone", creator.phone || "Not shared"],
              ["Joined", shortDate(creator.joined)],
              ["Status", creator.status],
              ...(creator.streak
                ? ([["Best streak", `${creator.streak.longest} days`]] as const)
                : []),
            ] as ReadonlyArray<readonly [string, string]>
          ).map(([label, value]) => (
            <div
              key={label}
              className="flex items-center gap-3 border-t border-line px-5 py-3"
            >
              <span className="w-20 shrink-0 text-[12.5px] font-semibold text-slate-400">
                {label}
              </span>
              <span className="min-w-0 flex-1 break-words text-[13.5px] font-bold text-ink">
                {value}
              </span>
            </div>
          ))}
        </Card>

        <div className="flex min-w-0 flex-col gap-3.5">
          <Card pad={22} className="flex flex-wrap gap-[18px]">
            {stats.map(([label, value]) => (
              <span key={label} className="min-w-[110px] flex-1">
                <span className="block text-[12px] font-semibold text-slate-400">
                  {label}
                </span>
                <span className="mt-[5px] block text-[26px] font-bold tracking-[-0.5px] text-ink">
                  {value}
                </span>
              </span>
            ))}
          </Card>

          {viewFinancials && creator.wallet ? (
            <Card pad={0}>
              <Label className="block px-5 pb-2 pt-4">Wallet</Label>
              <div className="flex flex-wrap gap-[18px] px-5 pb-[18px] pt-1">
                {(
                  [
                    ["Available", formatCents(creator.wallet.availableCents)],
                    ["Pending", formatCents(creator.wallet.pendingCents)],
                  ] as const
                ).map(([label, value]) => (
                  <span key={label} className="min-w-[110px] flex-1">
                    <span className="block text-[12px] font-semibold text-slate-400">
                      {label}
                    </span>
                    <span className="mt-[3px] block text-[18px] font-bold tracking-[-0.3px] text-ink">
                      {value}
                    </span>
                  </span>
                ))}
              </div>
            </Card>
          ) : null}

          <Card pad={0}>
            <Label className="block px-5 pb-2 pt-4">Current assignments</Label>
            <AssignmentRows
              rows={creator.currentAssignments}
              empty="Nothing in flight. Assignments show up here as the week fills in."
              showMetrics={false}
            />
          </Card>

          <Card pad={0}>
            <Label className="block px-5 pb-2 pt-4">Recent posts</Label>
            <AssignmentRows
              rows={creator.recentPosts}
              empty="Nothing published yet."
              showMetrics
            />
          </Card>
        </div>
      </div>
    </div>
  );
}
