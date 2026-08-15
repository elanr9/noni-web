"use client";

import {
  ArrowUpRight,
  AtSign,
  Check,
  ChevronLeft,
  ChevronRight,
  Music2,
  Send,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Card, Label, Modal, PageHead, Pill } from "@/components/kit";
import {
  approveMusicAction,
  requestMusicChangesAction,
} from "@/app/manager/music/actions";
import type { MusicApprovalDetail } from "@/lib/manager/review";

/* Music approval, ported from app/(admin)/music/[id].tsx. Accepting the
   song unlocks the post's earnings; sending it back clears the creator's
   music mark and drops the reasons into the review thread. */

const CHANGE_REASONS = [
  "Song is not on the post",
  "Different song than the brief",
  "Only added on one platform",
];

type Phase = "review" | "approved" | "sent";

function LivePostLink({
  icon,
  label,
  handle,
  url,
}: {
  icon: React.ReactNode;
  label: string;
  handle: string | null;
  url: string | null;
}) {
  const inner = (
    <>
      {icon}
      <span className="flex-1 text-[13px] font-bold text-ink">{label}</span>
      {handle !== null && handle.length > 0 ? (
        <span className="text-[12px] font-semibold text-slate-400">@{handle}</span>
      ) : null}
      <ArrowUpRight size={15} className="shrink-0 text-slate-300" />
    </>
  );
  const frame =
    "flex items-center gap-3 border border-line bg-white px-4 py-3.5 shadow-card rounded-ops-md";
  if (url === null) {
    return <div className={`${frame} opacity-55`}>{inner}</div>;
  }
  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      className={`${frame} transition-[border-color] duration-[160ms] ease-om hover:border-blue-300`}
    >
      {inner}
    </a>
  );
}

function DoneCard({ title, body }: { title: string; body: string }) {
  return (
    <Card pad={0} className="mx-auto mt-10 flex max-w-[420px] flex-col items-center gap-3 px-7 py-12 text-center">
      <span className="inline-flex h-12 w-12 items-center justify-center bg-green-soft rounded-pill">
        <Check size={20} className="text-green" />
      </span>
      <span className="text-[17px] font-bold text-ink">{title}</span>
      <span className="text-[13px] font-semibold leading-relaxed text-slate-400">
        {body}
      </span>
      <Link
        href="/manager"
        className="mt-2 inline-flex bg-blue-500 px-[22px] py-3 text-[14.5px] font-bold text-white shadow-accent rounded-pill"
      >
        Back to Review
      </Link>
    </Card>
  );
}

