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
    title: "Queues fill themselves",
    body: "Noni scrapes trends and drafts hooks, scripts, and captions so nobody starts blank.",
  },
  {
    n: "02",
    title: "Creators just record",
    body: "Open the app, see what to shoot, record with the teleprompter, or build a photo carousel.",
  },
  {
    n: "03",
    title: "Approve once",
    body: "Admins review finished pieces. After approve, edit, post, and track run alone.",
  },
  {
    n: "04",
    title: "It goes live",
    body: "Approved content posts to each creator's own TikTok and Instagram, then performance rolls in.",
  },
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
              Humans show up twice. Everything else runs.
            </motion.p>

            {/* Static hero copy so Google OAuth branding crawlers see name + purpose without opacity:0 */}
            <h1 className="display mt-4 max-w-xl text-[52px] font-semibold leading-[0.95] text-ink md:text-[76px]">
              noni
            </h1>
            <p className="display mt-3 max-w-xl text-[30px] font-semibold tracking-[-0.03em] text-ink-soft md:text-[42px]">
              Creator content that ships itself.
            </p>
            <p className="mt-5 max-w-lg text-[17px] leading-relaxed text-muted md:text-[18px]">
              The purpose of the Noni app is to help brands run creator content programs. Noni
              fills creator queues from trends, lets creators record video and photo posts in
              the mobile app, lets admins approve once, then edits, posts, and tracks the work
              automatically.
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
                Download the app
                <ArrowRight className="h-4 w-4" />
              </a>
              <Link
                href="/login?next=/admin"
                className="inline-flex items-center gap-2 rounded-full border border-line bg-white px-6 py-3.5 text-[15px] font-bold text-ink transition hover:border-ink/20"
              >
                Admin login
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
              One loop. Almost no ops.
            </h2>
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

      <section id="product" className="overflow-hidden bg-soft px-5 py-20 md:px-8 md:py-28">
        <div className="mx-auto max-w-6xl">
          <motion.div {...fade} transition={{ duration: 0.55 }} className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent-deep">
              The product
            </p>
            <h2 className="display mt-3 text-4xl font-semibold text-ink md:text-5xl">
              Creators shoot. Admins approve once.
            </h2>
            <p className="mt-4 text-[16px] leading-relaxed text-muted">
              Phone for the field. Calm review when you need a quality gate. Everything after
              that is automatic.
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

      <section id="creators" className="bg-white px-5 py-20 md:px-8 md:py-28">
        <div className="mx-auto max-w-6xl">
          <motion.div {...fade} transition={{ duration: 0.55 }} className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent-deep">
              What ships
            </p>
            <h2 className="display mt-3 text-4xl font-semibold text-ink md:text-5xl">
              Real posts from real creators.
            </h2>
            <p className="mt-4 text-[16px] leading-relaxed text-muted">
              Video talking heads and photo carousels, drafted from trends, recorded in app,
              approved once, then posted natively.
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

      <section id="brands" className="bg-ink px-5 py-20 text-white md:px-8 md:py-28">
        <div className="mx-auto flex max-w-6xl flex-col items-start gap-8 md:flex-row md:items-end md:justify-between">
          <motion.div {...fade} transition={{ duration: 0.55 }} className="max-w-xl">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent">
              For brands
            </p>
            <h2 className="display mt-3 text-4xl font-semibold md:text-5xl">
              Run your creator program without drowning in group chats.
            </h2>
            <p className="mt-4 text-[16px] leading-relaxed text-white/65">
              Review submissions, brief campaigns, watch analytics, and manage creators in
              Noni. Web for desks. App for the field.
            </p>
          </motion.div>
          <motion.div
            {...fade}
            transition={{ duration: 0.55, delay: 0.08 }}
            className="flex flex-wrap gap-3"
          >
            <Link
              href="/login?next=/admin"
              className="rounded-full bg-accent px-6 py-3.5 text-[15px] font-bold text-white"
            >
              Open admin
            </Link>
            <a
              href="mailto:founders@fieldvisionai.com"
              className="rounded-full border border-white/20 px-6 py-3.5 text-[15px] font-bold text-white"
            >
              Talk to us
            </a>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
