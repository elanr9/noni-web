"use client";

import {
  ArrowRight,
  Check,
  CircleAlert,
  Clock,
  CreditCard,
  Link2,
  Lock,
  Plus,
  Receipt,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import {
  cancelPlan,
  openBillingPortal,
  startCheckout,
  startStripeConnect,
  switchPlan,
  type BillingActionResult,
} from "@/app/admin/billing/actions";
import { tourStepTarget } from "@/components/admin/tour/TourHost";
import { Card, Chip, Label, Pill } from "@/components/kit";
import type { AdminBilling, SubscriptionPlan } from "@/lib/admin/types";

import { yearlyDollars } from "@/lib/plans";
import { WaitlistModal } from "@/components/WaitlistModal";
import { BOOKING_URL } from "@/lib/site-config";

import { money } from "./AmountModal";
import { PlanPicker, TIER_LABEL } from "./PlanPicker";
import { SignupTrackingCard } from "./SignupTrackingCard";

const MONTH_SHORT = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

/** "Resets Sep 1": creator spend resets on the 1st of next month. */
function resetsLabel(): string {
  const now = new Date();
  return `Resets ${MONTH_SHORT[(now.getMonth() + 1) % 12]} 1`;
}

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
  /* The plan picker replaces the subscription card in the change-plan flow;
     with no subscription it is the subscription section. */
  const [changingPlan, setChangingPlan] = useState(false);
  const [error, setError] = useState<string | null>(notice);
  const [connecting, setConnecting] = useState(false);
  const [section, setSection] = useState<Section | null>(null);
  const [callOpen, setCallOpen] = useState(false);

  const tourTarget = tourStep !== null ? tourStepTarget(tourStep) : null;

  const [portalBusy, setPortalBusy] = useState(false);

  const { subscription } = billing;
  /* Any stored plan, including one whose renewal failed. */
  const active = subscription.status !== "none";
  const paymentFailed =
    subscription.status === "past_due" || subscription.status === "unpaid";
  const annual = active && subscription.cadence === "annual";
  const limit = billing.monthlySpendLimit ?? 0;
  const pctUsed = limit > 0 ? Math.min(1, billing.spentThisMonth / limit) : 0;
  /* No plan yet: Budget and Sales data are locked. Pilots ops runs by hand
     (simulated billing) have no plan to buy, so nothing locks for them. */
  const locked = !active && !simulated;
  /* The steps unlock one at a time: Budget once there is a plan, Sales
     data once the budget is set (or there is already credit to spend). */
  const budgetDone = limit > 0 || billing.creditBalance > 0;
  const lockedStep = (id: Section): boolean =>
    simulated
      ? false
      : id === "budget"
        ? !active
        : id === "stripe"
          ? !active || !budgetDone
          : false;
  /* Open on the step that is up next, until the admin picks one. */
  const upNext: Section = !active ? "plan" : !budgetDone ? "budget" : "plan";
  const wanted: Section =
    (tourTarget && TOUR_SECTION[tourTarget]) || section || upNext;
  const shown: Section = lockedStep(wanted) ? upNext : wanted;
  const stepNo = SECTIONS.findIndex((x) => x.id === upNext) + 1;
  const cardOnFile =
    active && subscription.cardLast4
      ? `${subscription.cardBrand} ···· ${subscription.cardLast4}`
      : null;

  /** Runs an action; false keeps the calling modal open. */
  const run = async (
    fn: () => Promise<BillingActionResult>,
  ): Promise<boolean> => {
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
    const done = await run(() =>
      active ? switchPlan(companyId, plan) : startCheckout(companyId, plan),
    );
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
      {/* The three sections are steps in order: a plan first, then the
          creator budget, then sales data. The later two stay locked until
          the company has a plan. */}
      <div className="mb-4 flex flex-wrap items-center gap-x-4 gap-y-2">
        <div className="inline-flex max-w-full flex-wrap border border-line bg-white p-1 shadow-[0_1px_2px_rgba(15,23,32,0.04)] rounded-pill">
          {SECTIONS.map((s, i) => {
            const isLocked = lockedStep(s.id);
            const on = shown === s.id;
            const done =
              s.id === "plan"
                ? active
                : s.id === "budget"
                  ? budgetDone
                  : billing.stripeConnected;
            return (
              <button
                key={s.id}
                type="button"
                disabled={isLocked}
                title={
                  isLocked
                    ? active
                      ? "Unlocks once your creator budget is set"
                      : "Pick a plan first"
                    : undefined
                }
                onClick={() => setSection(s.id)}
                className={`inline-flex items-center gap-2 border-none px-[16px] py-2 text-[13px] font-bold transition-all duration-150 rounded-pill ${
                  on
                    ? "cursor-pointer bg-ink text-white shadow-[0_1px_3px_rgba(15,23,32,0.18)]"
                    : isLocked
                      ? "cursor-not-allowed bg-transparent text-slate-300"
                      : "cursor-pointer bg-transparent text-slate-500"
                }`}
              >
                <span
                  className={`inline-flex h-[18px] w-[18px] items-center justify-center text-[11px] font-bold rounded-pill ${
                    on
                      ? "bg-white/20 text-white"
                      : done
                        ? "bg-green-soft text-green"
                        : "bg-fill-quiet text-slate-400"
                  }`}
                >
                  {isLocked ? (
                    <Lock size={10} />
                  ) : done ? (
                    <Check size={11} />
                  ) : (
                    i + 1
                  )}
                </span>
                {s.label}
              </button>
            );
          })}
        </div>
        {locked ? (
          <span className="text-[12.5px] font-semibold text-slate-400">
            Step 1 of 3. Pick a plan to unlock your budget and sales data.
          </span>
        ) : active && !budgetDone && !simulated ? (
          <span className="text-[12.5px] font-semibold text-slate-400">
            Step {stepNo} of 3. Set your creator budget to unlock sales data.
          </span>
        ) : null}
      </div>

      <div key={shown} className="om-stagger flex flex-col gap-3.5">
        {simulated ? (
          <Card
            pad={14}
            className="bg-fill-quiet"
            style={{ borderColor: "transparent" }}
          >
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
            style={{
              background: "var(--color-danger-soft)",
              borderColor: "transparent",
            }}
          >
            <CircleAlert size={17} className="shrink-0 text-danger" />
            <span className="flex-1 text-[13px] font-semibold text-ink">
              {error}
            </span>
            {!active && shown !== "plan" ? (
              <Pill
                size="sm"
                onClick={() => {
                  setError(null);
                  setSection("plan");
                }}
              >
                Pick a plan
              </Pill>
            ) : null}
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
            style={{
              background: "var(--color-danger-soft)",
              borderColor: "transparent",
            }}
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
                    {subscription.price > 0
                      ? money(subscription.price)
                      : "Custom"}
                    {subscription.price > 0 ? (
                      <span className="text-[15px] font-bold text-slate-400">
                        /mo
                      </span>
                    ) : null}
                  </span>
                  <span className="text-[13.5px] font-semibold text-slate-400">
                    {[
                      `${TIER_LABEL[subscription.tier]}${annual ? " annual" : " monthly"}`,
                      annual && subscription.price > 0
                        ? `billed ${money(yearlyDollars(subscription.tier, subscription.price))}/yr`
                        : null,
                      subscription.renewsAt
                        ? `renews ${subscription.renewsAt}`
                        : "invoiced by Noni",
                      cardOnFile,
                    ]
                      .filter(Boolean)
                      .join(" · ")}
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
                    icon={
                      portalBusy ? Clock : paymentFailed ? CreditCard : Receipt
                    }
                    onClick={() => void openPortal()}
                    disabled={portalBusy}
                  >
                    {portalBusy
                      ? "Opening Stripe…"
                      : paymentFailed
                        ? "Update card"
                        : "Card and invoices"}
                  </Pill>
                  <span className="flex-1" />
                  <Pill
                    size="sm"
                    icon={ArrowRight}
                    onClick={() => setSection("budget")}
                  >
                    Next: creator budget
                  </Pill>
                </div>
              </Card>
            ) : (
              <>
                <PlanPicker
                  subscription={subscription}
                  simulated={simulated}
                  onChoose={purchase}
                  compact
                />
                {active ? (
                  <div className="flex items-center justify-center gap-5 pt-4">
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
            {/* The creator budget is agreed with the Noni team on a call and
                invoiced; nothing here charges a card. */}
            {!active ? (
              <Card pad={16} className="flex flex-wrap items-center gap-3">
                <span className="min-w-0 flex-1 text-[13.5px] font-semibold text-ink">
                  You have no plan yet. Pick one to start running creators.
                </span>
                <Pill size="sm" onClick={() => setSection("plan")}>
                  Pick a plan
                </Pill>
              </Card>
            ) : null}
            <div data-tour="billing-budget">
              <Card pad={0}>
                <div
                  className={`flex flex-wrap items-center gap-x-6 gap-y-4 px-[22px] pb-5 pt-[18px] ${
                    budgetDone ? "" : "rounded-t-[inherit] bg-blue-100/40"
                  }`}
                >
                  <span className="min-w-[240px] flex-1">
                    <Label className="mb-2.5 block">Creator budget</Label>
                    <span className="display block text-[30px] font-bold tracking-[-0.8px] text-ink">
                      {limit > 0
                        ? money(limit)
                        : budgetDone
                          ? "Set by Noni"
                          : "Set your creator budget"}
                      {limit > 0 ? (
                        <span className="text-[15px] font-bold text-slate-400">
                          /mo
                        </span>
                      ) : null}
                    </span>
                    <span className="mt-1 block max-w-[560px] text-[13.5px] font-semibold leading-[1.5] text-slate-500">
                      {budgetDone
                        ? "Set with the Noni team and invoiced to you. Noni pays your creators from it."
                        : "This is the money that pays your creators. We set the amount with you on a quick call, then send you an invoice. Nothing is charged to your card."}
                    </span>
                  </span>
                  <Pill
                    size={budgetDone ? "sm" : "md"}
                    variant={budgetDone ? "quiet" : "primary"}
                    icon={budgetDone ? undefined : ArrowRight}
                    onClick={() => {
                      if (BOOKING_URL)
                        window.open(
                          BOOKING_URL,
                          "_blank",
                          "noopener,noreferrer",
                        );
                      else setCallOpen(true);
                    }}
                  >
                    {budgetDone
                      ? "Change it on a call"
                      : "Book your budget call"}
                  </Pill>
                </div>
                <div className="flex flex-wrap items-center gap-4 border-t border-line px-[22px] py-4">
                  <span className="min-w-0">
                    <span className="block text-[18px] font-bold tracking-[-0.3px] text-ink">
                      {money(billing.creditBalance)}
                    </span>
                    <span className="mt-0.5 block text-[12.5px] font-semibold text-slate-400">
                      Balance left
                    </span>
                  </span>
                  <span className="h-2 min-w-[120px] flex-1 overflow-hidden bg-fill-quiet rounded-pill">
                    <span
                      className={`block h-full transition-[width] duration-[400ms] ease-om rounded-pill ${
                        pctUsed > 0.85
                          ? "bg-danger"
                          : pctUsed > 0.6
                            ? "bg-amber"
                            : "bg-blue-500"
                      }`}
                      style={{ width: Math.round(pctUsed * 100) + "%" }}
                    />
                  </span>
                  <span className="whitespace-nowrap text-[13px] font-semibold text-slate-400">
                    {money(billing.spentThisMonth)} spent · {resetsLabel()}
                  </span>
                </div>
              </Card>
            </div>

            {budgetDone ? (
              <div className="flex justify-end">
                <Pill
                  size="sm"
                  icon={ArrowRight}
                  onClick={() => setSection("stripe")}
                >
                  Next: sales data
                </Pill>
              </div>
            ) : (
              <p className="m-0 flex items-center justify-end gap-1.5 text-[12.5px] font-bold text-slate-400">
                <Lock size={13} />
                Sales data unlocks once your budget is set
              </p>
            )}

            {billing.topUpHistory.length > 0 ? (
              <Card pad={0}>
                <Label className="block px-5 pb-1.5 pt-4">
                  Budget payments
                </Label>
                {billing.topUpHistory.map((t, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 border-t border-line px-5 py-3"
                  >
                    <span className="inline-flex h-8 w-8 items-center justify-center bg-green-soft rounded-pill">
                      <Plus size={14} className="text-green" />
                    </span>
                    <span className="flex-1 text-[14px] font-bold text-ink">
                      {money(t.amt)}
                      <span className="ml-2 font-semibold text-slate-400">
                        {t.kind === "budget"
                          ? "Budget invoice paid"
                          : "Credit added"}
                      </span>
                    </span>
                    <span className="text-[13px] font-semibold text-slate-400">
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
                  Optional. If you sell on Stripe, connecting it lets Analytics
                  show real sales and sign-ups next to every post. Stripe will
                  ask you to approve access to your account; Noni only reads
                  sales and sign-ups and never moves money or changes anything.
                  Not on Stripe? Skip this; your plan and creator budget work
                  without it.
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
      <WaitlistModal
        open={callOpen}
        onClose={() => setCallOpen(false)}
        kind="call"
        source="billing-budget"
      />
    </div>
  );
}
