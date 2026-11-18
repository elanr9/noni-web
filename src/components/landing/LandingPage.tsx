"use client";

/* The public landing page. Every phone on it is a real Noni screen
   (public/landing, captured from the app). Order: hero, features, the two
   audience sections the hero buttons jump to, pricing, founders, FAQ. */

import { motion } from "framer-motion";
import {
  ArrowRight,
  BadgeDollarSign,
  BarChart3,
  Check,
  ClipboardList,
  MessagesSquare,
  Send,
  ShieldCheck,
  Trophy,
  Video,
} from "lucide-react";
import Link from "next/link";
import { useState, type ReactNode } from "react";

import { PlanPicker } from "@/components/admin/billing/PlanPicker";
import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";
import { WaitlistModal, type LeadModalKind } from "@/components/WaitlistModal";
import { FOUNDERS, FOUNDERS_NOTE } from "@/lib/founders";
import { PLAN_CREATOR_CAP, SELF_SERVE_PLANS } from "@/lib/plans";
import { BOOKING_URL, IOS_APP_AVAILABILITY } from "@/lib/site-config";

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

/* ── The loop, hero to payout ── */

const LOOP = [
  { icon: ClipboardList, title: "Brief", body: "Noni drafts what to film from your brand." },
  { icon: Video, title: "Film", body: "Creators record and edit in the app." },
  { icon: ShieldCheck, title: "Approve", body: "Nothing posts until you say so." },
  { icon: Send, title: "Post", body: "Out to TikTok and Instagram." },
  { icon: BarChart3, title: "Measure", body: "Views, sign-ups and sales by post." },
  { icon: BadgeDollarSign, title: "Pay", body: "Creators are paid from one budget." },
];

/* ── Three headline features, each with two real screens ── */

const FEATURES: {
  eyebrow: string;
  title: string;
  body: string;
  points: string[];
  front: { src: string; alt: string };
  back: { src: string; alt: string };
}[] = [
  {
    eyebrow: "Briefs",
    title: "Briefs your creators can actually film",
    body: "Noni reads your website to learn your brand, then drafts the post with you. Creators open it and see exactly what to say and what to show.",
    points: [
      "Talking head, slideshow, green screen and long text formats",
      "Guided templates or a loose outline, your call",
      "One library every creator on your team can pull from",
    ],
    front: { src: "/landing/briefs.png", alt: "The Briefs library in Noni" },
    back: { src: "/landing/newbrief.png", alt: "Choosing a post type for a new brief" },
  },
  {
    eyebrow: "Review",
    title: "Approve everything before it posts",
    body: "Every video and slideshow lands in one queue. Approve it, or send a single clip back with a note. Approved posts go out to TikTok and Instagram on schedule.",
    points: [
      "One queue per creator, newest first",
      "Send back one clip and keep the rest",
      "Talk it through in the thread next to the post",
    ],
    front: { src: "/landing/review.png", alt: "The Review queue in Noni" },
    back: { src: "/landing/chat.png", alt: "A chat with a creator about a retake" },
  },
  {
    eyebrow: "Analytics",
    title: "See which posts make you money",
    body: "Views are only the start. Connect Stripe and your app in one click each, give every creator a code, and Noni shows the sign-ups and sales each creator and each post brought in.",
    points: [
      "Views, likes, shares and saves for every post",
      "Sign-ups and sales credited to the creator who drove them",
      "Only coded sales count, so the numbers hold up",
    ],
    front: { src: "/landing/analytics.png", alt: "Analytics with views, sign-ups and sales" },
    back: { src: "/landing/post.png", alt: "One post with its views, sales and sign-ups" },
  },
];

/* ── Four more, one screen each ── */

const MORE = [
  {
    icon: Video,
    title: "Filmed in the app",
    body: "The script stays on screen while they record. Retakes, slideshows and sounds are built in.",
    src: "/landing/coutline.png",
    alt: "A creator's brief with a Start recording button",
  },
  {
    icon: BadgeDollarSign,
    title: "Creators get paid",
    body: "Set one monthly creator budget. Noni pays your creators from it and each one sees what they earned.",
    src: "/landing/cearn.png",
    alt: "A creator's earnings screen",
  },
  {
    icon: MessagesSquare,
    title: "One inbox",
    body: "Direct messages and team channels sit next to the work, so feedback never gets lost in texts.",
    src: "/landing/messages.png",
    alt: "The Messages inbox",
  },
  {
    icon: Trophy,
    title: "Every creator, ranked",
    body: "Each creator has a profile with their posts, views and the sales on their code.",
    src: "/landing/creator.png",
    alt: "A creator profile with views and sales",
  },
];