export function MusicApprovalView({
  detail,
}: {
  detail: MusicApprovalDetail | null;
}) {
  const router = useRouter();
  const [slideIndex, setSlideIndex] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [phase, setPhase] = useState<Phase>("review");
  const [reqOpen, setReqOpen] = useState(false);
  const [reasons, setReasons] = useState<string[]>([]);
  const [note, setNote] = useState("");

  if (!detail) {
    return (
      <div>
        <PageHead title="Music approval" onBack={() => router.push("/manager")} />
        <Card pad={0} className="flex flex-col items-center gap-3 px-6 py-14 text-center">
          <span className="text-[14.5px] font-bold text-ink">Nothing waiting here</span>
          <span className="text-[13px] font-semibold text-slate-400">
            This post is not in the music queue anymore.
          </span>
          <Link
            href="/manager"
            className="mt-1 inline-flex bg-fill-quiet px-[18px] py-2.5 text-[13px] font-bold text-ink rounded-pill"
          >
            Back to Review
          </Link>
        </Card>
      </div>
    );
  }

  const short = detail.creatorName.split(" ")[0] || "Creator";
  const canSend = reasons.length > 0 || note.trim().length > 0;

  const toggleReason = (reason: string) => {
    setReasons((prev) =>
      prev.includes(reason) ? prev.filter((r) => r !== reason) : [...prev, reason],
    );
  };

  const closeRequest = () => {
    setReqOpen(false);
    setReasons([]);
    setNote("");
  };

  const approve = async () => {
    setBusy(true);
    setError(null);
    const result = await approveMusicAction(detail.assignmentId);
    setBusy(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setPhase("approved");
    router.refresh();
  };

  const sendBack = async () => {
    setBusy(true);
    setError(null);
    const result = await requestMusicChangesAction({
      assignmentId: detail.assignmentId,
      reasons,
      note: note.trim().length > 0 ? note.trim() : null,
    });
    setBusy(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setReqOpen(false);
    setPhase("sent");
    router.refresh();
  };

  if (phase === "approved") {
    return (
      <DoneCard
        title="Song approved"
        body={`Earnings for this post are unlocked. ${short} sees it in their wallet tonight.`}
      />
    );
  }
  if (phase === "sent") {
    return (
      <DoneCard
        title="Sent back"
        body={`${short} sees your notes and fixes the song on the live post. It lands back in this queue when they mark it added again.`}
      />
    );
  }

  return (
    <div>
      <PageHead
        title="Music approval"
        sub={`${detail.creatorName} · Live ${detail.liveAgeLabel}`}
        onBack={() => router.push("/manager")}
      />

      <div className="grid gap-6 md:grid-cols-[minmax(0,340px)_minmax(0,1fr)]">
        <div className="mx-auto w-full max-w-[340px]">
          <div className="relative flex aspect-[9/16] w-full items-center justify-center overflow-hidden bg-gradient-to-br from-blue-100 to-line-strong shadow-media rounded-ops-md">
            <p className="m-0 px-8 text-center text-[17px] font-extrabold leading-snug tracking-[-0.3px] text-ink">
              {detail.slides[slideIndex] ?? ""}
            </p>
            <div className="absolute left-0 right-0 top-3.5 flex items-center justify-center gap-[5px]">
              {detail.slides.map((_, i) => (
                <span
                  key={i}
                  className={`h-1.5 rounded-pill ${
                    i === slideIndex ? "w-[18px] bg-ink" : "w-1.5 bg-slate-300"
                  }`}
                />
              ))}
            </div>
            <span className="absolute bottom-3 left-3 inline-flex items-center gap-1.5 bg-white/90 px-2.5 py-1 text-[11px] font-bold text-ink rounded-pill">
              Slideshow
            </span>
            {slideIndex > 0 ? (
              <button
                type="button"
                aria-label="Previous slide"
                onClick={() => setSlideIndex(slideIndex - 1)}
                className="absolute left-2.5 top-1/2 inline-flex h-8 w-8 -translate-y-1/2 cursor-pointer items-center justify-center border-none bg-white/85 shadow-card rounded-pill"
              >
                <ChevronLeft size={16} className="text-ink" />
              </button>
            ) : null}
            {slideIndex < detail.slides.length - 1 ? (
              <button
                type="button"
                aria-label="Next slide"
                onClick={() => setSlideIndex(slideIndex + 1)}
                className="absolute right-2.5 top-1/2 inline-flex h-8 w-8 -translate-y-1/2 cursor-pointer items-center justify-center border-none bg-white/85 shadow-card rounded-pill"
              >
                <ChevronRight size={16} className="text-ink" />
              </button>
            ) : null}
          </div>
        </div>

        <div className="flex min-w-0 flex-col gap-2.5 self-start">
          <Label>Check the live post</Label>
          <LivePostLink
            icon={<Music2 size={17} className="shrink-0 text-slate-500" />}
            label="Open on TikTok"
            handle={detail.tiktokHandle}
            url={detail.tiktokUrl}
          />
          <LivePostLink
            icon={<AtSign size={17} className="shrink-0 text-slate-500" />}
            label="Open on Instagram"
            handle={detail.instagramHandle}
            url={detail.instagramUrl}
          />
          <p className="m-0 mt-1 text-[12px] font-semibold leading-relaxed text-slate-400">
            Approving unlocks this post&apos;s earnings. Videos never enter this
            queue.
          </p>

          <div className="mt-3 flex gap-2.5">
            <Pill
              variant="quiet"
              onClick={() => setReqOpen(true)}
              disabled={busy}
              className="flex-1"
            >
              Request Changes
            </Pill>
            <Pill
              icon={Check}
              onClick={() => void approve()}
              disabled={busy}
              className="flex-[1.2]"
            >
              Accept Song
            </Pill>
          </div>
          {error !== null ? (
            <p className="m-0 text-[12.5px] font-semibold text-danger">{error}</p>
          ) : null}
        </div>
      </div>

      {reqOpen ? (
        <Modal title="Request changes" onClose={closeRequest} width={460}>
          <p className="m-0 mb-4 text-[13px] font-semibold text-slate-400">
            Goes to {short}
          </p>
          <div className="flex flex-col gap-2">
            {CHANGE_REASONS.map((reason) => {
              const selected = reasons.includes(reason);
              return (
                <button
                  key={reason}
                  type="button"
                  onClick={() => toggleReason(reason)}
                  className={`flex cursor-pointer items-center gap-3 border bg-white px-3.5 py-3 text-left text-[13px] font-semibold rounded-ops-sm transition-colors duration-[160ms] ease-om ${
                    selected ? "border-blue-500 text-ink" : "border-line text-slate-500"
                  }`}
                >
                  <span
                    className={`inline-flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-[6px] border ${
                      selected
                        ? "border-blue-500 bg-blue-500"
                        : "border-line-strong bg-white"
                    }`}
                  >
                    {selected ? <Check size={12} className="text-white" /> : null}
                  </span>
                  {reason}
                </button>
              );
            })}
          </div>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Anything specific, in your words"
            className="mt-3 min-h-[84px] w-full resize-y border border-line bg-white px-3.5 py-3 text-[13px] font-semibold text-ink outline-none rounded-ops-sm focus:border-blue-500"
          />
          <div className="mt-5 flex justify-end gap-2.5">
            <Pill variant="ghost" onClick={closeRequest} disabled={busy}>
              Cancel
            </Pill>
            <Pill
              icon={Send}
              onClick={() => void sendBack()}
              disabled={!canSend || busy}
            >
              Send back
            </Pill>
          </div>
        </Modal>
      ) : null}
    </div>
  );
}
