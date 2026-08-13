"use client";

import { Check, CircleAlert, Clock, Link2, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import {
  cancelPlan,
  setAutoTopUp,
  setSpendLimit,
  startCheckout,
  startStripeConnect,
  switchPlan,
  topUpCredit,
  type BillingActionResult,
} from "@/app/admin/billing/actions";
import { tourStepTarget } from "@/components/admin/tour/TourHost";
import { Card, Chip, Label, Pill } from "@/components/kit";
import type { AdminBilling, SubscriptionPlan } from "@/lib/admin/types";

import { AmountModal, money } from "./AmountModal";
import { PlanPicker, TIER_LABEL } from "./PlanPicker";

const MONTH_SHORT = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

/** "Resets Sep 1": creator spend resets on the 1st of next month. */
function resetsLabel(): string {
  const now = new Date();
  return `Resets ${MONTH_SHORT[(now.getMonth() + 1) % 12]} 1`;
}

type ModalKind = "limit" | "topup" | null;

type Section = "plan" | "budget" | "topups" | "stripe";

const SECTIONS: { id: Section; label: string }[] = [
  { id: "plan", label: "Plan" },
  { id: "budget", label: "Budget" },
  { id: "topups", label: "Top-ups" },
  { id: "stripe", label: "Stripe" },
];

/* The product tour spotlights targets that live on specific sections;
   while a billing tour step is active, that section is forced open so
   the target exists in the DOM. */
const TOUR_SECTION: Record<string, Section> = {
  "billing-subscription": "plan",
  "billing-budget": "budget",
  "billing-top-up": "topups",
};

export function BillingView({
  billing,
  simulated,
  notice,
  tourStep,
}: {
  billing: AdminBilling;
  /** Dev without Stripe keys, or a pilot company: simulated billing. */
  simulated: boolean;
  /** Return-trip message from ?checkout= or ?connect= query params. */
  notice: string | null;
  /** Active ?tour= step, if the product tour is running. */
  tourStep: number | null;
}) {
  const router = useRouter();
  const [modal, setModal] = useState<ModalKind>(null);
  /* The plan picker replaces the subscription card in the change-plan flow;
     with no subscription it is the subscription section. */
  const [changingPlan, setChangingPlan] = useState(false);
  const [error, setError] = useState<string | null>(notice);
  const [connecting, setConnecting] = useState(false);
  const [section, setSection] = useState<Section>("plan");

  const tourTarget = tourStep !== null ? tourStepTarget(tourStep) : null;
  const shown: Section = (tourTarget && TOUR_SECTION[tourTarget]) || section;

  const { subscription } = billing;
  const active = subscription.status === "active";
  const annual = active && subscription.cadence === "annual";
  const limit = billing.monthlySpendLimit ?? 0;
  const pctUsed = limit > 0 ? Math.min(1, billing.spentThisMonth / limit) : 0;
  const cardOnFile = active
    ? `${subscription.cardBrand} ···· ${subscription.cardLast4}`
    : null;

  /** Runs an action; false keeps the calling modal open. */
  const run = async (fn: () => Promise<BillingActionResult>): Promise<boolean> => {
    setError(null);
    const res = await fn();
    if (!res.ok) {
      setError(res.error);
      return false;
    }
    if (res.redirectUrl) {
      window.location.assign(res.redirectUrl);
      return true;
    }
    router.refresh();
    return true;
  };

  const purchase = async (plan: SubscriptionPlan): Promise<boolean> => {
    const done = await run(() => (active ? switchPlan(plan) : startCheckout(plan)));
    if (done) setChangingPlan(false);
    return done;
  };

  const cancel = async () => {
    const done = await run(cancelPlan);
    if (done) setChangingPlan(false);
  };

  const connect = async () => {
    if (connecting) return;
    setConnecting(true);
    await run(startStripeConnect);
    setConnecting(false);
  };

  return (
    <div>
      <div className="mb-4 inline-flex border border-line bg-white p-1 shadow-[0_1px_2px_rgba(15,23,32,0.04)] rounded-pill">
        {SECTIONS.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => setSection(s.id)}
            className={`cursor-pointer border-none px-[18px] py-2 text-[13px] font-bold transition-all duration-150 rounded-pill ${
              shown === s.id
                ? "bg-ink text-white shadow-[0_1px_3px_rgba(15,23,32,0.18)]"
                : "bg-transparent text-slate-500"
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-3.5">
        {simulated ? (
          <Card pad={14} className="bg-fill-quiet" style={{ borderColor: "transparent" }}>
            <p className="m-0 text-[12.5px] font-semibold text-slate-500">
              Billing is running in simulated mode for your company. Checkout,
              top-ups and Connect update your billing state without charging
              anything.
            </p>
          </Card>
        ) : null}

        {error ? (
          <Card
            pad={14}
            className="flex items-center gap-3"
            style={{ background: "var(--color-danger-soft)", borderColor: "transparent" }}
          >
            <CircleAlert size={17} className="shrink-0 text-danger" />
            <span className="flex-1 text-[13px] font-semibold text-ink">{error}</span>
            <button
              type="button"
              onClick={() => setError(null)}
              className="cursor-pointer border-none bg-transparent p-0 text-[12.5px] font-bold text-danger"
            >
              Dismiss
            </button>
          </Card>
        ) : null}

        {active && limit === 0 ? (
          <Card
            pad={16}
            className="flex items-center gap-[13px]"
            style={{ background: "var(--color-amber-soft)", borderColor: "transparent" }}
          >
            <CircleAlert size={19} className="shrink-0 text-amber" />
            <span className="flex-1 text-[13.5px] font-semibold text-ink">
              No monthly budget yet. Set a spend limit so Noni can pay creator
              bounties.
            </span>
            <Pill size="sm" onClick={() => setModal("limit")}>
              Set monthly budget
            </Pill>
          </Card>
        ) : null}

        {shown === "plan" ? (
          <div data-tour="billing-subscription">
            {active && !changingPlan ? (
              <Card pad={22}>
                <div className="flex items-center gap-2.5">
                  <Label className="flex-1">Subscription</Label>
                  <Chip tone="green">Active</Chip>
                </div>
                <div className="mt-3 flex items-baseline gap-2.5">
                  <span className="display text-[30px] font-bold tracking-[-0.8px] text-ink">
                    {money(subscription.price)}
                    <span className="text-[15px] font-bold text-slate-400">/mo</span>
                  </span>
                  <span className="text-[13.5px] font-semibold text-slate-400">
                    {TIER_LABEL[subscription.tier]}
                    {annual
                      ? ` annual · billed ${money(subscription.price * 12)}/yr · renews ${subscription.renewsAt}`
                      : ` monthly · renews ${subscription.renewsAt}`}
                    {cardOnFile ? ` · ${cardOnFile}` : ""}
                  </span>
                </div>
                <div className="mt-3.5">
                  <Pill size="sm" variant="quiet" onClick={() => setChangingPlan(true)}>
                    Change plan
                  </Pill>
                </div>
              </Card>
            ) : (
              <>
                <PlanPicker
                  subscription={subscription}
                  simulated={simulated}
                  onChoose={purchase}
                />
                {active ? (
                  <div className="flex items-center justify-center gap-5 pb-2">
                    <button
                      type="button"
                      onClick={() => setChangingPlan(false)}
                      className="cursor-pointer border-none bg-transparent p-0 text-[13px] font-bold text-blue-700"
                    >
                      Keep current plan
                    </button>
                    <button
                      type="button"
                      onClick={() => void cancel()}
                      className="cursor-pointer border-none bg-transparent p-0 text-[13px] font-bold text-slate-400"
                    >
                      Cancel subscription
                    </button>
                  </div>
                ) : null}
              </>
            )}
          </div>
        ) : null}

        {shown === "budget" ? (
          <div data-tour="billing-budget">
            <Card pad={0}>
              <div className="px-[22px] pb-4 pt-[18px]">
                <Label className="mb-3 block">Creator budget</Label>
                <div className="flex items-center gap-4">
                  <span className="min-w-0">
                    <span className="display block text-[24px] font-bold tracking-[-0.6px] text-ink">
                      {money(billing.spentThisMonth)} spent
                    </span>
                    <span className="mt-0.5 block text-[12.5px] font-semibold text-slate-400">
                      {resetsLabel()}
                    </span>
                  </span>
                  <span className="h-2 flex-1 overflow-hidden bg-fill-quiet rounded-pill">
                    <span
                      className={`block h-full transition-[width] duration-[400ms] ease-om rounded-pill ${
                        pctUsed > 0.85 ? "bg-danger" : pctUsed > 0.6 ? "bg-amber" : "bg-blue-500"
                      }`}
                      style={{ width: Math.round(pctUsed * 100) + "%" }}
                    />
                  </span>
                  <span className="whitespace-nowrap text-[13px] font-semibold text-slate-400">
                    {Math.round(pctUsed * 100)}% used
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-3 border-t border-line px-[22px] py-3.5">
                <span className="min-w-0 flex-1">
                  <span className="block text-[16px] font-bold text-ink">
                    {limit > 0 ? money(limit) : "Not set"}
                  </span>
                  <span className="mt-px block text-[12.5px] font-semibold text-slate-400">
                    Monthly spend limit
                  </span>
                </span>
                <Pill size="sm" variant="quiet" onClick={() => setModal("limit")}>
                  {limit > 0 ? "Adjust limit" : "Set limit"}
                </Pill>
              </div>
            </Card>
          </div>
        ) : null}

        {shown === "topups" ? (
          <>
            <div data-tour="billing-top-up">
              <Card pad={22}>
                <Label className="mb-3 block">Credit</Label>
                <div className="flex items-center gap-3">
                  <span className="min-w-0 flex-1">
                    <span className="display block text-[24px] font-bold tracking-[-0.6px] text-ink">
                      {money(billing.creditBalance)}
                    </span>
                    <span className="mt-0.5 flex items-center gap-2 text-[12.5px] font-semibold text-slate-400">
                      Extra credit balance · Auto top-up {billing.autoTopUp ? "on" : "off"}
                      <button
                        type="button"
                        onClick={() => void run(() => setAutoTopUp(!billing.autoTopUp))}
                        className="cursor-pointer border-none bg-transparent p-0 text-[12.5px] font-bold text-blue-700"
                      >
                        {billing.autoTopUp ? "Turn off" : "Turn on"}
                      </button>
                    </span>
                  </span>
                  <Pill size="sm" icon={Plus} onClick={() => setModal("topup")}>
                    Top up
                  </Pill>
                </div>
              </Card>
            </div>

            {billing.topUpHistory.length > 0 ? (
              <Card pad={0}>
                <Label className="block px-5 pb-1.5 pt-4">Top-ups</Label>
                {billing.topUpHistory.map((t, i) => (
                  <div key={i} className="flex items-center gap-3 border-t border-line px-5 py-3">
                    <span className="inline-flex h-8 w-8 items-center justify-center bg-green-soft rounded-pill">
                      <Plus size={14} className="text-green" />
                    </span>
                    <span className="flex-1 text-[14px] font-bold text-ink">
                      {money(t.amt)} top-up
                    </span>
                    <span className="text-[13px] font-semibold text-slate-400">
                      {cardOnFile ? `${cardOnFile} · ` : ""}
                      {t.date}
                    </span>
                  </div>
                ))}
              </Card>
            ) : null}
          </>
        ) : null}

        {shown === "stripe" ? (
          <Card pad={22}>
            <div className="flex items-center gap-2.5">
              <Label className="flex-1">Stripe</Label>
              {billing.stripeConnected ? (
                <Chip tone="green">
                  <Check size={12} /> Connected
                </Chip>
              ) : (
                <Chip tone="amber">Not connected</Chip>
              )}
            </div>
            {billing.stripeConnected ? null : (
              <>
                <p className="mb-0 mt-2.5 text-[13.5px] font-semibold leading-[1.55] text-slate-500">
                  Read-only connection so Analytics shows real sales and sign-ups
                  next to every post. We never move money from Stripe.
                </p>
                <div className="mt-3.5">
                  <Pill
                    size="sm"
                    icon={connecting ? Clock : Link2}
                    onClick={() => void connect()}
                  >
                    {connecting ? "Opening Stripe…" : "Connect with Stripe"}
                  </Pill>
                </div>
              </>
            )}
          </Card>
        ) : null}
      </div>

      {modal === "limit" ? (
        <AmountModal
          title="Monthly spend limit"
          description="The most Noni spends on creator bounties each month. Spend resets on the 1st."
          customLabel="Or a custom limit"
          ctaLabel={(v) => `Set limit to ${money(v)}/mo`}
          busyLabel="Saving limit…"
          initial={limit > 0 ? limit : 1000}
          onSubmit={(v) => run(() => setSpendLimit(v))}
          onClose={() => setModal(null)}
        />
      ) : null}
      {modal === "topup" ? (
        <AmountModal
          title="Top up your budget"
          description={`One-off credit on top of your monthly budget. Goes straight to creator bounties, charged to ${cardOnFile ?? "your card on file"}.`}
          customLabel="Or a custom amount"
          ctaLabel={(v) => `Add ${money(v)}`}
          busyLabel="Adding credit…"
          onSubmit={(v) => run(() => topUpCredit(v))}
          onClose={() => setModal(null)}
        />
      ) : null}
    </div>
  );
}
