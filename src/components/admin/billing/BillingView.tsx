"use client";

import { Check, CircleAlert, Clock, CreditCard, Link2, Plus, Receipt } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import {
  cancelPlan,
  openBillingPortal,
  setAutoTopUp,
  setMonthlyBudget,
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
import { EstimateCard } from "./EstimateCard";
import { PlanPicker, TIER_LABEL } from "./PlanPicker";
import { SignupTrackingCard } from "./SignupTrackingCard";

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

type Section = "plan" | "budget" | "stripe";

const SECTIONS: { id: Section; label: string }[] = [
  { id: "plan", label: "Plan" },
  { id: "budget", label: "Budget" },
  { id: "stripe", label: "Sales data" },
];

/* The product tour spotlights targets that live on specific sections;
   while a billing tour step is active, that section is forced open so
   the target exists in the DOM. */
const TOUR_SECTION: Record<string, Section> = {
  "billing-subscription": "plan",
  "billing-budget": "budget",
  "billing-top-up": "budget",
};

export function BillingView({
  companyId,
  billing,
  simulated,
  notice,
  tourStep,
}: {
  /** The company this page was rendered for; the actions refuse when the
      account has since switched to another one. */
  companyId: string;
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
  /* Prefill for the top-up modal when the estimator opens it. */
  const [topUpInitial, setTopUpInitial] = useState<number | undefined>(undefined);
  /* The plan picker replaces the subscription card in the change-plan flow;
     with no subscription it is the subscription section. */
  const [changingPlan, setChangingPlan] = useState(false);
  const [error, setError] = useState<string | null>(notice);
  const [connecting, setConnecting] = useState(false);
  const [section, setSection] = useState<Section>("plan");

  const tourTarget = tourStep !== null ? tourStepTarget(tourStep) : null;
  const shown: Section = (tourTarget && TOUR_SECTION[tourTarget]) || section;

  const [portalBusy, setPortalBusy] = useState(false);

  const { subscription } = billing;
  /* Any stored plan, including one whose renewal failed. */
  const active = subscription.status !== "none";
  const paymentFailed =
    subscription.status === "past_due" || subscription.status === "unpaid";
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
    const done = await run(() => (active ? switchPlan(companyId, plan) : startCheckout(companyId, plan)));
    if (done) setChangingPlan(false);
    return done;
  };

  const cancel = async () => {
    const done = await run(() => cancelPlan(companyId));
    if (done) setChangingPlan(false);
  };

  const openPortal = async () => {
    if (portalBusy) return;
    setPortalBusy(true);
    await run(() => openBillingPortal(companyId));
    setPortalBusy(false);
  };

  const connect = async () => {
    if (connecting) return;
    setConnecting(true);
    await run(() => startStripeConnect(companyId));
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

        {paymentFailed ? (
          <Card
            pad={16}
            className="flex flex-wrap items-center gap-[13px]"
            style={{ background: "var(--color-danger-soft)", borderColor: "transparent" }}
          >
            <CircleAlert size={19} className="shrink-0 text-danger" />
            <span className="min-w-[220px] flex-1">
              <span className="block text-[14px] font-bold text-ink">
                Payment failed, update your card
              </span>
              <span className="mt-0.5 block text-[13px] font-semibold text-slate-500">
                {subscription.status === "unpaid"
                  ? "Stripe could not charge your card, so inviting creators and publishing campaigns are paused until it is updated."
                  : "Stripe could not charge your card for your plan and will retry. Update it now to keep inviting creators and publishing campaigns."}
              </span>
            </span>
            <Pill
              size="sm"
              icon={portalBusy ? Clock : CreditCard}
              onClick={() => void openPortal()}
              disabled={portalBusy}
            >
              {portalBusy ? "Opening Stripe…" : "Update card"}
            </Pill>
          </Card>
        ) : null}

        {active && !paymentFailed && limit === 0 && billing.creditBalance === 0 ? (
          <Card
            pad={16}
            className="flex items-center gap-[13px]"
            style={{ background: "var(--color-amber-soft)", borderColor: "transparent" }}
          >
            <CircleAlert size={19} className="shrink-0 text-amber" />
            <span className="flex-1 text-[13.5px] font-semibold text-ink">
              No monthly budget yet. Set one so Noni has funds to pay your
              creators.
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
                  {paymentFailed ? (
                    <Chip
                      style={{
                        background: "var(--color-danger-soft)",
                        color: "var(--color-danger)",
                      }}
                    >
                      Payment failed
                    </Chip>
                  ) : subscription.status === "trialing" ? (
                    <Chip tone="blue">Trial</Chip>
                  ) : (
                    <Chip tone="green">Active</Chip>
                  )}
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
                <div className="mt-3.5 flex flex-wrap gap-2">
                  <Pill
                    size="sm"
                    variant="quiet"
                    onClick={() => setChangingPlan(true)}
                    disabled={paymentFailed}
                  >
                    Change plan
                  </Pill>
                  <Pill
                    size="sm"
                    variant={paymentFailed ? "primary" : "quiet"}
                    icon={portalBusy ? Clock : paymentFailed ? CreditCard : Receipt}
                    onClick={() => void openPortal()}
                    disabled={portalBusy}
                  >
                    {portalBusy
                      ? "Opening Stripe…"
                      : paymentFailed
                        ? "Update card"
                        : "Card and invoices"}
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
          <>
            <div data-tour="billing-budget">
              <Card pad={0}>
                <div className="px-[22px] pb-4 pt-[18px]">
                  <Label className="mb-3 block">Creator budget</Label>
                  <div className="flex items-center gap-4">
                    <span className="min-w-0">
                      <span className="display block text-[24px] font-bold tracking-[-0.6px] text-ink">
                        {money(billing.creditBalance)}
                      </span>
                      <span className="mt-0.5 block text-[12.5px] font-semibold text-slate-400">
                        Credit balance. Noni pays your creators from this.
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
                      {money(billing.spentThisMonth)} spent · {resetsLabel()}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-3 border-t border-line px-[22px] py-3.5">
                  <span className="min-w-0 flex-1">
                    <span className="block text-[16px] font-bold text-ink">
                      {limit > 0 ? `${money(limit)}/mo` : "Not set"}
                    </span>
                    <span className="mt-px block text-[12.5px] font-semibold text-slate-400">
                      Monthly budget, charged to your card and added to your
                      balance as credits
                    </span>
                  </span>
                  <Pill size="sm" onClick={() => setModal("limit")}>
                    {limit > 0 ? "Adjust monthly budget" : "Set monthly budget"}
                  </Pill>
                </div>
                <div
                  data-tour="billing-top-up"
                  className="flex items-center gap-3 border-t border-line px-[22px] py-3.5"
                >
                  <span className="min-w-0 flex-1">
                    <span className="block text-[13.5px] font-bold text-ink">
                      Backup top up
                    </span>
                    <span className="mt-px flex items-center gap-2 text-[12.5px] font-semibold text-slate-400">
                      One-off credit if you run low between cycles · Auto
                      top-up {billing.autoTopUp ? "on" : "off"}
                      <button
                        type="button"
                        onClick={() => void run(() => setAutoTopUp(companyId, !billing.autoTopUp))}
                        className="cursor-pointer border-none bg-transparent p-0 text-[12.5px] font-bold text-blue-700"
                      >
                        {billing.autoTopUp ? "Turn off" : "Turn on"}
                      </button>
                    </span>
                  </span>
                  <Pill
                    size="sm"
                    variant="quiet"
                    icon={Plus}
                    onClick={() => {
                      setTopUpInitial(undefined);
                      setModal("topup");
                    }}
                  >
                    Top up
                  </Pill>
                </div>
              </Card>
            </div>

            <EstimateCard
              onTopUp={(dollars) => {
                setTopUpInitial(dollars);
                setModal("topup");
              }}
            />

            {billing.topUpHistory.length > 0 ? (
              <Card pad={0}>
                <Label className="block px-5 pb-1.5 pt-4">Credit history</Label>
                {billing.topUpHistory.map((t, i) => (
                  <div key={i} className="flex items-center gap-3 border-t border-line px-5 py-3">
                    <span className="inline-flex h-8 w-8 items-center justify-center bg-green-soft rounded-pill">
                      <Plus size={14} className="text-green" />
                    </span>
                    <span className="flex-1 text-[14px] font-bold text-ink">
                      {money(t.amt)}
                      <span className="ml-2 font-semibold text-slate-400">
                        {t.kind === "budget" ? "Monthly budget" : "Top-up"}
                      </span>
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
              <Label className="flex-1">Stripe sales analytics</Label>
              {billing.stripeConnected ? (
                <Chip tone="green">
                  <Check size={12} /> Connected
                </Chip>
              ) : (
                <Chip tone="slate">Optional</Chip>
              )}
            </div>
            {billing.stripeConnected ? null : (
              <>
                <p className="mb-0 mt-2.5 text-[13.5px] font-semibold leading-[1.55] text-slate-500">
                  Optional. If you sell on Stripe, connecting it lets
                  Analytics show real sales and sign-ups next to every post.
                  Stripe will ask you to approve access to your account; Noni
                  only reads sales and sign-ups and never moves money or
                  changes anything. Not on Stripe? Skip this;
                  your plan and creator budget work without it.
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

        {shown === "stripe" ? <SignupTrackingCard /> : null}
      </div>

      {modal === "limit" ? (
        <AmountModal
          title="Monthly budget"
          description="Charged to your card automatically each month and added to your balance as credits. Noni pays your creators from that balance."
          customLabel="Or a custom amount"
          ctaLabel={(v) => `Set budget to ${money(v)}/mo`}
          busyLabel="Setting up budget…"
          initial={limit > 0 ? limit : 1000}
          onSubmit={(v) => run(() => setMonthlyBudget(companyId, v))}
          onClose={() => setModal(null)}
        />
      ) : null}
      {modal === "topup" ? (
        <AmountModal
          title="Backup top up"
          description={`A one-off charge that adds credit to your balance right away if you run low between monthly cycles. Charged to ${cardOnFile ?? "your card on file"}.`}
          customLabel="Or a custom amount"
          ctaLabel={(v) => `Add ${money(v)}`}
          busyLabel="Adding credit…"
          initial={topUpInitial}
          onSubmit={(v) => run(() => topUpCredit(companyId, v))}
          onClose={() => setModal(null)}
        />
      ) : null}
    </div>
  );
}
