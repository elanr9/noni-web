"use client";

import { DollarSign } from "lucide-react";
import { useState, type ReactNode } from "react";

import { Chip, Modal, Pill, type PillVariant } from "@/components/kit";
import type { Subscription, SubscriptionPlan } from "@/lib/admin/types";

function PlanCard({
  name,
  price,
  sub,
  chip,
  current,
  cta,
  ctaVariant,
  onCta,
}: {
  name: string;
  price: string;
  sub: string;
  chip?: ReactNode;
  current: boolean;
  cta: string;
  ctaVariant: PillVariant;
  onCta: () => void;
}) {
  return (
    <div
      className={`box-border flex min-w-0 flex-1 flex-col gap-1.5 rounded-[16px] border p-5 ${
        current ? "border-transparent bg-blue-100" : "border-line bg-white"
      }`}
    >
      <div className="flex items-center gap-2">
        <span
          className={`flex-1 text-[15.5px] font-bold ${current ? "text-blue-700" : "text-ink"}`}
        >
          {name}
        </span>
        {current ? (
          <Chip tone="blue" className="bg-white">
            Current
          </Chip>
        ) : (
          chip
        )}
      </div>
      <div className="flex items-baseline gap-[7px]">
        <span className="display text-[27px] font-bold tracking-[-0.7px] text-ink">
          {price}
        </span>
        <span className="text-[13.5px] font-semibold text-slate-400">per month</span>
      </div>
      <span className="text-[13px] font-semibold leading-[1.5] text-slate-500">{sub}</span>
      <Pill size="sm" variant={ctaVariant} onClick={onCta} className="mt-2.5 w-full">
        {cta}
      </Pill>
    </div>
  );
}

/* Plan modal (AdminSetupTabs.jsx PlanModal): side by side Monthly and
   Annual cards, each with its own CTA. Picking a plan shows the checkout
   interstitial while the redirect (or the simulated activation) runs. */
export function PlanModal({
  subscription,
  simulated,
  onPurchase,
  onCancel,
  onClose,
}: {
  subscription: Subscription;
  /** Dev without Stripe keys, or a pilot company: simulated checkout. */
  simulated: boolean;
  /** Resolves true when the flow moved on (redirected or state written). */
  onPurchase: (plan: SubscriptionPlan) => Promise<boolean>;
  onCancel: () => void;
  onClose: () => void;
}) {
  const [redirecting, setRedirecting] = useState<SubscriptionPlan | null>(null);
  const active = subscription.status === "active";
  const currentPlan = active ? subscription.plan : null;

  const pick = async (plan: SubscriptionPlan) => {
    if (redirecting) return;
    setRedirecting(plan);
    /* Keep the interstitial visible per the prototype's pacing. */
    const [done] = await Promise.all([
      onPurchase(plan),
      new Promise((resolve) => setTimeout(resolve, 1200)),
    ]);
    if (done) onClose();
    else setRedirecting(null);
  };

  const cancel = () => {
    onCancel();
    onClose();
  };

  return (
    <Modal
      title={active ? "Manage your plan" : "Purchase your subscription"}
      onClose={onClose}
    >
      {redirecting ? (
        <div className="px-2 pb-[22px] pt-[30px] text-center">
          <span className="inline-flex h-[52px] w-[52px] items-center justify-center bg-blue-100 rounded-pill">
            <DollarSign size={21} className="text-blue-700" />
          </span>
          <div className="display mt-3.5 text-[17px] font-bold tracking-[-0.4px] text-ink">
            {simulated ? "Simulating Stripe checkout" : "Taking you to Stripe checkout"}
          </div>
          <p className="mb-0 mt-[7px] text-[13.5px] font-semibold leading-[1.55] text-slate-400">
            {redirecting === "annual" ? "$1,200 billed once a year." : "$200 billed monthly."}{" "}
            {simulated
              ? "Billing is in simulated mode, so nothing is charged."
              : "You'll come right back here."}
          </p>
        </div>
      ) : (
        <>
          <div className="mt-1 flex gap-3">
            <PlanCard
              name="Monthly"
              price="$200"
              sub="Full access with monthly billing. Cancel any time."
              current={currentPlan === "monthly"}
              cta={
                active
                  ? currentPlan === "monthly"
                    ? "Cancel current plan"
                    : "Switch to monthly"
                  : "Choose monthly"
              }
              ctaVariant={active && currentPlan !== "monthly" ? "primary" : "quiet"}
              onCta={() =>
                active && currentPlan === "monthly" ? cancel() : void pick("monthly")
              }
            />
            <PlanCard
              name="Annual"
              price="$100"
              sub="Billed $1,200 per year."
              chip={<Chip tone="green">Save 50%</Chip>}
              current={currentPlan === "annual"}
              cta={
                active
                  ? currentPlan === "annual"
                    ? "Cancel current plan"
                    : "Upgrade to annual"
                  : "Choose annual"
              }
              ctaVariant={active && currentPlan === "annual" ? "quiet" : "primary"}
              onCta={() =>
                active && currentPlan === "annual" ? cancel() : void pick("annual")
              }
            />
          </div>
          <p className="mb-0 mt-3.5 text-center text-[12px] font-semibold text-slate-400">
            Checkout and card details are handled by Stripe. The same card funds
            your budget top-ups.
          </p>
        </>
      )}
    </Modal>
  );
}
