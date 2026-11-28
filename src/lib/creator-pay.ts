/* Creator pay rates and the company cost of them: the single TypeScript
   source for these numbers.

   These MUST match the SQL function public.creator_pay_rates() in the noni
   repo (supabase migrations 144 and 163), which is what actually credits creators
   and debits company_billing.credit_balance_cents. Change both together.

   The rules:
   - A creator takes home $10 per video post and $5 per static (slideshow)
     post once it is live and one platform's post alone (TikTok or
     Instagram) has 500 views, plus $1 for every full 1,000 views across
     both platforms combined (noni migration 182). A campaign can set its own higher rates (migration 163).
   - View pay is capped at $300 per post, and only views in the first 30
     days after posting count (checked daily).
   - The company's budget pays exactly what the creator earns, debited from
     its credit balance as pay is earned. Noni takes no fee on creator pay;
     it earns from subscriptions only (owner decision 2026-11-27, noni
     migration 174). */

import type { BriefFormat } from "@/components/manager/briefs/lib";

export const VIDEO_POST_CENTS = 1000;
export const STATIC_POST_CENTS = 500;
export const CENTS_PER_1K_VIEWS = 100;
export const VIEW_PAY_CAP_CENTS = 30000;
/** A post is paid for itself once it has this many views. */
export const MIN_VIEWS_FOR_POST_PAY = 500;
export const VIEW_WINDOW_DAYS = 30;
/** Base pay for one live post of this format, in cents. */
export function basePayCents(format: BriefFormat): number {
  return format === "video" ? VIDEO_POST_CENTS : STATIC_POST_CENTS;
}

/** View pay for one post, in cents: $1 per full 1,000 views, capped. */
export function viewPayCents(views: number): number {
  const thousands = Math.floor(Math.max(0, Number.isFinite(views) ? views : 0) / 1000);
  return Math.min(thousands * CENTS_PER_1K_VIEWS, VIEW_PAY_CAP_CENTS);
}

/** What the creator takes home for one post, in cents. `views` should be
    the views counted within the first VIEW_WINDOW_DAYS after posting. */
export function creatorPayForPost(format: BriefFormat, views: number): number {
  return basePayCents(format) + viewPayCents(views);
}

/** What the company is charged for creator pay, in cents: exactly the pay. */
export function companyCostCents(creatorPayCents: number): number {
  return Math.max(0, Math.round(creatorPayCents));
}

export interface CampaignCostInput {
  creators: number;
  videosPerCreator: number;
  staticsPerCreator: number;
  weeks: number;
  avgViewsPerPost: number;
}

export interface CampaignCostEstimate {
  postsTotal: number;
  /** Base pay for every post. */
  baseCreatorCents: number;
  /** View pay if every post gets the average views (per post cap applied). */
  viewCreatorCents: number;
  /** View pay if every post hits the cap. */
  maxViewCreatorCents: number;
  /** Guaranteed: base pay, no views. */
  companyMinCents: number;
  /** Base plus estimated view pay. */
  companyEstimateCents: number;
  /** Base plus capped view pay on every post. */
  companyMaxCents: number;
}

function count(n: number): number {
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : 0;
}

/** Rough cost of a campaign. VideosPerCreator and staticsPerCreator are per
    creator per week. */
export function estimateCampaignCost(input: CampaignCostInput): CampaignCostEstimate {
  const creatorWeeks = count(input.creators) * count(input.weeks);
  const videos = creatorWeeks * count(input.videosPerCreator);
  const statics = creatorWeeks * count(input.staticsPerCreator);
  const postsTotal = videos + statics;

  const baseCreatorCents = videos * VIDEO_POST_CENTS + statics * STATIC_POST_CENTS;
  const viewCreatorCents = postsTotal * viewPayCents(input.avgViewsPerPost);
  const maxViewCreatorCents = postsTotal * VIEW_PAY_CAP_CENTS;

  return {
    postsTotal,
    baseCreatorCents,
    viewCreatorCents,
    maxViewCreatorCents,
    companyMinCents:
      videos * companyCostCents(VIDEO_POST_CENTS) +
      statics * companyCostCents(STATIC_POST_CENTS),
    companyEstimateCents: companyCostCents(baseCreatorCents + viewCreatorCents),
    companyMaxCents: companyCostCents(baseCreatorCents + maxViewCreatorCents),
  };
}

export interface WeekGuaranteedCost {
  /** Posts across every creator: creators x (video + static briefs). */
  postsTotal: number;
  creatorPayCents: number;
  /** What the company's budget pays: the same base pay. */
  companyCents: number;
}

/** Guaranteed cost of a published week: every receiving creator gets every
    brief in it (publish-campaign), so base pay times the creator count,
    with no fee on top. View pay is extra. */
export function weekGuaranteedCost(input: {
  creators: number;
  videoPosts: number;
  staticPosts: number;
}): WeekGuaranteedCost {
  const creators = count(input.creators);
  const videos = creators * count(input.videoPosts);
  const statics = creators * count(input.staticPosts);
  return {
    postsTotal: videos + statics,
    creatorPayCents: videos * VIDEO_POST_CENTS + statics * STATIC_POST_CENTS,
    companyCents:
      videos * companyCostCents(VIDEO_POST_CENTS) +
      statics * companyCostCents(STATIC_POST_CENTS),
  };
}

/** Cents as dollars, with cents shown only when there are any: "$1,000",
    "$5.50". */
export function formatCents(cents: number): string {
  const whole = cents % 100 === 0;
  return (
    "$" +
    (cents / 100).toLocaleString("en-US", {
      minimumFractionDigits: whole ? 0 : 2,
      maximumFractionDigits: 2,
    })
  );
}

/** One line explaining the pay rules, for UI copy. */
export const PAY_RULES_LINE =
  `Creators earn ${formatCents(VIDEO_POST_CENTS)} per video and ${formatCents(STATIC_POST_CENTS)} per slideshow once it is live with ${MIN_VIEWS_FOR_POST_PAY} views, ` +
  `plus ${formatCents(CENTS_PER_1K_VIEWS)} per 1,000 views (up to ${formatCents(VIEW_PAY_CAP_CENTS)} a post, views in the first ${VIEW_WINDOW_DAYS} days).`;

/** Short form for the week page next to the targets. */
export const BASE_PAY_LINE =
  `${formatCents(VIDEO_POST_CENTS)} a video, ${formatCents(STATIC_POST_CENTS)} a slideshow. View pay is extra.`;
