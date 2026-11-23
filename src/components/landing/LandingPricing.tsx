"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";

import { MANAGED_PLAN, PLAN_CREATOR_CAP, SELF_SERVE_PLANS } from "@/lib/plans";
import { BOOKING_URL } from "@/lib/site-config";

/* Pricing on the landing page, kept to one row: the four plans side by side
   (two to a row on phones), each with its price, one line and one button.
   No toggles: the yearly price leads and the monthly price sits under it.
   What every plan includes is said once, under the title. */

const SIGN_UP = "/apply";

type Card = {
  name: string;
  price: string;
  per?: string;
  note: string;
  line: string;
  cta: string;
  href?: string;
  call?: boolean;
  popular?: boolean;
};

const [starter, premium] = SELF_SERVE_PLANS;

const CARDS: Card[] = [
  {
    name: "Starter",
    price: `$${starter.annual}`,
    per: "/mo",
    note: `yearly, or $${starter.monthly} monthly`,
    line: `Up to ${PLAN_CREATOR_CAP.starter} creators per campaign`,
    cta: "Get started",
    href: SIGN_UP,
  },
  {
    name: "Premium",
    price: `$${premium.annual}`,
    per: "/mo",
    note: `yearly, or $${premium.monthly} monthly`,
    line: `Up to ${PLAN_CREATOR_CAP.premium} creators per campaign`,
    cta: "Get started",
    href: SIGN_UP,
    popular: true,
  },
  {
    name: "Done for you",
    price: `$${MANAGED_PLAN.annual}`,
    per: "/mo",
    note: `yearly, or $${MANAGED_PLAN.monthly} monthly`,
    line: "The Noni team runs your whole program",
    cta: "Book a call",
    call: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    note: "built around your volume",
    line: "Unlimited creators and your own account manager",
    cta: "Let's talk",
    call: true,
  },
];

function bookCall() {
  if (BOOKING_URL) window.open(BOOKING_URL, "_blank", "noopener,noreferrer");
}

export function LandingPricing() {
  return (
    <div className="mx-auto w-full max-w-[1120px]">
      <div className="text-center">
        <h2 className="display m-0 text-[clamp(30px,5svh,46px)] font-bold leading-[1.05] tracking-[-0.02em] text-ink">Pricing</h2>
        <p className="m-0 mx-auto mt-2 max-w-[560px] text-balance text-[14px] font-medium text-muted lg:mt-3 lg:text-[clamp(14.5px,2svh,17px)]">
          Every plan: unlimited campaigns, AI briefs and edits, auto posting, tracking and payouts.
        </p>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-2.5 lg:mt-[clamp(20px,4svh,44px)] lg:grid-cols-4 lg:gap-4">
        {CARDS.map((c) => {
          const button = `group mt-auto inline-flex w-full items-center justify-center gap-1.5 rounded-full py-2.5 text-[14px] lg:py-3 lg:text-[14.5px] font-bold no-underline transition active:scale-[0.97] ${
            c.popular ? "bg-accent-deep text-white hover:bg-accent" : "border border-line-strong bg-white text-ink hover:bg-soft"
          }`;
          return (
            <div
              key={c.name}
              className={`relative flex flex-col rounded-[22px] bg-white p-3.5 lg:p-[clamp(16px,2.6svh,26px)] ${
                c.popular ? "shadow-[0_0_0_2px_var(--accent-deep),0_18px_40px_-20px_rgba(49,164,244,0.45)]" : "shadow-[0_0_0_1px_var(--line)]"
              }`}
            >
              {c.popular ? (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-accent-deep px-3 py-1 text-[11.5px] font-bold text-white">
                  Most popular
                </span>
              ) : null}
              <p className="m-0 text-[15px] font-bold text-ink">{c.name}</p>
              <p className="m-0 mt-[clamp(8px,1.6svh,16px)] flex items-baseline gap-1">
                <span className="display text-[26px] font-bold lg:text-[clamp(28px,4.6svh,40px)] leading-none tracking-[-0.02em] text-ink">{c.price}</span>
                {c.per ? <span className="text-[15px] font-semibold text-muted">{c.per}</span> : null}
              </p>
              <p className="m-0 mt-1.5 text-[12.5px] font-medium text-slate-400">{c.note}</p>
              <p className="m-0 mb-3.5 mt-2.5 text-[13.5px] font-semibold lg:mb-[clamp(14px,2.6svh,24px)] lg:mt-[clamp(10px,2svh,18px)] lg:text-[14.5px] leading-[1.4] text-ink-soft">
                {c.line}
              </p>
              {c.call ? (
                <button type="button" onClick={bookCall} className={`cursor-pointer ${button}`}>
                  {c.cta}
                  <ArrowRight className="h-4 w-4 transition-transform duration-150 group-hover:translate-x-0.5" />
                </button>
              ) : (
                <Link href={c.href ?? SIGN_UP} className={button}>
                  {c.cta}
                  <ArrowRight className="h-4 w-4 transition-transform duration-150 group-hover:translate-x-0.5" />
                </Link>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
