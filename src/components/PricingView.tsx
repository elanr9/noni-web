"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";

import { PricingFork, SIGN_UP } from "@/components/PricingFork";
import { PLAN_CREATOR_CAP } from "@/lib/plans";

/* Public /pricing (design_handoff_pricing_plans). The same question the
   product asks right after sign up comes first: run it yourself, or have Noni
   do it for you. Do it myself shows the self serve plans (one catalog in
   @/lib/plans); do it for me is a call. Either way the next step is signing
   up: a few quick questions, then the same choice inside the product. */

const STEPS = [
  {
    title: "Sign up",
    body: "Sign in with Google and answer a few quick questions. Noni reads your website while you do.",
  },
  {
    title: "Pick who runs it",
    body: "Run your creators yourself on Noni, or have our team run the whole campaign for you.",
  },
  {
    title: "Go live",
    body: `Do it yourself: pick a plan and invite up to ${PLAN_CREATOR_CAP.starter} or ${PLAN_CREATOR_CAP.premium} creators per campaign. Done for you: book a call and we take it from there.`,
  },
];

const FAQ = [
  {
    q: "What does done for you include?",
    a: "Everything. We find the creators, write the briefs, approve every post, pay the creators and send you the results. You do not touch the software unless you want to.",
  },
  {
    q: "What counts toward the creator cap?",
    a: "Every creator on your team, including pending invites. Each campaign goes to all of your approved creators, so the cap is how many creators run on a campaign.",
  },
  {
    q: "What happens to the creator budget?",
    a: "Separate from your plan. We set it with you on a call and invoice it. Noni pays your creators from it.",
  },
  {
    q: "Can I switch or cancel?",
    a: "Any time from Billing. Switching is prorated by Stripe. Downgrades wait until no running campaign has more creators than the smaller plan allows.",
  },
  {
    q: "Do I need to sell on Stripe?",
    a: "No. Connecting Stripe is optional and only adds sales numbers to Analytics. Your plan and creator budget are paid by card through Stripe Checkout either way.",
  },
];

export function PricingView() {
  return (
    <main className="font-ops">
      <PricingFork />

      <section className="mx-auto max-w-[1000px] px-4 pb-6 pt-6 md:px-8">
        <h2 className="m-0 text-center text-[26px] font-bold tracking-[-0.6px] text-ink">
          How getting started works
        </h2>
        <ol className="m-0 mt-7 grid list-none gap-4 p-0 md:grid-cols-3">
          {STEPS.map((step, i) => (
            <li
              key={step.title}
              className="rounded-[20px] border border-line bg-white px-6 py-6 shadow-[0_1px_3px_rgba(15,23,32,0.04)]"
            >
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-pill bg-blue-100 text-[13px] font-bold text-blue-700">
                {i + 1}
              </span>
              <h3 className="m-0 mt-4 text-[16px] font-bold text-ink">{step.title}</h3>
              <p className="m-0 mt-1.5 text-[13.5px] font-medium leading-[1.6] text-slate-500">
                {step.body}
              </p>
            </li>
          ))}
        </ol>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            href={SIGN_UP}
            className="inline-flex items-center gap-2 whitespace-nowrap border-none bg-blue-500 px-6 py-3 text-[14.5px] font-bold text-white no-underline shadow-accent rounded-pill transition-colors hover:bg-blue-400"
          >
            Get started <ArrowRight size={16} />
          </Link>
          <Link
            href="/login"
            className="inline-flex whitespace-nowrap border border-line-strong bg-white px-6 py-3 text-[14.5px] font-bold text-ink no-underline rounded-pill transition-colors hover:bg-fill-quiet"
          >
            Sign in
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-[760px] px-4 pb-20 pt-12 md:px-8">
        <h2 className="m-0 text-center text-[26px] font-bold tracking-[-0.6px] text-ink">
          Questions
        </h2>
        <div className="mt-7 flex flex-col gap-3">
          {FAQ.map((item) => (
            <details
              key={item.q}
              className="group rounded-[16px] border border-line bg-white px-5 py-4 [&_summary::-webkit-details-marker]:hidden"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-[14.5px] font-bold text-ink">
                {item.q}
                <span className="text-[18px] font-semibold text-slate-400 transition-transform group-open:rotate-45">
                  +
                </span>
              </summary>
              <p className="m-0 mt-2.5 text-[13.5px] font-medium leading-[1.6] text-slate-500">
                {item.a}
              </p>
            </details>
          ))}
        </div>
      </section>

    </main>
  );
}
