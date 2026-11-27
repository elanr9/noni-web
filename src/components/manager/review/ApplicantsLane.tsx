"use client";

import { AgreementText } from "@/components/agreement/AgreementText";
import { Check, ChevronLeft, ChevronRight, FileSignature, MessageCircle } from "lucide-react";
import { useEffect, useState } from "react";

import { loadSignedContract } from "@/app/manager/market/actions";
import { loadUnread, type ThreadMessage } from "@/app/messages/actions";
import { MessageThread } from "@/components/campaign/MessageThread";
import { Card, Modal, Pill } from "@/components/kit";
import { Face, MatchPill, Niches, SmallLabel, Stats } from "@/components/manager/market/MarketView";
import { EXPERIENCE, creatorFactLine, mainHandle, shortDay, type MarketCreator } from "@/lib/manager/market";

/* Creators who applied, in Review. The list on the left, the person on the
   right: their profile, the thread with them, and Decline or Accept. Nothing
   scrolls; the list pages. */

const PER_PAGE = 6;

type Signed = { title: string | null; body: string | null; signedName: string | null; signedAt: string | null };

function Row({ c, active, unread, onSelect }: { c: MarketCreator; active: boolean; unread: number; onSelect: () => void }) {
  const name = c.full_name?.trim() || "Creator";
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`flex w-full cursor-pointer items-center gap-3 rounded-[14px] border px-3 py-2.5 text-left transition-colors duration-[160ms] ease-om ${
        active ? "border-blue-300 bg-blue-50" : "border-transparent bg-transparent hover:bg-fill-quiet"
      }`}
    >
      <span className="relative shrink-0">
        <Face c={c} size={40} />
        {unread > 0 ? <span className="absolute -right-0.5 -top-0.5 h-3 w-3 rounded-full border-2 border-white bg-blue-500" /> : null}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[14px] font-extrabold text-ink">{name}</span>
        <span className="block truncate text-[12.5px] font-semibold text-slate-400">
          {creatorFactLine(c) || mainHandle(c) || "New to Noni"}
        </span>
      </span>
      <MatchPill c={c} />
    </button>
  );
}

