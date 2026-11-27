"use client";

import { AgreementText } from "@/components/agreement/AgreementText";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  FileSignature,
  MessageCircle,
  Pencil,
  Search,
  Send,
  SlidersHorizontal,
  Sparkles,
  Store,
  X,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";

import {
  decideApplication,
  inviteCreator,
  loadCreators,
  loadSignedContract,
  rankWithAi,
  saveListing,
} from "@/app/manager/market/actions";
import { Burst } from "@/components/admin/brain/BrainConfirm";
import { Card, Chip, Field, Modal, PageHead, Pill, TextArea } from "@/components/kit";
import { NICHES } from "@/lib/creator-profile";
import { CampaignCard, type CardCampaign } from "@/components/campaign/CampaignCard";
import { MessageThread } from "@/components/campaign/MessageThread";
import { CARD_COLORS, DEFAULT_TERMS, TERM_FLOORS, cardColor, payLines, postsPerDayLabel, withTerms } from "@/lib/campaign-terms";
import {
  AGE_BANDS,
  EXPERIENCE,
  FOLLOWER_FLOORS,
  GENDER_OPTIONS,
  NO_FILTERS,
  PLATFORMS,
  SORTS,
  VIEW_FLOORS,
  activeFilterCount,
  compactCount,
  creatorFactLine,
  dollars,
  listingStatusLabel,
  mainHandle,
  nicheLabel,
  shortDay,
  type CreatorFilters,
  type CreatorSort,
  type Listing,
  type ListingPatch,
  type MarketCreator,
  type MarketData,
  type MarketScope,
} from "@/lib/manager/market";

/* Market: the company's campaign as creators see it, who applied (already
   signed), who it reached out to, and every creator on Noni ranked for the
   campaign. One screen, no scroll: the board pages like Scout. */

const SCOPES: { key: MarketScope; label: string }[] = [
  { key: "applicants", label: "Applied" },
  { key: "invited", label: "Invited" },
  { key: "all", label: "Creators" },
];

const SPARKS = ["#1BA6EE", "#22C55E", "#F59E0B", "#EC4899"];

function usePerPage(): number {
  const [n, setN] = useState(8);
  useEffect(() => {
    const lg = window.matchMedia("(min-width: 1024px)");
    const xl = window.matchMedia("(min-width: 1280px)");
    const set = () => setN(xl.matches ? 8 : lg.matches ? 6 : 8);
    set();
    lg.addEventListener("change", set);
    xl.addEventListener("change", set);
    return () => {
      lg.removeEventListener("change", set);
      xl.removeEventListener("change", set);
    };
  }, []);
  return n;
}

export function Face({ c, size }: { c: MarketCreator; size: number }) {
  const [broken, setBroken] = useState(false);
  const name = c.full_name?.trim() || "Creator";
  if (c.photo && !broken) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={c.photo}
        alt=""
        width={size}
        height={size}
        onError={() => setBroken(true)}
        className="shrink-0 rounded-full object-cover"
        style={{ width: size, height: size }}
      />
    );
  }
  return (
    <span
      className="inline-flex shrink-0 items-center justify-center rounded-full bg-blue-100 font-extrabold text-blue-700"
      style={{ width: size, height: size, fontSize: Math.round(size * 0.4) }}
    >
      {name.charAt(0).toUpperCase()}
    </span>
  );
}

export function MatchPill({ c }: { c: MarketCreator }) {
  if (!c.match_score) return null;
  const strong = c.match_score >= 80;
  return (
    <span
      className={`inline-flex h-[26px] shrink-0 items-center gap-1 rounded-full px-2.5 text-[12.5px] font-extrabold tabular-nums ${
        strong ? "bg-blue-600 text-white" : "bg-blue-100 text-blue-700"
      }`}
    >
      {c.match_ai ? <Sparkles size={12} /> : null}
      {c.match_score}%
    </span>
  );
}

export function Stats({ c }: { c: MarketCreator }) {
  const items = [
    { label: "Views", value: compactCount(c.total_views) },
    { label: "Earned", value: dollars(c.total_earned_cents) },
    { label: "Followers", value: compactCount(c.followers) },
  ];
  return (
    <div className="grid grid-cols-3 gap-2">
      {items.map((s) => (
        <div key={s.label} className="rounded-[12px] bg-fill-quiet px-2.5 py-2">
          <div className="text-[15px] font-extrabold tabular-nums text-ink">{s.value}</div>
          <div className="text-[11.5px] font-bold text-slate-400">{s.label}</div>
        </div>
      ))}
    </div>
  );
}

export function Niches({ niches, wanted, max = 3, oneLine = false }: { niches: string[]; wanted: string[]; max?: number; oneLine?: boolean }) {
  if (niches.length === 0) return null;
  const shown = [...niches].sort((a, b) => Number(wanted.includes(b)) - Number(wanted.includes(a))).slice(0, max);
  return (
    <div className={`flex gap-1.5 ${oneLine ? "shrink-0 flex-nowrap overflow-hidden" : "flex-wrap"}`}>
      {shown.map((n) => (
        <Chip key={n} tone={wanted.includes(n) ? "blue" : "slate"} className="shrink-0 whitespace-nowrap">
          {nicheLabel(n)}
        </Chip>
      ))}
      {niches.length > max ? <Chip tone="slate">+{niches.length - max}</Chip> : null}
    </div>
  );
}

