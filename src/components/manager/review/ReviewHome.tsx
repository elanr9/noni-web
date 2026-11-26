"use client";

import {
  AtSign,
  Check,
  ChevronLeft,
  ChevronRight,
  CircleUserRound,
  Images,
  Music2,
  Play,
  UserRoundPlus,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Children, useState, type ReactNode } from "react";

import type { ThreadMessage } from "@/app/messages/actions";

import { decideApplication } from "@/app/manager/market/actions";
import { Burst } from "@/components/admin/brain/BrainConfirm";

import { ElsewhereStrip } from "@/components/CompanySwitcher";
import { Avatar, Chip, Label, PageHead, Pill } from "@/components/kit";
import type { MarketCreator } from "@/lib/manager/market";

import { ApplicantsLane } from "./ApplicantsLane";
import type {
  AccountQueueItem,
  MusicQueueItem,
  PostQueueItem,
} from "@/lib/manager/review";

/* Review home, ported from the mobile Review tab
   (app/(admin)/(tabs)/index.tsx): Posts | Creators | Music | Accounts
   lanes, one row per waiting item, whole row opens the detail page.
   Creators who applied are accepted or declined right on the row. */


const LANES = ["Posts", "Creators", "Music", "Accounts"] as const;
const SPARKS = ["#1BA6EE", "#22C55E", "#F59E0B", "#EC4899"];
type Lane = (typeof LANES)[number];

