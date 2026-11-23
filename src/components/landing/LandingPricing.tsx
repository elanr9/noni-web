"use client";

import { ArrowRight, Check } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { ENTERPRISE_PLAN, PLAN_CREATOR_CAP, SELF_SERVE_PLANS } from "@/lib/plans";
import { BOOKING_URL } from "@/lib/site-config";

/* Pricing on the landing page, the standard SaaS layout: one Monthly /
   Yearly switch, three plans (Starter, Premium highlighted, Enterprise),
   each with a line on who it is for, the price, one button and what it
   includes. Done for you sits in a slim row under them: no price, a call. */

const SIGN_UP = "/apply";

type Cadence = "monthly" | "yearly";

type Plan = {
  name: string;
  blurb: string;
  price: (c: Cadence) => string | null;
  feats: string[];
  cta: string;
  href?: string;
  popular?: boolean;
};

const [starter, premium] = SELF_SERVE_PLANS;
const SAVE_PCT = Math.round((1 - premium.annual / premium.monthly) * 100);

const PLANS: Plan[] = [
  {
    name: "Starter",
    blurb: starter.blurb,
    price: (c) => `$${c === "yearly" ? starter.annual : starter.monthly}`,
    feats: [`Up to ${PLAN_CREATOR_CAP.starter} creators per campaign`, ...starter.feats],
    cta: "Get started",
    href: SIGN_UP,
  },
  {
    name: "Premium",
    blurb: premium.blurb,
    price: (c) => `$${c === "yearly" ? premium.annual : premium.monthly}`,
    feats: [`Up to ${PLAN_CREATOR_CAP.premium} creators per campaign`, ...premium.feats],
    cta: "Get started",
    href: SIGN_UP,
    popular: true,
  },
  {
    name: "Enterprise",
    blurb: ENTERPRISE_PLAN.blurb,
    price: () => null,
    feats: ["Unlimited creators per campaign", ...ENTERPRISE_PLAN.feats],
    cta: "Contact sales",
  },
];

function bookCall() {
  if (BOOKING_URL) window.open(BOOKING_URL, "_blank", "noopener,noreferrer");
}

export function LandingPricing() {
  const [cadence, setCadence] = useState<Cadence>("yearly");

  return (
    <div className="mx-auto w-full max-w-[1040px]">
      <div className="text-center">
        <h2 className="display m-0 text-[clamp(30px,5svh,46px)] font-bold leading-[1.05] tracking-[-0.02em] text-ink">Pricing</h2>
        <div className="mt-[clamp(14px,2.6svh,24px)] inline-flex items-center rounded-full border border-line bg-white p-1">
          {(["monthly", "yearly"] as const).map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCadence(c)}
              className={`cursor-pointer rounded-full border-none px-4 py-2 text-[14px] font-semibold transition-colors duration-150 ${
                cadence === c ? "bg-accent-deep text-white" : "bg-transparent text-muted hover:text-ink"
              }`}
            >
              {c === "monthly" ? "Monthly" : `Yearly · save ${SAVE_PCT}%`}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-[clamp(18px,3.4svh,36px)] grid gap-4 md:grid-cols-3">
        {PLANS.map((p) => {
          const price = p.price(cadence);
          return (
            <div
              key={p.name}
              className={`flex flex-col rounded-[20px] bg-white p-[clamp(18px,2.8svh,28px)] ${
                p.popular ? "border-2 border-accent-deep" : "border border-line"
              }`}
            >
              <div className="flex items-center justify-between">
                <p className="m-0 text-[17px] font-bold text-ink">{p.name}</p>
                {p.popular ? (
                  <span className="rounded-full bg-accent-soft px-2.5 py-1 text-[12px] font-bold text-accent-deep">Most popular</span>
                ) : null}
              </div>
              <p className="m-0 mt-1.5 min-h-[40px] text-[14px] leading-[1.45] text-muted">{p.blurb}</p>
              <p className="m-0 mt-[clamp(10px,2svh,18px)] flex items-baseline gap-1">
                <span className="display text-[clamp(30px,4.4svh,40px)] font-bold leading-none tracking-[-0.02em] text-ink">
                  {price ?? "Custom"}
                </span>
                {price ? <span className="text-[15px] font-medium text-muted">/month</span> : null}
              </p>
              <p className="m-0 mt-1.5 h-[18px] text-[13px] text-slate-400">
                {price ? (cadence === "yearly" ? "billed yearly" : "billed monthly") : ""}
              </p>
              {p.href ? (
                <Link
                  href={p.href}
                  className={`mt-[clamp(12px,2.2svh,20px)] inline-flex w-full items-center justify-center rounded-full py-3 text-[15px] font-bold no-underline transition active:scale-[0.98] ${
                    p.popular ? "bg-accent-deep text-white hover:bg-accent" : "border border-line-strong bg-white text-ink hover:bg-soft"
                  }`}
                >
                  {p.cta}
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={bookCall}
                  className="mt-[clamp(12px,2.2svh,20px)] inline-flex w-full cursor-pointer items-center justify-center rounded-full border border-line-strong bg-white py-3 text-[15px] font-bold text-ink transition hover:bg-soft active:scale-[0.98]"
                >
                  {p.cta}
                </button>
              )}
              <ul className="m-0 mt-[clamp(14px,2.6svh,24px)] flex list-none flex-col gap-2.5 border-t border-line p-0 pt-[clamp(14px,2.6svh,24px)]">
                {p.feats.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-[14px] leading-[1.4] text-ink-soft">
                    <Check className="mt-[2px] h-4 w-4 shrink-0 text-accent-deep" strokeWidth={2.6} />
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>

      <div className="mt-4 flex flex-col items-start justify-between gap-3 rounded-[20px] border border-line bg-white px-[clamp(18px,2.8svh,28px)] py-4 sm:flex-row sm:items-center">
        <p className="m-0 text-[15px] text-ink-soft">
          <span className="font-bold text-ink">Done for you.</span> The Noni team runs your whole program.
        </p>
        <button
          type="button"
          onClick={bookCall}
          className="group inline-flex cursor-pointer items-center gap-1.5 border-none bg-transparent p-0 text-[15px] font-bold text-accent-deep"
        >
          Book a call
          <ArrowRight className="h-4 w-4 transition-transform duration-150 group-hover:translate-x-0.5" />
        </button>
      </div>
    </div>
  );
}
