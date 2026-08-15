"use client";

import {
  Check,
  ChevronLeft,
  ChevronRight,
  Images,
  MessageCircle,
  Send,
  X,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Card, Chip, Label, Modal, PageHead, Pill } from "@/components/kit";
import { reviewPost } from "@/app/manager/review/actions";
import type { PostReviewDetail, ReviewSection } from "@/lib/manager/review";

/* Post review, ported from the mobile review screen and RevisionMode
   (components/admin/review/RevisionMode.tsx): approve posts the finished
   edit, request changes collects notes per spoken section (or whole post
   notes) and flattens them to `Label: text` blocks. */

type Phase = "review" | "approved" | "sent";
type NoteMode = "Section by section" | "Whole post";

function firstName(name: string): string {
  return name.trim().split(/\s+/)[0] || name;
}

function SlidePager({
  slides,
  hasScreenshot,
}: {
  slides: string[];
  hasScreenshot: boolean[];
}) {
  const [index, setIndex] = useState(0);
  return (
    <div className="relative flex aspect-[9/16] w-full items-center justify-center overflow-hidden bg-gradient-to-br from-blue-100 to-line-strong rounded-ops-md">
      <p className="m-0 px-8 text-center text-[17px] font-extrabold leading-snug tracking-[-0.3px] text-ink">
        {slides[index] ?? ""}
      </p>
      <div className="absolute left-0 right-0 top-3.5 flex items-center justify-center gap-[5px]">
        {slides.map((_, i) => (
          <span
            key={i}
            className={`h-1.5 rounded-pill ${
              i === index ? "w-[18px] bg-ink" : "w-1.5 bg-slate-300"
            }`}
          />
        ))}
      </div>
      {hasScreenshot[index] ? (
        <span className="absolute bottom-3 left-3 inline-flex items-center gap-1.5 bg-white/90 px-2.5 py-1 text-[11px] font-bold text-ink rounded-pill">
          <Images size={12} /> Screenshot slide
        </span>
      ) : null}
      {index > 0 ? (
        <button
          type="button"
          aria-label="Previous slide"
          onClick={() => setIndex(index - 1)}
          className="absolute left-2.5 top-1/2 inline-flex h-8 w-8 -translate-y-1/2 cursor-pointer items-center justify-center border-none bg-white/85 shadow-card rounded-pill"
        >
          <ChevronLeft size={16} className="text-ink" />
        </button>
      ) : null}
      {index < slides.length - 1 ? (
        <button
          type="button"
          aria-label="Next slide"
          onClick={() => setIndex(index + 1)}
          className="absolute right-2.5 top-1/2 inline-flex h-8 w-8 -translate-y-1/2 cursor-pointer items-center justify-center border-none bg-white/85 shadow-card rounded-pill"
        >
          <ChevronRight size={16} className="text-ink" />
        </button>
      ) : null}
    </div>
  );
}

