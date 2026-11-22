"use client";

/* The public landing page. Every phone on it is a real Noni screen
   (public/landing, captured from the app). Kept short on purpose: hero,
   campaign managers, creators, pricing, founders, FAQ. */

import { motion } from "framer-motion";
import { ArrowRight, ChevronDown } from "lucide-react";
import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";

import { PricingFork } from "@/components/PricingFork";
import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";
import { WaitlistModal, type LeadModalKind } from "@/components/WaitlistModal";
import { FOUNDERS, FOUNDERS_NOTE } from "@/lib/founders";
import { SELF_SERVE_PLANS } from "@/lib/plans";
import { BOOKING_URL } from "@/lib/site-config";

import { HeroNoteStyles, HeroPingDock, HeroPings } from "./HeroNotifications";
import { HowItWorks } from "./HowItWorks";
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

type Side = "companies" | "creators";

const SIDES: { key: Side; label: string }[] = [
  { key: "companies", label: "For companies" },
  { key: "creators", label: "For creators" },
];


/* One row of real screens, sized from the screen height so every phone
   shows whole. Wide: three side by side. Narrow: swipe one at a time with
   the next one peeking in. */
function ShotRow({ shots, dark = false }: { shots: Shot[]; dark?: boolean }) {
  return (
    <div className="landing-swipe -mx-5 flex min-h-0 flex-1 snap-x snap-mandatory gap-4 overflow-x-auto px-[9%] sm:mx-0 sm:gap-6 sm:overflow-visible sm:px-0 lg:gap-10">
      {shots.map((s, i) => (
        <Reveal
          key={s.title}
          delay={i * 0.06}
          className="flex min-h-0 shrink-0 basis-[82%] snap-center flex-col items-center text-center sm:basis-0 sm:flex-1"
        >
          <div className="flex min-h-0 w-full flex-1 justify-center">
            <Phone fitHeight src={s.src} alt={s.alt} sizes="(min-width: 640px) 30vw, 70vw" />
          </div>
          <h3 className={`m-0 mt-[clamp(10px,2svh,22px)] text-[clamp(16px,2.3svh,20px)] font-extrabold ${dark ? "text-white" : "text-ink"}`}>{s.title}</h3>
          <p className={`m-0 mt-1 text-[clamp(13px,1.8svh,15px)] ${dark ? "text-white/65" : "text-ink-soft/75"}`}>{s.line}</p>
        </Reveal>
      ))}
    </div>
  );
}

