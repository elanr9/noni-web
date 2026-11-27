/* A creator's campaigns on the website: the open ones to explore and the
   ones they are in, applied to or left. Mirrors lib/marketplace.ts in the
   app (rpc marketplace_feed, migration 155; rpc creator_campaigns, 162). */
import type { CampaignTerms } from "@/lib/campaign-terms";

export type ApplicationStatus = "invited" | "applied" | "offered" | "accepted" | "declined" | "withdrawn";

export type FeedListing = CampaignTerms & {
  logo_path: string | null;
  id: string;
  company_id: string;
  company_name: string;
  company_website: string | null;
  status: "draft" | "open" | "paused" | "closed";
  title: string;
  tagline: string | null;
  about: string | null;
  requirements: string | null;
  niches: string[];
  platforms: string[];
  posts_per_week: number;
  spots: number | null;
  spots_left: number | null;
  min_age: number;
  start_days: number;
  contract_title: string;
  contract_body: string;
  contract_version: number;
  opened_at: string | null;
  creator_count: number;
  is_member: boolean;
  application_id: string | null;
  application_status: ApplicationStatus | null;
  application_origin: "applied" | "invited" | null;
  invite_message: string | null;
  signed_at: string | null;
  start_date: string | null;
  decision_note: string | null;
  niche_overlap: number;
};

/* "offered": the company accepted and the agreement is waiting to be signed. */
export type CampaignKind = "active" | "invited" | "applied" | "offered" | "past";

export type CreatorCampaign = {
  kind: CampaignKind;
  company_id: string;
  company_name: string;
  logo_path: string | null;
  listing_id: string | null;
  title: string | null;
  posts_per_week: number | null;
  application_id: string | null;
  application_status: string | null;
  invite_message: string | null;
  is_active: boolean;
  since: string | null;
  start_date: string | null;
  to_fix: number;
  to_make: number;
  in_review: number;
  posted: number;
  unread: number;
  earned_month_cents: number;
  earned_total_cents: number;
};

export type CampaignGroups = { active: CreatorCampaign[]; applied: CreatorCampaign[]; past: CreatorCampaign[] };

const money = (cents: number) =>
  `$${(cents / 100).toLocaleString("en-US", { minimumFractionDigits: cents % 100 ? 2 : 0, maximumFractionDigits: 2 })}`;
export { money };

export function groupCampaigns(rows: CreatorCampaign[]): CampaignGroups {
  const todo = (c: CreatorCampaign) => c.to_fix * 3 + c.to_make * 2 + c.unread;
  const when = (c: CreatorCampaign) => Date.parse(c.since ?? "") || 0;
  return {
    active: rows
      .filter((c) => c.kind === "active")
      .sort((a, b) => todo(b) - todo(a) || Number(b.is_active) - Number(a.is_active) || a.company_name.localeCompare(b.company_name)),
    applied: rows
      .filter((c) => c.kind === "invited" || c.kind === "applied" || c.kind === "offered")
      .sort((a, b) => Number(b.kind !== "applied") - Number(a.kind !== "applied") || when(b) - when(a)),
    past: rows.filter((c) => c.kind === "past").sort((a, b) => when(b) - when(a)),
  };
}

export type Tone = "blue" | "amber" | "purple" | "green" | "grey";

export function campaignTodo(c: Pick<CreatorCampaign, "to_fix" | "to_make" | "unread">): { label: string; tone: Tone }[] {
  const out: { label: string; tone: Tone }[] = [];
  if (c.to_make > 0) out.push({ label: `${c.to_make} to make`, tone: "blue" });
  if (c.to_fix > 0) out.push({ label: `${c.to_fix} to fix`, tone: "amber" });
  if (c.unread > 0) out.push({ label: `${c.unread} unread`, tone: "purple" });
  return out;
}

export function pastLabel(status: string | null): string {
  if (status === "declined") return "Not this time";
  if (status === "withdrawn") return "Withdrawn";
  return "Ended";
}

export function spotsLabel(l: Pick<FeedListing, "spots" | "spots_left">): string | null {
  if (l.spots === null || l.spots_left === null) return null;
  if (l.spots_left === 0) return "Full";
  return `${l.spots_left} ${l.spots_left === 1 ? "spot" : "spots"} left`;
}

/** What the creator still has to add before applying. */
export function missingToApply(r: { birth_year: number | null; tiktok: string | null; instagram: string | null } | null): string[] {
  const missing: string[] = [];
  if (!r?.birth_year) missing.push("your age");
  if (!r?.tiktok && !r?.instagram) missing.push("your TikTok or Instagram");
  return missing;
}

/** Explore order: closest interest fit, then newest. */
export function orderFeed(rows: FeedListing[]): FeedListing[] {
  return [...rows].sort(
    (a, b) => b.niche_overlap - a.niche_overlap || (Date.parse(b.opened_at ?? "") || 0) - (Date.parse(a.opened_at ?? "") || 0),
  );
}

const TONES: Tone[] = ["blue", "purple", "green", "amber"];
export function toneFor(id: string): Tone {
  let h = 0;
  for (let i = 0; i < id.length; i += 1) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return TONES[h % TONES.length];
}
