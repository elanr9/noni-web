"use client";

import Image from "next/image";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { PhoneMock } from "@/components/PhoneMock";

const WAITLIST_EMAIL = "founders@fieldvisionai.com";

type Audience = "creators" | "businesses";

const CREATOR_POINTS = [
  "Know exactly what to post today",
  "Record with a teleprompter or build photo carousels in app",
  "Noni edits, posts to your TikTok and Instagram, and pays you",
];

const BUSINESS_POINTS = [
  "Brand study, briefs, and weekly queues without a content ops team",
  "One tap Approve, then edit, post, and attribution run alone",
  "Review, Briefs, Library, Creators, and Analytics in one place",
];

const POSTS = [
  { src: "/brand/post-frame.png", alt: "Creator post about making two thousand dollars in one day" },
  { src: "/brand/post-jake2.png", alt: "Creator post about college coach outreach tips" },
  { src: "/brand/post-sebastian.png", alt: "Creator post about AI coach emails" },
  { src: "/brand/post-fabri.png", alt: "Creator slideshow about freshman athlete tips" },
  { src: "/brand/post-tona.png", alt: "Creator post example from Noni" },
];

const CONTENT = {
  creators: {
    eyebrow: "Open Home. Record. Get paid.",
    tagline: "The easiest way to do UGC and earn.",
    body: "Know what to post, record in app, and get paid.",
    phoneSrc: "/brand/creator-home-hero.png",
    phoneAlt: "Noni creator Home screen with today posts and earnings",
    sectionLabel: "For creators",
    sectionTitle: "Post what Noni tells you. Earn for it.",
    sectionBody:
      "Open Home, see exactly what to make, record or create in app, submit, and get paid.",
    points: CREATOR_POINTS,
  },
  businesses: {
    eyebrow: "Approve once. Everything else runs.",
    tagline: "The easiest way to run UGC campaigns.",
    body: "Scale on brand UGC without a content team.",
    phoneSrc: "/brand/admin-review-hero.png",
    phoneAlt: "Noni business Review screen for approving creator posts",
    sectionLabel: "For businesses",
    sectionTitle: "Run UGC without a content team.",
    sectionBody:
      "Set brand and cadence, invite creators, and approve. Briefs, posting, and attribution run through Noni.",
    points: BUSINESS_POINTS,
  },
} as const;

const panelMotion = {
  initial: { opacity: 0, y: 18, filter: "blur(4px)" },
  animate: { opacity: 1, y: 0, filter: "blur(0px)" },
  exit: { opacity: 0, y: -14, filter: "blur(4px)" },
  transition: { duration: 0.4, ease: [0.22, 0.61, 0.36, 1] as const },
};