/** Each section is exactly one screen under the navbar. The page scrolls freely, no snapping. */
function LandingScreenStyles() {
  return (
    <style>{`
      .landing-root { --nav: 56px; }
      @media (min-width: 768px) { .landing-root { --nav: 72px; } }
      html:has(.landing-root) { scroll-padding-top: 56px; }
      @media (min-width: 768px) { html:has(.landing-root) { scroll-padding-top: 72px; } }
      .landing-screen { min-height: calc(100svh - var(--nav)); }
      .landing-screen-fixed { height: calc(100svh - var(--nav)); min-height: 430px; }
      /* Short laptop windows: shrink the text sections a little so each still fits. */
      @media (min-width: 640px) and (max-height: 780px) { .landing-fit { zoom: 0.86; } }
      @media (min-width: 640px) and (max-height: 640px) { .landing-fit { zoom: 0.7; } }
      /* Plans: three across from tablet up, one at a time to swipe on phones. */
      @media (min-width: 640px) { .landing-pricing .plan-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); } }
      @media (max-width: 639px) {
        .landing-pricing .plan-grid { display: flex; overflow-x: auto; scroll-snap-type: x mandatory; scrollbar-width: none; margin-inline: -16px; padding: 4px 16px 8px; }
        .landing-pricing .plan-grid::-webkit-scrollbar { display: none; }
        .landing-pricing .plan-grid > * { flex: 0 0 84%; scroll-snap-align: center; }
        .landing-pricing .plan-title, .landing-pricing .plan-footnote { display: none; }
      }
      .landing-swipe { scrollbar-width: none; }
      .landing-swipe::-webkit-scrollbar { display: none; }
    `}</style>
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
  const [side, setSide] = useState<Side>("companies");

  /* The Creators link (navbar, footer, or a shared /#for-creators) opens the creators tab. */
  useEffect(() => {
    const pick = (hash: string) => {
      if (hash === "#for-creators") setSide("creators");
      else if (hash === "#for-businesses") setSide("companies");
    };
    const onClick = (e: MouseEvent) => {
      const link = (e.target as Element | null)?.closest?.("a[href]");
      const href = link?.getAttribute("href") ?? "";
      const at = href.indexOf("#");
      if (at >= 0 && (href.startsWith("#") || href.startsWith("/#"))) pick(href.slice(at));
    };
    pick(window.location.hash);
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  /** Book a call: the scheduling link when one is configured, else the request form. */
  const bookCall = () => {
    if (BOOKING_URL) window.open(BOOKING_URL, "_blank", "noopener,noreferrer");
    else setForm("call");
  };

  return (
    <div className="landing-root min-h-screen overflow-x-clip bg-white">
      <LandingScreenStyles />
      <Navbar />

      <main>
        {/* ── Hero ── */}
        <section className="landing-screen relative flex flex-col justify-center overflow-hidden">
          <HeroNoteStyles />
          <div className="relative mx-auto w-full max-w-[1240px] px-5 py-8 md:px-8">
            <div className="relative mx-auto max-w-[880px] text-center animate-om-rise">
              <h1 data-hero-text className="display text-balance text-[clamp(38px,6.6svh,62px)] font-extrabold leading-[1.02] tracking-[-0.03em] text-ink">
                <span className="text-accent-deep">UGC Campaigns</span> made easy
              </h1>
              <p data-hero-text className="mx-auto mt-[clamp(14px,2.6svh,24px)] max-w-[640px] text-balance text-[clamp(16px,2.2svh,20px)] leading-[1.5] text-muted">
                Everything you need to run UGC Campaigns, all in one place.
              </p>
              <div data-hero-block className="mx-auto mt-[clamp(18px,3.4svh,32px)] flex w-fit flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
                <Link
                  href="/apply?as=company"
                  className="group inline-flex items-center justify-center gap-2 rounded-[14px] bg-ink px-8 py-4 text-[16px] font-bold text-white no-underline transition hover:bg-ink-soft active:scale-[0.97]"
                >
                  Get started
                  <ArrowRight className="h-4 w-4 transition-transform duration-150 group-hover:translate-x-1" />
                </Link>
                <Link
                  href="#how"
                  className="group inline-flex items-center justify-center gap-2 rounded-[14px] border border-line-strong bg-white px-8 py-4 text-[16px] font-bold text-ink no-underline transition hover:bg-soft active:scale-[0.97]"
                >
                  Learn more
                  <ChevronDown className="h-4 w-4 transition-transform duration-150 group-hover:translate-y-0.5" />
                </Link>
              </div>
              <Link
                href="/apply?as=creator"
                data-hero-block
                className="group mt-[clamp(14px,2.6svh,24px)] inline-flex items-center gap-1.5 text-[14.5px] font-semibold text-muted no-underline transition hover:text-ink"
              >
                Creator? <span className="text-accent-deep">Get paid to post for brands</span>
                <ArrowRight className="h-3.5 w-3.5 text-accent-deep transition-transform duration-150 group-hover:translate-x-1" />
              </Link>
            </div>

            {/* Small screens: the same notifications one at a time under the buttons */}
            <div className="mt-[clamp(20px,4svh,40px)] lg:hidden">
              <HeroPingDock />
            </div>
          </div>
          <HeroPings />
        </section>

        {/* ── How it works: brief to payout, one screen ── */}
        <HowItWorks />

        {/* ── What Noni does, one screen: a tab for each side ── */}
        <section id="features" className="landing-screen-fixed relative px-5 md:px-8">
          <span id="for-businesses" className="absolute top-0" aria-hidden />
          <span id="for-creators" className="absolute top-0" aria-hidden />
          <div className="mx-auto flex h-full max-w-[1180px] flex-col py-[clamp(16px,3.4svh,40px)]">
            <div role="tablist" aria-label="Who Noni is for" className="mx-auto inline-flex rounded-full border border-line bg-white p-1.5 shadow-[0_1px_2px_rgba(15,23,32,0.04)]">
              {SIDES.map(({ key, label }) => (
                <button
                  key={key}
                  type="button"
                  role="tab"
                  aria-selected={side === key}
                  onClick={() => setSide(key)}
                  className={`relative cursor-pointer whitespace-nowrap rounded-full border-none bg-transparent px-5 py-2.5 text-[15px] font-bold transition-colors duration-150 active:scale-[0.96] md:px-7 md:text-[16px] ${
                    side === key ? "text-white" : "text-slate-500 hover:text-ink"
                  }`}
                >
                  {side === key ? (
                    <motion.span
                      layoutId="landing-side"
                      className="absolute inset-0 rounded-full bg-accent-deep"
                      transition={{ type: "spring", stiffness: 500, damping: 36 }}
                    />
                  ) : null}
                  <span className="relative">{label}</span>
                </button>
              ))}
            </div>

            <motion.div
              key={side}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, ease }}
              className="mt-[clamp(16px,3.4svh,36px)] flex min-h-0 flex-1 flex-col"
            >
              <ShotRow shots={side === "companies" ? MANAGER_SHOTS : CREATOR_SHOTS} />
            </motion.div>

            <div className="mt-[clamp(16px,3svh,32px)] flex justify-center gap-3">
              {side === "companies" ? (
                <>
                  <Link
                    href="/apply?as=company"
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-ink px-6 py-3 text-[15px] font-bold text-white no-underline transition hover:bg-ink-soft active:scale-[0.97] md:px-7 md:py-3.5"
                  >
                    Get started
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link
                    href="#pricing"
                    className="inline-flex items-center justify-center rounded-full border border-line-strong bg-white px-6 py-3 text-[15px] font-bold text-ink no-underline transition hover:bg-soft active:scale-[0.97] md:px-7 md:py-3.5"
                  >
                    See pricing
                  </Link>
                </>
              ) : (
                <Link
                  href="/apply?as=creator"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-accent px-6 py-3 text-[15px] font-bold text-white no-underline transition hover:bg-accent-deep active:scale-[0.97] md:px-7 md:py-3.5"
                >
                  Apply as a creator
                  <ArrowRight className="h-4 w-4" />
                </Link>
              )}
            </div>
          </div>
        </section>

        {/* ── Pricing ── */}
        <section id="pricing" className="landing-screen flex flex-col justify-center py-6">
          <div className="landing-fit landing-pricing font-ops mx-auto w-full max-w-[1080px] px-4 md:px-8">
            <PricingFork tight />
          </div>
        </section>

        {/* ── Founders ── */}
        <section id="founders" className="landing-screen flex flex-col justify-center py-6">
          <div className="landing-fit mx-auto w-full max-w-[920px] px-5 md:px-8">
            <Reveal className="px-1 md:px-4">
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
                  className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-full border-none bg-ink px-6 py-3.5 text-[15px] font-bold text-white transition hover:bg-ink-soft active:scale-[0.97]"
                >
                  Talk to us
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </Reveal>
          </div>
        </section>

        {/* ── FAQ and the last call to action, one screen ── */}
        <section id="faq" className="landing-screen flex flex-col justify-center py-6">
          <div className="landing-fit mx-auto w-full max-w-[820px] px-5 md:px-8">
            <Reveal className="text-center">
              <Eyebrow>FAQ</Eyebrow>
              <h2 className="display mt-2 text-[clamp(28px,4.6svh,44px)] font-bold leading-[1.04] text-ink">
                Questions
              </h2>
            </Reveal>
            <div className="mt-[clamp(14px,3svh,32px)] flex flex-col gap-2.5">
              {FAQ.map((item) => (
                <details
                  key={item.q}
                  className="group rounded-[18px] border border-line bg-white px-5 py-3.5 md:px-6 [&_summary::-webkit-details-marker]:hidden"
                >
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-[15.5px] font-extrabold text-ink">
                    {item.q}
                    <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-soft text-[18px] font-semibold text-ink-soft transition-transform group-open:rotate-45">
                      +
                    </span>
                  </summary>
                  <p className="m-0 mt-2.5 text-[15px] leading-[1.6] text-muted">{item.a}</p>
                </details>
              ))}
            </div>

            <Reveal className="mt-[clamp(20px,4svh,44px)] text-center">
              <h2 className="display m-0 text-[clamp(24px,3.6svh,34px)] font-bold leading-[1.08] text-ink">
                Ready when you are
              </h2>
              <div className="mt-[clamp(12px,2.4svh,22px)] flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
                <Link
                  href="/apply?as=company"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-ink px-7 py-3.5 text-[15px] font-bold text-white no-underline transition hover:bg-ink-soft active:scale-[0.97]"
                >
                  Get started
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/apply?as=creator"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-accent px-7 py-3.5 text-[15px] font-bold text-white no-underline transition hover:bg-accent-deep active:scale-[0.97]"
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
