import { CampaignsBoard } from "@/components/creator/CampaignsBoard";
import { CreatorShell } from "@/components/creator/CreatorShell";
import type { CreatorCampaign, FeedListing } from "@/lib/creator-campaigns";

/* Dev preview of /campaigns with sample data: ?tab=mine. 404 in production
   through the /internal layout. Buttons call real actions; look only. */
const BASE: Omit<CreatorCampaign, "kind" | "company_id" | "company_name"> = {
  logo_path: null, listing_id: null, title: null, posts_per_week: 3, application_id: null, application_status: null,
  invite_message: null, is_active: false, since: "2026-11-10T12:00:00Z", start_date: null,
  to_fix: 0, to_make: 0, in_review: 0, posted: 0, unread: 0, earned_month_cents: 0, earned_total_cents: 0,
};

const CAMPAIGNS: CreatorCampaign[] = [
  { ...BASE, kind: "active", company_id: "c-ink", company_name: "Inkbound AI", title: "Tattoo ideas in seconds", is_active: true, to_make: 2, unread: 1, in_review: 1, posted: 14, earned_month_cents: 18400, earned_total_cents: 40200 },
  { ...BASE, kind: "active", company_id: "c-fv", company_name: "FieldVision", title: "Soccer film breakdowns", to_fix: 1, posted: 6, earned_month_cents: 7600, earned_total_cents: 7600 },
  { ...BASE, kind: "active", company_id: "c-crumbs", company_name: "socialcrumbs", title: "socialcrumbs", posted: 3, earned_month_cents: 3100, earned_total_cents: 3100 },
  { ...BASE, kind: "invited", company_id: "c-glow", company_name: "Glowday", title: "Morning skincare in 30 seconds", listing_id: "l-glow", application_status: "invited", invite_message: "Loved your GRWM videos. Want in?" },
  { ...BASE, kind: "applied", company_id: "c-lift", company_name: "Liftly", title: "Gym form checks", listing_id: "l-lift", application_id: "a-lift", application_status: "applied" },
  { ...BASE, kind: "past", company_id: "c-old", company_name: "Snackbox", title: "Snackbox", application_status: "left", posted: 9, earned_total_cents: 12900 },
];

const L: Omit<FeedListing, "id" | "company_id" | "company_name" | "title"> = {
  company_website: null, status: "open", tagline: "Show how fast you get a design you love.", about: "Short, honest videos of you using the app.",
  requirements: "Face on camera. Natural light.", niches: ["tech", "lifestyle", "fashion_beauty"], platforms: ["tiktok", "instagram"],
  logo_path: null, brand_color: null, posts_per_day_min: 2, posts_per_day_max: 3, video_post_cents: 1000, static_post_cents: 500,
  cents_per_1k_views: 100, view_pay_cap_cents: 30000, min_views: 500,
  posts_per_week: 14, spots: 10, spots_left: 6, min_age: 18, start_days: 3, contract_title: "Creator agreement",
  contract_body: "You make 2 to 3 posts a day for the campaign.\n\nNoni pays $10 a video plus $1 per 1,000 views.\n\nEither side can end this at any time.",
  contract_version: 1, opened_at: "2026-11-20T12:00:00Z", creator_count: 4, is_member: false, application_id: null,
  application_status: null, application_origin: null, invite_message: null, signed_at: null, start_date: null, decision_note: null, niche_overlap: 0,
};

const LISTINGS: FeedListing[] = [
  { ...L, id: "l-glow", company_id: "c-glow", company_name: "Glowday", title: "Morning skincare in 30 seconds", application_status: "invited", invite_message: "Loved your GRWM videos. Want in?", niche_overlap: 1 },
  { ...L, id: "l-lift", company_id: "c-lift", company_name: "Liftly", title: "Gym form checks", application_status: "applied", application_id: "a-lift" },
  { ...L, id: "l-1", company_id: "c-a", company_name: "Pawprint", title: "Dog walks, filmed", niche_overlap: 2 },
  { ...L, id: "l-2", company_id: "c-b", company_name: "Budgetly", title: "Save $500 this month", niches: ["finance"], video_post_cents: 2500, cents_per_1k_views: 200 },
  { ...L, id: "l-3", company_id: "c-c", company_name: "Chefbox", title: "Dinner in 15 minutes", niches: ["food"], spots_left: 1, posts_per_day_min: 1, posts_per_day_max: 1, video_post_cents: 1500 },
  { ...L, id: "l-4", company_id: "c-d", company_name: "Lingo", title: "Learn Spanish on your commute", niches: ["education"] },
  { ...L, id: "l-5", company_id: "c-e", company_name: "Trailmate", title: "Weekend hikes near you", niches: ["travel"] },
  { ...L, id: "l-6", company_id: "c-f", company_name: "Stackd", title: "AI notes for class", niches: ["tech", "education"], niche_overlap: 1 },
  { ...L, id: "l-7", company_id: "c-g", company_name: "Glowup", title: "Before and after", niches: ["fashion_beauty"] },
];

export default async function CampaignsPreviewPage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const { tab } = await searchParams;
  return (
    <CreatorShell active="campaigns">
      <CampaignsBoard
        listings={LISTINGS}
        campaigns={CAMPAIGNS}
        failed={false}
        resume={{ birth_year: 2002, tiktok: "you", instagram: null, niches: ["tech", "lifestyle"] }}
        name="Elan Romo"
        startTab={tab === "mine" ? "mine" : "explore"}
      />
    </CreatorShell>
  );
}
