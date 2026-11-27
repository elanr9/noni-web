"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check, ChevronLeft, ChevronRight, MessageCircle, X } from "lucide-react";
import { useEffect, useMemo, useState, useTransition, type ReactNode } from "react";

import { apply, leave, signAgreement, withdraw } from "@/app/campaigns/actions";
import { AgreementText } from "@/components/agreement/AgreementText";
import { SignaturePad, isDrawn } from "@/components/agreement/SignaturePad";
import { loadUnread } from "@/app/messages/actions";
import { MessageThread } from "@/components/campaign/MessageThread";
import {
  campaignTodo,
  groupCampaigns,
  missingToApply,
  money,
  orderFeed,
  pastLabel,
  spotsLabel,
  toneFor,
  type CreatorCampaign,
  type FeedListing,
  type Tone,
} from "@/lib/creator-campaigns";
import { CampaignCard as ExploreCard, CampaignCover, type CardCampaign } from "@/components/campaign/CampaignCard";
import { payLines, postsPerDayLabel, withTerms } from "@/lib/campaign-terms";
import { companyLogoUrl } from "@/lib/company-logo";
import { NICHES } from "@/lib/creator-profile";
import { IOS_APP_URL } from "@/lib/site-config";

type Tab = "explore" | "mine";
type Mine = "active" | "applied" | "past";
type Resume = { birth_year: number | null; tiktok: string | null; instagram: string | null; niches: string[] | null };

const PAGE = 6;

const TONE: Record<Tone, string> = {
  blue: "bg-blue-100 text-blue-700",
  purple: "bg-[#efeafd] text-[#6b4fd8]",
  green: "bg-green-soft text-green",
  amber: "bg-amber-soft text-amber",
  grey: "bg-fill-quiet text-slate-500",
};

const nicheLabel = (k: string) => NICHES.find((n) => n.key === k)?.label ?? k;

/* Creator campaigns on the website: Explore and My campaigns (Active,
   Applied, Past). Cards page six at a time so nothing scrolls; a card opens
   a panel to apply, sign, withdraw or leave. */
