"use client";

import { Check, ExternalLink, X } from "lucide-react";
import { useState, useTransition } from "react";

import { decideApplication } from "@/app/ops/actions";
import { Avatar, Card, Chip, PageHead, Pill, type ChipTone } from "@/components/kit";
import type { ReviewApplication } from "@/lib/applications";

/* The review queue: who applied, what they said in the chat, and the two
   decisions. Creators show their resume (handles, experience, video links). */

const LABELS: Record<string, string> = {
  website: "Website",
  goal: "Goal",
  platforms: "Platforms",
  creators_wanted: "Creators wanted",
  monthly_budget: "Monthly budget",
  launch: "Launch",
  runs_campaigns: "Runs campaigns",
  experience: "Experience",
  campaigns_done: "Campaigns done",
  best_campaign: "Proudest campaign",
  on_camera: "On camera",
  niches: "Niches",
  weekly_capacity: "Videos a week",
};

const VALUES: Record<string, string> = {
  signups: "Downloads and sign ups",
  sales: "Sales",
  audience: "A bigger audience",
  trust: "Trust in the brand",
  under_1k: "Under $1,000",
  "1k-3k": "$1,000 to $3,000",
  "3k-10k": "$3,000 to $10,000",
  "10k+": "$10,000 or more",
  unsure: "Not sure yet",
  this_week: "This week",
  this_month: "Within a month",
  exploring: "Just exploring",
  noni: "Noni runs it",
  me: "They run it",
  team: "Someone on their team",
  pro: "Has done paid UGC",
  some: "A little",
  new: "Brand new",
  love_it: "Loves it",
  getting_there: "Getting there",
  voice_or_hands: "Voiceover or hands only",
};

const TONE: Record<ReviewApplication["status"], ChipTone> = { pending: "amber", approved: "green", rejected: "slate" };
const STATUS: Record<ReviewApplication["status"], string> = { pending: "To review", approved: "Approved", rejected: "Turned down" };

function show(value: string | string[] | undefined): string {
  if (value === undefined || value === "") return "";
  const one = (v: string) => VALUES[v] ?? v;
  return Array.isArray(value) ? value.map(one).join(", ") : one(value);
}