function CreatorCard({
  c,
  scope,
  wanted,
  canInvite,
  busy,
  onOpen,
  onInvite,
  onDecide,
}: {
  c: MarketCreator;
  scope: MarketScope;
  wanted: string[];
  canInvite: boolean;
  busy: boolean;
  onOpen: () => void;
  onInvite: () => void;
  onDecide: (accept: boolean) => void;
}) {
  const name = c.full_name?.trim() || "Creator";
  const facts = creatorFactLine(c) || mainHandle(c) || "New to Noni";
  const line = c.match_reason ?? (scope === "applicants" && c.application_note ? `“${c.application_note}”` : null);
  return (
    <Card pad={16} lift onClick={onOpen} className="flex h-full min-h-0 cursor-pointer flex-col gap-3 overflow-hidden">
      <div className="flex items-center gap-3">
        <Face c={c} size={44} />
        <div className="min-w-0 flex-1">
          <div className="truncate text-[15px] font-extrabold text-ink">{name}</div>
          <div className="truncate text-[12.5px] font-semibold text-slate-400">{facts}</div>
        </div>
        <MatchPill c={c} />
      </div>
      {line ? <p className="m-0 line-clamp-2 shrink-0 text-[13px] font-medium leading-[1.4] text-slate-600">{line}</p> : null}
      <div className="shrink-0">
        <Stats c={c} />
      </div>
      <Niches niches={c.niches} wanted={wanted} max={2} oneLine />
      <div className="mt-auto flex items-center gap-2 pt-1" onClick={(e) => e.stopPropagation()}>
        {scope === "applicants" ? (
          <>
            <Pill variant="quiet" size="sm" disabled={busy} onClick={() => onDecide(false)}>
              Decline
            </Pill>
            <Pill size="sm" icon={Check} loading={busy} onClick={() => onDecide(true)}>
              Accept
            </Pill>
          </>
        ) : c.application_status === "offered" ? (
          <Chip tone="amber">Signing</Chip>
        ) : c.application_status === "invited" ? (
          <Chip tone="blue">Invited {shortDay(c.applied_at) ?? ""}</Chip>
        ) : c.application_status === "applied" ? (
          <Chip tone="amber">Applied</Chip>
        ) : canInvite ? (
          <Pill variant="tint" size="sm" icon={Send} onClick={onInvite}>
            Reach out
          </Pill>
        ) : null}
      </div>
    </Card>
  );
}

function Toggle({ on, onChange, label }: { on: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      onClick={() => onChange(!on)}
      className={`relative h-[28px] w-[48px] shrink-0 cursor-pointer rounded-full transition-colors duration-200 ${on ? "bg-green" : "bg-line"}`}
    >
      <span
        className="absolute top-[3px] h-[22px] w-[22px] rounded-full bg-white shadow transition-[left] duration-200"
        style={{ left: on ? 23 : 3 }}
      />
    </button>
  );
}

