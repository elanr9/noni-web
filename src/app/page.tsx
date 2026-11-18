"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, BarChart3, ClipboardCheck, Users } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { HeroPhone } from "@/components/HeroPhone";
import { WaitlistModal, type LeadModalKind } from "@/components/WaitlistModal";
import { SELF_SERVE_PLANS } from "@/lib/plans";
import { IOS_APP_AVAILABILITY } from "@/lib/site-config";

const FROM_PRICE = Math.min(...SELF_SERVE_PLANS.map((p) => p.annual));

const BUSINESS_POINTS = [
  {
    icon: ClipboardCheck,
    title: "Briefs creators can film",
    body: "Noni learns your brand from your website and writes weekly briefs your creators shoot in the app.",
  },
  {
    icon: Users,
    title: "Approve before anything posts",
    body: "Review every video and slideshow, send notes back, and keep each creator on pace.",
  },
  {
    icon: BarChart3,
    title: "Know what works",
    body: "Views and engagement for every post, plus payouts from one creator budget.",
  },
];

export default function HomePage() {
  const [leadForm, setLeadForm] = useState<LeadModalKind | null>(null);

  return (
    <div className="min-h-screen overflow-x-clip bg-white">
      <Navbar />

      <main className="overflow-hidden">
        <div className="mx-auto flex max-w-[1100px] flex-col items-center px-4 py-12 text-center lg:flex-row lg:items-center lg:justify-between lg:gap-12 lg:px-10 lg:py-16 lg:text-left">
          <div className="flex w-full max-w-xl flex-col items-center lg:items-start">
            <h1 className="display text-[40px] font-semibold leading-[0.95] text-ink md:text-[56px]">
              noni app
            </h1>
            <p className="display mt-3 max-w-[22ch] text-[22px] font-semibold leading-[1.15] tracking-[-0.03em] text-ink-soft md:max-w-none md:text-[32px]">
              Automated UGC Content Submissions
            </p>
            <p className="mt-2.5 text-[14px] font-medium text-muted md:text-[15px]">
              {IOS_APP_AVAILABILITY === "app_store"
                ? "Available on the App Store"
                : "Now in private beta on iPhone"}
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3 lg:justify-start">
              <button
                type="button"
                onClick={() => setLeadForm("waitlist")}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-accent px-5 py-3 text-[14px] font-bold text-white transition hover:bg-accent-deep"
              >
                Join waitlist
                <ArrowRight className="h-4 w-4" />
              </button>
              <Link
                href="#for-businesses"
                className="inline-flex items-center justify-center rounded-full border border-line px-5 py-3 text-[14px] font-bold text-ink transition hover:bg-soft"
              >
                For businesses
              </Link>
            </div>
          </div>

          <div className="mt-10 shrink-0 lg:mt-0 lg:mb-[-48px]">
            <HeroPhone />
          </div>
        </div>
      </main>

      <section id="for-businesses" className="scroll-mt-20 border-t border-line bg-soft">
        <div className="mx-auto max-w-[1100px] px-4 py-14 lg:px-10 lg:py-20">
          <p className="text-center text-[13px] font-bold uppercase tracking-[0.12em] text-accent-deep lg:text-left">
            For businesses
          </p>
          <h2 className="display mt-2 text-center text-[30px] font-semibold leading-[1.05] text-ink md:text-[40px] lg:text-left">
            Run your UGC creator program on Noni
          </h2>
          <p className="mx-auto mt-3 max-w-[56ch] text-center text-[15px] text-muted lg:mx-0 lg:text-left">
            Plans start at ${FROM_PRICE} a month billed annually. Every plan includes
            campaigns, briefs, approvals, analytics and creator payouts.
          </p>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {BUSINESS_POINTS.map(({ icon: Icon, title, body }) => (
              <div key={title} className="rounded-3xl border border-line bg-white p-6">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-accent-soft">
                  <Icon className="h-5 w-5 text-accent-deep" />
                </span>
                <h3 className="mt-4 text-[16px] font-bold text-ink">{title}</h3>
                <p className="mt-1.5 text-[14px] leading-relaxed text-muted">{body}</p>
              </div>
            ))}
          </div>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3 lg:justify-start">
            <button
              type="button"
              onClick={() => setLeadForm("business")}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-ink px-5 py-3 text-[14px] font-bold text-white transition hover:bg-ink-soft"
            >
              Get started
              <ArrowRight className="h-4 w-4" />
            </button>
            <Link
              href="/pricing"
              className="inline-flex items-center justify-center rounded-full border border-line bg-white px-5 py-3 text-[14px] font-bold text-ink transition hover:bg-soft"
            >
              See pricing
            </Link>
          </div>
        </div>
      </section>

      <WaitlistModal
        open={leadForm !== null}
        onClose={() => setLeadForm(null)}
        kind={leadForm ?? "waitlist"}
        source="landing"
      />

      <Footer />
    </div>
  );
}
