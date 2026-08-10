"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { DualPhoneMock, PhoneMock } from "@/components/PhoneMock";

const APP_STORE =
  process.env.NEXT_PUBLIC_APP_STORE_URL ?? "https://apps.apple.com";

const fade = {
  initial: { opacity: 0, y: 18 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-60px" },
};

const STEPS = [
  {
    n: "01",
    title: "Find what works",
    body: "Noni scrapes trends and turns winners into concrete briefs with hooks, scripts, captions, and slide copy.",
  },
  {
    n: "02",
    title: "Fill creator queues",
    body: "Each creator gets a ready weekly queue of Reels and slideshows. No blank page, no strategy work.",
  },
  {
    n: "03",
    title: "Record, then approve",
    body: "Creators record or build in app. Businesses approve once or request changes. Humans only show up here.",
  },
  {
    n: "04",
    title: "Everything after runs",
    body: "Edit, post to TikTok and Instagram, track views and revenue, and pay creators automatically.",
  },
];

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

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <div className="hero-atmosphere relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 grid-fade opacity-60" />
        <Navbar />

        <main className="relative mx-auto grid max-w-6xl items-center gap-10 px-5 pb-16 pt-8 md:grid-cols-[1.05fr_0.95fr] md:gap-6 md:px-8 md:pb-24 md:pt-12">
          <div>
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-[13px] font-semibold uppercase tracking-[0.16em] text-accent-deep"
            >
              Creators record. Businesses approve. Everything else runs.
            </motion.p>

            {/* Static hero copy so Google OAuth branding crawlers see name + purpose without opacity:0 */}
            <h1 className="display mt-4 max-w-xl text-[52px] font-semibold leading-[0.95] text-ink md:text-[76px]">
              noni
            </h1>
            <p className="display mt-3 max-w-xl text-[30px] font-semibold tracking-[-0.03em] text-ink-soft md:text-[42px]">
              The easiest way to run UGC campaigns.
            </p>
            <p className="mt-5 max-w-lg text-[17px] leading-relaxed text-muted md:text-[18px]">
              The purpose of the Noni app is to automate UGC end to end. Noni finds what works,
              turns it into concrete posts, fills creator queues, and after one business Approve
              it edits, posts to TikTok and Instagram, tracks performance, and pays creators.
              Creators get paid to post what Noni tells them. Businesses scale on brand UGC
              without a content team.
            </p>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.15 }}
              className="mt-8 flex flex-wrap items-center gap-3"
            >
              <a
                href={APP_STORE}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3.5 text-[15px] font-bold text-white shadow-[0_16px_40px_rgba(79,186,242,0.35)] transition hover:bg-accent-deep"
              >
                Download for creators
                <ArrowRight className="h-4 w-4" />
              </a>
              <Link
                href="/login?next=/admin"
                className="inline-flex items-center gap-2 rounded-full border border-line bg-white px-6 py-3.5 text-[15px] font-bold text-ink transition hover:border-ink/20"
              >
                Business login
              </Link>
            </motion.div>
          </div>

          <div className="relative flex justify-center md:justify-end">
            <PhoneMock />
          </div>
        </main>
      </div>

      <section id="how" className="bg-white px-5 py-20 md:px-8 md:py-28">
        <div className="mx-auto max-w-6xl">
          <motion.div {...fade} transition={{ duration: 0.55 }} className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent-deep">
              How it works
            </p>
            <h2 className="display mt-3 text-4xl font-semibold text-ink md:text-5xl">
              Trends become posts. Posts go live. Humans show up twice.
            </h2>
            <p className="mt-4 max-w-xl text-[16px] leading-relaxed text-muted">
              Scrape, ideate, fill queues, record, approve, then auto edit, auto post, and track.
              Someone with zero content skill can ship several on brand pieces a day, video and
              photo carousels included.
            </p>
          </motion.div>

          <div className="mt-12 grid gap-8 md:grid-cols-4 md:gap-6">
            {STEPS.map((step, i) => (
              <motion.div
                key={step.n}
                {...fade}
                transition={{ duration: 0.5, delay: i * 0.06 }}
              >
                <div className="display text-[13px] font-semibold text-accent">
                  {step.n}
                </div>
                <h3 className="mt-3 text-xl font-bold text-ink">{step.title}</h3>
                <p className="mt-2 text-[15px] leading-relaxed text-muted">{step.body}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section id="creators" className="bg-soft px-5 py-20 md:px-8 md:py-28">
        <div className="mx-auto grid max-w-6xl items-center gap-12 md:grid-cols-2">
          <motion.div {...fade} transition={{ duration: 0.55 }}>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent-deep">
              For creators
            </p>
            <h2 className="display mt-3 text-4xl font-semibold text-ink md:text-5xl">
              The easiest way to do UGC campaigns and earn.
            </h2>
            <p className="mt-4 text-[16px] leading-relaxed text-muted">
              Open Home, see exactly what to make, record or create in app, submit, and get paid.
              No strategy, editing, or posting logistics. Noni tells you what to post.
            </p>
            <ul className="mt-8 space-y-3">
              {CREATOR_POINTS.map((line) => (
                <li
                  key={line}
                  className="rounded-2xl border border-line bg-white px-5 py-4 text-[15px] font-medium text-ink"
                >
                  {line}
                </li>
              ))}
            </ul>
            <a
              href={APP_STORE}
              target="_blank"
              rel="noreferrer"
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3.5 text-[15px] font-bold text-white"
            >
              Download the app
              <ArrowRight className="h-4 w-4" />
            </a>
          </motion.div>
          <PhoneMock
            src="/brand/creator-home-hero.png"
            alt="Noni creator Home screen with today posts and earnings"
            priority={false}
            delay={0.1}
          />
        </div>
      </section>

      <section id="brands" className="bg-white px-5 py-20 md:px-8 md:py-28">
        <div className="mx-auto grid max-w-6xl items-center gap-12 md:grid-cols-2">
          <div className="order-2 md:order-1">
            <PhoneMock
              src="/brand/admin-review-hero.png"
              alt="Noni business Review screen for approving creator posts"
              priority={false}
              delay={0.1}
            />
          </div>
          <motion.div {...fade} transition={{ duration: 0.55 }} className="order-1 md:order-2">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent-deep">
              For businesses
            </p>
            <h2 className="display mt-3 text-4xl font-semibold text-ink md:text-5xl">
              The easiest way to automate and run UGC campaigns.
            </h2>
            <p className="mt-4 text-[16px] leading-relaxed text-muted">
              A managed creator program without hiring a content ops team. Brand voice, briefs,
              quality gate, posting, and attribution run through Noni. You set brand and cadence,
              invite creators, and approve.
            </p>
            <ul className="mt-8 space-y-3">
              {BUSINESS_POINTS.map((line) => (
                <li
                  key={line}
                  className="rounded-2xl border border-line bg-soft px-5 py-4 text-[15px] font-medium text-ink"
                >
                  {line}
                </li>
              ))}
            </ul>
            <Link
              href="/login?next=/admin"
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3.5 text-[15px] font-bold text-white"
            >
              Open business admin
              <ArrowRight className="h-4 w-4" />
            </Link>
          </motion.div>
        </div>
      </section>

      <section id="product" className="overflow-hidden bg-soft px-5 py-20 md:px-8 md:py-28">
        <div className="mx-auto max-w-6xl">
          <motion.div {...fade} transition={{ duration: 0.55 }} className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent-deep">
              Both sides
            </p>
            <h2 className="display mt-3 text-4xl font-semibold text-ink md:text-5xl">
              Open Home and earn. Approve once and it goes live.
            </h2>
            <p className="mt-4 text-[16px] leading-relaxed text-muted">
              Noni turns trends into queued posts, creators make them, businesses approve once,
              and everything after that runs itself.
            </p>
          </motion.div>

          <motion.div
            {...fade}
            transition={{ duration: 0.65, delay: 0.08 }}
            className="mt-14"
          >
            <DualPhoneMock />
          </motion.div>
        </div>
      </section>

      <section className="bg-white px-5 py-20 md:px-8 md:py-28">
        <div className="mx-auto max-w-6xl">
          <motion.div {...fade} transition={{ duration: 0.55 }} className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent-deep">
              What ships
            </p>
            <h2 className="display mt-3 text-4xl font-semibold text-ink md:text-5xl">
              On brand UGC, video and carousels.
            </h2>
            <p className="mt-4 text-[16px] leading-relaxed text-muted">
              Ready posts drafted from trends, made by creators in app, approved once, then
              posted natively to their accounts.
            </p>
          </motion.div>

          <div className="mt-10 -mx-5 flex gap-4 overflow-x-auto px-5 pb-4 md:mx-0 md:grid md:grid-cols-5 md:gap-4 md:overflow-visible md:px-0 md:pb-0">
            {POSTS.map((post, i) => (
              <motion.div
                key={post.src}
                {...fade}
                transition={{ duration: 0.5, delay: i * 0.05 }}
                className="relative aspect-[3/4] w-[200px] shrink-0 overflow-hidden rounded-[22px] bg-soft md:w-auto"
              >
                <Image
                  src={post.src}
                  alt={post.alt}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 200px, 20vw"
                />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-ink px-5 py-20 text-white md:px-8 md:py-28">
        <div className="mx-auto flex max-w-6xl flex-col items-start gap-8 md:flex-row md:items-end md:justify-between">
          <motion.div {...fade} transition={{ duration: 0.55 }} className="max-w-xl">
            <h2 className="display text-4xl font-semibold md:text-5xl">
              Start a UGC campaign that runs itself.
            </h2>
            <p className="mt-4 text-[16px] leading-relaxed text-white/65">
              Creators download Noni and earn. Businesses log in, invite creators, publish
              briefs, and approve.
            </p>
          </motion.div>
          <motion.div
            {...fade}
            transition={{ duration: 0.55, delay: 0.08 }}
            className="flex flex-wrap gap-3"
          >
            <a
              href={APP_STORE}
              target="_blank"
              rel="noreferrer"
              className="rounded-full bg-accent px-6 py-3.5 text-[15px] font-bold text-white"
            >
              Download the app
            </a>
            <Link
              href="/login?next=/admin"
              className="rounded-full border border-white/20 px-6 py-3.5 text-[15px] font-bold text-white"
            >
              Business login
            </Link>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
