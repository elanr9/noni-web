"use client";

/* Make a post from a library row, porting the mobile MakePostSheet. Loads
   the week being planned, lists its empty slots by lane, and a click on a
   slot generates straight into it. Slots that have no type yet ask for one
   first, limited to the slot's lane. */
import { ChevronRight, Images, Loader2, Play } from "lucide-react";
import { useEffect, useState } from "react";

import { loadMakeTargets } from "@/app/manager/library/actions";
import { Chip, Modal, Pill } from "@/components/kit";
import {
  briefWeekRangeLabel,
  type BriefFormat,
  type BriefWeekSummary,
  type PostType,
} from "@/components/manager/briefs/lib";
import type { EmptyWeekSlot } from "@/lib/manager/library";

import { SubTabs } from "./SubTabs";

/** The slot and type the post is generated into. */
export interface MakeTarget {
  week: BriefWeekSummary;
  slot: EmptyWeekSlot;
  postType: PostType;
}

export interface MakePostModalProps {
  sourceLabel: string;
  /** The source's own type, when known, so a typed slot is the only choice left. */
  preferredFamily: BriefFormat | null;
  /** True while the post generates; the modal locks until it finishes. */
  busy: boolean;
  onPick: (target: MakeTarget) => void;
  onOpenWeek: (campaignId: string) => void;
  onClose: () => void;
}

function FormatChip({ family }: { family: BriefFormat }) {
  return family === "photo_carousel" ? (
    <Chip>
      <Images size={12} /> Slideshow
    </Chip>
  ) : (
    <Chip>
      <Play size={12} /> Reel
    </Chip>
  );
}

function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