function when(iso: string | null): string {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function profileLink(site: "instagram" | "tiktok", handle: string): string {
  const h = handle.replace(/^@/, "");
  return site === "instagram" ? `https://www.instagram.com/${h}` : `https://www.tiktok.com/@${h}`;
}

function Row({ app, onDecided }: { app: ReviewApplication; onDecided: (status: ReviewApplication["status"]) => void }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [rejecting, setRejecting] = useState(false);
  const [note, setNote] = useState("");
  const a = app.answers;
  const title = app.kind === "company" ? show(a.company_name) || app.full_name || "Company" : app.full_name || app.email || "Creator";
  const fields = Object.keys(LABELS)
    .map((k) => [LABELS[k], show(a[k])] as const)
    .filter(([, v]) => v);
  const r = app.resume;

  const decide = (decision: "approve" | "reject") => {
    setError(null);
    startTransition(async () => {
      const result = await decideApplication({ id: app.id, decision, note: decision === "reject" ? note : undefined });
      if (!result.ok) setError(result.error);
      else onDecided(decision === "approve" ? "approved" : "rejected");
    });
  };

  return (
    <div className="flex flex-col gap-3.5 border-b border-line px-5 py-[18px] last:border-b-0">
      <div className="flex items-center gap-3.5">
        <Avatar name={title} size={38} />
        <span className="min-w-0 flex-1">
          <span className="block text-[15px] font-bold text-ink">{title}</span>
          <span className="mt-0.5 block text-[13px] font-semibold text-slate-400">
            {app.kind === "company" ? `${app.full_name ?? ""} · ` : ""}
            {app.email} · applied {when(app.submitted_at)}
          </span>
        </span>
        <Chip tone={app.kind === "company" ? "blue" : "slate"}>{app.kind === "company" ? "Brand" : "Creator"}</Chip>
        <Chip tone={TONE[app.status]}>{STATUS[app.status]}</Chip>
      </div>

      <dl className="m-0 grid grid-cols-1 gap-x-6 gap-y-1.5 pl-[52px] sm:grid-cols-2">
        {fields.map(([label, value]) => (
          <div key={label} className="flex gap-2 text-[13.5px] leading-[1.45]">
            <dt className="shrink-0 font-semibold text-slate-400">{label}</dt>
            <dd className="m-0 font-semibold text-ink">{value}</dd>
          </div>
        ))}
      </dl>

      {r && (r.instagram || r.tiktok || r.portfolio.length) ? (
        <div className="flex flex-wrap gap-2 pl-[52px]">
          {r.instagram ? (
            <a href={profileLink("instagram", r.instagram)} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 rounded-full bg-fill-quiet px-3 py-1.5 text-[13px] font-bold text-ink no-underline">
              Instagram {r.instagram} <ExternalLink size={12} />
            </a>
          ) : null}
          {r.tiktok ? (
            <a href={profileLink("tiktok", r.tiktok)} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 rounded-full bg-fill-quiet px-3 py-1.5 text-[13px] font-bold text-ink no-underline">
              TikTok {r.tiktok} <ExternalLink size={12} />
            </a>
          ) : null}
          {r.portfolio.map((v, i) => (
            <a key={v.url} href={v.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 rounded-full bg-blue-100 px-3 py-1.5 text-[13px] font-bold text-blue-700 no-underline">
              Video {i + 1} <ExternalLink size={12} />
            </a>
          ))}
        </div>
      ) : null}

      {app.status === "pending" ? (
        <div className="flex flex-wrap items-center gap-2 pl-[52px]">
          {rejecting ? (
            <>
              <input
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Reason they will see (optional)"
                className="min-w-[220px] flex-1 rounded-full border border-line bg-white px-4 py-2 text-[13.5px] font-semibold text-ink outline-none focus:border-blue-500"
              />
              <Pill size="sm" variant="danger" icon={X} disabled={pending} onClick={() => decide("reject")}>
                Turn down
              </Pill>
              <Pill size="sm" variant="quiet" onClick={() => setRejecting(false)}>
                Cancel
              </Pill>
            </>
          ) : (
            <>
              <Pill size="sm" icon={Check} disabled={pending} onClick={() => decide("approve")}>
                {pending ? "Working…" : "Approve"}
              </Pill>
              <Pill size="sm" variant="quiet" icon={X} disabled={pending} onClick={() => setRejecting(true)}>
                Turn down
              </Pill>
            </>
          )}
          {error ? <span className="text-[13px] font-semibold text-danger">{error}</span> : null}
        </div>
      ) : app.decision_note ? (
        <p className="m-0 pl-[52px] text-[13px] font-semibold text-slate-400">Note: {app.decision_note}</p>
      ) : null}
    </div>
  );
}

export function ApplicationsView({ applications, loadError }: { applications: ReviewApplication[]; loadError: string | null }) {
  const [apps, setApps] = useState(applications);
  const waiting = apps.filter((a) => a.status === "pending");
  const decided = apps.filter((a) => a.status !== "pending");
  const set = (id: string, status: ReviewApplication["status"]) =>
    setApps((xs) => xs.map((x) => (x.id === id ? { ...x, status } : x)));

  return (
    <div>
      <PageHead
        title="Applications"
        sub="Brands and creators who applied on the website. Approving opens their account and emails them."
      />
      {loadError ? <p className="m-0 mb-4 text-[14px] font-semibold text-danger">{loadError}</p> : null}
      <Card pad={0} className="overflow-hidden">
        {waiting.length === 0 ? (
          <p className="m-0 px-5 py-[22px] text-[13.5px] font-semibold text-slate-400">Nobody is waiting on you.</p>
        ) : null}
        {waiting.map((a) => (
          <Row key={a.id} app={a} onDecided={(s) => set(a.id, s)} />
        ))}
      </Card>
      {decided.length ? (
        <>
          <h2 className="m-0 mb-3 mt-8 text-[15px] font-bold text-ink">Decided</h2>
          <Card pad={0} className="overflow-hidden">
            {decided.map((a) => (
              <Row key={a.id} app={a} onDecided={(s) => set(a.id, s)} />
            ))}
          </Card>
        </>
      ) : null}
    </div>
  );
}