function RequestChangesModal({
  creatorShort,
  postTitle,
  sections,
  busy,
  onCancel,
  onSend,
}: {
  creatorShort: string;
  postTitle: string;
  sections: ReviewSection[];
  busy: boolean;
  onCancel: () => void;
  onSend: (note: string) => void;
}) {
  const [mode, setMode] = useState<NoteMode>("Section by section");
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [openKey, setOpenKey] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [wholeNotes, setWholeNotes] = useState<string[]>([""]);

  const filledWhole = wholeNotes.filter((t) => t.trim().length > 0);
  const count =
    mode === "Section by section" ? Object.keys(notes).length : filledWhole.length;
  const lastWhole = wholeNotes[wholeNotes.length - 1] ?? "";

  /* Notes flattened to `Label: text` blocks, exactly like mobile
     RevisionMode (ReviewThread parses this). */
  const send = () => {
    const note =
      mode === "Section by section"
        ? sections
            .filter((s) => notes[s.key] !== undefined)
            .map((s) => `${s.label}: ${notes[s.key]}`)
            .join("\n\n")
        : filledWhole.map((t) => t.trim()).join("\n\n");
    onSend(note);
  };

  return (
    <Modal title={`What should ${creatorShort} fix?`} onClose={onCancel} width={560}>
      <p className="m-0 mb-4 text-[13px] font-semibold text-slate-400">{postTitle}</p>

      <div className="mb-4 flex gap-1 bg-fill-quiet p-[3px] rounded-pill">
        {(["Section by section", "Whole post"] as const).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => {
              setMode(m);
              setOpenKey(null);
            }}
            className={`inline-flex flex-1 cursor-pointer items-center justify-center whitespace-nowrap border-none px-[13px] py-[7px] text-[12.5px] font-bold transition-colors duration-[160ms] ease-om rounded-pill ${
              mode === m ? "bg-white text-ink shadow-card" : "bg-transparent text-slate-400"
            }`}
          >
            {m}
          </button>
        ))}
      </div>

      {mode === "Section by section" ? (
        <div>
          <p className="m-0 mb-3 text-[12.5px] font-semibold leading-relaxed text-slate-500">
            Note a section and only that section comes back. The rest stay
            approved.
          </p>
          <div className="flex flex-col gap-2">
            {sections.map((section) => {
              const saved = notes[section.key];
              const open = openKey === section.key;
              return (
                <div
                  key={section.key}
                  className={`border bg-white p-3.5 rounded-ops-sm ${
                    saved !== undefined ? "border-blue-300" : "border-line"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span className="min-w-0 flex-1">
                      <Label>{section.label}</Label>
                      <span className="mt-1 block text-[13px] font-semibold leading-relaxed text-ink">
                        {section.text}
                      </span>
                    </span>
                    {!open ? (
                      <button
                        type="button"
                        onClick={() => {
                          setDraft(saved ?? "");
                          setOpenKey(section.key);
                        }}
                        className="shrink-0 cursor-pointer border-none bg-blue-100 px-3 py-1.5 text-[12px] font-bold text-blue-700 rounded-pill"
                      >
                        {saved !== undefined ? "Edit note" : "Add note"}
                      </button>
                    ) : null}
                  </div>
                  {saved !== undefined && !open ? (
                    <div className="mt-2.5 flex items-start gap-2 bg-fill-quiet p-2.5 rounded-ops-sm">
                      <span className="min-w-0 flex-1 text-[12.5px] font-semibold leading-relaxed text-slate-500">
                        {saved}
                      </span>
                      <button
                        type="button"
                        aria-label="Remove note"
                        onClick={() =>
                          setNotes((prev) => {
                            const next = { ...prev };
                            delete next[section.key];
                            return next;
                          })
                        }
                        className="inline-flex h-6 w-6 shrink-0 cursor-pointer items-center justify-center border-none bg-white rounded-pill"
                      >
                        <X size={12} className="text-slate-400" />
                      </button>
                    </div>
                  ) : null}
                  {open ? (
                    <div className="mt-2.5">
                      <textarea
                        autoFocus
                        value={draft}
                        onChange={(e) => setDraft(e.target.value)}
                        placeholder={`What should ${creatorShort} change here`}
                        className="min-h-[76px] w-full resize-y border border-line bg-white px-3 py-2.5 text-[13px] font-semibold text-ink outline-none rounded-ops-sm focus:border-blue-500"
                      />
                      <div className="mt-2 flex justify-end gap-2">
                        <Pill variant="ghost" size="sm" onClick={() => setOpenKey(null)}>
                          Cancel
                        </Pill>
                        <Pill
                          variant="tint"
                          size="sm"
                          disabled={draft.trim().length === 0}
                          onClick={() => {
                            setNotes((prev) => ({
                              ...prev,
                              [section.key]: draft.trim(),
                            }));
                            setOpenKey(null);
                          }}
                        >
                          Save note
                        </Pill>
                      </div>
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div>
          <Label>Notes for the whole post</Label>
          <div className="mt-2.5 flex flex-col gap-2">
            {wholeNotes.map((text, i) => (
              <div key={i} className="relative">
                <textarea
                  value={text}
                  onChange={(e) =>
                    setWholeNotes(wholeNotes.map((t, j) => (j === i ? e.target.value : t)))
                  }
                  placeholder={
                    i === 0
                      ? `What has to change before ${creatorShort} records again`
                      : "Another note"
                  }
                  className="min-h-[76px] w-full resize-y border border-line bg-white py-2.5 pl-3 pr-9 text-[13px] font-semibold text-ink outline-none rounded-ops-sm focus:border-blue-500"
                />
                {wholeNotes.length > 1 ? (
                  <button
                    type="button"
                    aria-label="Remove note"
                    onClick={() => setWholeNotes(wholeNotes.filter((_, j) => j !== i))}
                    className="absolute right-2 top-2 inline-flex h-6 w-6 cursor-pointer items-center justify-center border-none bg-fill-quiet rounded-pill"
                  >
                    <X size={12} className="text-slate-400" />
                  </button>
                ) : null}
              </div>
            ))}
          </div>
          <button
            type="button"
            disabled={lastWhole.trim().length === 0}
            onClick={() => setWholeNotes([...wholeNotes, ""])}
            className={`mt-2.5 inline-flex cursor-pointer items-center gap-1.5 border-none bg-blue-100 px-3.5 py-2 text-[12px] font-bold text-blue-700 rounded-pill ${
              lastWhole.trim().length === 0 ? "pointer-events-none opacity-45" : ""
            }`}
          >
            Add another note
          </button>
        </div>
      )}

      <div className="mt-5 flex justify-end gap-2.5">
        <Pill variant="ghost" onClick={onCancel} disabled={busy}>
          Cancel
        </Pill>
        <Pill icon={Send} onClick={send} disabled={busy || count === 0}>
          {count === 0
            ? "Send back"
            : `Send back · ${count} ${count === 1 ? "note" : "notes"}`}
        </Pill>
      </div>
    </Modal>
  );
}

function DoneCard({
  title,
  body,
}: {
  title: string;
  body: string;
}) {
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

export function PostReviewView({ detail }: { detail: PostReviewDetail | null }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [phase, setPhase] = useState<Phase>("review");
  const [revisionOpen, setRevisionOpen] = useState(false);

  if (!detail) {
    return (
      <div>
        <PageHead title="Review" onBack={() => router.push("/manager")} />
        <Card pad={0} className="flex flex-col items-center gap-3 px-6 py-14 text-center">
          <span className="text-[14.5px] font-bold text-ink">
            Nothing left to review
          </span>
          <span className="text-[13px] font-semibold text-slate-400">
            This post is not in the review queue anymore.
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

  const short = firstName(detail.creatorName);
  const isReel = detail.format === "video";
  const editPending =
    isReel && detail.submissionId !== null && detail.renderStatus !== "ready";
  const editFailed = isReel && detail.renderStatus === "failed";

  const runReview = async (
    action: "approved" | "changes_requested",
    note: string | null,
  ) => {
    if (detail.submissionId === null) {
      setError("This post has no video to review yet.");
      return;
    }
    setBusy(true);
    setError(null);
    const result = await reviewPost({
      assignmentId: detail.assignmentId,
      submissionId: detail.submissionId,
      action,
      note,
    });
    setBusy(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setRevisionOpen(false);
    setPhase(action === "approved" ? "approved" : "sent");
    router.refresh();
  };

  if (phase === "approved") {
    return (
      <DoneCard
        title="Approved and posting"
        body={`The post goes out automatically. ${short} gets notified once it is live.`}
      />
    );
  }
  if (phase === "sent") {
    return (
      <DoneCard
        title={`Sent back to ${short}`}
        body="They see your notes in the app and record a new take. It lands back in this queue."
      />
    );
  }

  return (
    <div>
      <PageHead
        title={detail.briefTitle}
        sub={[
          detail.creatorName,
          detail.tiktokHandle ? `@${detail.tiktokHandle}` : null,
          isReel ? "Reel" : "Slideshow",
          detail.ageLabel,
        ]
          .filter(Boolean)
          .join(" · ")}
        right={
          <span className="flex items-center gap-2">
            {detail.attempt > 1 ? (
              <Chip tone="amber">Take {detail.attempt}</Chip>
            ) : null}
            <Link
              href={`/manager/creators/${detail.creatorId}/chat`}
              className="inline-flex items-center gap-1.5 border border-line bg-white px-3 py-1.5 text-[12.5px] font-bold text-ink rounded-pill transition-colors duration-[160ms] ease-om hover:bg-fill-quiet"
            >
              <MessageCircle size={14} className="text-slate-400" />
              Chat
            </Link>
          </span>
        }
        onBack={() => router.push("/manager")}
      />

      <div className="grid gap-6 md:grid-cols-[minmax(0,340px)_minmax(0,1fr)]">
        <div className="mx-auto w-full max-w-[340px]">
          {isReel ? (
            <div className="relative aspect-[9/16] w-full overflow-hidden bg-ink-900 shadow-media rounded-ops-md">
              {detail.videoUrl !== null ? (
                <video
                  src={detail.videoUrl}
                  controls
                  playsInline
                  className="h-full w-full object-contain"
                />
              ) : null}
              {editPending || detail.videoUrl === null ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2.5 bg-ink-900/90 px-8 text-center">
                  {editFailed ? (
                    <>
                      <span className="text-[14px] font-bold text-white">
                        Edit failed
                      </span>
                      <span className="text-[12.5px] font-semibold leading-relaxed text-slate-400">
                        {detail.renderError ??
                          "Something went wrong while putting this video together."}
                      </span>
                    </>
                  ) : editPending ? (
                    <>
                      <span className="text-[14px] font-bold text-white">
                        Editing the final video
                      </span>
                      <span className="text-[12.5px] font-semibold leading-relaxed text-slate-400">
                        Clips are being stitched and captions added. This can
                        take a couple of minutes. Refresh to check again.
                      </span>
                    </>
                  ) : (
                    <span className="text-[12.5px] font-semibold text-slate-400">
                      No video to review yet.
                    </span>
                  )}
                </div>
              ) : null}
            </div>
          ) : (
            <SlidePager slides={detail.slides} hasScreenshot={detail.hasScreenshot} />
          )}

          <div className="mt-4 flex gap-2.5">
            <Pill
              variant="quiet"
              onClick={() => setRevisionOpen(true)}
              disabled={busy || detail.submissionId === null}
              className="flex-1"
            >
              Request changes
            </Pill>
            <Pill
              icon={Check}
              onClick={() => void runReview("approved", null)}
              disabled={busy || editPending || detail.submissionId === null}
              className="flex-[1.2]"
            >
              Approve
            </Pill>
          </div>
          {error !== null ? (
            <p className="m-0 mt-2.5 text-[12.5px] font-semibold text-danger">
              {error}
            </p>
          ) : null}
        </div>

        <Card pad={22} className="min-w-0 self-start">
          <Label>Brief</Label>
          <h2 className="mb-0 mt-2 text-[17px] font-bold tracking-[-0.3px] text-ink">
            {detail.briefTitle}
          </h2>
          {detail.hook?.trim() ? (
            <p className="mb-0 mt-2 text-[13.5px] font-semibold leading-relaxed text-slate-500">
              {detail.hook}
            </p>
          ) : null}

          {detail.sections.length > 0 ? (
            <div className="mt-5 flex flex-col gap-3">
              {detail.sections.map((section) => (
                <div key={section.key} className="bg-fill-quiet p-3.5 rounded-ops-sm">
                  <Label>{section.label}</Label>
                  <p className="mb-0 mt-1 text-[13px] font-semibold leading-relaxed text-ink">
                    {section.text}
                  </p>
                </div>
              ))}
            </div>
          ) : null}

          {detail.caption.trim() || detail.hashtags.length > 0 ? (
            <div className="mt-5">
              <Label>Caption</Label>
              <p className="mb-0 mt-1 text-[13px] font-semibold leading-relaxed text-slate-500">
                {detail.caption}
                {detail.hashtags.length > 0 ? (
                  <span className="block pt-1 text-blue-700">
                    {detail.hashtags.map((h) => `#${h.replace(/^#/, "")}`).join(" ")}
                  </span>
                ) : null}
              </p>
            </div>
          ) : null}
        </Card>
      </div>

      {revisionOpen ? (
        <RequestChangesModal
          creatorShort={short}
          postTitle={detail.briefTitle}
          sections={detail.sections}
          busy={busy}
          onCancel={() => setRevisionOpen(false)}
          onSend={(note) => void runReview("changes_requested", note)}
        />
      ) : null}
    </div>
  );
}
