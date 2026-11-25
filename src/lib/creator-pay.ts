/* Creator pay rates and the company cost of them: the single TypeScript
   source for these numbers.

   These MUST match the SQL function public.creator_pay_rates() in the noni
   repo (supabase migrations 144 and 163), which is what actually credits creators
   and debits company_billing.credit_balance_cents. Change both together.

   The rules:
   - A creator takes home $10 per video post and $5 per static (slideshow)
     post once it is live and has 500 views, plus $1 for every full 1,000
     views. A campaign can set its own higher rates (migration 163).
   - View pay is capped at $300 per post, and only views in the first 30
     days after posting count (checked daily).
   - The company pays creator pay plus a 13% Noni fee, rounded up to the
     cent, debited from its credit balance as pay is earned. */

import type { BriefFormat } from "@/components/manager/briefs/lib";

export const VIDEO_POST_CENTS = 1000;
export const STATIC_POST_CENTS = 500;
export const CENTS_PER_1K_VIEWS = 100;
export const VIEW_PAY_CAP_CENTS = 30000;
/** A post is paid for itself once it has this many views. */
export const MIN_VIEWS_FOR_POST_PAY = 500;
export const VIEW_WINDOW_DAYS = 30;
export const NONI_FEE_RATE = 0.13;

/* Whole percent, so the fee is computed in integer cents with no float
   drift (1000 * 1.13 is not exactly 1130 in floating point). */
const FEE_PERCENT = Math.round(NONI_FEE_RATE * 100);

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

/** What the company is charged for creator pay, in cents: pay plus the
    Noni fee, rounded up to the cent. */
export function companyCostCents(creatorPayCents: number): number {
  const c = Math.max(0, Math.round(creatorPayCents));
  return Math.ceil((c * (100 + FEE_PERCENT)) / 100);
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
  /** Base pay for every post, before the fee. */
  baseCreatorCents: number;
  /** View pay if every post gets the average views (per post cap applied). */
  viewCreatorCents: number;
  /** View pay if every post hits the cap. */
  maxViewCreatorCents: number;
  /** Guaranteed: base pay plus fee, no views. */
  companyMinCents: number;
  /** Base plus estimated view pay, plus fee. */
  companyEstimateCents: number;
  /** Base plus capped view pay on every post, plus fee. */
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
    /* Base pay is debited per post, so the fee rounds up per post. */
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
  /** Base pay plus fee, rounded up per post like the SQL debit. */
  companyCents: number;
}

/** Guaranteed cost of a published week: every receiving creator gets every
    brief in it (publish-campaign), so base pay times the creator count,
    with the fee rounded up on each post's base pay. View pay is extra. */
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

/** Cents as dollars, with cents shown only when there are any: "$1,130",
    "$5.65". */
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

const FEE_LABEL = `${FEE_PERCENT}%`;

/** One line explaining the pay rules, for UI copy. */
export const PAY_RULES_LINE =
  `Creators earn ${formatCents(VIDEO_POST_CENTS)} per video and ${formatCents(STATIC_POST_CENTS)} per slideshow once it is live with ${MIN_VIEWS_FOR_POST_PAY} views, ` +
  `plus ${formatCents(CENTS_PER_1K_VIEWS)} per 1,000 views (up to ${formatCents(VIEW_PAY_CAP_CENTS)} a post, views in the first ${VIEW_WINDOW_DAYS} days). ` +
  `Noni adds a ${FEE_LABEL} fee.`;

/** Short form for the week page next to the targets. */
export const BASE_PAY_LINE =
  `${formatCents(VIDEO_POST_CENTS)} a video, ${formatCents(STATIC_POST_CENTS)} a slideshow, plus ${FEE_LABEL} fee. View pay is extra.`;
