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
import { Card, Chip, Label, PageHead, Pill } from "@/components/kit";
import type { AdminBilling, SubscriptionPlan } from "@/lib/admin/types";

import { AmountModal, money } from "./AmountModal";
import { PlanModal } from "./PlanModal";

const MONTH_SHORT = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

/** "Resets Sep 1": creator spend resets on the 1st of next month. */
function resetsLabel(): string {
  const now = new Date();
  return `Resets ${MONTH_SHORT[(now.getMonth() + 1) % 12]} 1`;
}

type ModalKind = "plan" | "limit" | "topup" | null;

export function BillingView({
  billing,
  companyName,
  simulated,
  notice,
}: {
  billing: AdminBilling;
  companyName: string;
  /** Dev without Stripe keys, or a pilot company: simulated billing. */
  simulated: boolean;
  /** Return-trip message from ?checkout= or ?connect= query params. */
  notice: string | null;
}) {
  const router = useRouter();
  const [modal, setModal] = useState<ModalKind>(null);
  const [error, setError] = useState<string | null>(notice);
  const [connecting, setConnecting] = useState(false);

  const { subscription } = billing;
  const active = subscription.status === "active";
  const annual = active && subscription.plan === "annual";
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

  const purchase = (plan: SubscriptionPlan) =>
    run(() => (active ? switchPlan(plan) : startCheckout(plan)));

  const connect = async () => {
    if (connecting) return;
    setConnecting(true);
    await run(startStripeConnect);
    setConnecting(false);
  };

  return (
    <div>
      <PageHead
        title="Billing"
        sub="Two things live here: your Noni subscription, and the budget that pays creator bounties."
      />
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

        <Card pad={22}>
          <div className="flex items-center gap-2.5">
            <Label className="flex-1">Subscription</Label>
            {active ? (
              <Chip tone="green">Active</Chip>
            ) : (
              <Chip tone="amber">Not active</Chip>
            )}
          </div>
          {active ? (
            <>
              <div className="mt-3 flex items-baseline gap-2.5">
                <span className="display text-[30px] font-bold tracking-[-0.8px] text-ink">
                  {money(subscription.price)}
                  <span className="text-[15px] font-bold text-slate-400">/mo</span>
                </span>
                <span className="text-[13.5px] font-semibold text-slate-400">
                  {annual
                    ? `Annual · billed $1,200/yr · renews ${subscription.renewsAt}`
                    : `Monthly · renews ${subscription.renewsAt}`}
                  {cardOnFile ? ` · ${cardOnFile}` : ""}
                </span>
              </div>
              <div className="mt-3.5">
                <Pill size="sm" variant="quiet" onClick={() => setModal("plan")}>
                  Manage plan
                </Pill>
              </div>
            </>
          ) : (
            <>
              <p className="mb-0 mt-2.5 text-[13.5px] font-semibold leading-[1.55] text-slate-500">
                $100/mo billed annually, or $200/mo billed monthly. One
                subscription runs your whole roster. Checkout is handled by
                Stripe.
              </p>
              <div className="mt-3.5">
                <Pill size="sm" onClick={() => setModal("plan")}>
                  Choose a plan
                </Pill>
              </div>
            </>
          )}
        </Card>

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
          <div className="flex items-center gap-3 border-t border-line px-[22px] py-3.5">
            <span className="min-w-0 flex-1">
              <span className="block text-[16px] font-bold text-ink">
                {money(billing.creditBalance)}
              </span>
              <span className="mt-px flex items-center gap-2 text-[12.5px] font-semibold text-slate-400">
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
          {billing.stripeConnected ? (
            <p className="mb-0 mt-2.5 text-[13.5px] font-semibold leading-[1.55] text-slate-500">
              {companyName}
              {billing.stripeAccountId
                ? ` · acct ${billing.stripeAccountId}`
                : ""}{" "}
              · read-only. Sales and sign-ups now flow into Analytics.
            </p>
          ) : (
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
      </div>

      {modal === "plan" ? (
        <PlanModal
          subscription={subscription}
          simulated={simulated}
          onPurchase={purchase}
          onCancel={() => void run(cancelPlan)}
          onClose={() => setModal(null)}
        />
      ) : null}
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