function PillPicker<K extends string>({
  options,
  value,
  onToggle,
}: {
  options: ReadonlyArray<{ key: K; label: string }>;
  value: readonly string[];
  onToggle: (k: K) => void;
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map((o) => {
        const on = value.includes(o.key);
        return (
          <button
            key={o.key}
            type="button"
            onClick={() => onToggle(o.key)}
            className={`cursor-pointer rounded-full border px-3 py-1.5 text-[12.5px] font-bold transition-colors ${
              on ? "border-blue-600 bg-blue-600 text-white" : "border-line bg-white text-slate-500 hover:text-ink"
            }`}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

export function SmallLabel({ children }: { children: ReactNode }) {
  return <div className="mb-1.5 text-[12px] font-extrabold uppercase tracking-[0.06em] text-slate-400">{children}</div>;
}

function NumberBox({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <label className="block">
      <SmallLabel>{label}</SmallLabel>
      <input
        inputMode="numeric"
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value.replace(/[^0-9]/g, "").slice(0, 4))}
        className="h-11 w-full rounded-[12px] border border-line bg-white px-3 text-[15px] font-semibold text-ink outline-none focus:border-blue-600"
      />
    </label>
  );
}

const EDIT_TABS = ["Pitch", "Who", "Job", "Pay", "Agreement"] as const;
type EditTab = (typeof EDIT_TABS)[number];

/* The campaign as creators see it. Tabs inside the modal so it never scrolls. */
function ListingEditor({
  listing,
  companyName,
  logoUrl,
  onSaved,
  onClose,
}: {
  listing: Listing | null;
  companyName: string;
  logoUrl: string | null;
  onSaved: (l: Listing) => void;
  onClose: () => void;
}) {
  const [tab, setTab] = useState<EditTab>("Pitch");
  const [title, setTitle] = useState(listing?.title ?? `${companyName} creators`);
  const [tagline, setTagline] = useState(listing?.tagline ?? "");
  const [about, setAbout] = useState(listing?.about ?? "");
  const [requirements, setRequirements] = useState(listing?.requirements ?? "");
  const [niches, setNiches] = useState<string[]>(listing?.niches ?? []);
  const [platforms, setPlatforms] = useState<string[]>(listing?.platforms ?? ["tiktok", "instagram"]);
  const t0 = listing ? withTerms(listing) : DEFAULT_TERMS;
  const [dayMin, setDayMin] = useState(String(t0.posts_per_day_min));
  const [dayMax, setDayMax] = useState(String(t0.posts_per_day_max));
  const [video, setVideo] = useState(String(t0.video_post_cents / 100));
  const [slide, setSlide] = useState(String(t0.static_post_cents / 100));
  const [per1k, setPer1k] = useState(String(t0.cents_per_1k_views / 100));
  const [cap, setCap] = useState(String(t0.view_pay_cap_cents / 100));
  const [minViews, setMinViews] = useState(String(t0.min_views));
  const [color, setColor] = useState(cardColor(t0.brand_color, companyName));
  const [spots, setSpots] = useState(listing?.spots != null ? String(listing.spots) : "");
  const [startDays, setStartDays] = useState(String(listing?.start_days ?? 3));
  const [minAge, setMinAge] = useState(String(listing?.min_age ?? 18));
  const [contractTitle, setContractTitle] = useState(listing?.contract_title ?? "Creator agreement");
  const [contract, setContract] = useState(listing?.contract_body ?? "");
  const [open, setOpen] = useState(listing?.status === "open");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggle = (list: string[], set: (v: string[]) => void) => (k: string) =>
    set(list.includes(k) ? list.filter((x) => x !== k) : [...list, k]);

  const cents = (v: string, floor: number) => Math.max(floor, Math.round((Number(v) || 0) * 100));
  const lo = Math.min(7, Math.max(1, Math.round(Number(dayMin) || 1)));
  const terms = {
    posts_per_day_min: lo,
    posts_per_day_max: Math.min(7, Math.max(lo, Math.round(Number(dayMax) || lo))),
    video_post_cents: cents(video, TERM_FLOORS.video_post_cents),
    static_post_cents: cents(slide, TERM_FLOORS.static_post_cents),
    cents_per_1k_views: cents(per1k, TERM_FLOORS.cents_per_1k_views),
    view_pay_cap_cents: cents(cap, 0),
    min_views: Math.max(0, Math.round(Number(minViews) || 0)),
    brand_color: color,
  };
  const card: CardCampaign = { ...terms, company_name: companyName, title: title.trim() || companyName, tagline: tagline.trim() || null, logo_url: logoUrl };

  const save = async () => {
    if (busy || !title.trim()) return;
    setBusy(true);
    setError(null);
    const patch: ListingPatch = {
      title: title.trim(),
      tagline: tagline.trim(),
      about: about.trim(),
      requirements: requirements.trim(),
      niches,
      platforms,
      ...terms,
      spots: spots ? Math.max(1, Number(spots)) : null,
      start_days: Math.min(60, Number(startDays) || 0),
      min_age: Math.max(18, Number(minAge) || 18),
      contract_title: contractTitle.trim(),
      ...(listing ? { contract_body: contract } : {}),
      status: listing ? (open ? "open" : listing.status === "open" ? "paused" : listing.status) : "draft",
    };
    const r = await saveListing(listing?.id ?? null, patch);
    setBusy(false);
    if (!r.ok) {
      setError(r.error);
      if (/agreement/i.test(r.error)) setTab("Agreement");
      return;
    }
    onSaved(r.data);
    if (!listing) {
      /* The server wrote the starting agreement; show it before opening. */
      setContract(r.data.contract_body);
      setContractTitle(r.data.contract_title);
      setTab("Agreement");
    } else {
      onClose();
    }
  };

  const tabs = listing ? EDIT_TABS : EDIT_TABS.filter((t) => t !== "Agreement");

  return (
    <Modal title="Your campaign" onClose={onClose} width={900}>
     <div className="flex flex-col gap-5 md:flex-row">
      <div className="min-w-0 flex-1">
      {listing ? (
        <div className="mb-4 flex items-center gap-3 rounded-[14px] bg-fill-quiet px-4 py-3">
          <span className="flex-1 text-[14px] font-extrabold text-ink">Open to applications</span>
          <Toggle on={open} onChange={setOpen} label="Open to applications" />
        </div>
      ) : null}
      <div className="mb-4 flex gap-1">
        {tabs.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`cursor-pointer rounded-full px-[14px] py-[6px] text-[13px] font-bold ${
              tab === t ? "bg-blue-100 text-blue-700" : "text-slate-400 hover:text-ink"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="flex min-h-[300px] flex-col gap-3">
        {tab === "Pitch" ? (
          <>
            <Field label="Campaign name" value={title} onChange={(e) => setTitle(e.target.value.slice(0, 80))} />
            <Field label="One line" value={tagline} onChange={(e) => setTagline(e.target.value.slice(0, 140))} optional />
            <TextArea label="About" value={about} onChange={(e) => setAbout(e.target.value.slice(0, 2000))} rows={3} optional />
            <div>
              <SmallLabel>Card color</SmallLabel>
              <div className="flex flex-wrap gap-2">
                {CARD_COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    aria-label={c}
                    aria-pressed={color === c}
                    onClick={() => setColor(c)}
                    className={`h-8 w-8 cursor-pointer rounded-full border-2 border-white transition-transform active:scale-90 ${color === c ? "scale-110 outline outline-2 outline-ink" : "hover:scale-105"}`}
                    style={{ background: c }}
                  />
                ))}
              </div>
            </div>
          </>
        ) : tab === "Who" ? (
          <>
            <TextArea
              label="Who you want"
              value={requirements}
              onChange={(e) => setRequirements(e.target.value.slice(0, 1000))}
              rows={3}
              optional
            />
            <div>
              <SmallLabel>Niches</SmallLabel>
              <PillPicker options={NICHES} value={niches} onToggle={toggle(niches, setNiches)} />
            </div>
            <div>
              <SmallLabel>Platforms</SmallLabel>
              <PillPicker options={PLATFORMS} value={platforms} onToggle={toggle(platforms, setPlatforms)} />
            </div>
          </>
        ) : tab === "Job" ? (
          <>
            <div className="grid grid-cols-2 gap-3">
              <NumberBox label="Posts a day, least" value={dayMin} onChange={(v) => setDayMin(v.slice(0, 1))} />
              <NumberBox label="Posts a day, most" value={dayMax} onChange={(v) => setDayMax(v.slice(0, 1))} />
              <NumberBox label="Creators wanted" value={spots} onChange={setSpots} placeholder="No limit" />
              <NumberBox label="Days to first post" value={startDays} onChange={(v) => setStartDays(v.slice(0, 2))} />
              <NumberBox label="Minimum age" value={minAge} onChange={(v) => setMinAge(v.slice(0, 2))} />
            </div>
          </>
        ) : tab === "Pay" ? (
          <div className="grid grid-cols-2 gap-3">
            <NumberBox label="Per video, $" value={video} onChange={(v) => setVideo(v.slice(0, 4))} />
            <NumberBox label="Per slideshow, $" value={slide} onChange={(v) => setSlide(v.slice(0, 4))} />
            <NumberBox label="Per 1,000 views, $" value={per1k} onChange={(v) => setPer1k(v.slice(0, 3))} />
            <NumberBox label="View pay cap, $" value={cap} onChange={(v) => setCap(v.slice(0, 5))} />
            <NumberBox label="Views to get paid" value={minViews} onChange={(v) => setMinViews(v.slice(0, 6))} />
          </div>
        ) : (
          <>
            <Field label="Title" value={contractTitle} onChange={(e) => setContractTitle(e.target.value.slice(0, 80))} />
            <TextArea label="Terms" value={contract} onChange={(e) => setContract(e.target.value)} rows={10} />
          </>
        )}
      </div>

      {error ? <div className="mt-3 text-[13px] font-semibold text-danger">{error}</div> : null}
      <div className="mt-5 flex justify-end gap-2">
        <Pill variant="quiet" onClick={onClose}>
          Cancel
        </Pill>
        <Pill loading={busy} disabled={!title.trim()} onClick={() => void save()}>
          {listing ? "Save" : "Create"}
        </Pill>
      </div>
      </div>
      <div className="hidden w-[300px] shrink-0 md:block">
        <SmallLabel>Creators see</SmallLabel>
        <CampaignCard c={card} chips={[...(spots ? [{ label: `${spots} spots` }] : []), ...niches.slice(0, 2).map((n) => ({ label: nicheLabel(n) }))]} className="!h-auto" />
      </div>
     </div>
    </Modal>
  );
}

function CreatorModal({
  c,
  listing,
  busy,
  onClose,
  onDecide,
  onInvite,
}: {
  c: MarketCreator;
  listing: Listing | null;
  busy: boolean;
  onClose: () => void;
  onDecide: (accept: boolean) => void;
  onInvite: (message: string) => void;
}) {
  const name = c.full_name?.trim() || "Creator";
  const [writing, setWriting] = useState(false);
  const [talking, setTalking] = useState(false);
  const [message, setMessage] = useState("");
  const [contract, setContract] = useState<{ title: string | null; body: string | null; signedName: string | null; signedAt: string | null } | null>(null);
  const [contractError, setContractError] = useState<string | null>(null);

  const showContract = async () => {
    if (!c.application_id) return;
    const r = await loadSignedContract(c.application_id);
    if (r.ok) setContract(r.data);
    else setContractError(r.error);
  };

  const links = [
    c.tiktok ? { label: `TikTok @${c.tiktok}`, href: `https://www.tiktok.com/@${c.tiktok}` } : null,
    c.instagram ? { label: `Instagram @${c.instagram}`, href: `https://www.instagram.com/${c.instagram}` } : null,
    c.youtube ? { label: "YouTube", href: c.youtube.startsWith("http") ? c.youtube : `https://www.youtube.com/@${c.youtube}` } : null,
  ].filter((x): x is { label: string; href: string } => x !== null);

  if (contract) {
    return (
      <Modal title={contract.title ?? "Agreement"} onClose={() => setContract(null)} width={620}>
        <AgreementText body={contract.body ?? ""} className="max-h-[58vh] overflow-y-auto rounded-[12px] bg-fill-quiet p-4 text-[13px] leading-[1.55] text-ink" />
        <div className="mt-3 flex items-center justify-between gap-3 text-[13px] font-bold text-slate-500">
          <span>
            {contract.signedAt ? `Signed by ${contract.signedName ?? name}${shortDay(contract.signedAt) ? ` on ${shortDay(contract.signedAt)}` : ""}` : "Not signed yet"}
          </span>
          {c.application_id && contract.signedAt ? (
            <a href={`/agreements/${c.application_id}`} target="_blank" rel="noreferrer" className="text-blue-600 no-underline hover:underline">
              Signed copy
            </a>
          ) : null}
        </div>
      </Modal>
    );
  }

  if (talking && c.application_id) {
    return (
      <Modal title={name} onClose={() => setTalking(false)} width={520}>
        <MessageThread applicationId={c.application_id} placeholder={`Message ${name.split(" ")[0]}`} className="h-[52vh]" />
      </Modal>
    );
  }

  return (
    <Modal title="" onClose={onClose} width={600}>
      <div className="flex items-center gap-4">
        <Face c={c} size={64} />
        <div className="min-w-0 flex-1">
          <div className="truncate text-[22px] font-extrabold text-ink">{name}</div>
          <div className="truncate text-[13.5px] font-semibold text-slate-400">{creatorFactLine(c) || mainHandle(c) || "New to Noni"}</div>
        </div>
        <MatchPill c={c} />
      </div>

      {c.match_reason ? <p className="mb-0 mt-4 text-[14px] font-medium leading-[1.45] text-slate-600">{c.match_reason}</p> : null}
      {c.application_note ? (
        <p className="mb-0 mt-3 rounded-[12px] bg-fill-quiet px-3.5 py-2.5 text-[14px] font-medium leading-[1.45] text-ink">“{c.application_note}”</p>
      ) : null}

      <div className="mt-4">
        <Stats c={c} />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 text-[13px]">
        {c.experience ? (
          <div>
            <SmallLabel>Experience</SmallLabel>
            <div className="font-bold text-ink">{EXPERIENCE.find((e) => e.key === c.experience)?.label}</div>
          </div>
        ) : null}
        {c.languages.length ? (
          <div>
            <SmallLabel>Languages</SmallLabel>
            <div className="font-bold capitalize text-ink">{c.languages.slice(0, 3).join(", ")}</div>
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
        <div className="mt-4">
          <Niches niches={c.niches} wanted={listing?.niches ?? []} max={5} />
        </div>
      ) : null}

      {links.length || c.portfolio.length ? (
        <div className="mt-4 flex flex-wrap gap-2">
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
          {c.portfolio.slice(0, 3).map((p, i) => (
            <a
              key={p.url}
              href={p.url}
              target="_blank"
              rel="noreferrer"
              className="rounded-full border border-line px-3 py-1.5 text-[12.5px] font-bold text-ink no-underline hover:bg-fill-quiet"
            >
              Video {i + 1}
            </a>
          ))}
        </div>
      ) : null}

      {writing ? (
        <div className="mt-5">
          <TextArea label="Message" value={message} onChange={(e) => setMessage(e.target.value.slice(0, 600))} rows={3} optional autoFocus />
        </div>
      ) : null}

      {contractError ? <div className="mt-3 text-[13px] font-semibold text-danger">{contractError}</div> : null}

      <div className="mt-5 flex flex-wrap items-center justify-end gap-2">
        {c.application_status === "applied" && c.application_id ? (
          <>
            <Pill variant="tint" size="sm" icon={MessageCircle} onClick={() => setTalking(true)}>
              Message
            </Pill>
            <Pill variant="ghost" size="sm" icon={FileSignature} onClick={() => void showContract()}>
              Agreement
            </Pill>
            <span className="flex-1" />
            <Pill variant="quiet" disabled={busy} onClick={() => onDecide(false)}>
              Decline
            </Pill>
            <Pill icon={Check} loading={busy} onClick={() => onDecide(true)}>
              Accept
            </Pill>
          </>
        ) : (c.application_status === "invited" || c.application_status === "offered") && c.application_id ? (
          <>
            <Chip tone={c.application_status === "offered" ? "amber" : "blue"}>{c.application_status === "offered" ? "Signing" : "Invited"}</Chip>
            <Pill variant="ghost" size="sm" icon={FileSignature} onClick={() => void showContract()}>
              Agreement
            </Pill>
            <span className="flex-1" />
            <Pill variant="tint" icon={MessageCircle} onClick={() => setTalking(true)}>
              Message
            </Pill>
          </>
        ) : c.is_member ? (
          <Chip tone="green">On your team</Chip>
        ) : listing ? (
          writing ? (
            <>
              <Pill variant="quiet" onClick={() => setWriting(false)}>
                Cancel
              </Pill>
              <Pill icon={Send} loading={busy} onClick={() => onInvite(message)}>
                Send invite
              </Pill>
            </>
          ) : (
            <Pill icon={Send} onClick={() => setWriting(true)}>
              Reach out
            </Pill>
          )
        ) : null}
      </div>
    </Modal>
  );
}

function FiltersPanel({ value, onApply, onClose }: { value: CreatorFilters; onApply: (f: CreatorFilters) => void; onClose: () => void }) {
  const [f, setF] = useState(value);
  const band = AGE_BANDS.find((b) => b.min === f.minAge && b.max === f.maxAge)?.key ?? "any";
  const floorOptions = (floors: readonly (number | null)[]) =>
    floors.map((n) => ({ key: n === null ? "any" : String(n), label: n === null ? "Any" : `${compactCount(n)}+` }));
  return (
    <Modal title="Filters" onClose={onClose} width={560}>
      <div className="flex flex-col gap-4">
        <div>
          <SmallLabel>Niches</SmallLabel>
          <PillPicker
            options={NICHES}
            value={f.niches}
            onToggle={(k) => setF({ ...f, niches: f.niches.includes(k) ? f.niches.filter((x) => x !== k) : [...f.niches, k] })}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <SmallLabel>Age</SmallLabel>
            <PillPicker
              options={AGE_BANDS}
              value={[band]}
              onToggle={(k) => {
                const b = AGE_BANDS.find((x) => x.key === k)!;
                setF({ ...f, minAge: b.min, maxAge: b.max });
              }}
            />
          </div>
          <div>
            <SmallLabel>Gender</SmallLabel>
            <PillPicker
              options={[{ key: "any", label: "Any" }, ...GENDER_OPTIONS]}
              value={[f.gender ?? "any"]}
              onToggle={(k) => setF({ ...f, gender: k === "any" ? null : (k as CreatorFilters["gender"]) })}
            />
          </div>
          <div>
            <SmallLabel>Views</SmallLabel>
            <PillPicker
              options={floorOptions(VIEW_FLOORS)}
              value={[f.minViews === null ? "any" : String(f.minViews)]}
              onToggle={(k) => setF({ ...f, minViews: k === "any" ? null : Number(k) })}
            />
          </div>
          <div>
            <SmallLabel>Followers</SmallLabel>
            <PillPicker
              options={floorOptions(FOLLOWER_FLOORS)}
              value={[f.minFollowers === null ? "any" : String(f.minFollowers)]}
              onToggle={(k) => setF({ ...f, minFollowers: k === "any" ? null : Number(k) })}
            />
          </div>
        </div>
        <div>
          <SmallLabel>Experience</SmallLabel>
          <PillPicker
            options={[{ key: "any", label: "Any" }, ...EXPERIENCE]}
            value={[f.experience ?? "any"]}
            onToggle={(k) => setF({ ...f, experience: k === "any" ? null : (k as CreatorFilters["experience"]) })}
          />
        </div>
      </div>
      <div className="mt-5 flex justify-end gap-2">
        <Pill variant="quiet" onClick={() => setF(NO_FILTERS)}>
          Clear
        </Pill>
        <Pill onClick={() => onApply(f)}>Show creators</Pill>
      </div>
    </Modal>
  );
}

/* The campaign as creators see it, its numbers, and one switch to open it. */
function CampaignTab({
  listing,
  companyName,
  logoUrl,
  busy,
  applicants,
  onOpen,
  onEdit,
  onApplicants,
}: {
  listing: Listing;
  companyName: string;
  logoUrl: string | null;
  busy: boolean;
  applicants: number;
  onOpen: (open: boolean) => void;
  onEdit: () => void;
  onApplicants: () => void;
}) {
  const l = withTerms(listing);
  const open = l.status === "open";
  const card: CardCampaign = { ...l, company_name: companyName, logo_url: logoUrl };
  const chips = [...(l.spots ? [{ label: `${l.spots} spots` }] : []), ...l.niches.slice(0, 2).map((n) => ({ label: nicheLabel(n) }))];
  return (
    <div className="grid min-h-0 flex-1 animate-om-pop grid-cols-1 gap-4 md:grid-cols-[340px_minmax(0,1fr)]">
      <div className="min-w-0">
        <CampaignCard c={card} chips={chips} className="!h-auto" />
      </div>
      <Card pad={20} className="flex min-w-0 flex-col gap-5">
        <div className="flex flex-wrap items-center gap-3">
          <span className={`h-2.5 w-2.5 rounded-full ${open ? "bg-green" : "bg-slate-300"}`} />
          <span className="flex-1 text-[17px] font-extrabold text-ink">{open ? "Open to creators" : "Hidden from creators"}</span>
          {applicants > 0 ? (
            <Pill variant="tint" size="sm" onClick={onApplicants}>
              {applicants} applied
            </Pill>
          ) : null}
          <Pill variant="quiet" size="sm" icon={Pencil} onClick={onEdit}>
            Edit
          </Pill>
          <Pill size="sm" variant={open ? "quiet" : "primary"} loading={busy} onClick={() => onOpen(!open)}>
            {open ? "Pause" : "Open campaign"}
          </Pill>
        </div>
        <div>
          <SmallLabel>Pay</SmallLabel>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-5">
            {payLines(l).map((p) => (
              <div key={p.label} className="rounded-[14px] bg-fill-quiet px-3.5 py-3">
                <div className="text-[20px] font-extrabold tracking-[-0.3px] text-ink">{p.value}</div>
                <div className="text-[12px] font-bold text-slate-400">{p.label}</div>
              </div>
            ))}
          </div>
        </div>
        <div>
          <SmallLabel>The job</SmallLabel>
          <div className="flex flex-wrap gap-1.5">
            {[postsPerDayLabel(l), l.spots ? `${l.spots} creators wanted` : null, `First post in ${l.start_days} days`, `${l.min_age}+`, ...l.platforms.map((p) => (p === "tiktok" ? "TikTok" : p === "instagram" ? "Instagram" : p))]
              .filter(Boolean)
              .map((x) => (
                <span key={x} className="rounded-full bg-fill-quiet px-3 py-1.5 text-[13px] font-bold text-slate-600">
                  {x}
                </span>
              ))}
          </div>
        </div>
      </Card>
    </div>
  );
}

export function MarketView({ initial, preview = false }: { initial: MarketData; preview?: boolean }) {
  const [listing, setListing] = useState<Listing | null>(initial.listing);
  const [scope, setScope] = useState<MarketScope>(initial.listing ? "applicants" : "all");
  /* The campaign tab shows the card creators see; it opens first when nobody is waiting. */
  const [onCampaign, setOnCampaign] = useState(initial.listing !== null && initial.applicantCount === 0);
  const [opening, setOpening] = useState(false);
  const [rows, setRows] = useState<MarketCreator[]>(initial.creators.rows);
  const [total, setTotal] = useState(initial.creators.total);
  const [counts, setCounts] = useState({ applicants: initial.applicantCount, invited: initial.invitedCount });
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<CreatorSort>("match");
  const [filters, setFilters] = useState<CreatorFilters>(NO_FILTERS);
  const [loading, setLoading] = useState(false);
  const [ranking, setRanking] = useState(false);
  const [editing, setEditing] = useState(false);
  const [filtering, setFiltering] = useState(false);
  const [open, setOpen] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const PER_PAGE = usePerPage();
  const [page, setPage] = useState(0);
  const first = useRef(true);

  const flash = (msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 1800);
  };

  const reload = useCallback(
    async (next?: { scope?: MarketScope; search?: string; sort?: CreatorSort; filters?: CreatorFilters; listingId?: string | null }) => {
      if (preview) return;
      setLoading(true);
      setError(null);
      const r = await loadCreators({
        listingId: next?.listingId !== undefined ? next.listingId : listing?.id ?? null,
        scope: next?.scope ?? scope,
        search: next?.search ?? search,
        sort: next?.sort ?? sort,
        filters: next?.filters ?? filters,
      });
      setLoading(false);
      if (!r.ok) {
        setError(r.error);
        return;
      }
      setRows(r.data.rows);
      setTotal(r.data.total);
      setPage(0);
    },
    [preview, listing?.id, scope, search, sort, filters],
  );

  /* Search as you type, after a short pause. */
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    const t = window.setTimeout(() => void reload(), 300);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const setOpenStatus = async (open: boolean) => {
    if (!listing || opening) return;
    setOpening(true);
    setError(null);
    const r = await saveListing(listing.id, { status: open ? "open" : "paused" });
    setOpening(false);
    if (!r.ok) {
      setError(r.error);
      return;
    }
    setListing(r.data);
    flash(open ? "Campaign is open" : "Paused");
  };

  const pickScope = (s: MarketScope) => {
    setOnCampaign(false);
    setScope(s);
    setPage(0);
    void reload({ scope: s });
  };

  const pages = Math.max(1, Math.ceil(rows.length / PER_PAGE));
  const safePage = Math.min(page, pages - 1);
  const shown = rows.slice(safePage * PER_PAGE, safePage * PER_PAGE + PER_PAGE);
  const openCreator = rows.find((c) => c.creator_id === open) ?? null;
  const aiRanked = rows.some((c) => c.match_ai);
  const status = listing ? listingStatusLabel(listing.status) : null;
  const filterCount = activeFilterCount(filters);

  const decide = async (c: MarketCreator, accept: boolean) => {
    if (!c.application_id || busyId) return;
    setBusyId(c.creator_id);
    const r = await decideApplication(c.application_id, accept);
    setBusyId(null);
    if (!r.ok) {
      setError(r.error);
      return;
    }
    setRows((all) => all.filter((x) => x.creator_id !== c.creator_id));
    setTotal((t) => Math.max(0, t - 1));
    setCounts((k) => ({ ...k, applicants: Math.max(0, k.applicants - 1) }));
    setOpen(null);
    if (accept) setCounts((k) => ({ ...k, invited: k.invited + 1 }));
    flash(accept ? "Agreement sent" : "Declined");
  };

  const invite = async (c: MarketCreator, message: string) => {
    if (!listing || busyId) return;
    setBusyId(c.creator_id);
    const r = await inviteCreator(listing.id, c.creator_id, message);
    setBusyId(null);
    if (!r.ok) {
      setError(r.error);
      return;
    }
    setRows((all) =>
      all.map((x) => (x.creator_id === c.creator_id ? { ...x, application_status: "invited", applied_at: new Date().toISOString() } : x)),
    );
    setCounts((k) => ({ ...k, invited: k.invited + 1 }));
    setOpen(null);
    flash("Invite sent");
  };

  const rank = async () => {
    if (!listing || ranking) return;
    setRanking(true);
    setError(null);
    const r = await rankWithAi(listing.id);
    setRanking(false);
    if (!r.ok) {
      setError(r.error);
      return;
    }
    await reload({ sort: "match" });
    flash(`${r.data} ranked`);
  };

  const onSaved = (l: Listing) => {
    const created = !listing;
    setListing(l);
    if (created) void reload({ listingId: l.id });
  };

  const counter = (s: MarketScope) => (s === "applicants" ? counts.applicants : s === "invited" ? counts.invited : scope === "all" ? total : null);

  return (
    <div className="flex flex-col lg:h-[calc(100dvh-120px)] lg:min-h-[560px]">
      <PageHead
        title="Market"
        right={
          listing ? (
            <div className="flex items-center gap-2">
              <Chip tone={status!.tone}>{status!.label}</Chip>
            </div>
          ) : null
        }
      />

      {!listing ? (
        <Card pad={0} className="mb-4 flex shrink-0 items-center gap-3" style={{ padding: "14px 16px 14px 20px" }}>
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-700">
            <Store size={19} />
          </span>
          <span className="flex-1 text-[15px] font-extrabold text-ink">No campaign yet</span>
          <Pill size="sm" onClick={() => setEditing(true)}>
            Set up campaign
          </Pill>
        </Card>
      ) : null}

      <div className="mb-3 flex shrink-0 flex-wrap items-center gap-2">
        <div className="-mx-1 flex min-w-0 gap-2 overflow-x-auto px-1 [scrollbar-width:none]">
          {listing ? (
            <button
              type="button"
              onClick={() => setOnCampaign(true)}
              className={`shrink-0 cursor-pointer whitespace-nowrap rounded-full border px-4 py-1.5 text-[13.5px] font-bold transition-colors ${
                onCampaign ? "border-ink bg-ink text-white" : "border-line bg-white text-slate-500 hover:text-ink"
              }`}
            >
              Campaign
            </button>
          ) : null}
          {SCOPES.filter((s) => listing || s.key === "all").map((s) => {
            const n = counter(s.key);
            return (
              <button
                key={s.key}
                type="button"
                onClick={() => pickScope(s.key)}
                className={`shrink-0 cursor-pointer whitespace-nowrap rounded-full border px-4 py-1.5 text-[13.5px] font-bold transition-colors ${
                  scope === s.key && !onCampaign ? "border-ink bg-ink text-white" : "border-line bg-white text-slate-500 hover:text-ink"
                }`}
              >
                {s.label} {n !== null ? <span className="tabular-nums opacity-70">{n}</span> : null}
              </button>
            );
          })}
        </div>

        {scope === "all" && !onCampaign ? (
          <div className="flex flex-1 flex-wrap items-center justify-end gap-2">
            <label className="flex h-9 min-w-[180px] flex-1 items-center gap-2 rounded-full border border-line bg-white px-3 sm:max-w-[240px]">
              <Search size={15} className="text-slate-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Name or handle"
                className="min-w-0 flex-1 bg-transparent text-[13.5px] font-semibold text-ink outline-none"
              />
              {search ? (
                <button type="button" aria-label="Clear" onClick={() => setSearch("")} className="cursor-pointer text-slate-400">
                  <X size={14} />
                </button>
              ) : null}
            </label>
            <select
              value={sort}
              onChange={(e) => {
                const s = e.target.value as CreatorSort;
                setSort(s);
                void reload({ sort: s });
              }}
              className="h-9 cursor-pointer rounded-full border border-line bg-white px-3 text-[13px] font-bold text-ink outline-none"
            >
              {SORTS.map((s) => (
                <option key={s.key} value={s.key}>
                  {s.label}
                </option>
              ))}
            </select>
            <Pill variant={filterCount ? "tint" : "quiet"} size="sm" icon={SlidersHorizontal} onClick={() => setFiltering(true)}>
              {filterCount ? `Filters ${filterCount}` : "Filters"}
            </Pill>
            {listing && sort === "match" ? (
              <Pill variant="tint" size="sm" icon={Sparkles} loading={ranking} onClick={() => void rank()}>
                {ranking ? "Ranking" : aiRanked ? "Rerank" : "Rank with AI"}
              </Pill>
            ) : null}
          </div>
        ) : (
          <span className="flex-1" />
        )}

        {pages > 1 && !onCampaign ? (
          <span className="flex items-center gap-1.5 text-[13px] font-bold text-slate-500">
            <button
              type="button"
              aria-label="Previous"
              disabled={safePage === 0}
              onClick={() => setPage(safePage - 1)}
              className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-line bg-white text-ink disabled:cursor-default disabled:opacity-35"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="tabular-nums">
              {safePage + 1} / {pages}
            </span>
            <button
              type="button"
              aria-label="Next"
              disabled={safePage >= pages - 1}
              onClick={() => setPage(safePage + 1)}
              className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-line bg-white text-ink disabled:cursor-default disabled:opacity-35"
            >
              <ChevronRight size={16} />
            </button>
          </span>
        ) : null}
      </div>

      {error ? <div className="mb-2 shrink-0 text-[13px] font-semibold text-danger">{error}</div> : null}

      {onCampaign && listing ? (
        <CampaignTab
          listing={listing}
          companyName={initial.companyName}
          logoUrl={initial.logoUrl}
          busy={opening}
          applicants={counts.applicants}
          onOpen={(open) => void setOpenStatus(open)}
          onEdit={() => setEditing(true)}
          onApplicants={() => pickScope("applicants")}
        />
      ) : shown.length ? (
        <div
          key={`${scope}-${safePage}`}
          className={`grid min-h-0 flex-1 grid-cols-1 gap-3 transition-opacity sm:grid-cols-2 lg:auto-rows-[minmax(0,1fr)] lg:grid-cols-3 xl:grid-cols-4 ${
            loading ? "opacity-50" : ""
          }`}
        >
          {shown.map((c, i) => (
            <div key={c.creator_id} className="h-full min-h-0 min-w-0 animate-om-pop" style={{ animationDelay: `${i * 35}ms` } as CSSProperties}>
              <CreatorCard
                c={c}
                scope={scope}
                wanted={listing?.niches ?? []}
                canInvite={listing !== null}
                busy={busyId === c.creator_id}
                onOpen={() => setOpen(c.creator_id)}
                onInvite={() => setOpen(c.creator_id)}
                onDecide={(accept) => void decide(c, accept)}
              />
            </div>
          ))}
        </div>
      ) : (
        <Card pad={0} className="flex min-h-[240px] flex-1 flex-col items-center justify-center gap-3">
          <span className="text-[15px] font-extrabold text-ink">
            {loading
              ? "Loading"
              : scope === "applicants"
                ? "No applications"
                : scope === "invited"
                  ? "No invites yet"
                  : filterCount || search
                    ? "No matches"
                    : "No creators yet"}
          </span>
          {!loading && scope !== "all" ? (
            <Pill variant="quiet" size="sm" onClick={() => pickScope("all")}>
              Browse creators
            </Pill>
          ) : !loading && (filterCount || search) ? (
            <Pill
              variant="quiet"
              size="sm"
              onClick={() => {
                setFilters(NO_FILTERS);
                setSearch("");
                void reload({ filters: NO_FILTERS, search: "" });
              }}
            >
              Clear filters
            </Pill>
          ) : null}
        </Card>
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

      {openCreator ? (
        <CreatorModal
          c={openCreator}
          listing={listing}
          busy={busyId === openCreator.creator_id}
          onClose={() => setOpen(null)}
          onDecide={(accept) => void decide(openCreator, accept)}
          onInvite={(m) => void invite(openCreator, m)}
        />
      ) : null}

      {editing ? (
        <ListingEditor listing={listing} companyName={initial.companyName} logoUrl={initial.logoUrl} onSaved={onSaved} onClose={() => setEditing(false)} />
      ) : null}

      {filtering ? (
        <FiltersPanel
          value={filters}
          onClose={() => setFiltering(false)}
          onApply={(f) => {
            setFilters(f);
            setFiltering(false);
            void reload({ filters: f });
          }}
        />
      ) : null}
    </div>
  );
}
