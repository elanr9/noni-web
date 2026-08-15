"use client";

import {
  AtSign,
  ChevronRight,
  CircleUserRound,
  Images,
  Inbox,
  Music2,
  Play,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { useState, type ReactNode } from "react";

import { Avatar, Card, Chip, PageHead } from "@/components/kit";
import type {
  AccountQueueItem,
  MusicQueueItem,
  PostQueueItem,
} from "@/lib/manager/review";

/* Review home, ported from the mobile Review tab
   (app/(admin)/(tabs)/index.tsx): Posts | Music | Accounts lanes, one row
   per waiting item, whole row opens the detail page. */

const SUBTITLE_DEFAULT = "Approve posts and they will be posted automatically!";
const SUBTITLE_ONE_LEFT = "One to clear, then you're done for today.";
const SUBTITLE_CLEARED =
  "Everything is cleared. Creators are recording the rest of the week.";
const FOOTER_NOTE =
  "Reject a single clip and only that clip goes back. The rest stay approved.";
const MUSIC_INTRO =
  "Slideshows only. Open the post, check the song is on it, approve. Approval unlocks that post's earnings.";

const LANES = ["Posts", "Music", "Accounts"] as const;
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
    <div className="mb-4 flex items-center gap-1">
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
            <span
              className={`inline-flex min-w-[20px] items-center justify-center px-1.5 py-px text-[11px] font-extrabold rounded-pill ${
                isActive ? "bg-white text-blue-700" : "bg-fill-quiet text-slate-400"
              }`}
            >
              {counts[lane]}
            </span>
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

function EmptyLane({
  icon: Icon,
  title,
  body,
}: {
  icon: LucideIcon;
  title: string;
  body: string;
}) {
  return (
    <Card pad={0} className="flex flex-col items-center gap-2.5 px-6 py-12 text-center">
      <span className="inline-flex h-11 w-11 items-center justify-center bg-fill-quiet rounded-pill">
        <Icon size={19} className="text-slate-400" />
      </span>
      <span className="text-[14.5px] font-bold text-ink">{title}</span>
      <span className="max-w-[380px] text-[13px] font-semibold leading-relaxed text-slate-400">
        {body}
      </span>
    </Card>
  );
}

export function ReviewHome({
  posts,
  music,
  accounts,
}: {
  posts: PostQueueItem[];
  music: MusicQueueItem[];
  accounts: AccountQueueItem[];
}) {
  const [lane, setLane] = useState<Lane>("Posts");

  const total = posts.length + music.length + accounts.length;
  const subtitle =
    total === 0
      ? SUBTITLE_CLEARED
      : total === 1
        ? SUBTITLE_ONE_LEFT
        : SUBTITLE_DEFAULT;

  return (
    <div>
      <PageHead
        title="Review"
        sub={subtitle}
        right={
          total === 0 ? (
            <Chip tone="green">All clear</Chip>
          ) : (
            <Chip tone="blue">{total} waiting</Chip>
          )
        }
      />

      <LaneTabs
        active={lane}
        counts={{
          Posts: posts.length,
          Music: music.length,
          Accounts: accounts.length,
        }}
        onSelect={setLane}
      />

      {lane === "Posts" ? (
        posts.length === 0 ? (
          <EmptyLane
            icon={Inbox}
            title="Nothing to review"
            body="Creators are recording this week's posts. New submissions land here, newest first."
          />
        ) : (
          <div className="flex flex-col gap-2.5">
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
            <p className="m-0 mt-1 px-0.5 text-[12px] font-semibold leading-relaxed text-slate-400">
              {FOOTER_NOTE}
            </p>
          </div>
        )
      ) : lane === "Music" ? (
        music.length === 0 ? (
          <EmptyLane
            icon={Music2}
            title="No songs waiting"
            body="Creators tap Music added once the track is on a live slideshow. It lands here."
          />
        ) : (
          <div className="flex flex-col gap-2.5">
            <p className="m-0 mb-1 px-0.5 text-[12px] font-semibold leading-relaxed text-slate-500">
              {MUSIC_INTRO}
            </p>
            {music.map((row) => (
              <QueueRow
                key={row.assignmentId}
                href={`/manager/music/${row.assignmentId}`}
                name={row.creatorName}
                title={row.briefTitle}
                meta={[
                  row.creatorName,
                  row.slideCount !== null ? `${row.slideCount} slides` : null,
                  `Marked ${row.ageLabel}`,
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
          </div>
        )
      ) : accounts.length === 0 ? (
        <EmptyLane
          icon={CircleUserRound}
          title="No accounts to approve"
          body="Every creator on the roster is linked. New creators show up here after they upload their warm up proof."
        />
      ) : (
        <div className="flex flex-col gap-2.5">
          {accounts.map((row) => (
            <QueueRow
              key={row.accountId}
              href={`/manager/accounts/${row.accountId}`}
              name={row.creatorName}
              title={row.creatorName}
              meta={[
                row.tiktokHandle ? `@${row.tiktokHandle}` : null,
                row.instagramHandle ? `@${row.instagramHandle}` : null,
                `Submitted ${row.ageLabel}`,
              ]
                .filter(Boolean)
                .join(" · ")}
              chip={
                <span className="flex shrink-0 items-center gap-2">
                  <span className="inline-flex h-9 w-7 items-center justify-center bg-blue-100 rounded-[9px]">
                    <AtSign size={13} className="text-blue-700" />
                  </span>
                  <Chip tone="slate">Pending</Chip>
                </span>
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}