export function MakePostModal({
  sourceLabel,
  preferredFamily,
  busy,
  onPick,
  onOpenWeek,
  onClose,
}: MakePostModalProps) {
  const [week, setWeek] = useState<BriefWeekSummary | null>(null);
  const [slots, setSlots] = useState<EmptyWeekSlot[]>([]);
  const [postTypes, setPostTypes] = useState<PostType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lane, setLane] = useState<BriefFormat>("video");
  const [typeFor, setTypeFor] = useState<EmptyWeekSlot | null>(null);
  const [busyKey, setBusyKey] = useState<string | null>(null);

  useEffect(() => {
    let live = true;
    loadMakeTargets().then((result) => {
      if (!live) return;
      setLoading(false);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setWeek(result.week);
      setSlots(result.slots);
      setPostTypes(result.postTypes);
      const hasVideo = result.slots.some((s) => s.family === "video");
      const hasSlides = result.slots.some((s) => s.family === "photo_carousel");
      setLane(
        preferredFamily && result.slots.some((s) => s.family === preferredFamily)
          ? preferredFamily
          : hasVideo || !hasSlides
            ? "video"
            : "photo_carousel",
      );
    });
    return () => {
      live = false;
    };
  }, [preferredFamily]);

  const activeBusyKey = busy ? busyKey : null;

  function pickSlot(slot: EmptyWeekSlot) {
    if (!week || busy) return;
    if (slot.postType) {
      setBusyKey(slot.briefId);
      onPick({ week, slot, postType: slot.postType });
      return;
    }
    setTypeFor(slot);
  }

  function pickType(postType: PostType) {
    if (!week || !typeFor || busy) return;
    setBusyKey(postType.id);
    onPick({ week, slot: typeFor, postType });
  }

  function close() {
    if (busy) return;
    if (typeFor !== null) {
      setTypeFor(null);
      return;
    }
    onClose();
  }

  const laneSlots = slots.filter((s) => s.family === lane);
  const videoCount = slots.filter((s) => s.family === "video").length;
  const slideCount = slots.filter((s) => s.family === "photo_carousel").length;
  const laneTypes = postTypes.filter(
    (t) => (t.family === "photo_carousel" ? "photo_carousel" : "video") === lane,
  );

  const weekLabel = week
    ? `Week ${week.weekNumber}, ${
        week.campaign.drop_date ? briefWeekRangeLabel(week.campaign.drop_date) : "not scheduled"
      }`
    : null;
  const subtitle =
    typeFor !== null
      ? `${lane === "photo_carousel" ? "Slideshow" : "Reel"} ${pad2(typeFor.laneIndex)} has no type yet. Pick one and the post generates.`
      : weekLabel
        ? `From ${sourceLabel}. Goes into ${weekLabel}. Pick the empty slot it fills.`
        : `From ${sourceLabel}.`;

  const rowClass = (isBusy: boolean) =>
    `flex w-full cursor-pointer items-center gap-2.5 border-none bg-transparent px-3.5 py-2.5 text-left min-h-[56px] ${
      isBusy ? "bg-blue-50" : busy ? "opacity-45" : "hover:bg-fill-quiet"
    }`;

  return (
    <Modal title="Make a post" onClose={close} width={520}>
      <p className="mb-4 mt-0 text-[13.5px] font-semibold leading-normal text-slate-500">
        {subtitle}
      </p>
      {loading ? (
        <div className="flex justify-center py-8">
          <Loader2 size={20} className="animate-spin text-blue-500" />
        </div>
      ) : error !== null ? (
        <p className="m-0 text-[13.5px] font-semibold text-slate-500">{error}</p>
      ) : week === null ? (
        <div className="flex flex-col items-start gap-2 py-2">
          <p className="m-0 text-[16px] font-bold text-ink">No week to fill yet</p>
          <p className="m-0 text-[13.5px] font-semibold text-slate-500">
            Start a week in Briefs, then make posts into it from here.
          </p>
        </div>
      ) : slots.length === 0 ? (
        <div className="flex flex-col items-start gap-2 py-2">
          <p className="m-0 text-[16px] font-bold text-ink">This week is full</p>
          <p className="m-0 text-[13.5px] font-semibold text-slate-500">
            Every slot already has a post. Add a slot in Briefs.
          </p>
          <Pill variant="tint" size="sm" onClick={() => onOpenWeek(week.campaign.id)}>
            Open the week
          </Pill>
        </div>
      ) : typeFor !== null ? (
        <div className="overflow-hidden border border-line bg-white rounded-ops-md">
          {laneTypes.map((t, i) => {
            const isBusy = activeBusyKey === t.id;
            return (
              <button
                key={t.id}
                type="button"
                disabled={busy}
                onClick={() => pickType(t)}
                className={`${rowClass(isBusy)} ${i < laneTypes.length - 1 ? "border-b border-line" : ""}`}
              >
                <Chip tone="slate">{t.label}</Chip>
                <span className="flex-1" />
                <FormatChip family={lane} />
                {isBusy ? <Loader2 size={14} className="animate-spin text-blue-600" /> : null}
              </button>
            );
          })}
          {laneTypes.length === 0 ? (
            <p className="m-0 p-3.5 text-[13.5px] font-semibold text-slate-500">
              No post types set up for this lane.
            </p>
          ) : null}
        </div>
      ) : (
        <>
          <SubTabs<BriefFormat>
            items={[
              { id: "video", label: "Reels", count: videoCount },
              { id: "photo_carousel", label: "Slideshows", count: slideCount },
            ]}
            value={lane}
            onChange={(next) => {
              if (!busy) setLane(next);
            }}
          />
          <div className="mt-2.5 overflow-hidden border border-line bg-white rounded-ops-md">
            {laneSlots.map((slot, i) => {
              const isBusy = activeBusyKey === slot.briefId;
              return (
                <button
                  key={slot.briefId}
                  type="button"
                  disabled={busy}
                  onClick={() => pickSlot(slot)}
                  className={`${rowClass(isBusy)} ${i < laneSlots.length - 1 ? "border-b border-line" : ""}`}
                >
                  <span className="w-[26px] text-[12px] font-extrabold tabular-nums text-slate-400">
                    {pad2(slot.laneIndex)}
                  </span>
                  <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                    <span className="text-[13.5px] font-bold text-ink">Empty slot</span>
                    <span className="text-[11.5px] font-semibold text-slate-400">
                      {slot.postType ? "Type set, generates on click" : "Pick a type next"}
                    </span>
                  </span>
                  {slot.postType ? (
                    <Chip tone="slate">{slot.postType.label}</Chip>
                  ) : (
                    <FormatChip family={slot.family} />
                  )}
                  {isBusy ? (
                    <Loader2 size={14} className="animate-spin text-blue-600" />
                  ) : (
                    <ChevronRight size={16} className="text-slate-300" />
                  )}
                </button>
              );
            })}
            {laneSlots.length === 0 ? (
              <p className="m-0 p-3.5 text-[13.5px] font-semibold text-slate-500">
                {lane === "photo_carousel"
                  ? "No empty slideshow slots this week."
                  : "No empty reel slots this week."}
              </p>
            ) : null}
          </div>
        </>
      )}
    </Modal>
  );
}
