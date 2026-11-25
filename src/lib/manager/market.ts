/* The company side of the marketplace on the website: the company's own
   campaign listing, the creators who applied, the ones it reached out to,
   and every creator on Noni ranked for the campaign. Mirrors lib/marketplace.ts
   in the app (migration 155, 160). Every write is a database function that
   checks the caller is a manager of the active company, so reads and writes
   run on the signed-in user's client, never the service client. */
import type { CampaignTerms } from "@/lib/campaign-terms";
import { NICHES } from "@/lib/creator-profile";

export type ListingStatus = "draft" | "open" | "paused" | "closed";
export type ApplicationStatus = "invited" | "applied" | "accepted" | "declined" | "withdrawn";
export type Gender = "female" | "male" | "nonbinary" | "undisclosed";
export type Experience = "pro" | "some" | "new";
export type MarketScope = "all" | "applicants" | "invited";

export type Listing = CampaignTerms & {
  id: string;
  company_id: string;
  status: ListingStatus;
  title: string;
  tagline: string | null;
  about: string | null;
  requirements: string | null;
  niches: string[];
  platforms: string[];
  posts_per_week: number;
  spots: number | null;
  min_age: number;
  start_days: number;
  contract_title: string;
  contract_body: string;
  contract_version: number;
  opened_at: string | null;
};

export type ListingPatch = Partial<Omit<Listing, "id" | "company_id" | "contract_version" | "opened_at">>;

export type PortfolioLink = { url: string; note?: string };

export type MarketCreator = {
  creator_id: string;
  full_name: string | null;
  avatar_path: string | null;
  /** Signed photo URL, added on the server. */
  photo?: string | null;
  age: number | null;
  gender: Gender | null;
  location: string | null;
  bio: string | null;
  instagram: string | null;
  tiktok: string | null;
  youtube: string | null;
  followers: number | null;
  country: string | null;
  languages: string[];
  experience: Experience | null;
  best_campaign: string | null;
  niches: string[];
  portfolio: PortfolioLink[];
  total_views: number;
  posts_live: number;
  total_earned_cents: number;
  companies_count: number;
  joined_at: string | null;
  is_member: boolean;
  match_score: number;
  match_reason: string | null;
  match_ai: boolean;
  application_id: string | null;
  application_status: ApplicationStatus | null;
  application_origin: "applied" | "invited" | null;
  application_note: string | null;
  signed_name: string | null;
  signed_at: string | null;
  start_date: string | null;
  applied_at: string | null;
};

export type CreatorSort = "match" | "views" | "earned" | "followers" | "newest";

export const SORTS: { key: CreatorSort; label: string }[] = [
  { key: "match", label: "Best match" },
  { key: "views", label: "Most views" },
  { key: "earned", label: "Most earned" },
  { key: "followers", label: "Most followers" },
  { key: "newest", label: "Newest" },
];

export type CreatorFilters = {
  niches: string[];
  gender: Gender | null;
  minAge: number | null;
  maxAge: number | null;
  minViews: number | null;
  minEarnedCents: number | null;
  minFollowers: number | null;
  experience: Experience | null;
};

export const NO_FILTERS: CreatorFilters = {
  niches: [],
  gender: null,
  minAge: null,
  maxAge: null,
  minViews: null,
  minEarnedCents: null,
  minFollowers: null,
  experience: null,
};

export const AGE_BANDS: { key: string; label: string; min: number | null; max: number | null }[] = [
  { key: "any", label: "Any age", min: null, max: null },
  { key: "18-20", label: "18 to 20", min: 18, max: 20 },
  { key: "21-24", label: "21 to 24", min: 21, max: 24 },
  { key: "25-34", label: "25 to 34", min: 25, max: 34 },
  { key: "35+", label: "35 and up", min: 35, max: null },
];

export const VIEW_FLOORS = [null, 10_000, 100_000, 1_000_000] as const;
export const FOLLOWER_FLOORS = [null, 1_000, 10_000, 100_000] as const;

export const GENDER_OPTIONS: { key: Gender; label: string }[] = [
  { key: "female", label: "Female" },
  { key: "male", label: "Male" },
  { key: "nonbinary", label: "Non-binary" },
];

export const EXPERIENCE: { key: Experience; label: string }[] = [
  { key: "pro", label: "Paid UGC before" },
  { key: "some", label: "A little" },
  { key: "new", label: "Brand new" },
];

export const PLATFORMS = [
  { key: "tiktok", label: "TikTok" },
  { key: "instagram", label: "Instagram" },
] as const;

export function activeFilterCount(f: CreatorFilters): number {
  return (
    (f.niches.length > 0 ? 1 : 0) +
    (f.gender ? 1 : 0) +
    (f.minAge !== null || f.maxAge !== null ? 1 : 0) +
    (f.minViews !== null ? 1 : 0) +
    (f.minEarnedCents !== null ? 1 : 0) +
    (f.minFollowers !== null ? 1 : 0) +
    (f.experience ? 1 : 0)
  );
}

export function nicheLabel(key: string): string {
  return NICHES.find((n) => n.key === key)?.label ?? key.charAt(0).toUpperCase() + key.slice(1);
}

const COUNTRY_NAMES: Record<string, string> = { US: "United States", CA: "Canada", GB: "United Kingdom", AU: "Australia" };

/** "22 · Female · Austin, United States", skipping what is missing. */
export function creatorFactLine(c: Pick<MarketCreator, "age" | "gender" | "location" | "country">): string {
  const place = [c.location, c.country ? COUNTRY_NAMES[c.country] ?? c.country : null].filter(Boolean).join(", ");
  const gender = c.gender && c.gender !== "undisclosed" ? GENDER_OPTIONS.find((g) => g.key === c.gender)?.label : null;
  return [c.age !== null ? String(c.age) : null, gender, place || null].filter(Boolean).join(" · ");
}

export function mainHandle(c: Pick<MarketCreator, "tiktok" | "instagram">): string | null {
  const h = c.tiktok ?? c.instagram;
  return h ? `@${h}` : null;
}

export function compactCount(n: number | null | undefined): string {
  if (n === null || n === undefined) return "n/a";
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(n >= 10_000_000 ? 0 : 1).replace(/\.0$/, "")}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(n >= 10_000 ? 0 : 1).replace(/\.0$/, "")}K`;
  return String(n);
}

export function dollars(cents: number): string {
  return `$${Math.round(cents / 100).toLocaleString("en-US")}`;
}

/** "Nov 24" from an ISO date or timestamp. */
export function shortDay(date: string | null): string | null {
  if (!date) return null;
  const [y, m, d] = date.slice(0, 10).split("-").map(Number);
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function listingStatusLabel(s: ListingStatus): { label: string; tone: "green" | "amber" | "slate" } {
  if (s === "open") return { label: "Open", tone: "green" };
  if (s === "paused") return { label: "Paused", tone: "amber" };
  if (s === "closed") return { label: "Closed", tone: "slate" };
  return { label: "Draft", tone: "amber" };
}

export function normalizeCreator(r: MarketCreator): MarketCreator {
  return {
    ...r,
    niches: r.niches ?? [],
    languages: r.languages ?? [],
    portfolio: Array.isArray(r.portfolio) ? r.portfolio : [],
    total_views: Number(r.total_views) || 0,
    total_earned_cents: Number(r.total_earned_cents) || 0,
  };
}

export type MarketPage = { total: number; rows: MarketCreator[] };

export type MarketData = {
  companyName: string;
  logoUrl: string | null;
  listing: Listing | null;
  applicantCount: number;
  invitedCount: number;
  creators: MarketPage;
};