function LaneTabs({
  active,
  counts,
  onSelect,
}: {
  active: Lane;
  counts: Record<Lane, number>;
  onSelect: (lane: Lane) => void;
}) {
  return (
    <div className="mb-4 flex shrink-0 items-center gap-1">
      {LANES.map((lane) => {
        const isActive = lane === active;
        return (
          <button
            key={lane}
            type="button"
            onClick={() => onSelect(lane)}
            className={`inline-flex cursor-pointer items-center gap-2 whitespace-nowrap border-none px-[15px] py-[7px] text-[13px] font-bold transition-colors duration-[160ms] ease-om rounded-pill ${
              isActive
                ? "bg-blue-100 text-blue-700"
                : "bg-transparent text-slate-400"
            }`}
          >
            {lane}
            {counts[lane] > 0 ? (
              <span
                className={`inline-flex min-w-[20px] items-center justify-center px-1.5 py-px text-[11px] font-extrabold rounded-pill ${
                  isActive ? "bg-blue-500 text-white" : "bg-fill-quiet text-slate-500"
                }`}
              >
                {counts[lane]}
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}

function QueueRow({
  href,
  name,
  title,
  meta,
  chip,
}: {
  href: string;
  name: string;
  title: string;
  meta: string;
  chip?: ReactNode;
}) {
  return (
    <Link
      href={href}
      className="group flex items-center gap-3.5 border border-line bg-white p-4 shadow-card rounded-ops-md transition-[transform,box-shadow,border-color] duration-200 ease-om hover:-translate-y-[3px] hover:border-blue-300 hover:shadow-raised"
    >
      <Avatar name={name} size={40} />
      <span className="min-w-0 flex-1">
        <span className="block overflow-hidden text-ellipsis whitespace-nowrap text-[14px] font-bold text-ink">
          {title}
        </span>
        <span className="mt-[3px] block overflow-hidden text-ellipsis whitespace-nowrap text-[12.5px] font-semibold text-slate-400">
          {meta}
        </span>
      </span>
      {chip}
      <ChevronRight
        size={15}
        className="shrink-0 text-blue-700 opacity-0 transition-opacity duration-[160ms] ease-om group-hover:opacity-100"
      />
    </Link>
  );
}

function AccountQueueRow({ row }: { row: AccountQueueItem }) {
  const sentBack = row.status === "needs_changes";
  return (
    <QueueRow
      href={`/manager/accounts/${row.accountId}`}
      name={row.creatorName}
      title={row.creatorName}
      meta={[
        row.tiktokHandle ? `@${row.tiktokHandle}` : "No TikTok handle",
        row.instagramHandle ? `@${row.instagramHandle}` : "No Instagram handle",
        sentBack && row.reason ? row.reason : `Submitted ${row.ageLabel}`,
      ].join(" · ")}
      chip={
        <span className="flex shrink-0 items-center gap-2">
          <span className="inline-flex h-9 w-7 items-center justify-center bg-blue-100 rounded-[9px]">
            <AtSign size={13} className="text-blue-700" />
          </span>
          {sentBack ? (
            <Chip tone="amber">Sent back</Chip>
          ) : (
            <Chip tone="slate">Pending</Chip>
          )}
        </span>
      }
    />
  );
}

/* An empty lane fills the page: one mark, two words, one thing to do. */
function EmptyLane({
  icon: Icon,
  title,
  tone = "blue",
  action,
  href,
}: {
  icon: LucideIcon;
  title: string;
  tone?: "blue" | "green";
  action?: string;
  href?: string;
}) {
  const router = useRouter();
  return (
    <div className="flex min-h-[340px] flex-1 flex-col items-center justify-center gap-5 border border-line bg-white shadow-card rounded-ops-md">
      <span
        className={`flex h-[76px] w-[76px] animate-om-bounce items-center justify-center rounded-full ${
          tone === "green" ? "bg-green-soft text-green" : "bg-blue-100 text-blue-600"
        }`}
      >
        <Icon size={34} strokeWidth={2.4} />
      </span>
      <span className="text-[22px] font-extrabold tracking-[-0.3px] text-ink">{title}</span>
      {action && href ? (
        <Pill icon={ChevronRight} onClick={() => router.push(href)}>
          {action}
        </Pill>
      ) : null}
    </div>
  );
}

const ROWS = 6;

/* A lane never scrolls: six rows, then the next page. */
function Paged({ children }: { children: ReactNode }) {
  const rows = Children.toArray(children);
  const [page, setPage] = useState(0);
  const pages = Math.max(1, Math.ceil(rows.length / ROWS));
  const at = Math.min(page, pages - 1);
  return (
    <div className="flex min-h-0 flex-1 flex-col gap-2.5">
      {rows.slice(at * ROWS, at * ROWS + ROWS)}
      {pages > 1 ? (
        <div className="mt-auto flex shrink-0 items-center justify-center gap-3 pt-1">
          <button
            type="button"
            aria-label="Previous"
            disabled={at === 0}
            onClick={() => setPage(at - 1)}
            className="flex h-9 w-9 cursor-pointer items-center justify-center border border-line bg-white text-ink rounded-pill disabled:cursor-default disabled:opacity-30"
          >
            <ChevronLeft size={16} />
          </button>
          <span className="text-[12.5px] font-bold tabular-nums text-slate-400">
            {at + 1} of {pages}
          </span>
          <button
            type="button"
            aria-label="Next"
            disabled={at >= pages - 1}
            onClick={() => setPage(at + 1)}
            className="flex h-9 w-9 cursor-pointer items-center justify-center border border-line bg-white text-ink rounded-pill disabled:cursor-default disabled:opacity-30"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      ) : null}
    </div>
  );
}

export function ReviewHome({
  posts,
  music,
  accounts,
  applicants = [],
  wanted = [],
  sampleThread,
  startTalking,
}: {
  posts: PostQueueItem[];
  music: MusicQueueItem[];
  accounts: AccountQueueItem[];
  applicants?: MarketCreator[];
  /** Niches the campaign asked for, to mark the ones a creator shares. */
  wanted?: string[];
  /** Fixed messages for the /internal preview. */
  sampleThread?: ThreadMessage[];
  startTalking?: boolean;
}) {
  const [lane, setLane] = useState<Lane>(posts.length === 0 && applicants.length > 0 ? "Creators" : "Posts");
  const [waiting, setWaiting] = useState(applicants);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const decide = async (c: MarketCreator, accept: boolean) => {
    if (!c.application_id || busyId) return;
    setBusyId(c.creator_id);
    setError(null);
    const r = await decideApplication(c.application_id, accept);
    setBusyId(null);
    if (!r.ok) {
      setError(r.error);
      return;
    }
    setWaiting((all) => all.filter((x) => x.creator_id !== c.creator_id));
    setToast(accept ? `${c.full_name?.split(" ")[0] ?? "They"} joined` : "Declined");
    window.setTimeout(() => setToast(null), 1800);
  };

  const pendingAccounts = accounts.filter((a) => a.status !== "needs_changes");
  const sentBackAccounts = accounts.filter((a) => a.status === "needs_changes");

  const total = posts.length + waiting.length + music.length + pendingAccounts.length;
  return (
    <div className="flex flex-col lg:h-[calc(100dvh-120px)] lg:min-h-[560px]">
      <PageHead title="Review" right={total > 0 ? <Chip tone="blue">{total} waiting</Chip> : null} />
      <ElsewhereStrip />

      <LaneTabs
        active={lane}
        counts={{
          Posts: posts.length,
          Creators: waiting.length,
          Music: music.length,
          Accounts: pendingAccounts.length,
        }}
        onSelect={setLane}
      />

      {lane === "Posts" ? (
        posts.length === 0 ? (
          <EmptyLane icon={Check} tone="green" title="All caught up" action="Open briefs" href="/manager/briefs" />
        ) : (
          <Paged>
            {posts.map((row) => (
              <QueueRow
                key={row.assignmentId}
                href={`/manager/review/${row.assignmentId}`}
                name={row.creatorName}
                title={row.briefTitle}
                meta={[
                  row.creatorName,
                  row.lengthLabel,
                  row.unitCount !== null
                    ? `${row.unitCount} ${row.format === "video" ? "clips" : "slides"}`
                    : null,
                  row.ageLabel,
                ]
                  .filter(Boolean)
                  .join(" · ")}
                chip={
                  <span className="flex shrink-0 items-center gap-2">
                    <span className="inline-flex h-9 w-7 items-center justify-center bg-blue-100 rounded-[9px]">
                      {row.format === "video" ? (
                        <Play size={13} className="text-blue-700" />
                      ) : (
                        <Images size={13} className="text-blue-700" />
                      )}
                    </span>
                    {row.attempt > 1 ? (
                      <Chip tone="amber">Take {row.attempt}</Chip>
                    ) : null}
                  </span>
                }
              />
            ))}
          </Paged>
        )
      ) : lane === "Creators" ? (
        waiting.length === 0 ? (
          <EmptyLane icon={UserRoundPlus} title="No one waiting" action="Find creators" href="/manager/scout" />
        ) : (
          <>
            {error ? <span className="mb-2 shrink-0 text-[13px] font-semibold text-danger">{error}</span> : null}
            <ApplicantsLane
              applicants={waiting}
              busyId={busyId}
              wanted={wanted}
              sampleThread={sampleThread}
              startTalking={startTalking}
              onDecide={(c, accept) => void decide(c, accept)}
            />
          </>
        )
      ) : lane === "Music" ? (
        music.length === 0 ? (
          <EmptyLane icon={Music2} title="No songs waiting" />
        ) : (
          <Paged>
            {music.map((row) => (
              <QueueRow
                key={row.assignmentId}
                href={`/manager/music/${row.assignmentId}`}
                name={row.creatorName}
                title={row.briefTitle}
                meta={[
                  row.creatorName,
                  row.slideCount !== null ? `${row.slideCount} slides` : null,
                  row.liveAgeLabel !== null ? `Live ${row.liveAgeLabel}` : null,
                  `Marked added ${row.ageLabel}`,
                ]
                  .filter(Boolean)
                  .join(" · ")}
                chip={
                  <span className="inline-flex h-9 w-7 shrink-0 items-center justify-center bg-blue-100 rounded-[9px]">
                    <Music2 size={13} className="text-blue-700" />
                  </span>
                }
              />
            ))}
          </Paged>
        )
      ) : accounts.length === 0 ? (
        <EmptyLane icon={CircleUserRound} title="No accounts waiting" />
      ) : (
        <div className="flex flex-col gap-2.5">
          {pendingAccounts.map((row) => (
            <AccountQueueRow key={row.accountId} row={row} />
          ))}
          {sentBackAccounts.length > 0 ? (
            <>
              <Label className="mt-2.5 block">Sent back</Label>
              {sentBackAccounts.map((row) => (
                <AccountQueueRow key={row.accountId} row={row} />
              ))}
            </>
          ) : null}
        </div>
      )}

      {toast ? (
        <div className="pointer-events-none fixed bottom-8 left-1/2 z-50 -translate-x-1/2 animate-om-pop">
          <div className="relative flex items-center gap-2 rounded-full bg-ink px-5 py-2.5 text-[14px] font-extrabold text-white shadow-lg">
            <Check size={16} />
            {toast}
            <Burst colors={SPARKS} count={10} reach={40} />
          </div>
        </div>
      ) : null}
    </div>
  );
}
