"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import {
  createSetupUrl,
  createTopUpUrl,
  saveMonthlyBudget,
  type CompanyBillingStatus,
} from "@/app/admin/billing/actions";

const TOPUP_CHIPS = [100, 500, 1000] as const;
const MIN_TOPUP_CENTS = 1000;

function formatCents(cents: number): string {
  return (cents / 100).toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: cents % 100 === 0 ? 0 : 2,
  });
}

function centsFromInput(raw: string): number {
  const cleaned = raw.replace(/[^0-9.]/g, "");
  const dollars = Number(cleaned);
  if (cleaned.trim() === "" || !Number.isFinite(dollars) || dollars < 0) return 0;
  return Math.round(dollars * 100);
}

const primaryBtn =
  "inline-flex items-center justify-center rounded-full bg-ink px-5 py-2.5 text-sm font-bold text-white disabled:opacity-50";
const outlineBtn =
  "inline-flex items-center justify-center rounded-full border border-line bg-white px-5 py-2.5 text-sm font-bold text-ink disabled:opacity-50";

export function BillingPanel({ status }: { status: CompanyBillingStatus }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [budgetInput, setBudgetInput] = useState(
    status.monthly_budget_cents > 0
      ? String(status.monthly_budget_cents / 100)
      : "",
  );
  const [topUpChoice, setTopUpChoice] = useState<number | "custom">(100);
  const [customTopUp, setCustomTopUp] = useState("");

  const lowBalance =
    status.monthly_budget_cents > 0 &&
    status.credit_balance_cents < status.monthly_budget_cents * 0.2;

  const topUpCents =
    topUpChoice === "custom" ? centsFromInput(customTopUp) : topUpChoice * 100;

  function addCredits() {
    if (topUpCents < MIN_TOPUP_CENTS) {
      setError("Add at least $10 in credits.");
      return;
    }
    setError(null);
    setNotice(null);
    startTransition(async () => {
      const result = await createTopUpUrl(topUpCents);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      window.location.assign(result.value.url);
    });
  }

  function connectBank() {
    setError(null);
    setNotice(null);
    startTransition(async () => {
      const result = await createSetupUrl();
      if (!result.ok) {
        setError(result.error);
        return;
      }
      window.location.assign(result.value.url);
    });
  }

  function saveBudget() {
    setError(null);
    setNotice(null);
    startTransition(async () => {
      const result = await saveMonthlyBudget(centsFromInput(budgetInput));
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setNotice(result.value.warn ?? "Monthly budget updated.");
      router.refresh();
    });
  }

  return (
    <div className="mt-8 max-w-2xl space-y-6">
      {error ? (
        <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      ) : null}
      {notice ? (
        <p className="rounded-2xl border border-line bg-soft px-4 py-3 text-sm text-ink">
          {notice}
        </p>
      ) : null}

      <section className="rounded-[24px] border border-line bg-white p-6">
        <div className="text-[13px] font-bold uppercase tracking-[0.1em] text-muted">
          Available credits
        </div>
        <div className="mt-1 display text-4xl font-semibold text-ink">
          {formatCents(status.credit_balance_cents)}
        </div>
        {lowBalance ? (
          <p className="mt-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
            Low balance, under 20% of your monthly budget. Add credits so
            bounties keep paying out.
          </p>
        ) : null}
        <p className="mt-3 text-[14px] text-muted">
          Credits fund creator bounties. Companies pay 10% on each payout.
          Creators receive 97% (3% platform fee).
        </p>
      </section>

      <section className="space-y-4 rounded-[24px] border border-line bg-white p-6">
        <h2 className="display text-xl font-semibold text-ink">Add credits</h2>
        <div className="flex flex-wrap gap-2">
          {TOPUP_CHIPS.map((dollars) => {
            const on = topUpChoice === dollars;
            return (
              <button
                key={dollars}
                type="button"
                onClick={() => setTopUpChoice(dollars)}
                className={`rounded-full px-4 py-2 text-sm font-bold ${
                  on ? "bg-accent-soft text-accent-deep" : "bg-soft text-muted"
                }`}
              >
                ${dollars}
              </button>
            );
          })}
          <button
            type="button"
            onClick={() => setTopUpChoice("custom")}
            className={`rounded-full px-4 py-2 text-sm font-bold ${
              topUpChoice === "custom"
                ? "bg-accent-soft text-accent-deep"
                : "bg-soft text-muted"
            }`}
          >
            Custom
          </button>
        </div>
        {topUpChoice === "custom" ? (
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-ink">$</span>
            <input
              value={customTopUp}
              onChange={(e) => setCustomTopUp(e.target.value)}
              inputMode="decimal"
              placeholder="0"
              aria-label="Custom top-up amount in dollars"
              className="w-full rounded-2xl border border-line bg-white px-4 py-2.5 text-xl font-bold text-ink outline-none ring-accent/30 focus:ring-4"
            />
          </div>
        ) : null}
        <button
          type="button"
          disabled={pending}
          onClick={addCredits}
          className={primaryBtn}
        >
          {pending ? "Working…" : "Add credits"}
        </button>
      </section>

      <section className="space-y-4 rounded-[24px] border border-line bg-white p-6">
        <h2 className="display text-xl font-semibold text-ink">
          Monthly budget
        </h2>
        <div>
          <label
            htmlFor="billing-budget"
            className="block text-sm font-semibold text-ink"
          >
            Planned spend per month
          </label>
          <div className="mt-2 flex items-center gap-2">
            <span className="text-2xl font-bold text-ink">$</span>
            <input
              id="billing-budget"
              value={budgetInput}
              onChange={(e) => setBudgetInput(e.target.value)}
              inputMode="decimal"
              placeholder="0"
              className="w-full rounded-2xl border border-line bg-white px-4 py-2.5 text-xl font-bold text-ink outline-none ring-accent/30 focus:ring-4"
            />
          </div>
        </div>
        <button
          type="button"
          disabled={pending}
          onClick={saveBudget}
          className={primaryBtn}
        >
          {pending ? "Saving…" : "Save budget"}
        </button>
      </section>

      <section className="space-y-3 rounded-[24px] border border-line bg-white p-6">
        <h2 className="display text-xl font-semibold text-ink">
          Payment method (optional)
        </h2>
        <p className="text-[14px] text-muted">
          {status.bank_connected
            ? `${status.bank_name ?? "Bank"} ····${status.bank_last4 ?? ""}`
            : "Not required, top-ups use card checkout."}
        </p>
        <button
          type="button"
          disabled={pending}
          onClick={connectBank}
          className={outlineBtn}
        >
          {status.bank_connected ? "Manage bank" : "Connect bank"}
        </button>
      </section>

      <p className="text-[13px] text-muted">
        Creators are paid every Sunday at 8PM Eastern from prepaid credits.
      </p>
    </div>
  );
}
