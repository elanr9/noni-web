/* The Noni plan catalog (design_handoff_pricing_plans). The single source of
   truth for plan names, prices, creator caps and card copy: the Billing tab
   plan picker, the public /pricing page and the server-side cap and paywall
   checks in @/lib/admin/billing all read from here. Client safe: no server
   imports.

   Plans differ only in the creator cap. Starter and Premium are self-serve
   Stripe subscriptions in a monthly or annual cadence; Enterprise is
   sales-led (contact us) and is written by ops, never by Checkout. */

import type {
  BillingCadence,
  PlanTier,
  SubscriptionPlan,
} from "@/lib/admin/types";

export type SelfServeTier = Exclude<PlanTier, "enterprise">;

export type StripePriceEnv =
  | "STRIPE_PRICE_STARTER_MONTHLY"
  | "STRIPE_PRICE_STARTER_ANNUAL"
  | "STRIPE_PRICE_PREMIUM_MONTHLY"
  | "STRIPE_PRICE_PREMIUM_ANNUAL";

export const PLAN_PRICING: Record<
  SubscriptionPlan,
  {
    tier: SelfServeTier;
    cadence: BillingCadence;
    /** Effective monthly price in cents. */
    monthlyPriceCents: number;
    priceEnv: StripePriceEnv;
  }
> = {
  starter_monthly: {
    tier: "starter",
    cadence: "monthly",
    monthlyPriceCents: 10000,
    priceEnv: "STRIPE_PRICE_STARTER_MONTHLY",
  },
  starter_annual: {
    tier: "starter",
    cadence: "annual",
    monthlyPriceCents: 7500,
    priceEnv: "STRIPE_PRICE_STARTER_ANNUAL",
  },
  premium_monthly: {
    tier: "premium",
    cadence: "monthly",
    monthlyPriceCents: 25000,
    priceEnv: "STRIPE_PRICE_PREMIUM_MONTHLY",
  },
  premium_annual: {
    tier: "premium",
    cadence: "annual",
    monthlyPriceCents: 15000,
    priceEnv: "STRIPE_PRICE_PREMIUM_ANNUAL",
  },
};

/** Creators per campaign on each plan. Null means unlimited. */
export const PLAN_CREATOR_CAP: Record<PlanTier, number | null> = {
  starter: 5,
  premium: 15,
  enterprise: null,
};

export const PLAN_TIER_LABEL: Record<PlanTier, string> = {
  starter: "Starter",
  premium: "Premium",
  enterprise: "Enterprise",
};

function dollars(plan: SubscriptionPlan): number {
  return PLAN_PRICING[plan].monthlyPriceCents / 100;
}

export interface SelfServePlanCard {
  tier: SelfServeTier;
  blurb: string;
  /** Dollars per month on the monthly cadence. */
  monthly: number;
  /** Effective dollars per month on the annual cadence. */
  annual: number;
  feats: string[];
  /** The creator cap line, bold part first. Always the first feature. */
  capFeat: { bold: string; rest: string };
}

/* Card copy straight from design_handoff_pricing_plans/PricingPlans.html. */
export const SELF_SERVE_PLANS: SelfServePlanCard[] = [
  {
    tier: "starter",
    blurb: "For your first campaigns with a small creator crew.",
    monthly: dollars("starter_monthly"),
    annual: dollars("starter_annual"),
    feats: [
      "Unlimited campaigns and briefs",
      "TikTok and Instagram tracking",
      "Creator payouts through Stripe",
    ],
    capFeat: { bold: `Up to ${PLAN_CREATOR_CAP.starter} creators`, rest: " per campaign" },
  },
  {
    tier: "premium",
    blurb: "For teams running a full scale creator program.",
    monthly: dollars("premium_monthly"),
    annual: dollars("premium_annual"),
    feats: [
      "Everything in Starter",
      "Room to scale across creator pods",
      "Priority support",
    ],
    capFeat: { bold: `Up to ${PLAN_CREATOR_CAP.premium} creators`, rest: " per campaign" },
  },
];

export const ENTERPRISE_PLAN = {
  blurb: "For agencies and studios running creators at scale.",
  feats: [
    "Everything in Premium",
    "Dedicated account manager",
    "Custom onboarding for your team",
  ],
  capFeat: { bold: "Unlimited creators", rest: " per campaign" },
};

/** "Save up to 40% annually": the best annual discount across plans. */
export const MAX_ANNUAL_SAVINGS_PCT = Math.round(
  Math.max(...SELF_SERVE_PLANS.map((p) => 1 - p.annual / p.monthly)) * 100,
);

/** The one-line fix named whenever the creator cap blocks something. */
export function capUpgradeHint(tier: PlanTier): string {
  const cap = PLAN_CREATOR_CAP[tier];
  if (tier === "starter") {
    return `Starter allows ${cap} creators per campaign. Upgrade to Premium for ${PLAN_CREATOR_CAP.premium}.`;
  }
  if (tier === "premium") {
    return `Premium allows ${cap} creators per campaign. Contact us about Enterprise for unlimited creators.`;
  }
  return "";
}