function Profile({ c, wanted }: { c: MarketCreator; wanted: string[] }) {
  const links = [
    c.tiktok ? { label: `TikTok @${c.tiktok}`, href: `https://www.tiktok.com/@${c.tiktok}` } : null,
    c.instagram ? { label: `Instagram @${c.instagram}`, href: `https://www.instagram.com/${c.instagram}` } : null,
    c.youtube ? { label: "YouTube", href: c.youtube.startsWith("http") ? c.youtube : `https://www.youtube.com/@${c.youtube}` } : null,
    ...c.portfolio.slice(0, 3).map((p, i) => ({ label: `Video ${i + 1}`, href: p.url })),
  ].filter((x): x is { label: string; href: string } => x !== null);

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-hidden">
      {c.application_note ? (
        <p className="m-0 line-clamp-3 shrink-0 rounded-[14px] bg-fill-quiet px-4 py-3 text-[14.5px] font-medium leading-[1.45] text-ink">
          “{c.application_note}”
        </p>
      ) : c.match_reason ? (
        <p className="m-0 line-clamp-2 shrink-0 text-[14px] font-medium leading-[1.45] text-slate-600">{c.match_reason}</p>
      ) : null}
      <div className="shrink-0">
        <Stats c={c} />
      </div>
      <div className="grid shrink-0 grid-cols-2 gap-x-4 gap-y-3 text-[13px]">
        {c.experience ? (
          <div>
            <SmallLabel>Experience</SmallLabel>
            <div className="font-bold text-ink">{EXPERIENCE.find((e) => e.key === c.experience)?.label}</div>
          </div>
        ) : null}
        {c.languages.length ? (
          <div>
            <SmallLabel>Languages</SmallLabel>
            <div className="truncate font-bold capitalize text-ink">{c.languages.slice(0, 3).join(", ")}</div>
          </div>
        ) : null}
        {c.best_campaign ? (
          <div className="col-span-2">
            <SmallLabel>Best campaign</SmallLabel>
            <div className="line-clamp-2 font-semibold text-ink">{c.best_campaign}</div>
          </div>
        ) : null}
      </div>
      {c.niches.length ? (
        <div className="shrink-0">
          <Niches niches={c.niches} wanted={wanted} max={5} />
        </div>
      ) : null}
      {links.length ? (
        <div className="flex shrink-0 flex-wrap gap-2">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              target="_blank"
              rel="noreferrer"
              className="rounded-full border border-line px-3 py-1.5 text-[12.5px] font-bold text-ink no-underline hover:bg-fill-quiet"
            >
              {l.label}
            </a>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export function ApplicantsLane({
  applicants,
  busyId,
  wanted = [],
  sampleThread,
  startTalking = false,
  onDecide,
}: {
  applicants: MarketCreator[];
  busyId: string | null;
  wanted?: string[];
  sampleThread?: ThreadMessage[];
  startTalking?: boolean;
  onDecide: (c: MarketCreator, accept: boolean) => void;
}) {
  const [selectedId, setSelectedId] = useState<string | null>(applicants[0]?.creator_id ?? null);
  const [page, setPage] = useState(0);
  const [talking, setTalking] = useState(startTalking);
  const [unread, setUnread] = useState<Record<string, number>>({});
  const [signed, setSigned] = useState<Signed | null>(null);
  const [error, setError] = useState<string | null>(null);

  const pages = Math.max(1, Math.ceil(applicants.length / PER_PAGE));
  const at = Math.min(page, pages - 1);
  const shown = applicants.slice(at * PER_PAGE, at * PER_PAGE + PER_PAGE);
  const c = applicants.find((x) => x.creator_id === selectedId) ?? shown[0] ?? null;

  const ids = applicants.map((x) => x.application_id).filter((x): x is string => !!x).join(",");
  useEffect(() => {
    if (sampleThread || !ids) return;
    let live = true;
    void loadUnread(ids.split(",")).then((u) => live && setUnread(u));
    return () => {
      live = false;
    };
  }, [ids, sampleThread]);

  if (!c) return null;
  const name = c.full_name?.trim() || "Creator";
  const first = name.split(" ")[0];
  const busy = busyId === c.creator_id;

  const select = (x: MarketCreator) => {
    setSelectedId(x.creator_id);
    setTalking(false);
    setError(null);
  };

  const openThread = () => {
    setTalking(true);
    if (c.application_id) setUnread((u) => ({ ...u, [c.application_id!]: 0 }));
  };

  const showSigned = async () => {
    if (!c.application_id) return;
    const r = await loadSignedContract(c.application_id);
    if (r.ok) setSigned(r.data);
    else setError(r.error);
  };

  const myUnread = c.application_id ? unread[c.application_id] ?? 0 : 0;

  return (
    <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 lg:grid-cols-[320px_minmax(0,1fr)]">
      <Card pad={8} className="flex min-h-0 min-w-0 flex-col">
        <div className="flex flex-1 flex-col gap-1">
          {shown.map((x) => (
            <Row
              key={x.creator_id}
              c={x}
              active={x.creator_id === c.creator_id}
              unread={x.application_id ? unread[x.application_id] ?? 0 : 0}
              onSelect={() => select(x)}
            />
          ))}
        </div>
        {pages > 1 ? (
          <div className="flex shrink-0 items-center justify-between px-2 pb-1 pt-2">
            <button
              type="button"
              aria-label="Previous"
              disabled={at === 0}
              onClick={() => setPage(at - 1)}
              className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border-0 bg-fill-quiet text-ink disabled:cursor-default disabled:opacity-30"
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
              className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border-0 bg-fill-quiet text-ink disabled:cursor-default disabled:opacity-30"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        ) : null}
      </Card>

      <Card key={c.creator_id} pad={22} className="flex min-h-[420px] min-w-0 animate-om-pop flex-col lg:min-h-0">
        <div className="mb-4 flex shrink-0 items-center gap-4">
          {talking ? (
            <button
              type="button"
              aria-label="Back to profile"
              onClick={() => setTalking(false)}
              className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full border-0 bg-fill-quiet text-ink hover:bg-line"
            >
              <ChevronLeft size={18} />
            </button>
          ) : null}
          <Face c={c} size={talking ? 40 : 60} />
          <div className="min-w-0 flex-1">
            <div className={`truncate font-extrabold text-ink ${talking ? "text-[16px]" : "text-[22px] tracking-[-0.3px]"}`}>{name}</div>
            <div className="truncate text-[13px] font-semibold text-slate-400">
              {[creatorFactLine(c) || mainHandle(c) || "New to Noni", shortDay(c.applied_at) ? `Applied ${shortDay(c.applied_at)}` : null]
                .filter(Boolean)
                .join(" · ")}
            </div>
          </div>
          <MatchPill c={c} />
        </div>

        {talking && c.application_id ? (
          <MessageThread applicationId={c.application_id} placeholder={`Message ${first}`} sample={sampleThread} className="flex-1" />
        ) : (
          <Profile c={c} wanted={wanted} />
        )}

        {error ? <div className="mt-3 shrink-0 text-[13px] font-semibold text-danger">{error}</div> : null}

        <div className="mt-4 flex shrink-0 flex-wrap items-center gap-2 border-t border-line pt-4">
          {talking ? null : (
            <>
              <Pill variant="tint" icon={MessageCircle} onClick={openThread}>
                Message
                {myUnread > 0 ? (
                  <span className="ml-0.5 inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-blue-500 px-1 text-[11px] font-extrabold text-white">
                    {myUnread}
                  </span>
                ) : null}
              </Pill>
              <Pill variant="ghost" size="sm" icon={FileSignature} onClick={() => void showSigned()}>
                Agreement
              </Pill>
            </>
          )}
          <span className="flex-1" />
          <Pill variant="quiet" disabled={busy} onClick={() => onDecide(c, false)}>
            Decline
          </Pill>
          <Pill icon={Check} loading={busy} onClick={() => onDecide(c, true)}>
            Accept
          </Pill>
        </div>
      </Card>

      {signed ? (
        <Modal title={signed.title ?? "Agreement"} onClose={() => setSigned(null)} width={620}>
          <AgreementText body={signed.body ?? ""} className="max-h-[58vh] overflow-y-auto rounded-[12px] bg-fill-quiet p-4 text-[13px] leading-[1.55] text-ink" />
          <div className="mt-3 flex items-center justify-between gap-3 text-[13px] font-bold text-slate-500">
            <span>
              {signed.signedAt ? `Signed by ${signed.signedName ?? name}${shortDay(signed.signedAt) ? ` on ${shortDay(signed.signedAt)}` : ""}` : "Not signed yet"}
            </span>
            {c.application_id && signed.signedAt ? (
              <a href={`/agreements/${c.application_id}`} target="_blank" rel="noreferrer" className="text-blue-600 no-underline hover:underline">
                Signed copy
              </a>
            ) : null}
          </div>
        </Modal>
      ) : null}
    </div>
  );
}
