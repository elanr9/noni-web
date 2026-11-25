import { ManagerShell } from "@/components/manager/ManagerShell";
import { MarketView } from "@/components/manager/market/MarketView";
import type { Listing, MarketCreator, MarketData } from "@/lib/manager/market";

/* Dev preview of the manager Market tab with sample creators
   (?view=none|draft|applicants|all). 404 in production through the
   /internal layout. Actions need a real session. */

const NAMES = ["Maya Chen", "Jordan Price", "Ava Brooks", "Leo Martinez", "Priya Shah", "Sam Rivera", "Zoe Kim", "Eli Turner", "Nora Diaz", "Kai Patel"];
const NICHE_SETS = [["education", "tech"], ["lifestyle", "fashion_beauty"], ["fitness"], ["tech", "gaming", "entertainment"], ["education"], ["food", "travel"]];

function sample(i: number, status: MarketCreator["application_status"]): MarketCreator {
  return {
    creator_id: `c${i}`,
    full_name: NAMES[i % NAMES.length],
    avatar_path: null,
    photo: null,
    age: 19 + (i % 9),
    gender: i % 3 === 0 ? "male" : "female",
    location: ["Austin", "Miami", "Toronto", "London"][i % 4],
    country: ["US", "US", "CA", "GB"][i % 4],
    bio: null,
    instagram: `creator${i}`,
    tiktok: `creator.${i}`,
    youtube: null,
    followers: [1200, 18400, 260000, 5300][i % 4],
    languages: ["english"],
    experience: (["pro", "some", "new"] as const)[i % 3],
    best_campaign: i % 2 ? "Study app launch, 1.2M views over six posts" : null,
    niches: NICHE_SETS[i % NICHE_SETS.length],
    portfolio: [],
    total_views: [0, 48000, 1200000, 9800][i % 4],
    posts_live: i,
    total_earned_cents: [0, 42000, 310000, 6500][i % 4],
    companies_count: i % 3,
    joined_at: "2026-11-20",
    is_member: false,
    match_score: 92 - i * 6,
    match_reason: i < 3 ? "Posts study content to college students and already reviews productivity apps." : null,
    match_ai: i < 3,
    application_id: status ? `a${i}` : null,
    application_status: status,
    application_origin: status === "invited" ? "invited" : status ? "applied" : null,
    application_note: status === "applied" ? "I make daily study vlogs and use apps like this every day." : null,
    signed_name: status === "applied" ? NAMES[i % NAMES.length] : null,
    signed_at: status === "applied" ? "2026-11-24" : null,
    start_date: null,
    applied_at: "2026-11-24",
  };
}

const LISTING: Listing = {
  id: "l1",
  company_id: "x",
  status: "open",
  title: "Inkbound AI creators",
  tagline: "Make videos about the app that writes your essays",
  about: null,
  requirements: null,
  niches: ["education", "tech"],
  platforms: ["tiktok", "instagram"],
  posts_per_week: 14,
  posts_per_day_min: 2,
  posts_per_day_max: 3,
  video_post_cents: 1000,
  static_post_cents: 500,
  cents_per_1k_views: 100,
  view_pay_cap_cents: 30000,
  min_views: 500,
  brand_color: null,
  spots: 10,
  min_age: 18,
  start_days: 3,
  contract_title: "Creator agreement",
  contract_body: "Sample agreement text ".repeat(10),
  contract_version: 1,
  opened_at: "2026-11-21",
};

export default async function MarketPreview({ searchParams }: { searchParams: Promise<{ view?: string }> }) {
  const view = (await searchParams).view ?? "applicants";
  const listing = view === "none" ? null : view === "draft" ? { ...LISTING, status: "draft" as const } : LISTING;
  const rows =
    view === "applicants" ? Array.from({ length: 5 }, (_, i) => sample(i, "applied")) : Array.from({ length: 10 }, (_, i) => sample(i, i === 2 ? "invited" : null));
  const data: MarketData = {
    companyName: "Inkbound AI",
    logoUrl: null,
    listing,
    applicantCount: view === "applicants" ? 5 : 0,
    invitedCount: 1,
    creators: { total: rows.length, rows },
  };
  return (
    <ManagerShell companyName="Inkbound AI" name="Preview" people={[]} reviewCount={0}>
      <MarketView initial={data} preview />
    </ManagerShell>
  );
}