export function CampaignsBoard({
  listings,
  campaigns,
  failed,
  resume,
  name,
  startTab,
}: {
  listings: FeedListing[];
  campaigns: CreatorCampaign[];
  failed: boolean;
  resume: Resume;
  name: string;
  startTab: Tab;
}) {
  const groups = useMemo(() => groupCampaigns(campaigns), [campaigns]);
  const [tab, setTab] = useState<Tab>(startTab);
  const [mine, setMine] = useState<Mine>(
    /* Something to sign opens first. */
    groups.applied.some((c) => c.kind !== "applied") || (groups.active.length === 0 && groups.applied.length > 0) ? "applied" : "active",
  );
  const [forYou, setForYou] = useState(false);
  const [page, setPage] = useState(0);
  const [openListing, setOpenListing] = useState<FeedListing | null>(null);
  const [openCampaign, setOpenCampaign] = useState<CreatorCampaign | null>(null);

  const explore = useMemo(
    () =>
      orderFeed(listings).filter(
        (l) => l.status === "open" && !l.is_member && l.application_status === null && (!forYou || l.niche_overlap > 0),
      ),
    [listings, forYou],
  );
  const missing = missingToApply(resume);
  const myCount = groups.active.length + groups.applied.length;

  const items: (FeedListing | CreatorCampaign)[] = tab === "explore" ? explore : groups[mine];
  const pages = Math.max(1, Math.ceil(items.length / PAGE));
  const current = Math.min(page, pages - 1);
  const shown = items.slice(current * PAGE, current * PAGE + PAGE);

  const byListing = (id: string | null) => (id ? listings.find((l) => l.id === id) ?? null : null);

  const go = (t: Tab) => {
    setTab(t);
    setPage(0);
  };

  return (
    <main className="mx-auto flex w-full max-w-[1080px] flex-1 flex-col px-4 pb-8 sm:px-6">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <h1 className="m-0 text-[28px] font-bold leading-[1.1] tracking-[-0.7px] text-ink">Campaigns</h1>
        {missing.length > 0 ? (
          <Link href="/profile" className="rounded-full bg-amber-soft px-4 py-2 text-[14px] font-bold text-amber no-underline transition-transform hover:-translate-y-px">
            Add {missing.join(" and ")} to apply
          </Link>
        ) : null}
      </div>

      <nav className="mb-5 flex gap-1 border-b border-line" role="tablist">
        {(
          [
            { key: "explore", label: "Explore", n: 0 },
            { key: "mine", label: "My campaigns", n: myCount },
          ] as const
        ).map((t) => {
          const on = t.key === tab;
          return (
            <button
              key={t.key}
              type="button"
              role="tab"
              aria-selected={on}
              onClick={() => go(t.key)}
              className={`relative -mb-px flex cursor-pointer items-center gap-1.5 border-0 border-b-[3px] bg-transparent px-3 pb-3 pt-1 text-[15px] transition-colors duration-[160ms] ease-om ${
                on ? "border-blue-500 font-bold text-blue-700" : "border-transparent font-semibold text-slate-400 hover:text-ink"
              }`}
            >
              {t.label}
              {t.n ? (
                <span className={`inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[12px] font-bold ${on ? "bg-blue-500 text-white" : "bg-fill-quiet text-slate-500"}`}>
                  {t.n}
                </span>
              ) : null}
            </button>
          );
        })}
      </nav>

      <div className="mb-4 flex items-center justify-between gap-3">
        {tab === "explore" ? (
          <Segments
            value={forYou ? "for" : "all"}
            onChange={(v) => (setForYou(v === "for"), setPage(0))}
            options={[
              { key: "all", label: "All" },
              { key: "for", label: "For you" },
            ]}
          />
        ) : (
          <Segments
            value={mine}
            onChange={(v) => (setMine(v), setPage(0))}
            options={[
              { key: "active", label: "Active", n: groups.active.length },
              { key: "applied", label: "Applied", n: groups.applied.length },
              { key: "past", label: "Past", n: groups.past.length },
            ]}
          />
        )}
        {pages > 1 ? (
          <div className="flex items-center gap-1">
            <PageButton label="Previous" disabled={current === 0} onClick={() => setPage(current - 1)}>
              <ChevronLeft size={18} />
            </PageButton>
            <span className="min-w-12 text-center text-[13px] font-semibold tabular-nums text-slate-500">
              {current + 1} / {pages}
            </span>
            <PageButton label="Next" disabled={current >= pages - 1} onClick={() => setPage(current + 1)}>
              <ChevronRight size={18} />
            </PageButton>
          </div>
        ) : null}
      </div>

      {failed && items.length === 0 ? (
        <Empty title="Could not load campaigns" />
      ) : shown.length === 0 ? (
        tab === "explore" ? (
          <Empty title={forYou ? "Nothing matches your interests" : "No open campaigns"} />
        ) : (
          <Empty title={mine === "active" ? "No active campaigns" : mine === "applied" ? "No applications" : "Nothing here yet"}>
            {mine !== "past" ? (
              <button type="button" onClick={() => go("explore")} className="mt-4 h-11 cursor-pointer rounded-full border-0 bg-blue-500 px-6 text-[15px] font-bold text-white shadow-accent transition-transform active:scale-[0.97]">
                Explore
              </button>
            ) : null}
          </Empty>
        )
      ) : (
        <div key={`${tab}-${mine}-${forYou}-${current}`} className="grid animate-om-fade grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {shown.map((it) =>
            "kind" in it ? (
              <CampaignCard key={`${it.kind}-${it.company_id}-${it.application_id ?? ""}`} c={it} onOpen={() => setOpenCampaign(it)} />
            ) : (
              <ListingCard key={it.id} l={it} onOpen={() => setOpenListing(it)} />
            ),
          )}
        </div>
      )}

      {openListing ? <ListingPanel l={openListing} name={name} missing={missing} onClose={() => setOpenListing(null)} /> : null}
      {openCampaign ? (
        <CampaignPanel
          c={openCampaign}
          listing={byListing(openCampaign.listing_id)}
          name={name}
          missing={missing}
          onClose={() => setOpenCampaign(null)}
        />
      ) : null}
    </main>
  );
}

