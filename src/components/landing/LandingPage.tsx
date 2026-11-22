"use client";

/* The public landing page. Every phone on it is a real Noni screen
   (public/landing, captured from the app). Kept short on purpose: hero,
   campaign managers, creators, pricing, founders, FAQ. */

import { motion } from "framer-motion";
import { ArrowRight, BadgeDollarSign, BarChart3, Send, Sparkles, Video } from "lucide-react";
import Link from "next/link";
import { useState, type ReactNode } from "react";

import { PricingFork } from "@/components/PricingFork";
import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";
import { WaitlistModal, type LeadModalKind } from "@/components/WaitlistModal";
import { FOUNDERS, FOUNDERS_NOTE } from "@/lib/founders";
import { SELF_SERVE_PLANS } from "@/lib/plans";
import { BOOKING_URL } from "@/lib/site-config";

import { HERO_NOTES, HeroNoteStyles, NoteCard } from "./HeroNotifications";
import { Phone } from "./Phone";

const FROM_PRICE = Math.min(...SELF_SERVE_PLANS.map((p) => p.annual));

const ease = [0.22, 0.61, 0.36, 1] as const;

function Reveal({ children, delay = 0, className = "" }: { children: ReactNode; delay?: number; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.55, ease, delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function Eyebrow({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <p className={`text-[12.5px] font-extrabold uppercase tracking-[0.14em] text-accent-deep ${className}`}>
      {children}
    </p>
  );
}

/* ── What each side gets: one real screen each, a few words under it ── */

type Shot = { title: string; line: string; src: string; alt: string };

const MANAGER_SHOTS: Shot[] = [
  {
    title: "Briefs, easier than ever",
    line: "Noni drafts them from your brand.",
    src: "/landing/briefs.png",
    alt: "The Briefs library in Noni",
  },
  {
    title: "Every number",
    line: "Views and sales for every creator.",
    src: "/landing/creator.png",
    alt: "A creator profile with views and sales",
  },
  {
    title: "Payouts handled",
    line: "Every creator paid from one budget.",
    src: "/landing/cearn.png",
    alt: "A creator's earnings and payouts",
  },
];

const CREATOR_SHOTS: Shot[] = [
  {
    title: "Make it",
    line: "The brief stays on screen as you film.",
    src: "/landing/coutline.png",
    alt: "A creator's brief with a Start recording button",
  },
  {
    title: "Post and track",
    line: "Every post and its views in one place.",
    src: "/landing/chome.png",
    alt: "A creator's home screen in Noni",
  },
  {
    title: "Get paid",
    line: "See what you earned, week by week.",
    src: "/landing/cearn.png",
    alt: "A creator's earnings screen",
  },
];

const CREATOR_STEPS = [
  { icon: Video, label: "Make" },
  { icon: Sparkles, label: "Edit with AI" },
  { icon: Send, label: "Post" },
  { icon: BarChart3, label: "Track" },
  { icon: BadgeDollarSign, label: "Get paid" },
];

function ShotRow({ shots, dark = false }: { shots: Shot[]; dark?: boolean }) {
  return (
    <div className="mt-12 grid gap-12 sm:grid-cols-3 sm:gap-6 lg:gap-10">
      {shots.map((s, i) => (
        <Reveal key={s.title} delay={i * 0.06} className="flex flex-col items-center text-center">
          <Phone src={s.src} alt={s.alt} sizes="(min-width: 1024px) 260px, (min-width: 640px) 28vw, 62vw" className="w-[62%] max-w-[260px] sm:w-[88%]" />
          <h3 className={`m-0 mt-7 text-[20px] font-extrabold ${dark ? "text-white" : "text-ink"}`}>{s.title}</h3>
          <p className={`m-0 mt-1.5 text-[15px] ${dark ? "text-white/65" : "text-ink-soft/75"}`}>{s.line}</p>
        </Reveal>
      ))}
    </div>
  );
}

const FAQ = [
  {
    q: "What is Noni?",
    a: "One app for running UGC campaigns: briefs, filming, posting, analytics and creator payouts.",
  },
  {
    q: "How are sales tracked?",
    a: "Each creator gets a promo code. Connect Stripe and every sale on that code is credited to them.",
  },
  {
    q: "How do creators get paid?",
    a: "You set a monthly creator budget and Noni pays creators from it.",
  },
  {
    q: "What does it cost?",
    a: `From $${FROM_PRICE} a month, billed annually. Unlimited campaigns and briefs.`,
  },
  {
    q: "Is there an Android app?",
    a: "Not yet. iPhone only, plus a web dashboard for companies.",
  },
];

export function LandingPage() {
  const [form, setForm] = useState<LeadModalKind | null>(null);

  /** Book a call: the scheduling link when one is configured, else the request form. */
  const bookCall = () => {
    if (BOOKING_URL) window.open(BOOKING_URL, "_blank", "noopener,noreferrer");
    else setForm("call");
  };

  return (
    <div className="min-h-screen overflow-x-clip bg-white">
      <Navbar />

      <main>
        {/* ── Hero ── */}
        <section className="relative overflow-hidden">
          <HeroNoteStyles />
          <div className="relative mx-auto max-w-[1240px] px-5 pb-20 pt-14 md:px-8 md:pt-20 lg:pb-28">
            {/* Notifications around the headline (wide screens) */}
            <div aria-hidden className="pointer-events-none absolute inset-0 hidden lg:block">
              <NoteCard note={HERO_NOTES[0]} delay={500} drift={0} className="absolute left-0 top-[262px]" />
              <NoteCard note={HERO_NOTES[1]} delay={750} drift={1500} className="absolute right-0 top-[250px]" />
              <NoteCard note={HERO_NOTES[2]} delay={1000} drift={800} className="absolute left-[56px] top-[392px]" />
              <NoteCard note={HERO_NOTES[3]} delay={1250} drift={2200} className="absolute right-[48px] top-[380px]" />
            </div>

            <div className="relative mx-auto max-w-[880px] text-center animate-om-rise">
              <h1 className="display text-balance text-[44px] font-extrabold leading-[1.02] tracking-[-0.03em] text-ink sm:text-[56px] lg:text-[62px]">
                Your entire <span className="text-accent-deep">UGC campaigns</span>
                <br className="hidden lg:block" /> all in one place
              </h1>
              <p className="mx-auto mt-6 max-w-[640px] text-balance text-[18px] leading-[1.5] text-muted md:text-[20px]">
                Run your creators on Noni, or let the Noni team run it all for you.
                <span className="mt-1 block font-semibold text-ink">Work better, work faster.</span>
              </p>
              <div className="mt-8 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
                <Link
                  href="/apply?as=company"
                  className="group inline-flex items-center justify-center gap-2 rounded-[14px] bg-ink px-8 py-4 text-[16px] font-bold text-white no-underline transition hover:bg-ink-soft"
                >
                  Get started
                  <ArrowRight className="h-4 w-4 transition-transform duration-150 group-hover:translate-x-1" />
                </Link>
                <Link
                  href="#pricing"
                  className="inline-flex items-center justify-center rounded-[14px] border border-line-strong bg-white px-8 py-4 text-[16px] font-bold text-ink no-underline transition hover:bg-soft"
                >
                  See pricing
                </Link>
              </div>
              <Link
                href="/apply?as=creator"
                className="group mt-6 inline-flex items-center gap-1.5 text-[14.5px] font-semibold text-muted no-underline transition hover:text-ink"
              >
                Creator? <span className="text-accent-deep">Get paid to post for brands</span>
                <ArrowRight className="h-3.5 w-3.5 text-accent-deep transition-transform duration-150 group-hover:translate-x-1" />
              </Link>
            </div>

            {/* Notifications under the buttons (small screens) */}
            <div aria-hidden className="mt-10 flex flex-col items-center gap-3 lg:hidden">
              <NoteCard note={HERO_NOTES[0]} delay={400} />
              <NoteCard note={HERO_NOTES[1]} delay={600} drift={1500} />
            </div>
          </div>
        </section>

        <div id="features" className="scroll-mt-20">
          {/* ── For Businesses ── */}
          <section id="for-businesses" className="scroll-mt-20 px-3 md:px-6">
            <div className="mx-auto max-w-[1180px] rounded-[36px] bg-ink px-6 py-14 md:px-12 lg:py-20">
              <Reveal className="text-center">
                <p className="text-[12.5px] font-extrabold uppercase tracking-[0.14em] text-accent">For campaign managers</p>
                <h2 className="display mt-3 text-[36px] font-bold leading-[1.04] text-white md:text-[50px]">
                  Run every campaign from one app
                </h2>
              </Reveal>
              <ShotRow shots={MANAGER_SHOTS} dark />
              <div className="mt-14 flex flex-col justify-center gap-3 sm:flex-row">
                <Link
                  href="/apply?as=company"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-accent px-7 py-4 text-[15.5px] font-bold text-white no-underline transition hover:bg-accent-deep"
                >
                  Get started
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="#pricing"
                  className="inline-flex items-center justify-center rounded-full border border-white/20 px-7 py-4 text-[15.5px] font-bold text-white transition hover:bg-white/10"
                >
                  See pricing
                </Link>
              </div>
            </div>
          </section>

          {/* ── For Creators ── */}
          <section id="for-creators" className="scroll-mt-20 px-3 pt-5 md:px-6">
            <div className="mx-auto max-w-[1180px] rounded-[36px] bg-accent-soft px-6 py-14 md:px-12 lg:py-20">
              <Reveal className="text-center">
                <Eyebrow>For creators</Eyebrow>
                <h2 className="display mt-3 text-[36px] font-bold leading-[1.04] text-ink md:text-[50px]">
                  Everything in one place
                </h2>
                <ol className="m-0 mx-auto mt-7 flex max-w-[760px] list-none flex-wrap items-center justify-center gap-2 p-0">
                  {CREATOR_STEPS.map(({ icon: Icon, label }) => (
                    <li
                      key={label}
                      className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2.5 text-[14.5px] font-extrabold text-ink"
                    >
                      <Icon className="h-4 w-4 text-accent-deep" />
                      {label}
                    </li>
                  ))}
                </ol>
              </Reveal>
              <ShotRow shots={CREATOR_SHOTS} />
              <div className="mt-14 flex justify-center">
                <Link
                  href="/apply?as=creator"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-ink px-7 py-4 text-[15.5px] font-bold text-white no-underline transition hover:bg-ink-soft sm:w-auto"
                >
                  Apply as a creator
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </section>
        </div>

        {/* ── Pricing ── */}
        <section id="pricing" className="scroll-mt-20 pt-16 lg:pt-24">
          <div className="font-ops mx-auto max-w-[1080px] px-4 md:px-8">
            <PricingFork />
          </div>
        </section>

        {/* ── Founders ── */}
        <section id="founders" className="scroll-mt-20">
          <div className="mx-auto max-w-[920px] px-5 pt-20 md:px-8 lg:pt-28">
            <Reveal className="rounded-[36px] border border-line bg-white px-6 py-10 md:px-12 md:py-14">
              <Eyebrow>From the founders</Eyebrow>
              <h2 className="display mt-3 text-[30px] font-bold leading-[1.06] text-ink md:text-[40px]">
                {FOUNDERS_NOTE.title}
              </h2>
              <div className="mt-5 flex flex-col gap-4 text-[16.5px] leading-[1.7] text-ink-soft">
                {FOUNDERS_NOTE.paragraphs.map((p) => (
                  <p key={p} className="m-0">
                    {p}
                  </p>
                ))}
              </div>
              {FOUNDERS.length > 0 ? (
                <ul className="m-0 mt-9 flex list-none flex-wrap gap-x-10 gap-y-6 p-0">
                  {FOUNDERS.map((f) => (
                    <li key={f.name} className="flex items-center gap-3.5">
                      {f.photo ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={f.photo} alt="" width={52} height={52} className="h-[52px] w-[52px] rounded-full object-cover" />
                      ) : (
                        <span className="inline-flex h-[52px] w-[52px] items-center justify-center rounded-full bg-accent-soft text-[18px] font-extrabold text-accent-deep">
                          {f.name.charAt(0)}
                        </span>
                      )}
                      <span>
                        <span className="block text-[15.5px] font-extrabold text-ink">{f.name}</span>
                        <span className="block text-[13.5px] font-semibold text-muted">{f.role}</span>
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="m-0 mt-8 text-[15px] font-extrabold text-ink">The Noni founders</p>
              )}
              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={bookCall}
                  className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-full border-none bg-ink px-6 py-3.5 text-[15px] font-bold text-white transition hover:bg-ink-soft"
                >
                  Talk to us
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </Reveal>
          </div>
        </section>

        {/* ── FAQ ── */}
        <section id="faq" className="scroll-mt-20">
          <div className="mx-auto max-w-[820px] px-5 pb-20 pt-20 md:px-8 lg:pb-28 lg:pt-28">
            <Reveal className="text-center">
              <Eyebrow>FAQ</Eyebrow>
              <h2 className="display mt-3 text-[34px] font-bold leading-[1.04] text-ink md:text-[44px]">
                Questions
              </h2>
            </Reveal>
            <div className="mt-9 flex flex-col gap-3">
              {FAQ.map((item) => (
                <details
                  key={item.q}
                  className="group rounded-[20px] border border-line bg-white px-5 py-4 md:px-6 md:py-5 [&_summary::-webkit-details-marker]:hidden"
                >
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-[16px] font-extrabold text-ink">
                    {item.q}
                    <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-soft text-[18px] font-semibold text-ink-soft transition-transform group-open:rotate-45">
                      +
                    </span>
                  </summary>
                  <p className="m-0 mt-3 text-[15px] leading-[1.65] text-muted">{item.a}</p>
                </details>
              ))}
            </div>

            <Reveal className="mt-14 rounded-[32px] bg-soft px-6 py-10 text-center md:py-12">
              <h2 className="display m-0 text-[28px] font-bold leading-[1.08] text-ink md:text-[36px]">
                Ready when you are
              </h2>
              <div className="mt-6 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
                <Link
                  href="/apply?as=company"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-ink px-7 py-4 text-[15.5px] font-bold text-white no-underline transition hover:bg-ink-soft"
                >
                  Get started
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/apply?as=creator"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-accent px-7 py-4 text-[15.5px] font-bold text-white no-underline transition hover:bg-accent-deep"
                >
                  Apply as a creator
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </Reveal>
          </div>
        </section>
      </main>

      <WaitlistModal open={form !== null} onClose={() => setForm(null)} kind={form ?? "creator"} source="landing" />

      <Footer />
    </div>
  );
}