const FAQ = [
  {
    q: "What is Noni?",
    a: "An iPhone app and web dashboard for running a UGC creator program in one place: briefs, filming, review, posting to TikTok and Instagram, analytics and creator payouts.",
  },
  {
    q: "Who is it for?",
    a: "Companies that work with creators to make TikTok and Instagram posts, and the creators who make them. A company runs its program in Noni; its creators film and submit in the same app.",
  },
  {
    q: "How does Noni know which posts brought in sales?",
    a: "Each creator gets a promo code. When you connect Stripe, a customer who pays with that code is credited to that creator, and the credit is shared across their posts by the views each one was getting that week. Connect your app as well and sign-ups are counted the same way. Sales with no creator code are never credited to a post.",
  },
  {
    q: "Do I have to connect Stripe or my app?",
    a: "No. Both are optional and take one click each. Without them you still get briefs, review, posting, views and payouts. They add sign-ups and sales to Analytics.",
  },
  {
    q: "How do creators get paid?",
    a: "You set a monthly creator budget, separate from your plan. It is added to your balance as credits and Noni pays your creators from that balance.",
  },
  {
    q: "What does it cost?",
    a: `Plans start at $${FROM_PRICE} a month billed annually for up to ${PLAN_CREATOR_CAP.starter} creators per campaign. Every plan includes unlimited campaigns and briefs. Your creator budget is on top and is yours to set.`,
  },
  {
    q: "Is there an Android app?",
    a: "Not yet. The app is on iPhone, in private beta. Company admins can also use the web dashboard.",
  },
  {
    q: "How do I get started?",
    a: "Companies book a call: we show you Noni with your brand in it and set up your workspace. Creators apply with their TikTok or Instagram handle and we email when a brand is a fit.",
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
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-[-180px] mx-auto h-[620px] max-w-[1100px] rounded-full bg-[radial-gradient(closest-side,rgba(79,186,242,0.22),transparent)]"
          />
          <div className="relative mx-auto max-w-[1180px] px-5 pb-6 pt-10 md:px-8 md:pt-16 lg:grid lg:grid-cols-[1.02fr_1fr] lg:items-center lg:gap-10 lg:pb-20 lg:pt-20">
            <div className="mx-auto max-w-[620px] text-center lg:mx-0 lg:text-left">
              <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease }}>
                <span className="inline-flex items-center gap-2 rounded-full border border-line bg-white px-3.5 py-1.5 text-[12.5px] font-bold text-ink-soft">
                  <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                  {IOS_APP_AVAILABILITY === "app_store" ? "Available on the App Store" : "Now in private beta on iPhone"}
                </span>
                <h1 className="display mt-5 text-[44px] font-semibold leading-[0.98] text-ink sm:text-[56px] lg:text-[68px]">
                  Your whole UGC program, in one app.
                </h1>
                <p className="mx-auto mt-5 max-w-[52ch] text-[16.5px] leading-[1.6] text-muted md:text-[18px] lg:mx-0">
                  Noni drafts the briefs. Your creators film them in the app. You approve, and it posts to
                  TikTok and Instagram. Then it shows you which posts brought in views, sign-ups and sales,
                  and pays your creators.
                </p>
                <div className="mt-8 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center lg:justify-start">
                  <Link
                    href="#for-businesses"
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-ink px-7 py-4 text-[15.5px] font-bold text-white transition hover:bg-ink-soft"
                  >
                    For Businesses
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link
                    href="#for-creators"
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-accent px-7 py-4 text-[15.5px] font-bold text-white shadow-[0_10px_24px_-10px_var(--glow)] transition hover:bg-accent-deep"
                  >
                    For Creators
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </motion.div>
            </div>

            {/* Three real screens: review, analytics, a creator's home. */}
            <motion.div
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease, delay: 0.12 }}
              className="relative mx-auto mt-9 flex h-[390px] w-full max-w-[560px] items-end justify-center sm:h-[520px] lg:mt-0 lg:h-[600px]"
            >
              <Phone
                src="/landing/review.png"
                alt="The Review queue in Noni"
                priority
                sizes="(min-width: 1024px) 230px, 40vw"
                className="absolute bottom-6 left-[2%] w-[40%] max-w-[230px] -rotate-[7deg] sm:left-[4%]"
              />
              <Phone
                src="/landing/chome.png"
                alt="A creator's home screen in Noni"
                priority
                sizes="(min-width: 1024px) 230px, 40vw"
                className="absolute bottom-6 right-[2%] w-[40%] max-w-[230px] rotate-[7deg] sm:right-[4%]"
              />
              <Phone
                src="/landing/analytics.png"
                alt="Noni Analytics: views, posts, sign-ups and sales"
                priority
                sizes="(min-width: 1024px) 280px, 50vw"
                className="relative z-10 w-[50%] max-w-[280px]"
              />
            </motion.div>
          </div>

          {/* The loop */}
          <div className="relative border-y border-line bg-soft/70">
            <ol className="mx-auto grid max-w-[1180px] list-none grid-cols-2 gap-x-4 gap-y-6 px-5 py-8 sm:grid-cols-3 md:px-8 lg:grid-cols-6 lg:gap-2 lg:py-9">
              {LOOP.map(({ icon: Icon, title, body }, i) => (
                <li key={title} className="flex items-start gap-3 lg:flex-col lg:gap-2.5">
                  <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-accent-deep shadow-[0_1px_2px_rgba(15,23,32,0.06)] ring-1 ring-line">
                    <Icon className="h-[18px] w-[18px]" />
                  </span>
                  <div>
                    <p className="m-0 text-[14.5px] font-extrabold text-ink">
                      <span className="mr-1.5 text-muted/70">{i + 1}</span>
                      {title}
                    </p>
                    <p className="m-0 mt-0.5 text-[13px] leading-[1.45] text-muted">{body}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* ── Features ── */}
        <section id="features" className="scroll-mt-20">
          <div className="mx-auto max-w-[1180px] px-5 pt-16 md:px-8 lg:pt-24">
            <Reveal className="mx-auto max-w-[720px] text-center">
              <Eyebrow>Everything in one place</Eyebrow>
              <h2 className="display mt-3 text-[34px] font-semibold leading-[1.04] text-ink md:text-[46px]">
                From the brief to the payout, without leaving Noni
              </h2>
              <p className="mx-auto mt-4 max-w-[58ch] text-[16px] leading-[1.6] text-muted">
                Most creator programs run on a doc for briefs, a group chat for videos, a spreadsheet for
                numbers and a bank app for payouts. Noni is all of it, on your phone.
              </p>
            </Reveal>

            <div className="mt-14 flex flex-col gap-16 lg:mt-20 lg:gap-28">
              {FEATURES.map((f, i) => (
                <div
                  key={f.title}
                  className={`flex flex-col items-center gap-10 lg:flex-row lg:gap-16 ${i % 2 ? "lg:flex-row-reverse" : ""}`}
                >
                  <Reveal className="w-full max-w-[520px] lg:flex-1">
                    <Eyebrow>{f.eyebrow}</Eyebrow>
                    <h3 className="display mt-3 text-[28px] font-semibold leading-[1.08] text-ink md:text-[36px]">
                      {f.title}
                    </h3>
                    <p className="mt-4 text-[16px] leading-[1.65] text-muted">{f.body}</p>
                    <ul className="m-0 mt-6 flex list-none flex-col gap-3 p-0">
                      {f.points.map((point) => (
                        <li key={point} className="flex items-start gap-3 text-[15px] font-semibold leading-[1.45] text-ink-soft">
                          <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent-soft">
                            <Check className="h-3 w-3 text-accent-deep" strokeWidth={3} />
                          </span>
                          {point}
                        </li>
                      ))}
                    </ul>
                  </Reveal>

                  <Reveal delay={0.08} className="w-full lg:flex-1">
                    <div className="relative mx-auto h-[420px] w-full max-w-[480px] overflow-hidden rounded-[36px] bg-soft sm:h-[500px]">
                      <Phone
                        src={f.back.src}
                        alt={f.back.alt}
                        sizes="(min-width: 1024px) 220px, 42vw"
                        className={`absolute top-[84px] w-[44%] max-w-[220px] ${i % 2 ? "left-[7%] -rotate-[5deg]" : "right-[7%] rotate-[5deg]"}`}
                      />
                      <Phone
                        src={f.front.src}
                        alt={f.front.alt}
                        sizes="(min-width: 1024px) 260px, 52vw"
                        className={`absolute top-[44px] z-10 w-[52%] max-w-[260px] ${i % 2 ? "right-[8%]" : "left-[8%]"}`}
                      />
                    </div>
                  </Reveal>
                </div>
              ))}
            </div>

            <div className="mt-20 grid gap-5 sm:grid-cols-2 lg:mt-28 lg:grid-cols-4">
              {MORE.map(({ icon: Icon, title, body, src, alt }, i) => (
                <Reveal key={title} delay={i * 0.06}>
                  <div className="flex h-full flex-col overflow-hidden rounded-[28px] border border-line bg-white">
                    <div className="px-6 pt-6">
                      <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-accent-soft">
                        <Icon className="h-5 w-5 text-accent-deep" />
                      </span>
                      <h3 className="m-0 mt-4 text-[17px] font-extrabold text-ink">{title}</h3>
                      <p className="m-0 mt-1.5 text-[14px] leading-[1.55] text-muted">{body}</p>
                    </div>
                    <div className="mt-6 flex h-[250px] justify-center overflow-hidden bg-soft px-6 pt-6">
                      <Phone src={src} alt={alt} sizes="220px" className="w-[200px] self-start" />
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ── For Businesses ── */}
        <section id="for-businesses" className="scroll-mt-20 px-3 pt-20 md:px-6 lg:pt-28">
          <div className="mx-auto max-w-[1180px] overflow-hidden rounded-[36px] bg-ink">
            <div className="grid items-end gap-10 px-6 pt-12 md:px-12 lg:grid-cols-[1.1fr_1fr] lg:gap-6 lg:pt-16">
              <Reveal className="pb-2 lg:pb-16">
                <p className="text-[12.5px] font-extrabold uppercase tracking-[0.14em] text-accent">For Businesses</p>
                <h2 className="display mt-3 text-[34px] font-semibold leading-[1.04] text-white md:text-[46px]">
                  Run a creator program that pays for itself
                </h2>
                <p className="mt-4 max-w-[52ch] text-[16px] leading-[1.65] text-white/70">
                  Hand your creators clear briefs, approve every post from your phone and see the sign-ups
                  and sales each one brings in. No spreadsheets, no chasing videos over text.
                </p>
                <ul className="m-0 mt-7 flex list-none flex-col gap-3 p-0">
                  {[
                    "We set up your workspace with you on a call",
                    "Noni learns your brand from your website",
                    `Up to ${PLAN_CREATOR_CAP.starter}, ${PLAN_CREATOR_CAP.premium} or unlimited creators per campaign`,
                    "Switch plans or cancel any time",
                  ].map((point) => (
                    <li key={point} className="flex items-start gap-3 text-[15px] font-semibold leading-[1.45] text-white/90">
                      <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/12">
                        <Check className="h-3 w-3 text-accent" strokeWidth={3} />
                      </span>
                      {point}
                    </li>
                  ))}
                </ul>
                <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                  <button
                    type="button"
                    onClick={bookCall}
                    className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-full border-none bg-accent px-7 py-4 text-[15.5px] font-bold text-white transition hover:bg-accent-deep"
                  >
                    Book a call
                    <ArrowRight className="h-4 w-4" />
                  </button>
                  <Link
                    href="#pricing"
                    className="inline-flex items-center justify-center rounded-full border border-white/20 px-7 py-4 text-[15.5px] font-bold text-white transition hover:bg-white/10"
                  >
                    See pricing
                  </Link>
                </div>
              </Reveal>
              <Reveal delay={0.08} className="relative mx-auto flex h-[380px] w-full max-w-[440px] items-end justify-center sm:h-[460px]">
                <Phone
                  src="/landing/creator.png"
                  alt="A creator profile with views and sales"
                  sizes="(min-width: 1024px) 200px, 40vw"
                  className="absolute bottom-[-70px] right-[4%] w-[42%] max-w-[200px] rotate-[6deg]"
                />
                <Phone
                  src="/landing/analytics.png"
                  alt="Noni Analytics"
                  sizes="(min-width: 1024px) 250px, 52vw"
                  className="relative z-10 mb-[-70px] w-[52%] max-w-[250px] -translate-x-[20%]"
                />
              </Reveal>
            </div>
          </div>
        </section>

        {/* ── For Creators ── */}
        <section id="for-creators" className="scroll-mt-20 px-3 pt-5 md:px-6">
          <div className="mx-auto max-w-[1180px] overflow-hidden rounded-[36px] bg-accent-soft">
            <div className="grid items-end gap-10 px-6 pt-12 md:px-12 lg:grid-cols-[1fr_1.1fr] lg:gap-6 lg:pt-16">
              <Reveal delay={0.08} className="relative order-2 mx-auto flex h-[380px] w-full max-w-[440px] items-end justify-center sm:h-[460px] lg:order-1">
                <Phone
                  src="/landing/cearn.png"
                  alt="A creator's earnings screen"
                  sizes="(min-width: 1024px) 200px, 40vw"
                  className="absolute bottom-[-70px] left-[4%] w-[42%] max-w-[200px] -rotate-[6deg]"
                />
                <Phone
                  src="/landing/chome.png"
                  alt="A creator's home screen in Noni"
                  sizes="(min-width: 1024px) 250px, 52vw"
                  className="relative z-10 mb-[-70px] w-[52%] max-w-[250px] translate-x-[20%]"
                />
              </Reveal>
              <Reveal className="order-1 pb-2 lg:order-2 lg:pb-16">
                <Eyebrow>For Creators</Eyebrow>
                <h2 className="display mt-3 text-[34px] font-semibold leading-[1.04] text-ink md:text-[46px]">
                  Make posts for brands. Get paid for them.
                </h2>
                <p className="mt-4 max-w-[52ch] text-[16px] leading-[1.65] text-ink-soft/80">
                  No guessing what a brand wants and no chasing invoices. Open the brief, film it in the
                  app, send it in and watch your views and earnings add up.
                </p>
                <ul className="m-0 mt-7 flex list-none flex-col gap-3 p-0">
                  {[
                    "Briefs that tell you what to say and show",
                    "Record, edit and submit from your phone",
                    "Notes come back on the exact clip to redo",
                    "See your views and what you earned, post by post",
                  ].map((point) => (
                    <li key={point} className="flex items-start gap-3 text-[15px] font-semibold leading-[1.45] text-ink-soft">
                      <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white">
                        <Check className="h-3 w-3 text-accent-deep" strokeWidth={3} />
                      </span>
                      {point}
                    </li>
                  ))}
                </ul>
                <div className="mt-9">
                  <button
                    type="button"
                    onClick={() => setForm("creator")}
                    className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-full border-none bg-ink px-7 py-4 text-[15.5px] font-bold text-white transition hover:bg-ink-soft sm:w-auto"
                  >
                    Get started as a creator
                    <ArrowRight className="h-4 w-4" />
                  </button>
                  <p className="m-0 mt-3 text-[13px] font-semibold text-ink-soft/70">
                    iPhone only for now. We read every application.
                  </p>
                </div>
              </Reveal>
            </div>
          </div>
        </section>

        {/* ── Pricing ── */}
        <section id="pricing" className="scroll-mt-20 pt-16 lg:pt-24">
          <div className="font-ops mx-auto max-w-[1080px] px-4 md:px-8">
            <PlanPicker
              eyebrow="Pricing"
              heading="Simple plans for your creator program"
              publicCta={{ label: "Book a call", onClick: bookCall }}
            />
          </div>
        </section>

        {/* ── Founders ── */}
        <section id="founders" className="scroll-mt-20">
          <div className="mx-auto max-w-[920px] px-5 pt-20 md:px-8 lg:pt-28">
            <Reveal className="rounded-[36px] border border-line bg-white px-6 py-10 md:px-12 md:py-14">
              <Eyebrow>From the founders</Eyebrow>
              <h2 className="display mt-3 text-[30px] font-semibold leading-[1.06] text-ink md:text-[40px]">
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
              <h2 className="display mt-3 text-[34px] font-semibold leading-[1.04] text-ink md:text-[44px]">
                Questions, answered
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
              <h2 className="display m-0 text-[28px] font-semibold leading-[1.08] text-ink md:text-[36px]">
                Ready when you are
              </h2>
              <div className="mt-6 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
                <button
                  type="button"
                  onClick={bookCall}
                  className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-full border-none bg-ink px-7 py-4 text-[15.5px] font-bold text-white transition hover:bg-ink-soft"
                >
                  Book a call
                  <ArrowRight className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setForm("creator")}
                  className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-full border-none bg-accent px-7 py-4 text-[15.5px] font-bold text-white transition hover:bg-accent-deep"
                >
                  Get started as a creator
                  <ArrowRight className="h-4 w-4" />
                </button>
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