function Segments<K extends string>({ value, onChange, options }: { value: K; onChange: (k: K) => void; options: { key: K; label: string; n?: number }[] }) {
  return (
    <div className="flex rounded-full bg-fill-quiet p-1">
      {options.map((o) => {
        const on = o.key === value;
        return (
          <button
            key={o.key}
            type="button"
            aria-pressed={on}
            onClick={() => onChange(o.key)}
            className={`flex h-9 cursor-pointer items-center gap-1.5 rounded-full border-0 px-4 text-[14px] transition-all duration-[160ms] ease-om ${
              on ? "bg-white font-bold text-ink shadow-sm" : "bg-transparent font-semibold text-slate-500 hover:text-ink"
            }`}
          >
            {o.label}
            {o.n !== undefined ? <span className={`tabular-nums ${on ? "text-blue-600" : "text-slate-400"}`}>{o.n}</span> : null}
          </button>
        );
      })}
    </div>
  );
}

function PageButton({ label, disabled, onClick, children }: { label: string; disabled: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-line bg-white text-ink transition-colors hover:bg-fill-quiet disabled:cursor-default disabled:opacity-40"
    >
      {children}
    </button>
  );
}

function Empty({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center py-16 text-center">
      <p className="m-0 text-[20px] font-bold tracking-[-0.3px] text-ink">{title}</p>
      {children}
    </div>
  );
}

function Mark({ id, name, size = 44 }: { id: string; name: string; size?: number }) {
  return (
    <span
      className={`flex shrink-0 items-center justify-center rounded-[12px] font-bold ${TONE[toneFor(id)]}`}
      style={{ width: size, height: size, fontSize: Math.round(size * 0.44) }}
    >
      {(name || "?").trim().charAt(0).toUpperCase()}
    </span>
  );
}

function Pill({ tone, children }: { tone: Tone; children: ReactNode }) {
  return <span className={`inline-flex h-6 items-center rounded-full px-2.5 text-[12px] font-bold ${TONE[tone]}`}>{children}</span>;
}

const CARD =
  "flex h-full w-full cursor-pointer flex-col rounded-[20px] border border-line bg-white p-4 text-left transition-all duration-[160ms] ease-om hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md active:scale-[0.99]";

const cardOf = (l: FeedListing): CardCampaign => ({ ...withTerms(l), logo_url: companyLogoUrl(l.logo_path), website: l.company_website });

function ListingCard({ l, onOpen }: { l: FeedListing; onOpen: () => void }) {
  return <ExploreCard c={cardOf(l)} onOpen={onOpen} />;
}

function CampaignCard({ c, onOpen }: { c: CreatorCampaign; onOpen: () => void }) {
  const todo = campaignTodo(c);
  const chip =
    c.kind === "invited"
      ? { tone: "purple" as const, label: "Invited you" }
      : c.kind === "offered"
        ? { tone: "green" as const, label: "Sign to start" }
        : c.kind === "applied"
          ? { tone: "amber" as const, label: "Applied" }
          : c.kind === "past"
            ? { tone: "grey" as const, label: pastLabel(c.application_status) }
            : null;
  return (
    <button type="button" onClick={onOpen} className={CARD}>
      <div className="flex w-full items-center gap-3">
        <Mark id={c.company_id} name={c.company_name} />
        <div className="min-w-0 flex-1">
          <p className="m-0 truncate text-[16px] font-bold text-ink">{c.company_name}</p>
          {c.title && c.title !== c.company_name ? <p className="m-0 truncate text-[13px] text-slate-500">{c.title}</p> : null}
        </div>
        {chip ? <Pill tone={chip.tone}>{chip.label}</Pill> : null}
      </div>
      {c.kind === "active" ? (
        <>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {todo.length > 0 ? todo.map((t) => <Pill key={t.label} tone={t.tone}>{t.label}</Pill>) : <Pill tone="grey">Caught up</Pill>}
          </div>
          <div className="mt-auto grid w-full grid-cols-3 gap-2 pt-4">
            <Stat value={money(c.earned_month_cents)} label="this month" green />
            <Stat value={String(c.posted)} label="posted" />
            <Stat value={String(c.in_review)} label="in review" />
          </div>
        </>
      ) : c.kind === "invited" && c.invite_message ? (
        <p className="m-0 mt-3 line-clamp-2 text-[14px] leading-[1.45] text-ink">“{c.invite_message}”</p>
      ) : c.kind === "past" && (c.posted > 0 || c.earned_total_cents > 0) ? (
        <p className="m-0 mt-3 text-[13px] text-slate-500">
          {money(c.earned_total_cents)} earned · {c.posted} posted
        </p>
      ) : null}
    </button>
  );
}

