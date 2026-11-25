"use client";

import { ExternalLink, RotateCcw, Send, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { inviteLead, resendLeadInvite, setLeadLost } from "@/app/ops/leads/actions";
import { Avatar, Card, Chip, Modal, PageHead, Pill, type ChipTone } from "@/components/kit";
import type { SubscriptionPlan } from "@/lib/admin/types";

/* The company pipeline: Get started chat → call booked → invited (plan and
   budget agreed on the call) → subscribed. One row per lead; Invite opens
   the form that turns it into a company. */

export type OpsLead = {
  id: string;
  name: string | null;
  email: string | null;
  company: string | null;
  website: string | null;
  role: string | null;
  answers: Record<string, unknown> | null;
  status: "new" | "call_booked" | "invited" | "subscribed" | "lost";
  finished_at: string | null;
  call_booked_at: string | null;
  invited_at: string | null;
  subscribed_at: string | null;
  company_id: string | null;
  created_at: string;
};

const STATUS: Record<OpsLead["status"], [string, ChipTone]> = {
  new: ["New", "slate"],
  call_booked: ["Call booked", "amber"],
  invited: ["Invited", "blue"],
  subscribed: ["Subscribed", "green"],
  lost: ["Lost", "slate"],
};

const VALUES: Record<string, string> = {
  signups: "Sign ups and sales",
  audience: "A bigger audience",
  trust: "Trust in the brand",
  tiktok: "TikTok",
  instagram: "Instagram Reels",
  youtube: "YouTube Shorts",
  "1-5": "1 to 5",
  "5-10": "5 to 10",
  "10-25": "10 to 25",
  "25+": "25 or more",
  this_week: "This week",
  this_month: "Within a month",
  exploring: "Just exploring",
};

const PLANS: [SubscriptionPlan, string][] = [
  ["starter_monthly", "Starter, monthly"],
  ["starter_annual", "Starter, annual"],
  ["premium_monthly", "Premium, monthly"],
  ["premium_annual", "Premium, annual"],
  ["managed_monthly", "Done for you, monthly"],
  ["managed_annual", "Done for you, annual"],
];

const FILTERS = [
  ["open", "Open"],
  ["invited", "Invited"],
  ["subscribed", "Subscribed"],
  ["lost", "Lost"],
] as const;
type Filter = (typeof FILTERS)[number][0];

function show(v: unknown): string {
  if (Array.isArray(v)) return v.map((x) => VALUES[String(x)] ?? String(x)).join(", ");
  return v ? (VALUES[String(v)] ?? String(v)) : "";
}

function when(iso: string | null): string {
  return iso ? new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "";
}

const field =
  "box-border w-full border border-line bg-white px-3.5 py-2.5 text-[14.5px] font-semibold text-ink outline-none rounded-ops-sm focus:border-blue-500";

function InviteModal({ lead, onClose }: { lead: OpsLead; onClose: () => void }) {
  const router = useRouter();
  const [plan, setPlan] = useState<SubscriptionPlan>("premium_annual");
  const [budget, setBudget] = useState("");
  const [runBy, setRunBy] = useState<"me" | "noni">("me");
  const [email, setEmail] = useState(lead.email ?? "");
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const submit = () => {
    setError(null);
    const dollars = Number(budget.replace(/[$,\s]/g, "") || "0");
    start(async () => {
      const r = await inviteLead({ leadId: lead.id, plan, budgetDollars: dollars, runBy, email });
      if (!r.ok) {
        setError(r.error);
        return;
      }
      router.refresh();
      onClose();
    });
  };

  return (
    <Modal title={`Invite ${lead.company ?? "company"}`} onClose={() => (pending ? undefined : onClose())}>
      <div className="flex flex-col gap-3.5">
        <label className="flex flex-col gap-[7px]">
          <span className="text-[12px] font-semibold text-slate-400">Plan</span>
          <select className={field} value={plan} onChange={(e) => setPlan(e.target.value as SubscriptionPlan)}>
            {PLANS.map(([v, l]) => (
              <option key={v} value={v}>
                {l}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-[7px]">
          <span className="text-[12px] font-semibold text-slate-400">Monthly creator budget ($)</span>
          <input className={field} inputMode="numeric" placeholder="0" value={budget} onChange={(e) => setBudget(e.target.value)} />
        </label>
        <label className="flex flex-col gap-[7px]">
          <span className="text-[12px] font-semibold text-slate-400">Who runs the campaigns</span>
          <select className={field} value={runBy} onChange={(e) => setRunBy(e.target.value as "me" | "noni")}>
            <option value="me">They do</option>
            <option value="noni">Noni team</option>
          </select>
        </label>
        <label className="flex flex-col gap-[7px]">
          <span className="text-[12px] font-semibold text-slate-400">Send to</span>
          <input className={field} type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </label>
        {error ? <p className="m-0 text-[13px] font-semibold text-danger">{error}</p> : null}
        <div className="flex gap-2.5">
          <Pill variant="quiet" onClick={onClose} className="flex-1">
            Cancel
          </Pill>
          <Pill icon={Send} disabled={pending} onClick={submit} className="flex-1">
            {pending ? "Sending…" : "Create and invite"}
          </Pill>
        </div>
      </div>
    </Modal>
  );
}

function Row({ lead, onInvite }: { lead: OpsLead; onInvite: () => void }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [note, setNote] = useState<{ ok: boolean; text: string } | null>(null);
  const [label, tone] = STATUS[lead.status];
  const a = lead.answers ?? {};
  const facts: [string, string][] = (
    [
      ["Role", lead.role ?? ""],
      ["Goal", show(a.goal)],
      ["Platforms", show(a.platforms)],
      ["Creators", show(a.creators_wanted)],
      ["Launch", show(a.launch)],
    ] as [string, string][]
  ).filter(([, v]) => v);

  const run = (fn: () => Promise<{ ok: boolean; error?: string; email?: string }>, done: string) =>
    start(async () => {
      setNote(null);
      const r = await fn();
      if (!r.ok) setNote({ ok: false, text: r.error ?? "That did not work." });
      else {
        setNote({ ok: true, text: done });
        router.refresh();
      }
    });

  return (
    <div className="flex flex-col gap-3 border-b border-line px-5 py-[18px] last:border-b-0">
      <div className="flex items-center gap-3.5">
        <Avatar name={lead.company || lead.name || "?"} size={38} />
        <span className="min-w-0 flex-1">
          <span className="block text-[15px] font-bold text-ink">{lead.company || "No company yet"}</span>
          <span className="mt-0.5 block truncate text-[13px] font-semibold text-slate-400">
            {[lead.name, lead.email, when(lead.created_at)].filter(Boolean).join(" · ")}
            {!lead.finished_at && lead.status === "new" ? " · stopped partway" : ""}
          </span>
        </span>
        {lead.website ? (
          <a href={`https://${lead.website}`} target="_blank" rel="noreferrer" className="hidden items-center gap-1 text-[13px] font-bold text-slate-500 no-underline hover:text-ink sm:inline-flex">
            {lead.website} <ExternalLink size={12} />
          </a>
        ) : null}
        <Chip tone={tone}>{lead.status === "call_booked" && lead.call_booked_at ? `${label} ${when(lead.call_booked_at)}` : label}</Chip>
      </div>

      {facts.length ? (
        <dl className="m-0 grid grid-cols-1 gap-x-6 gap-y-1.5 pl-[52px] sm:grid-cols-2">
          {facts.map(([k, v]) => (
            <div key={k} className="flex gap-2 text-[13.5px] leading-[1.45]">
              <dt className="shrink-0 font-semibold text-slate-400">{k}</dt>
              <dd className="m-0 font-semibold text-ink">{v}</dd>
            </div>
          ))}
        </dl>
      ) : null}

      <div className="flex flex-wrap items-center gap-2 pl-[52px]">
        {lead.status === "new" || lead.status === "call_booked" ? (
          <>
            <Pill size="sm" icon={Send} onClick={onInvite}>
              Invite
            </Pill>
            <Pill size="sm" variant="quiet" icon={X} disabled={pending} onClick={() => run(() => setLeadLost(lead.id, true), "Marked lost.")}>
              Lost
            </Pill>
          </>
        ) : null}
        {lead.status === "invited" ? (
          <Pill size="sm" variant="quiet" icon={RotateCcw} disabled={pending} onClick={() => run(() => resendLeadInvite(lead.id), "Sent again.")}>
            {pending ? "Sending…" : "Resend"}
          </Pill>
        ) : null}
        {lead.status === "lost" ? (
          <Pill size="sm" variant="quiet" icon={RotateCcw} disabled={pending} onClick={() => run(() => setLeadLost(lead.id, false), "Reopened.")}>
            Reopen
          </Pill>
        ) : null}
        {lead.company_id ? (
          <Link href={`/ops/companies/${lead.company_id}`} className="text-[13px] font-bold text-blue-600 no-underline">
            Open company
          </Link>
        ) : null}
        {note ? <span className={`text-[13px] font-semibold ${note.ok ? "text-green" : "text-danger"}`}>{note.text}</span> : null}
      </div>
    </div>
  );
}

export function LeadsView({ leads }: { leads: OpsLead[] }) {
  const [filter, setFilter] = useState<Filter>("open");
  const [inviting, setInviting] = useState<OpsLead | null>(null);
  const shown = leads.filter((l) =>
    filter === "open" ? l.status === "new" || l.status === "call_booked" : l.status === filter,
  );
  const count = (f: Filter) =>
    leads.filter((l) => (f === "open" ? l.status === "new" || l.status === "call_booked" : l.status === f)).length;

  return (
    <div>
      <PageHead title="Leads" />
      <div className="mb-4 flex flex-wrap gap-2">
        {FILTERS.map(([f, label]) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={`cursor-pointer rounded-full border px-4 py-1.5 text-[13.5px] font-bold transition-colors ${
              filter === f ? "border-ink bg-ink text-white" : "border-line bg-white text-slate-500 hover:text-ink"
            }`}
          >
            {label} {count(f)}
          </button>
        ))}
      </div>
      <Card pad={0} className="overflow-hidden">
        {shown.length === 0 ? <p className="m-0 px-5 py-[22px] text-[13.5px] font-semibold text-slate-400">Nothing here.</p> : null}
        {shown.map((l) => (
          <Row key={l.id} lead={l} onInvite={() => setInviting(l)} />
        ))}
      </Card>
      {inviting ? <InviteModal lead={inviting} onClose={() => setInviting(null)} /> : null}
    </div>
  );
}