export default function HomePage() {
  const [audience, setAudience] = useState<Audience>("creators");
  const content = CONTENT[audience];
  const waitlistHref = `mailto:${WAITLIST_EMAIL}?subject=${encodeURIComponent(
    audience === "creators" ? "Noni waitlist Creators" : "Noni waitlist Businesses",
  )}`;

  return (
    <div className="min-h-screen overflow-x-clip bg-white">
      <Navbar audience={audience} onAudienceChange={setAudience} />

      <main className="relative mx-auto grid max-w-6xl items-center gap-8 px-4 pb-12 pt-6 md:grid-cols-[1.05fr_0.95fr] md:gap-6 md:px-8 md:pb-20 md:pt-12">
        <div className="min-w-0 text-center md:text-left">
          {/* Static brand name for Google OAuth branding crawlers */}
          <h1 className="display mt-1 text-[48px] font-semibold leading-[0.95] text-ink md:text-[76px]">
            noni app
          </h1>

          <AnimatePresence mode="wait">
            <motion.div
              key={audience}
              {...panelMotion}
              className="mt-2"
            >
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-accent-deep md:text-[13px] md:tracking-[0.16em]">
                {content.eyebrow}
              </p>
              <p className="display mx-auto mt-3 max-w-[18ch] text-[26px] font-semibold leading-[1.15] tracking-[-0.03em] text-ink-soft sm:max-w-none md:mx-0 md:text-[42px]">
                {content.tagline}
              </p>
              <p className="mx-auto mt-4 max-w-lg text-[15px] leading-relaxed text-muted md:mx-0 md:text-[18px]">
                {content.body}
              </p>
            </motion.div>
          </AnimatePresence>

          <div className="mt-7 flex flex-col items-center gap-3 md:mt-8 md:items-start">
            <a
              href={waitlistHref}
              className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-accent px-6 py-3.5 text-[15px] font-bold text-white transition hover:bg-accent-deep sm:w-auto"
            >
              Join waitlist
              <ArrowRight className="h-4 w-4" />
            </a>
            <div
              role="group"
              aria-label="Audience"
              className="inline-flex rounded-full border border-line bg-white p-1"
            >
              <button
                type="button"
                onClick={() => setAudience("creators")}
                className={`rounded-full px-4 py-2 text-[13px] font-semibold transition ${
                  audience === "creators"
                    ? "bg-ink text-white"
                    : "text-ink-soft hover:text-ink"
                }`}
              >
                For UGC Creators
              </button>
              <button
                type="button"
                onClick={() => setAudience("businesses")}
                className={`rounded-full px-4 py-2 text-[13px] font-semibold transition ${
                  audience === "businesses"
                    ? "bg-ink text-white"
                    : "text-ink-soft hover:text-ink"
                }`}
              >
                For Businesses
              </button>
            </div>
          </div>
        </div>

        <div className="relative flex min-h-[420px] items-center justify-center md:min-h-[560px] md:justify-end">
          <AnimatePresence mode="wait">
            <motion.div
              key={audience}
              initial={{ opacity: 0, scale: 0.96, x: audience === "businesses" ? 28 : -28 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.96, x: audience === "businesses" ? -28 : 28 }}
              transition={{ duration: 0.45, ease: [0.22, 0.61, 0.36, 1] }}
              className="w-full"
            >
              <PhoneMock
                src={content.phoneSrc}
                alt={content.phoneAlt}
                className="w-[min(68vw,248px)] md:w-[340px]"
              />
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      <section className="border-t border-line bg-white px-4 py-14 md:px-8 md:py-20">
        <div className="mx-auto max-w-6xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={audience}
              {...panelMotion}
              className="grid items-start gap-8 md:grid-cols-2 md:gap-12"
            >
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent-deep">
                  {content.sectionLabel}
                </p>
                <h2 className="display mt-3 text-[32px] font-semibold leading-[1.15] text-ink md:text-5xl">
                  {content.sectionTitle}
                </h2>
                <p className="mt-4 text-[15px] leading-relaxed text-muted md:text-[16px]">
                  {content.sectionBody}
                </p>
                <ul className="mt-6 space-y-2.5 md:mt-8 md:space-y-3">
                  {content.points.map((line) => (
                    <li
                      key={line}
                      className="rounded-2xl border border-line bg-white px-4 py-3.5 text-[14px] font-medium text-ink md:px-5 md:py-4 md:text-[15px]"
                    >
                      {line}
                    </li>
                  ))}
                </ul>
              </div>

              {audience === "creators" ? (
                <div className="scrollbar-none -mx-4 flex gap-3 overflow-x-auto px-4 pb-1 md:mx-0 md:grid md:grid-cols-2 md:gap-4 md:overflow-visible md:px-0">
                  {POSTS.slice(0, 4).map((post) => (
                    <div
                      key={post.src}
                      className="relative aspect-[3/4] w-[148px] shrink-0 overflow-hidden rounded-[18px] bg-soft sm:w-[170px] md:w-auto md:rounded-[22px]"
                    >
                      <Image
                        src={post.src}
                        alt={post.alt}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 148px, 20vw"
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex justify-center md:justify-end">
                  <PhoneMock
                    src="/brand/admin-review-hero.png"
                    alt="Noni business admin review"
                    priority={false}
                    className="w-[min(68vw,248px)] md:w-[300px]"
                  />
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      <section className="bg-ink px-4 py-14 text-white md:px-8 md:py-20">
        <div className="mx-auto flex max-w-6xl flex-col items-stretch gap-6 md:flex-row md:items-end md:justify-between">
          <AnimatePresence mode="wait">
            <motion.div key={audience} {...panelMotion} className="max-w-xl">
              <h2 className="display text-[32px] font-semibold leading-[1.15] md:text-5xl">
                {audience === "creators"
                  ? "Join the creator waitlist."
                  : "Join the business waitlist."}
              </h2>
              <p className="mt-4 text-[15px] leading-relaxed text-white/65 md:text-[16px]">
                {audience === "creators"
                  ? "Get early access to Noni and start earning on queued posts."
                  : "Get early access to Noni and run UGC without a content team."}
              </p>
            </motion.div>
          </AnimatePresence>
          <a
            href={waitlistHref}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-accent px-6 py-3.5 text-[15px] font-bold text-white"
          >
            Join waitlist
            <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </section>

      <Footer />
    </div>
  );
}
