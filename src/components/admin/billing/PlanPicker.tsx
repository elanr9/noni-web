"use client";

import { useState } from "react";

import type {
  BillingCadence,
  PlanTier,
  Subscription,
  SubscriptionPlan,
} from "@/lib/admin/types";

export const TIER_LABEL: Record<PlanTier, string> = {
  starter: "Starter",
  premium: "Premium",
  enterprise: "Enterprise",
};

const ENTERPRISE_MAILTO =
  "mailto:founders@usenoni.app?subject=" +
  encodeURIComponent("Noni Enterprise plan");

/* Card copy straight from design_handoff_pricing_plans/PricingPlans.html.
   The creator cap line is bold and always first. */
const SELF_SERVE = [
  {
    tier: "starter" as const,
    blurb: "For your first campaigns with a small creator crew.",
    monthly: 100,
    annual: 75,
    feats: [
      "Unlimited campaigns and briefs",
      "TikTok and Instagram tracking",
      "Creator payouts through Stripe",
    ],
    capFeat: { bold: "Up to 5 creators", rest: " per campaign" },
  },
  {
    tier: "premium" as const,
    blurb: "For teams running a full scale creator program.",
    monthly: 250,
    annual: 150,
    feats: [
      "Everything in Starter",
      "Room to scale across creator pods",
      "Priority support",
    ],
    capFeat: { bold: "Up to 15 creators", rest: " per campaign" },
  },
];

const ENTERPRISE_FEATS = [
  "Everything in Premium",
  "Dedicated account manager",
  "Custom onboarding for your team",
];

