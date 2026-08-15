"use client";

import {
  AtSign,
  Check,
  CircleAlert,
  Images,
  ListChecks,
  Music2,
  Pencil,
  Play,
  X,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";

import { Avatar, Card, Chip, Modal, PageHead, Pill } from "@/components/kit";
import {
  decideAccountAction,
  type AccountDecision,
} from "@/app/manager/accounts/actions";
import type { AccountApprovalDetail } from "@/lib/manager/review";

/* Account approval, ported from app/(admin)/account-approval/[accountId].tsx
   and components/admin/approval/. Five evidence cards; noting a part and
   sending back flips the row to needs_changes with a required reason, and
   approving links the handles. */

type PartKey = "ig" | "tt" | "shots" | "feed" | "handles";
type PartKind = "clip" | "shots" | "feed" | "handles";

type AccountPart = {
  key: PartKey;
  label: string;
  meta: string;
  kind: PartKind;
};

type Phase = "review" | "approved" | "sent";

function ClipPreview({ url }: { url: string | null }) {
  return (
    <div className="mx-auto flex aspect-[9/16] w-full max-w-[220px] items-center justify-center overflow-hidden bg-fill-quiet shadow-media rounded-ops-md">
      {url !== null ? (
        <video src={url} controls playsInline className="h-full w-full object-contain" />
      ) : (
        <span className="inline-flex h-10 w-10 items-center justify-center bg-white/90 shadow-card rounded-pill">
          <Play size={16} className="text-ink" />
        </span>
      )}
    </div>
  );
}

function ScreenshotFrame({ label, url }: { label: string; url: string | null }) {
  return (
    <div className="relative flex aspect-[9/16] w-full max-w-[150px] items-center justify-center overflow-hidden bg-fill-quiet shadow-media rounded-ops-sm">
      {url !== null ? (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img src={url} alt={`${label} profile screenshot`} className="h-full w-full object-cover" />
      ) : (
        <Images size={20} className="text-blue-300" />
      )}
      <span className="absolute bottom-2 left-2 bg-ink/55 px-2 py-0.5 text-[10.5px] font-bold text-white rounded-pill">
        {label}
      </span>
    </div>
  );
}

function HandleRow({
  icon,
  label,
  handle,
}: {
  icon: ReactNode;
  label: string;
  handle: string | null;
}) {
  return (
    <div className="flex items-center gap-2.5 border border-line-strong bg-white px-3.5 py-3 rounded-ops-sm">
      {icon}
      <span className="w-[66px] text-[12px] font-semibold text-slate-400">{label}</span>
      <span className="min-w-0 flex-1 truncate text-[13px] font-semibold text-ink">
        {handle !== null && handle.length > 0 ? `@${handle}` : "Not set"}
      </span>
    </div>
  );
}

function DoneCard({
  tone,
  title,
  body,
}: {
  tone: "good" | "warn";
  title: string;
  body: string;
}) {
  return (
    <Card pad={0} className="mx-auto mt-10 flex max-w-[420px] flex-col items-center gap-3 px-7 py-12 text-center">
      <span
        className={`inline-flex h-12 w-12 items-center justify-center rounded-pill ${
          tone === "good" ? "bg-green-soft" : "bg-amber-soft"
        }`}
      >
        {tone === "good" ? (
          <Check size={20} className="text-green" />
        ) : (
          <CircleAlert size={20} className="text-amber" />
        )}
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

export function AccountApprovalView({
  detail,
}: {
  detail: AccountApprovalDetail | null;
}) {
  const router = useRouter();
  const [notes, setNotes] = useState<Partial<Record<PartKey, string>>>({});
  const [openKey, setOpenKey] = useState<PartKey | null>(null);
  const [noteMode, setNoteMode] = useState(false);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [phase, setPhase] = useState<Phase>("review");

  if (!detail) {
    return (
      <div>
        <PageHead title="Account approval" onBack={() => router.push("/manager")} />
        <Card pad={0} className="flex flex-col items-center gap-3 px-6 py-14 text-center">
          <span className="text-[14.5px] font-bold text-ink">
            Could not load this submission
          </span>
          <span className="text-[13px] font-semibold text-slate-400">
            This account submission does not exist anymore.
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

  const short = detail.creatorName.includes(" ")
    ? detail.creatorName.slice(0, detail.creatorName.indexOf(" "))
    : detail.creatorName;
  const sentBack = detail.status === "needs_changes";
  const decided = detail.status === "approved";

  const handleList = [detail.tiktokHandle, detail.instagramHandle]
    .filter((h): h is string => typeof h === "string" && h.length > 0)
    .map((h) => `@${h}`);

  const parts: AccountPart[] = [
    { key: "ig", label: "Instagram scroll", meta: "20s: home, explore, reels", kind: "clip" },
    { key: "tt", label: "TikTok For You scroll", meta: "15s minimum, continuous", kind: "clip" },
    { key: "shots", label: "Profile screenshots", meta: "Both platforms, bio visible", kind: "shots" },
    { key: "feed", label: "Feed test", meta: "For You is college soccer", kind: "feed" },
    {
      key: "handles",
      label: "Handles to link",
      meta: handleList.length > 0 ? handleList.join(" · ") : "Not set",
      kind: "handles",
    },
  ];

  const openPart = openKey === null ? null : (parts.find((p) => p.key === openKey) ?? null);
  const count = Object.keys(notes).length;

  const closeSheet = () => {
    setOpenKey(null);
    setNoteMode(false);
    setDraft("");
  };

  const decide = async (status: "approved" | "needs_changes") => {
    /* Reason lines and the structured decision mirror the mobile screen:
       a noted part fails its check, everything else counts as approved. */
    const reason =
      status === "needs_changes"
        ? parts
            .filter((p) => notes[p.key] !== undefined)
            .map((p) => `${p.label}: ${notes[p.key] ?? ""}`)
            .join("\n")
        : null;

    const decision: AccountDecision =
      status === "approved"
        ? {
            instagram_recording_ok: true,
            tiktok_recording_ok: true,
            feed_is_niche: true,
            profile_matches_template: true,
          }
        : {
            instagram_recording_ok: notes.ig === undefined,
            tiktok_recording_ok: notes.tt === undefined,
            feed_is_niche: notes.feed === undefined,
            profile_matches_template: notes.shots === undefined,
          };

    setBusy(true);
    setError(null);
    const result = await decideAccountAction({
      accountId: detail.accountId,
      status,
      reason,
      decision,
    });
    setBusy(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setPhase(status === "approved" ? "approved" : "sent");
    router.refresh();
  };

  if (phase === "approved") {
    return (
      <DoneCard
        tone="good"
        title={`${short} is approved`}
        body={`@${detail.tiktokHandle ?? ""} and @${detail.instagramHandle ?? ""} are linked. Their first brief lands tomorrow morning.`}
      />
    );
  }
  if (phase === "sent") {
    return (
      <DoneCard
        tone="warn"
        title={`Sent back to ${short}`}
        body="They see your notes on their setup screen and resubmit. It lands back in this queue."
      />
    );
  }

  return (
    <div>
      <PageHead
        title="Account approval"
        sub={
          sentBack
            ? `Sent back ${detail.ageLabel}`
            : `Submitted ${detail.ageLabel}`
        }
        onBack={() => router.push("/manager")}
      />

      <div className="flex flex-col gap-3">
        <Card pad={16} className="flex items-center gap-3.5">
          <Avatar name={detail.creatorName} size={46} />
          <span className="min-w-0 flex-1 truncate text-[16px] font-bold tracking-[-0.3px] text-ink">
            {detail.creatorName}
          </span>
          <Chip tone={decided ? "green" : sentBack ? "amber" : "slate"}>
            {decided ? "Approved" : sentBack ? "Needs changes" : "Pending"}
          </Chip>
        </Card>

        {sentBack && detail.reason !== null ? (
          <div className="flex items-start gap-2.5 bg-amber-soft p-3.5 rounded-ops-md">
            <CircleAlert size={16} className="mt-0.5 shrink-0 text-amber" />
            <p className="m-0 whitespace-pre-line text-[12.5px] font-semibold leading-relaxed text-amber">
              {detail.reason}
            </p>
          </div>
        ) : null}

        <p className="m-0 px-0.5 text-[12.5px] font-semibold leading-relaxed text-slate-500">
          Open a part to check it. Request changes on anything that is wrong,
          the rest counts as approved.
        </p>

        <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
          {parts.map((p) => {
            const noted = notes[p.key] !== undefined;
            return (
              <Card
                key={p.key}
                pad={16}
                lift
                onClick={() => setOpenKey(p.key)}
                className="flex items-center gap-3"
              >
                <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center bg-blue-100 rounded-[10px]">
                  {p.kind === "clip" ? (
                    <Play size={15} className="text-blue-700" />
                  ) : p.kind === "shots" ? (
                    <Images size={15} className="text-blue-700" />
                  ) : p.kind === "feed" ? (
                    <ListChecks size={15} className="text-blue-700" />
                  ) : (
                    <AtSign size={15} className="text-blue-700" />
                  )}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[13.5px] font-bold text-ink">
                    {p.label}
                  </span>
                  <span className="mt-[2px] block truncate text-[12px] font-semibold text-slate-400">
                    {p.meta}
                  </span>
                </span>
                {noted ? <Chip tone="amber">1 note</Chip> : null}
              </Card>
            );
          })}
        </div>

        {!decided ? (
          <div className="mt-2 flex gap-2.5">
            <Pill
              variant="quiet"
              onClick={() => void decide("needs_changes")}
              disabled={busy || count === 0}
              className="flex-1"
            >
              {count === 0 ? "Send back" : `Send back · ${count}`}
            </Pill>
            <Pill
              icon={Check}
              onClick={() => void decide("approved")}
              disabled={busy}
              className="flex-[1.3]"
            >
              Approve and link
            </Pill>
          </div>
        ) : null}
        {error !== null ? (
          <p className="m-0 text-[12.5px] font-semibold text-danger">{error}</p>
        ) : null}
      </div>

      {openPart !== null ? (
        <Modal title={openPart.label} onClose={closeSheet} width={480}>
          <p className="m-0 mb-4 text-[13px] font-semibold text-slate-400">
            {openPart.meta}
          </p>

          {openPart.kind === "clip" ? (
            <ClipPreview
              url={
                openPart.key === "ig"
                  ? detail.urls.instagramRecording
                  : detail.urls.tiktokRecording
              }
            />
          ) : null}

          {openPart.kind === "shots" ? (
            <div className="flex justify-center gap-2.5">
              <ScreenshotFrame label="TikTok" url={detail.urls.tiktokScreenshot} />
              <ScreenshotFrame label="Instagram" url={detail.urls.instagramScreenshot} />
            </div>
          ) : null}

          {openPart.kind === "feed" ? (
            <div className="bg-fill-quiet p-3.5 rounded-ops-sm">
              <p className="m-0 text-[13px] font-semibold leading-relaxed text-ink">
                For You has to be college soccer and recruiting. A cold feed or
                one on the wrong topic throttles every post this creator will
                ever make.
              </p>
            </div>
          ) : null}

          {openPart.kind === "handles" ? (
            <div className="flex flex-col gap-2.5">
              <HandleRow
                icon={<Music2 size={16} className="shrink-0 text-slate-400" />}
                label="TikTok"
                handle={detail.tiktokHandle}
              />
              <HandleRow
                icon={<AtSign size={16} className="shrink-0 text-slate-400" />}
                label="Instagram"
                handle={detail.instagramHandle}
              />
              <p className="m-0 px-0.5 text-[12px] font-semibold leading-relaxed text-slate-400">
                Captured on approval. Both handles are needed before anything
                can go out.
              </p>
            </div>
          ) : null}

          {notes[openPart.key] !== undefined && !noteMode ? (
            <div className="mt-4 flex items-start gap-2 bg-amber-soft p-3 rounded-ops-sm">
              <span className="min-w-0 flex-1 text-[12.5px] font-semibold leading-relaxed text-amber">
                {notes[openPart.key]}
              </span>
              <button
                type="button"
                aria-label="Remove note"
                onClick={() =>
                  setNotes((prev) => {
                    const next = { ...prev };
                    delete next[openPart.key];
                    return next;
                  })
                }
                className="inline-flex h-6 w-6 shrink-0 cursor-pointer items-center justify-center border-none bg-white rounded-pill"
              >
                <X size={12} className="text-slate-400" />
              </button>
            </div>
          ) : null}

          {noteMode ? (
            <div className="mt-4">
              <textarea
                autoFocus
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder={`What should ${short} change here`}
                className="min-h-[84px] w-full resize-y border border-blue-300 bg-white px-3 py-2.5 text-[13px] font-semibold text-ink outline-none rounded-ops-sm focus:border-blue-500"
              />
              <div className="mt-3 flex justify-end gap-2.5">
                <Pill
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setNoteMode(false);
                    setDraft("");
                  }}
                >
                  Cancel
                </Pill>
                <Pill
                  size="sm"
                  disabled={draft.trim().length === 0}
                  onClick={() => {
                    setNotes((prev) => ({ ...prev, [openPart.key]: draft.trim() }));
                    closeSheet();
                  }}
                >
                  Save note
                </Pill>
              </div>
            </div>
          ) : (
            <div className="mt-5 flex justify-end gap-2.5">
              <Pill variant="ghost" onClick={closeSheet}>
                Back
              </Pill>
              <Pill
                icon={Pencil}
                variant="tint"
                onClick={() => {
                  setDraft(notes[openPart.key] ?? "");
                  setNoteMode(true);
                }}
              >
                Request changes
              </Pill>
            </div>
          )}
        </Modal>
      ) : null}
    </div>
  );
}
