"use client";

import { useState } from "react";

import { WaitlistModal } from "@/components/WaitlistModal";
import type {
  BillingCadence,
  PlanTier,
  Subscription,
  SubscriptionPlan,
} from "@/lib/admin/types";
import {
  ENTERPRISE_PLAN,
  MANAGED_PLAN,
  MAX_ANNUAL_SAVINGS_PCT,
  PLAN_TIER_LABEL,
  SELF_SERVE_PLANS,
} from "@/lib/plans";
import { BOOKING_URL } from "@/lib/site-config";

export const TIER_LABEL: Record<PlanTier, string> = PLAN_TIER_LABEL;

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
   flow when it does. The public /pricing page renders the same cards with
   `publicCta` instead of checkout. Annual is the default cadence.

   `compact` is the Billing tab layout: a one-line heading beside the cadence
   switch and tighter cards, so the three plans and their buttons fit on one
   laptop screen without scrolling. */
export function PlanPicker({
  subscription = { status: "none" },
  simulated = false,
  onChoose,
  publicCta,
  heading = "Pick the plan that fits your creator program",
  eyebrow = "Subscription",
  compact = false,
}: {
  subscription?: Subscription;
  /** Dev without Stripe keys, or a pilot company: simulated checkout. */
  simulated?: boolean;
  /** Resolves true when the flow moved on (redirected or state written). */
  onChoose?: (plan: SubscriptionPlan) => Promise<boolean>;
  /** Public page mode: every self-serve CTA runs this instead of checkout. */
  publicCta?: { label: string; onClick: (plan: SubscriptionPlan) => void };
  heading?: string;
  eyebrow?: string;
  /** Dense layout for the Billing tab. */
  compact?: boolean;
}) {
  const [cadence, setCadence] = useState<BillingCadence>("annual");
  const [busy, setBusy] = useState<SubscriptionPlan | null>(null);
  const [contactOpen, setContactOpen] = useState(false);
  const annual = cadence === "annual";
  const active = subscription.status !== "none";
  const currentTier = active ? subscription.tier : null;

  const pick = async (plan: SubscriptionPlan) => {
    if (publicCta) {
      publicCta.onClick(plan);
      return;
    }
    if (busy || !onChoose) return;
    setBusy(plan);
    const done = await onChoose(plan);
    if (!done) setBusy(null);
  };

  /* Enterprise and Done for you are sold on a call: the scheduling link
     when one is configured, else the request-a-call form. */
  const bookCall = () => {
    if (BOOKING_URL) window.open(BOOKING_URL, "_blank", "noopener,noreferrer");
    else setContactOpen(true);
  };

  /* Done for you is scoped on a call, then ops puts the company on it. */
  const managedCurrent = currentTier === "managed";
  const managedCta = managedCurrent ? "Current plan" : "Let's talk";

  const busyLabel = active
    ? "Switching plan…"
    : simulated
      ? "Simulating checkout…"
      : "Opening Stripe checkout…";

  const cadenceSwitch = (
    <>
      <div className="inline-flex border border-line bg-white p-1 shadow-[0_1px_2px_rgba(15,23,32,0.04)] rounded-pill">
            {(["monthly", "annual"] as const).map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setCadence(c)}
                className={`cursor-pointer border-none font-bold transition-all duration-150 rounded-pill ${
                  compact ? "px-4 py-[7px] text-[13px]" : "px-[22px] py-[9px] text-[13.5px]"
                } ${
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
            Save up to {MAX_ANNUAL_SAVINGS_PCT}% annually
          </span>
    </>
  );

  /* Card spacing shared by the three cards. */
  const cardPad = compact ? "p-5" : "px-7 py-[30px]";
  const priceCls = compact
    ? "text-[32px] tracking-[-1px]"
    : "text-[42px] tracking-[-1.5px]";
  /* Compact cards list features first and pin the button to the bottom, so
     the three buttons line up whatever the feature count. */
  const ctaCls = compact ? "mt-auto py-[11px]" : "mt-[22px] py-[13px]";
  const priceGap = compact ? "mt-2.5" : "mt-[22px]";
  const ruleCls = compact ? "my-3.5" : "mb-[18px] mt-6";
  const featsCls = compact
    ? "gap-2 text-[13px] leading-[1.4]"
    : "gap-3 text-[13.5px] leading-[1.45]";

  const enterpriseFeats = (
    <>
      <div className={`h-px bg-white/15 ${ruleCls}`} />
      <div className={`flex flex-col font-semibold ${featsCls} ${compact ? "mb-4" : ""}`}>
        <Feat dark>
          <b>{ENTERPRISE_PLAN.capFeat.bold}</b>
          {ENTERPRISE_PLAN.capFeat.rest}
        </Feat>
        {ENTERPRISE_PLAN.feats.map((f) => (
          <Feat dark key={f}>
            {f}
          </Feat>
        ))}
      </div>
    </>
  );

  return (
    <div className={`flex flex-col items-center ${compact ? "" : "py-8"}`}>
      {compact ? (
        <div className="flex w-full flex-wrap items-center justify-between gap-x-6 gap-y-3">
          <div className="min-w-0">
            <h1 className="display m-0 text-[22px] font-bold leading-[1.2] tracking-[-0.5px] text-ink">
              Pick your plan
            </h1>
            <p className="mb-0 mt-1 text-[13px] font-medium leading-[1.5] text-slate-500">
              Pick how many creators you run, or have Noni run it for you.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2.5">
            {cadenceSwitch}
          </div>
        </div>
      ) : (
        <>
          <div className="max-w-[560px] text-center">
            <span className="inline-flex whitespace-nowrap bg-blue-100 px-3.5 py-1.5 text-[12.5px] font-bold tracking-[0.3px] text-blue-700 rounded-pill">
              {eyebrow}
            </span>
            <h1 className="display m-0 mt-[18px] text-[38px] font-bold leading-[1.1] tracking-[-1px] text-ink">
              {heading}
            </h1>
            <p className="mb-0 mt-3.5 text-[15px] font-medium leading-[1.6] text-slate-500">
              Every plan includes unlimited campaigns, briefs, approvals,
              analytics, and creator payouts. Plans differ only in how many
              creators can run on a campaign. Switch or cancel any time.
            </p>
          </div>

          <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
            {cadenceSwitch}
          </div>
        </>
      )}

      <div
        className={`om-stagger grid w-full items-stretch lg:grid-cols-3 ${
          compact ? "mt-5 gap-3.5" : "mt-9 max-w-[1000px] gap-5"
        }`}
      >
        {SELF_SERVE_PLANS.map((p) => {
          const popular = p.tier === "premium";
          const current = currentTier === p.tier;
          const plan: SubscriptionPlan = `${p.tier}_${cadence}`;
          const cta = publicCta
            ? publicCta.label
            : current
            ? "Current plan"
            : active
              ? `Switch to ${TIER_LABEL[p.tier]}`
              : `Choose ${TIER_LABEL[p.tier]}`;
          const feats = (
            <>
              <div className={`h-px bg-line ${ruleCls}`} />
              <div
                className={`flex flex-col font-semibold text-ink ${featsCls} ${
                  compact ? "mb-4" : ""
                }`}
              >
                <Feat>
                  <b>{p.capFeat.bold}</b>
                  {p.capFeat.rest}
                </Feat>
                {p.feats.map((f) => (
                  <Feat key={f}>{f}</Feat>
                ))}
              </div>
            </>
          );
          return (
            <div
              key={p.tier}
              className={`flex flex-col rounded-[20px] bg-white transition-[translate,box-shadow] duration-200 ease-om hover:-translate-y-1 hover:shadow-[0_16px_36px_rgba(15,23,32,0.10)] ${
                popular
                  ? `relative border-2 border-blue-500 shadow-[0_12px_32px_rgba(27,166,238,0.14)] ${
                      compact ? "p-[19px]" : "px-[27px] py-[29px]"
                    }`
                  : `border border-line shadow-[0_1px_3px_rgba(15,23,32,0.04)] ${cardPad}`
              }`}
            >
              {popular && !compact ? (
                <span className="absolute -top-[13px] left-1/2 -translate-x-1/2 whitespace-nowrap bg-blue-500 px-3.5 py-[5px] text-[11.5px] font-bold tracking-[0.4px] text-white rounded-pill">
                  MOST POPULAR
                </span>
              ) : null}
              <span className="flex items-center justify-between gap-2">
                <span className="text-[17px] font-bold text-ink">{TIER_LABEL[p.tier]}</span>
                {popular && compact ? (
                  <span className="whitespace-nowrap bg-blue-500 px-2.5 py-[3px] text-[10.5px] font-bold tracking-[0.4px] text-white rounded-pill">
                    MOST POPULAR
                  </span>
                ) : null}
              </span>
              {compact ? null : (
                <span className="mt-1 text-[13px] font-medium leading-[1.5] text-slate-500">
                  {p.blurb}
                </span>
              )}
              <div className={`flex items-baseline gap-2 ${priceGap}`}>
                <span
                  key={cadence}
                  className={`animate-om-rise font-bold text-ink ${priceCls}`}
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
              {compact ? feats : null}
              <button
                type="button"
                disabled={current || busy !== null}
                onClick={() => void pick(plan)}
                className={`w-full text-[14px] font-bold transition-colors duration-150 rounded-pill ${ctaCls} ${
                  current
                    ? "cursor-default border border-line bg-transparent text-slate-400"
                    : popular
                      ? "cursor-pointer border-none bg-blue-500 text-white hover:bg-blue-400"
                      : "cursor-pointer border border-line-strong bg-white text-ink hover:bg-off-white"
                }`}
              >
                {busy === plan ? busyLabel : cta}
              </button>
              {compact ? null : feats}
            </div>
          );
        })}

        <div
          className={`flex flex-col rounded-[20px] border border-ink-900 bg-ink-900 text-white transition-[translate,box-shadow] duration-200 ease-om hover:-translate-y-1 hover:shadow-[0_16px_36px_rgba(15,23,32,0.28)] ${cardPad}`}
        >
          <span className="text-[17px] font-bold">Enterprise</span>
          {compact ? null : (
            <span className="mt-1 text-[13px] font-medium leading-[1.5] text-white/65">
              {ENTERPRISE_PLAN.blurb}
            </span>
          )}
          <div className={`flex items-baseline gap-2 ${priceGap}`}>
            <span className={`font-bold ${priceCls}`}>Custom</span>
          </div>
          <span className="mt-1 text-[12.5px] font-semibold text-white/55">
            Pricing built around your volume
          </span>
          {compact ? enterpriseFeats : null}
          {currentTier === "enterprise" ? (
            <span
              className={`w-full cursor-default border border-white/35 text-center text-[14px] font-bold text-white/60 rounded-pill ${ctaCls}`}
            >
              Current plan
            </span>
          ) : (
            <button
              type="button"
              onClick={bookCall}
              className={`w-full cursor-pointer border border-white/35 bg-transparent text-center text-[14px] font-bold text-white transition-colors duration-150 rounded-pill hover:bg-white/10 ${ctaCls}`}
            >
              Let&apos;s talk
            </button>
          )}
          {compact ? null : enterpriseFeats}
        </div>
      </div>

      {/* Done for you: the last option, a full-width band under the cards. */}
      <div
        className={`flex w-full flex-col gap-x-6 gap-y-4 rounded-[20px] border border-line bg-white shadow-[0_1px_3px_rgba(15,23,32,0.04)] transition-[translate,box-shadow] duration-200 ease-om hover:-translate-y-0.5 hover:shadow-[0_12px_28px_rgba(15,23,32,0.08)] md:flex-row md:items-center ${
          compact ? "mt-3.5 px-5 py-4" : "mt-5 max-w-[1000px] px-7 py-6"
        }`}
      >
        <div className="min-w-0 flex-1">
          <span className="flex flex-wrap items-center gap-2">
            <span className="text-[17px] font-bold text-ink">{TIER_LABEL.managed}</span>
            <span className="whitespace-nowrap bg-blue-100 px-2.5 py-[3px] text-[11.5px] font-bold text-blue-700 rounded-pill">
              {MANAGED_PLAN.tag}
            </span>
          </span>
          <p
            className={`m-0 mt-1 font-medium leading-[1.5] text-slate-500 ${
              compact ? "text-[13px]" : "text-[13.5px]"
            }`}
          >
            {MANAGED_PLAN.blurb}
          </p>
        </div>
        <button
          type="button"
          disabled={managedCurrent}
          onClick={bookCall}
          className={`shrink-0 px-6 text-[14px] font-bold transition-colors duration-150 rounded-pill ${
            compact ? "py-[11px]" : "py-[13px]"
          } ${
            managedCurrent
              ? "cursor-default border border-line bg-transparent text-slate-400"
              : "cursor-pointer border-none bg-ink text-white hover:bg-ink-900"
          }`}
        >
          {managedCta}
        </button>
      </div>

      <p
        className={`mb-0 text-center text-[12.5px] font-semibold text-slate-400 ${
          compact ? "mt-4" : "mt-8"
        }`}
      >
        Checkout and card details are handled by Stripe. Switch or cancel
        any time.
      </p>

      <WaitlistModal
        open={contactOpen}
        onClose={() => setContactOpen(false)}
        kind="call"
        source={publicCta ? "pricing" : "billing"}
      />
    </div>
  );
}
