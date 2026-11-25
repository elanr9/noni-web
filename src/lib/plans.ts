/* The Noni plan catalog (design_handoff_pricing_plans). The single source of
   truth for plan names, prices, creator caps and card copy: the Billing tab
   plan picker, the public /pricing page and the server-side cap and paywall
   checks in @/lib/admin/billing all read from here. Client safe: no server
   imports.

   Starter and Premium differ only in the creator cap. Done for you (tier
   "managed") is the same software with the Noni team running the whole
   program for the company. Starter and Premium are self-serve Stripe
   subscriptions in a monthly or annual cadence. Done for you and Enterprise
   start with a call: ops puts the company on the plan from the ops console
   and invoices it, never Checkout. */

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
  | "STRIPE_PRICE_PREMIUM_ANNUAL"
  | "STRIPE_PRICE_MANAGED_MONTHLY"
  | "STRIPE_PRICE_MANAGED_ANNUAL";

export const PLAN_PRICING: Record<
  SubscriptionPlan,
  {
    tier: SelfServeTier;
    cadence: BillingCadence;
    /** Effective monthly price in cents. */
    monthlyPriceCents: number;
    /** What an annual plan charges once a year, in cents. */
    yearlyPriceCents?: number;
    priceEnv: StripePriceEnv;
  }
> = {
  starter_monthly: {
    tier: "starter",
    cadence: "monthly",
    monthlyPriceCents: 22500,
    priceEnv: "STRIPE_PRICE_STARTER_MONTHLY",
  },
  starter_annual: {
    tier: "starter",
    cadence: "annual",
    monthlyPriceCents: 17500,
    yearlyPriceCents: 210000,
    priceEnv: "STRIPE_PRICE_STARTER_ANNUAL",
  },
  premium_monthly: {
    tier: "premium",
    cadence: "monthly",
    monthlyPriceCents: 35000,
    priceEnv: "STRIPE_PRICE_PREMIUM_MONTHLY",
  },
  premium_annual: {
    tier: "premium",
    cadence: "annual",
    monthlyPriceCents: 25000,
    yearlyPriceCents: 300000,
    priceEnv: "STRIPE_PRICE_PREMIUM_ANNUAL",
  },
  managed_monthly: {
    tier: "managed",
    cadence: "monthly",
    monthlyPriceCents: 100000,
    priceEnv: "STRIPE_PRICE_MANAGED_MONTHLY",
  },
  managed_annual: {
    tier: "managed",
    cadence: "annual",
    monthlyPriceCents: 80000,
    yearlyPriceCents: 960000,
    priceEnv: "STRIPE_PRICE_MANAGED_ANNUAL",
  },
};

/** Creators per campaign on each plan. Null means unlimited. */
export const PLAN_CREATOR_CAP: Record<PlanTier, number | null> = {
  starter: 5,
  premium: 15,
  /* Noni's team picks and manages the creators, so no cap applies. */
  managed: null,
  enterprise: null,
};

export const PLAN_TIER_LABEL: Record<PlanTier, string> = {
  starter: "Starter",
  premium: "Premium",
  managed: "Done for you",
  enterprise: "Enterprise",
};

function dollars(plan: SubscriptionPlan): number {
  return Math.round(PLAN_PRICING[plan].monthlyPriceCents / 100);
}

/** Dollars an annual plan bills once a year. `monthly` is the per-month
    price on the subscription, used when the plan has no yearly figure. */
export function yearlyDollars(tier: PlanTier, monthly: number): number {
  const annual = Object.values(PLAN_PRICING).find(
    (p) => p.tier === tier && p.cadence === "annual",
  );
  if (
    annual?.yearlyPriceCents !== undefined &&
    Math.round(annual.monthlyPriceCents / 100) === monthly
  ) {
    return annual.yearlyPriceCents / 100;
  }
  return monthly * 12;
}

/** The two capped tiers shown as cards. */
export type CappedTier = Exclude<SelfServeTier, "managed">;

export interface SelfServePlanCard {
  tier: CappedTier;
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
      "Creator payouts by bank transfer",
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

/* Done for you: sits under the three cards as the last option. */
export const MANAGED_PLAN = {
  blurb:
    "Our team runs your whole creator program on Noni. We find the creators, write the briefs, approve every post and send you the results.",
  tag: "Noni runs it",
  monthly: dollars("managed_monthly"),
  annual: dollars("managed_annual"),
  yearly: (PLAN_PRICING.managed_annual.yearlyPriceCents ?? 0) / 100,
};

export const ENTERPRISE_PLAN = {
  blurb: "For agencies and studios running creators at scale.",
  feats: [
    "Everything in Premium",
    "Dedicated account manager",
    "Custom onboarding for your team",
  ],
  capFeat: { bold: "Unlimited creators", rest: " per campaign" },
};

/** "Save up to 29% annually": the best annual discount across plans. */
export const MAX_ANNUAL_SAVINGS_PCT = Math.round(
  Math.max(
    ...[...SELF_SERVE_PLANS, MANAGED_PLAN].map((p) => 1 - p.annual / p.monthly),
  ) * 100,
);

/** The one-line fix named whenever the creator cap blocks something. */
export function capUpgradeHint(tier: PlanTier): string {
  const cap = PLAN_CREATOR_CAP[tier];
  if (tier === "starter") {
    return `Starter allows ${cap} creators per campaign. Upgrade to Premium for ${PLAN_CREATOR_CAP.premium}.`;
  }
  if (tier === "premium") {
    return `Premium allows ${cap} creators per campaign. Book a call about Enterprise for unlimited creators.`;
  }
  return "";
}

const usd = (cents: number) =>
  `$${(cents / 100).toLocaleString("en-US", { maximumFractionDigits: 2 })}`;

/** The plan agreed on the call, in plain lines: the /start screen and the
    email that sends the company there both show these. */
export function planOfferLines(
  plan: SubscriptionPlan,
  budgetCents: number,
  /** What Stripe actually charges each period (month or year), when known. */
  chargeCents?: number | null,
): { plan: string; budget: string | null } {
  const p = PLAN_PRICING[plan];
  const name = `${PLAN_TIER_LABEL[p.tier]} plan`;
  const yearly = chargeCents ?? p.yearlyPriceCents ?? p.monthlyPriceCents * 12;
  const monthly = chargeCents ?? p.monthlyPriceCents;
  const price =
    p.cadence === "annual"
      ? `${usd(Math.round(yearly / 12))} a month, billed yearly at ${usd(yearly)}`
      : `${usd(monthly)} a month`;
  return {
    plan: `${name}: ${price}.`,
    budget:
      budgetCents > 0
        ? `Creator budget: ${usd(budgetCents)} a month, billed monthly. Anything unused rolls over to the next month.`
        : null,
  };
}
