"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Check, Sparkles, Clapperboard, ShieldCheck } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { PhoneMock } from "@/components/PhoneMock";

const APP_STORE =
  process.env.NEXT_PUBLIC_APP_STORE_URL ?? "https://apps.apple.com";

const fade = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
};

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <div className="hero-atmosphere relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 grid-fade opacity-70" />
        <Navbar />

        <main className="relative mx-auto grid max-w-6xl items-center gap-12 px-5 pb-20 pt-10 md:grid-cols-[1.1fr_0.9fr] md:gap-8 md:px-8 md:pb-28 md:pt-16">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-accent/20 bg-white/70 px-3 py-1.5 text-[13px] font-semibold text-accent-deep shadow-sm">
              <Sparkles className="h-3.5 w-3.5" />
              Humans show up twice. Everything else runs.
            </div>

            {/* Static hero copy so Google OAuth branding crawlers see name + purpose without opacity:0 */}
            <h1 className="display mt-6 max-w-xl text-[48px] font-semibold leading-[0.98] text-ink md:text-[72px]">
              Noni
            </h1>
            <p className="display mt-2 max-w-xl text-[34px] font-semibold tracking-[-0.03em] text-ink-soft md:text-[44px]">
              Creator content that ships itself.
            </p>
            <p className="mt-5 max-w-lg text-[17px] leading-relaxed text-muted md:text-[18px]">
              The purpose of the Noni app is to help brands run creator content programs. Noni
              fills creator queues from trends, lets creators record video and photo posts in
              the mobile app, lets admins approve once on the web, then edits, posts, and
              tracks the work automatically.
            </p>

            <motion.div
              {...fade}
              transition={{ duration: 0.6, delay: 0.18 }}
              className="mt-8 flex flex-wrap items-center gap-3"
            >
              <a
                href={APP_STORE}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3.5 text-[15px] font-bold text-white shadow-[0_16px_40px_rgba(27,166,238,0.35)] transition hover:bg-accent-deep"
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

          <PhoneMock />
        </main>
      </div>

      <section id="how" className="bg-white px-5 py-20 md:px-8 md:py-28">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent-deep">
              How it works
            </p>
            <h2 className="display mt-3 text-4xl font-semibold text-ink md:text-5xl">
              One loop. Almost no ops.
            </h2>
          </div>

          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {[
              {
                icon: Clapperboard,
                title: "Queue fills itself",
                body: "Noni scrapes trends and drafts creator tasks so nobody starts from a blank page.",
              },
              {
                icon: Check,
                title: "Creators just record",
                body: "Scripts, hooks, and formats land in the app. Shoot, submit, done.",
              },
              {
                icon: ShieldCheck,
                title: "Approve once",
                body: "Admins review the finished piece. After approve, edit, post, and track run alone.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="rounded-[28px] border border-line bg-soft/60 p-7 transition hover:-translate-y-0.5 hover:border-accent/30 hover:bg-white hover:shadow-[0_20px_50px_rgba(15,23,32,0.06)]"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-accent-soft text-accent-deep">
                  <item.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-5 text-xl font-bold text-ink">{item.title}</h3>
                <p className="mt-2 text-[15px] leading-relaxed text-muted">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="creators" className="bg-ink px-5 py-20 text-white md:px-8 md:py-28">
        <div className="mx-auto grid max-w-6xl items-center gap-12 md:grid-cols-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent">
              For creators
            </p>
            <h2 className="display mt-3 text-4xl font-semibold md:text-5xl">
              Clear tasks. Fast payouts. No chaos.
            </h2>
            <p className="mt-4 max-w-md text-[16px] leading-relaxed text-white/65">
              Open Noni, see what to shoot, record with the prompter, and get paid for posted
              work. Video and photo carousels both supported.
            </p>
          </div>
          <div className="grid gap-3">
            {[
              "Phone-number payouts and post updates",
              "In-app recording with scripts on screen",
              "Weekly estimates that feel real",
            ].map((line) => (
              <div
                key={line}
                className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-[15px] font-medium"
              >
                {line}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="brands" className="bg-soft px-5 py-20 md:px-8 md:py-28">
        <div className="mx-auto max-w-6xl rounded-[36px] border border-line bg-white p-8 shadow-[0_30px_80px_rgba(15,23,32,0.06)] md:p-14">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent-deep">
              For brands
            </p>
            <h2 className="display mt-3 text-4xl font-semibold text-ink md:text-5xl">
              Run your creator program from one calm screen.
            </h2>
            <p className="mt-4 text-[16px] leading-relaxed text-muted">
              Review submissions, brief campaigns, watch analytics, and manage creators in the
              Noni admin. Web for desks. App for the field.
            </p>
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/login?next=/admin"
              className="rounded-full bg-ink px-6 py-3.5 text-[15px] font-bold text-white"
            >
              Open admin
            </Link>
            <a
              href="mailto:founders@fieldvisionai.com"
              className="rounded-full border border-line px-6 py-3.5 text-[15px] font-bold text-ink"
            >
              Talk to us
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