function Stat({ value, label, green }: { value: string; label: string; green?: boolean }) {
  return (
    <div className="min-w-0">
      <p className={`m-0 text-[18px] font-bold tabular-nums ${green ? "text-green" : "text-ink"}`}>{value}</p>
      <p className="m-0 truncate text-[12px] text-slate-500">{label}</p>
    </div>
  );
}

/* A side panel over the board. Its own body scrolls when a contract is long;
   the page behind never does. */
function Panel({ onClose, children, footer }: { onClose: () => void; children: ReactNode; footer?: ReactNode }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);
  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <button type="button" aria-label="Close" onClick={onClose} className="absolute inset-0 animate-om-fade cursor-default border-0 bg-scrim" />
      <aside role="dialog" className="relative flex h-full w-full max-w-[480px] animate-om-rise flex-col bg-white shadow-2xl">
        <button
          type="button"
          aria-label="Close"
          onClick={onClose}
          className="absolute right-4 top-4 z-10 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border-0 bg-fill-quiet text-ink hover:bg-line"
        >
          <X size={18} />
        </button>
        <div className="flex-1 overflow-y-auto px-6 pb-6 pt-6">{children}</div>
        {footer ? <div className="border-t border-line px-6 py-4">{footer}</div> : null}
      </aside>
    </div>
  );
}

function PanelHead({ id, company, title, chip }: { id: string; company: string; title: string | null; chip?: ReactNode }) {
  return (
    <div className="mb-5 flex items-center gap-3 pr-10">
      <Mark id={id} name={company} size={52} />
      <div className="min-w-0 flex-1">
        <p className="m-0 truncate text-[13px] font-semibold text-slate-500">{company}</p>
        <p className="m-0 text-[20px] font-bold leading-[1.2] tracking-[-0.3px] text-ink">{title || company}</p>
      </div>
      {chip}
    </div>
  );
}

const PRIMARY =
  "inline-flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-full border-0 bg-blue-500 px-6 text-[16px] font-bold text-white shadow-accent transition-all duration-[160ms] ease-om hover:bg-blue-400 active:scale-[0.98] disabled:cursor-default disabled:opacity-50";
const QUIET =
  "inline-flex h-12 w-full cursor-pointer items-center justify-center rounded-full border border-line bg-white px-6 text-[15px] font-bold text-ink transition-colors hover:bg-fill-quiet disabled:opacity-50";

function Done({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-10">
      <span className="flex h-16 w-16 animate-om-bounce items-center justify-center rounded-full bg-green text-white">
        <Check size={32} strokeWidth={3} />
      </span>
      <p className="m-0 text-[20px] font-bold text-ink">{label}</p>
    </div>
  );
}