function CheckIcon({ dark }: { dark?: boolean }) {
  return (
    <svg width="17" height="17" viewBox="0 0 20 20" fill="none" className="mt-px flex-none">
      <circle
        cx="10"
        cy="10"
        r="10"
        fill={dark ? "rgba(255,255,255,0.16)" : "var(--color-blue-100)"}
      />
      <path
        d="M6 10.2l2.6 2.6L14 7.4"
        stroke={dark ? "var(--color-blue-300)" : "var(--color-blue-600)"}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function Feat({ dark, children }: { dark?: boolean; children: React.ReactNode }) {
  return (
    <span className="flex items-start gap-2.5">
      <CheckIcon dark={dark} />
      <span>{children}</span>
    </span>
  );
}

/* Pricing plan picker (design_handoff_pricing_plans). Shown inline on the
   Billing tab when a company has no subscription, and in the change-plan
   flow when it does. Annual is the default cadence. */
export function PlanPicker({
  subscription,
  simulated,
  onChoose,
}: {
  subscription: Subscription;
  /** Dev without Stripe keys, or a pilot company: simulated checkout. */
  simulated: boolean;
  /** Resolves true when the flow moved on (redirected or state written). */
  onChoose: (plan: SubscriptionPlan) => Promise<boolean>;
}) {
  const [cadence, setCadence] = useState<BillingCadence>("annual");
  const [busy, setBusy] = useState<SubscriptionPlan | null>(null);
  const annual = cadence === "annual";
  const active = subscription.status === "active";
  const currentTier = active ? subscription.tier : null;

  const pick = async (plan: SubscriptionPlan) => {
    if (busy) return;
    setBusy(plan);
    const done = await onChoose(plan);
    if (!done) setBusy(null);
  };

  const busyLabel = active
    ? "Switching plan…"
    : simulated
      ? "Simulating checkout…"
      : "Opening Stripe checkout…";

  return (
    <div className="flex flex-col items-center py-8">
      <div className="max-w-[560px] text-center">
        <span className="inline-flex whitespace-nowrap bg-blue-100 px-3.5 py-1.5 text-[12.5px] font-bold tracking-[0.3px] text-blue-700 rounded-pill">
          Subscription
        </span>
        <h1 className="display m-0 mt-[18px] text-[38px] font-bold leading-[1.1] tracking-[-1px] text-ink">
          Pick the plan that fits your creator program
        </h1>
        <p className="mb-0 mt-3.5 text-[15px] font-medium leading-[1.6] text-slate-500">
          Every plan includes unlimited campaigns, briefs, approvals,
          analytics, and creator payouts. Plans differ only in how many
          creators can run on a campaign. Switch or cancel any time.
        </p>
      </div>

      <div className="mt-9 flex items-center gap-3">
        <div className="inline-flex border border-line bg-white p-1 shadow-[0_1px_2px_rgba(15,23,32,0.04)] rounded-pill">
          {(["monthly", "annual"] as const).map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCadence(c)}
              className={`cursor-pointer border-none px-[22px] py-[9px] text-[13.5px] font-bold transition-all duration-150 rounded-pill ${
                cadence === c
                  ? "bg-ink text-white shadow-[0_1px_3px_rgba(15,23,32,0.18)]"
                  : "bg-transparent text-slate-500"
              }`}
            >
              {c === "monthly" ? "Monthly" : "Annual"}
            </button>
          ))}
        </div>
        <span className="whitespace-nowrap bg-green-soft px-3 py-[5px] text-[12px] font-bold text-green rounded-pill">
          Save up to 40% annually
        </span>
      </div>

      <div className="mt-9 grid w-full max-w-[1000px] items-stretch gap-5 lg:grid-cols-3">
        {SELF_SERVE.map((p) => {
          const popular = p.tier === "premium";
          const current = currentTier === p.tier;
          const plan: SubscriptionPlan = `${p.tier}_${cadence}`;
          const cta = current
            ? "Current plan"
            : active
              ? `Switch to ${TIER_LABEL[p.tier]}`
              : `Choose ${TIER_LABEL[p.tier]}`;
          return (
            <div
              key={p.tier}
              className={`flex flex-col rounded-[20px] bg-white ${
                popular
                  ? "relative border-2 border-blue-500 px-[27px] py-[29px] shadow-[0_12px_32px_rgba(27,166,238,0.14)]"
                  : "border border-line px-7 py-[30px] shadow-[0_1px_3px_rgba(15,23,32,0.04)]"
              }`}
            >
              {popular ? (
                <span className="absolute -top-[13px] left-1/2 -translate-x-1/2 whitespace-nowrap bg-blue-500 px-3.5 py-[5px] text-[11.5px] font-bold tracking-[0.4px] text-white rounded-pill">
                  MOST POPULAR
                </span>
              ) : null}
              <span className="text-[17px] font-bold text-ink">{TIER_LABEL[p.tier]}</span>
              <span className="mt-1 text-[13px] font-medium leading-[1.5] text-slate-500">
                {p.blurb}
              </span>
              <div className="mt-[22px] flex items-baseline gap-2">
                <span
                  key={cadence}
                  className="animate-om-rise text-[42px] font-bold tracking-[-1.5px] text-ink"
                >
                  ${annual ? p.annual : p.monthly}
                </span>
                <span className="text-[14px] font-semibold text-slate-400">/mo</span>
                {annual ? (
                  <span className="text-[15px] font-semibold text-slate-300 line-through">
                    ${p.monthly}
                  </span>
                ) : null}
              </div>
              <span className="mt-1 text-[12.5px] font-semibold text-slate-400">
                {annual ? "per month, billed annually" : "per month, billed monthly"}
              </span>
              <button
                type="button"
                disabled={current || busy !== null}
                onClick={() => void pick(plan)}
                className={`mt-[22px] w-full py-[13px] text-[14px] font-bold transition-colors duration-150 rounded-pill ${
                  current
                    ? "cursor-default border border-line bg-transparent text-slate-400"
                    : popular
                      ? "cursor-pointer border-none bg-blue-500 text-white hover:bg-blue-400"
                      : "cursor-pointer border border-line-strong bg-white text-ink hover:bg-off-white"
                }`}
              >
                {busy === plan ? busyLabel : cta}
              </button>
              <div className="mb-[18px] mt-6 h-px bg-line" />
              <div className="flex flex-col gap-3 text-[13.5px] font-semibold leading-[1.45] text-ink">
                <Feat>
                  <b>{p.capFeat.bold}</b>
                  {p.capFeat.rest}
                </Feat>
                {p.feats.map((f) => (
                  <Feat key={f}>{f}</Feat>
                ))}
              </div>
            </div>
          );
        })}

        <div className="flex flex-col rounded-[20px] border border-ink-900 bg-ink-900 px-7 py-[30px] text-white">
          <span className="text-[17px] font-bold">Enterprise</span>
          <span className="mt-1 text-[13px] font-medium leading-[1.5] text-white/65">
            For agencies and studios running creators at scale.
          </span>
          <div className="mt-[22px] flex items-baseline gap-2">
            <span className="text-[42px] font-bold tracking-[-1.5px]">Custom</span>
          </div>
          <span className="mt-1 text-[12.5px] font-semibold text-white/55">
            Pricing built around your volume
          </span>
          {currentTier === "enterprise" ? (
            <span className="mt-[22px] w-full cursor-default border border-white/35 py-[13px] text-center text-[14px] font-bold text-white/60 rounded-pill">
              Current plan
            </span>
          ) : (
            <a
              href={ENTERPRISE_MAILTO}
              className="mt-[22px] w-full border border-white/35 bg-transparent py-[13px] text-center text-[14px] font-bold text-white no-underline transition-colors duration-150 rounded-pill hover:bg-white/10"
            >
              Contact us
            </a>
          )}
          <div className="mb-[18px] mt-6 h-px bg-white/15" />
          <div className="flex flex-col gap-3 text-[13.5px] font-semibold leading-[1.45]">
            <Feat dark>
              <b>Unlimited creators</b> per campaign
            </Feat>
            {ENTERPRISE_FEATS.map((f) => (
              <Feat dark key={f}>
                {f}
              </Feat>
            ))}
          </div>
        </div>
      </div>

      <p className="mb-0 mt-8 text-center text-[12.5px] font-semibold text-slate-400">
        Checkout and card details are handled by Stripe. The same card funds
        your creator budget.
      </p>
    </div>
  );
}