function ListingDetails({ l }: { l: FeedListing }) {
  const t = withTerms(l);
  const facts = [postsPerDayLabel(t), spotsLabel(l), l.min_age > 0 ? `${l.min_age}+` : null, ...l.platforms.map((p) => (p === "tiktok" ? "TikTok" : p === "instagram" ? "Instagram" : p))].filter(Boolean);
  return (
    <div className="flex flex-col gap-4">
      <CampaignCover c={cardOf(l)} className="rounded-[18px]" />
      <div className="grid grid-cols-3 gap-2">
        {payLines(t).map((p) => (
          <div key={p.label} className="rounded-[14px] bg-green-soft px-3 py-2.5">
            <p className="m-0 text-[18px] font-extrabold text-green">{p.value}</p>
            <p className="m-0 text-[11.5px] font-bold leading-tight text-green">{p.label}</p>
          </div>
        ))}
      </div>
      <div className="flex flex-wrap gap-1.5">
        {facts.map((f) => (
          <span key={f} className="rounded-full bg-ink px-2.5 py-1 text-[12.5px] font-bold text-white">
            {f}
          </span>
        ))}
      </div>
      {l.tagline ? <p className="m-0 text-[15px] leading-[1.5] text-ink">{l.tagline}</p> : null}
      {l.about ? <Section title="About">{l.about}</Section> : null}
      {l.requirements ? <Section title="What they want">{l.requirements}</Section> : null}
      {l.niches.length > 0 ? (
        <div className="flex flex-wrap gap-1.5">
          {l.niches.map((n) => (
            <span key={n} className="rounded-full bg-fill-quiet px-2.5 py-1 text-[12.5px] font-semibold text-slate-500">
              {nicheLabel(n)}
            </span>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div>
      <p className="m-0 mb-1 text-[13px] font-semibold text-slate-500">{title}</p>
      <p className="m-0 whitespace-pre-line text-[15px] leading-[1.5] text-ink">{children}</p>
    </div>
  );
}

/* Applying is one press. Once the company accepts (or invites), the
   agreement written for this creator is here to read and sign by name. */
function useSign(l: FeedListing | null, name: string) {
  const router = useRouter();
  const [step, setStep] = useState<"view" | "sign" | "done">("view");
  const [signed, setSigned] = useState(name);
  const [signature, setSignature] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, start] = useTransition();
  const submit = () => {
    if (!l) return;
    setError(null);
    start(async () => {
      const signing = (l.application_status === "offered" || l.application_status === "invited") && l.application_id;
      const res = signing ? await signAgreement(l.application_id!, signed, signature) : await apply(l.id);
      if (res.ok) {
        setStep("done");
        router.refresh();
      } else setError(res.error);
    });
  };
  return { step, setStep, signed, setSigned, signature, setSignature, error, busy, submit };
}

function SignStep({ l, signed, setSigned, signature, setSignature }: { l: FeedListing; signed: string; setSigned: (v: string) => void; signature: string; setSignature: (v: string) => void }) {
  return (
    <div className="flex flex-col gap-4">
      <p className="m-0 text-[17px] font-bold text-ink">{l.contract_title || "Agreement"}</p>
      <AgreementText body={l.contract_body} className="max-h-[32vh] overflow-y-auto rounded-[14px] bg-fill-quiet p-4 text-[14px] leading-[1.55] text-ink" />
      <label className="flex flex-col gap-[7px]">
        <span className="text-[13px] font-semibold text-slate-500">Full name</span>
        <input
          value={signed}
          onChange={(e) => setSigned(e.target.value)}
          autoComplete="name"
          className="h-12 rounded-[14px] border border-line bg-white px-4 text-[17px] text-ink outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
        />
      </label>
      <div className="flex flex-col gap-[7px]">
        <span className="text-[13px] font-semibold text-slate-500">Signature</span>
        <SignaturePad value={signature} onChange={setSignature} />
      </div>
    </div>
  );
}

function ListingPanel({ l, name, missing, onClose }: { l: FeedListing; name: string; missing: string[]; onClose: () => void }) {
  const s = useSign(l, name);
  const invited = l.application_status === "invited";
  const offered = l.application_status === "offered";
  const signing = invited || offered;
  const [talking, setTalking] = useState(false);
  const blocked = missing.length > 0 && !signing;
  return (
    <Panel
      onClose={onClose}
      footer={
        s.step === "done" ? (
          <button type="button" onClick={onClose} className={PRIMARY}>
            Done
          </button>
        ) : s.step === "sign" ? (
          <div className="flex flex-col gap-2">
            <button type="button" disabled={s.busy || !s.signed.trim() || !isDrawn(s.signature)} onClick={s.submit} className={PRIMARY}>
              {s.busy ? "Submitting" : "Submit"}
            </button>
            {s.error ? <p className="m-0 text-center text-[13px] font-semibold text-danger">{s.error}</p> : null}
          </div>
        ) : blocked ? (
          <Link href="/profile" className={`${PRIMARY} no-underline`}>
            Add {missing.join(" and ")}
          </Link>
        ) : l.spots_left === 0 && !signing ? (
          <button type="button" disabled className={PRIMARY}>
            Full
          </button>
        ) : talking ? undefined : (
          <div className="flex flex-col gap-2">
            <button type="button" disabled={s.busy} onClick={signing ? () => s.setStep("sign") : s.submit} className={PRIMARY}>
              {signing ? "Sign agreement" : s.busy ? "Applying" : "Apply"}
            </button>
            {s.error ? <p className="m-0 text-center text-[13px] font-semibold text-danger">{s.error}</p> : null}
            {signing && l.application_id ? (
              <button type="button" onClick={() => setTalking(true)} className={`${QUIET} gap-2`}>
                <MessageCircle size={17} />
                Messages
              </button>
            ) : null}
          </div>
        )
      }
    >
      <PanelHead id={l.company_id} company={l.company_name} title={l.title} chip={invited ? <Pill tone="purple">Invited you</Pill> : offered ? <Pill tone="green">Accepted</Pill> : null} />
      {s.step === "done" ? (
        <Done label={signing ? "You are in" : "Applied"} />
      ) : s.step === "sign" ? (
        <SignStep l={l} signed={s.signed} setSigned={s.setSigned} signature={s.signature} setSignature={s.setSignature} />
      ) : talking && l.application_id ? (
        <div className="flex h-[calc(100dvh-150px)] flex-col">
          <button type="button" onClick={() => setTalking(false)} className="mb-3 inline-flex cursor-pointer items-center gap-1 self-start border-0 bg-transparent p-0 text-[14px] font-bold text-slate-500 hover:text-ink">
            <ChevronLeft size={16} />
            Campaign
          </button>
          <MessageThread applicationId={l.application_id} placeholder={`Message ${l.company_name}`} className="flex-1" />
        </div>
      ) : (
        <>
          {invited && l.invite_message ? <p className="m-0 mb-4 rounded-[14px] bg-[#efeafd] px-4 py-3 text-[15px] text-ink">“{l.invite_message}”</p> : null}
          <ListingDetails l={l} />
        </>
      )}
    </Panel>
  );
}

function CampaignPanel({ c, listing, name, missing, onClose }: { c: CreatorCampaign; listing: FeedListing | null; name: string; missing: string[]; onClose: () => void }) {
  const router = useRouter();
  const [confirm, setConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [left, setLeft] = useState(false);
  const [talking, setTalking] = useState(false);
  const [unread, setUnread] = useState(0);
  const [busy, start] = useTransition();

  const threadId = c.kind === "applied" ? c.application_id : null;
  useEffect(() => {
    if (!threadId) return;
    let live = true;
    void loadUnread([threadId]).then((u) => live && setUnread(u[threadId] ?? 0));
    return () => {
      live = false;
    };
  }, [threadId]);

  // An invite or an accepted application is an agreement to sign.
  if ((c.kind === "invited" || c.kind === "offered") && listing) return <ListingPanel l={listing} name={name} missing={missing} onClose={onClose} />;

  const act = (fn: () => Promise<{ ok: boolean; error?: string }>) => {
    if (!confirm) {
      setConfirm(true);
      return;
    }
    setError(null);
    start(async () => {
      const res = await fn();
      if (res.ok) {
        setLeft(true);
        router.refresh();
      } else setError(res.error ?? "Something went wrong");
    });
  };

  const todo = campaignTodo(c);
  const footer =
    left ? (
      <button type="button" onClick={onClose} className={PRIMARY}>
        Done
      </button>
    ) : c.kind === "active" ? (
      <div className="flex flex-col gap-2">
        {IOS_APP_URL ? (
          <a href={IOS_APP_URL} className={`${PRIMARY} no-underline`}>
            Open the app
          </a>
        ) : null}
        {c.application_id ? (
          <a href={`/agreements/${c.application_id}`} target="_blank" rel="noreferrer" className={`${QUIET} no-underline`}>
            Agreement
          </a>
        ) : null}
        <button type="button" disabled={busy} onClick={() => act(() => leave(c.company_id))} className={`${QUIET} ${confirm ? "border-danger text-danger" : ""}`}>
          {busy ? "Leaving" : confirm ? "Click again to leave" : "Leave campaign"}
        </button>
        {error ? <p className="m-0 text-center text-[13px] font-semibold text-danger">{error}</p> : null}
      </div>
    ) : talking ? undefined : c.kind === "applied" && c.application_id ? (
      <div className="flex flex-col gap-2">
        <button type="button" onClick={() => setTalking(true)} className={PRIMARY}>
          <MessageCircle size={18} />
          Messages
          {unread > 0 ? <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-white px-1 text-[12px] font-extrabold text-blue-600">{unread}</span> : null}
        </button>
        <button type="button" disabled={busy} onClick={() => act(() => withdraw(c.application_id!))} className={`${QUIET} ${confirm ? "border-danger text-danger" : ""}`}>
          {busy ? "Withdrawing" : confirm ? "Click again to withdraw" : "Withdraw"}
        </button>
        {error ? <p className="m-0 text-center text-[13px] font-semibold text-danger">{error}</p> : null}
      </div>
    ) : undefined;

  const chip =
    c.kind === "applied" ? <Pill tone="amber">Applied</Pill> : c.kind === "past" ? <Pill tone="grey">{pastLabel(c.application_status)}</Pill> : null;

  return (
    <Panel onClose={onClose} footer={footer}>
      <PanelHead id={c.company_id} company={c.company_name} title={c.title} chip={chip} />
      {left ? (
        <Done label={c.kind === "active" ? "Left" : "Withdrawn"} />
      ) : talking && threadId ? (
        <div className="flex h-[calc(100dvh-150px)] flex-col">
          <button type="button" onClick={() => setTalking(false)} className="mb-3 inline-flex cursor-pointer items-center gap-1 self-start border-0 bg-transparent p-0 text-[14px] font-bold text-slate-500 hover:text-ink">
            <ChevronLeft size={16} />
            Campaign
          </button>
          <MessageThread applicationId={threadId} placeholder={`Message ${c.company_name}`} className="flex-1" />
        </div>
      ) : c.kind === "active" ? (
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap gap-1.5">
            {todo.length > 0 ? todo.map((t) => <Pill key={t.label} tone={t.tone}>{t.label}</Pill>) : <Pill tone="grey">Caught up</Pill>}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <BigStat value={money(c.earned_month_cents)} label="This month" green />
            <BigStat value={money(c.earned_total_cents)} label="All time" />
            <BigStat value={String(c.posted)} label="Posted" />
            <BigStat value={String(c.in_review)} label="In review" />
          </div>
          {listing ? <p className="m-0 text-[14px] text-slate-500">{postsPerDayLabel(withTerms(listing))}</p> : null}
        </div>
      ) : c.kind === "past" ? (
        <div className="grid grid-cols-2 gap-3">
          <BigStat value={money(c.earned_total_cents)} label="Earned" green />
          <BigStat value={String(c.posted)} label="Posted" />
        </div>
      ) : listing ? (
        <ListingDetails l={listing} />
      ) : null}
    </Panel>
  );
}

function BigStat({ value, label, green }: { value: string; label: string; green?: boolean }) {
  return (
    <div className="rounded-[16px] bg-fill-quiet px-4 py-3">
      <p className={`m-0 text-[24px] font-bold tabular-nums tracking-[-0.4px] ${green ? "text-green" : "text-ink"}`}>{value}</p>
      <p className="m-0 text-[13px] font-semibold text-slate-500">{label}</p>
    </div>
  );
}
