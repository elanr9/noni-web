"use client";

import { AnimatePresence, motion, useInView } from "framer-motion";
import {
  BadgeCheck,
  Check,
  CircleDollarSign,
  FileText,
  Hand,
  Music,
  Play,
  Share2,
  Sparkles,
  Video as VideoIcon,
  type LucideIcon,
} from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState, type ReactNode } from "react";

/* How it works, one screen: a Companies / Creators switch, then four
   simple steps for that side over one phone acting each step out. It walks
   through on its own once the section is in view, and any step can be
   clicked. Phones get the phone and the current step under it. Every screen
   is drawn here, sized in container units so it scales with the phone. */

const STEP_MS = 3600;

const ease = [0.22, 0.61, 0.36, 1] as const;

/** A child that pops in after `d` seconds each time its step shows. */
function Pop({ d = 0, className = "", children }: { d?: number; className?: string; children: ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: d, type: "spring", stiffness: 380, damping: 26 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/** Counts from 0 to `to` once, after `d` seconds. */
function CountUp({ to, d = 0, format }: { to: number; d?: number; format: (n: number) => string }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    let raf = 0;
    const start = performance.now() + d * 1000;
    const tick = (now: number) => {
      const t = Math.min(1, Math.max(0, (now - start) / 1300));
      setN(to * (1 - Math.pow(1 - t, 3)));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [to, d]);
  return <>{format(n)}</>;
}

/** Turns true after `d` seconds, for a button that changes state mid step. */
function useAfter(d: number) {
  const [on, setOn] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setOn(true), d * 1000);
    return () => clearTimeout(t);
  }, [d]);
  return on;
}

function TikTokIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path
        fill="currentColor"
        d="M16.6 5.82A4.28 4.28 0 0 1 15.54 3h-3.09v12.4a2.59 2.59 0 0 1-2.59 2.5c-1.42 0-2.6-1.16-2.6-2.6 0-1.72 1.66-3.01 3.37-2.48V9.66c-3.45-.46-6.47 2.22-6.47 5.64 0 3.33 2.76 5.7 5.69 5.7 3.14 0 5.69-2.55 5.69-5.7V9.01a7.35 7.35 0 0 0 4.3 1.38V7.3s-1.88.09-3.24-1.48z"
      />
    </svg>
  );
}

function InstagramIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

/* ── The screens ── */

/** The finished video, whole: a blurred copy fills the box, the full frame sits on top so no caption is cut. */
function Video({ zoomFrom, className = "" }: { zoomFrom?: number; className?: string }) {
  return (
    <div className={`relative overflow-hidden bg-black ${className}`}>
      <Image src="/brand/post-fabri.png" alt="" fill sizes="200px" className="scale-110 object-cover opacity-70 blur-[6px]" />
      <motion.div
        className="absolute inset-0 origin-bottom"
        initial={zoomFrom ? { scale: zoomFrom } : false}
        animate={{ scale: 1 }}
        transition={{ delay: 0.5, duration: 0.9, ease }}
      >
        <Image src="/brand/post-fabri.png" alt="" fill sizes="300px" className="object-contain" />
      </motion.div>
    </div>
  );
}

function Screen({ children, dark = false }: { children: ReactNode; dark?: boolean }) {
  return (
    <div className={`absolute inset-0 flex flex-col ${dark ? "bg-black text-white" : "bg-[#f4f6f9] text-ink"}`}>{children}</div>
  );
}

function Title({ children }: { children: ReactNode }) {
  return <p className="m-0 text-[9.1cqw] font-extrabold tracking-[-0.02em]">{children}</p>;
}

/** `text` typed out one letter at a time, starting after `d` seconds. */
function useTyped(text: string, d: number, perChar = 0.045) {
  const [n, setN] = useState(0);
  useEffect(() => {
    let i = 0;
    let t = setTimeout(function tick() {
      i += 1;
      setN(i);
      if (i < text.length) t = setTimeout(tick, perChar * 1000);
    }, d * 1000);
    return () => clearTimeout(t);
  }, [text, d, perChar]);
  return text.slice(0, n);
}

const IDEA = "what nobody tells athletes about freshman year";

/* The headline feature: a campaign manager types a rough post idea and
   Noni turns it into a full draft, every part with a filming note. */
function BriefScreen() {
  const typed = useTyped(IDEA, 0.4);
  const typing = typed.length < IDEA.length;
  const drafted = useAfter(3.1);
  const sent = useAfter(5.6);
  return (
    <Screen>
      <div className="flex flex-1 flex-col px-[5.5cqw] pt-[14cqw]">
        <Title>New post</Title>

        {/* The idea, typed in */}
        <div className="mt-[3cqw] rounded-[4cqw] border-[0.5cqw] border-accent bg-white px-[3.8cqw] py-[3cqw] shadow-[0_0_0_1.2cqw_var(--accent-soft)]">
          <p className="m-0 text-[3.6cqw] font-bold uppercase tracking-[0.08em] text-muted">Post idea</p>
          <p className="m-0 mt-[0.8cqw] min-h-[6cqw] text-[5cqw] font-semibold leading-[1.3] text-ink">
            {typed}
            {typing ? <span className="ml-[0.4cqw] inline-block h-[4.6cqw] w-[0.6cqw] translate-y-[0.6cqw] animate-pulse bg-accent-deep" /> : null}
          </p>
        </div>

        {/* Noni writing, then the draft */}
        {!typing && !drafted ? (
          <Pop className="mt-[3.5cqw] inline-flex w-fit items-center gap-[1.6cqw] rounded-full bg-accent-soft px-[3cqw] py-[1.4cqw] text-[4.3cqw] font-bold text-accent-deep">
            <Sparkles className="h-[3.6cqw] w-[3.6cqw] animate-pulse" /> Noni is writing your draft
          </Pop>
        ) : null}
        {drafted ? (
          <Pop className="mt-[3.5cqw] rounded-[4.5cqw] bg-white p-[4.2cqw] shadow-[0_1px_2px_rgba(15,23,32,0.06)]">
            <div className="flex items-center gap-[1.6cqw]">
              <span className="inline-block rounded-[1.6cqw] bg-accent-soft px-[2cqw] py-[0.6cqw] text-[3.6cqw] font-bold text-accent-deep">Talking head</span>
              <span className="text-[3.6cqw] font-semibold text-muted">30s</span>
            </div>
            <p className="m-0 mt-[1.8cqw] text-[5.8cqw] font-extrabold leading-[1.2]">5 things nobody tells you before freshman year</p>
            {[
              ["Hook", "What nobody tells you before college", "Look straight at the camera"],
              ["Middle", "Five quick tips, one line each", "Cut between every tip"],
              ["Close", "Follow for part two", "Point at the follow button"],
            ].map(([label, text, note], i) => (
              <Pop key={label} d={0.25 + i * 0.35} className="mt-[2.6cqw] border-l-[0.8cqw] border-accent pl-[2.6cqw]">
                <p className="m-0 text-[3.5cqw] font-bold uppercase tracking-[0.08em] text-muted">{label}</p>
                <p className="m-0 mt-[0.3cqw] text-[4.6cqw] font-semibold leading-[1.3] text-ink">{text}</p>
                <p className="m-0 mt-[0.6cqw] inline-flex items-center gap-[1.2cqw] rounded-[1.4cqw] bg-[#fff7e6] px-[1.8cqw] py-[0.5cqw] text-[3.7cqw] font-semibold text-[#a16207]">
                  <FileText className="h-[3.2cqw] w-[3.2cqw]" /> {note}
                </p>
              </Pop>
            ))}
          </Pop>
        ) : null}

        <div className="mt-auto pb-[9cqw]">
          {drafted ? (
            <Pop d={1.4}>
              <div
                className={`flex items-center justify-center gap-[1.6cqw] rounded-full py-[3.6cqw] text-[5.5cqw] font-bold text-white transition-colors duration-300 ${
                  sent ? "bg-green" : "bg-accent-deep"
                }`}
              >
                {sent ? (
                  <>
                    <Check className="h-[4.4cqw] w-[4.4cqw]" strokeWidth={3} /> Sent to 6 creators
                  </>
                ) : (
                  "Send to creators"
                )}
              </div>
            </Pop>
          ) : null}
        </div>
      </div>
    </Screen>
  );
}

function PickScreen() {
  const picked = useAfter(1.3);
  const briefs = [
    { title: "5 things athletes should know before freshman year", tag: "Talking Head", tone: "from-sky-400 to-blue-500" },
    { title: "Reacting to my own heat map", tag: "Greenscreen", tone: "from-emerald-400 to-teal-500" },
    { title: "How to film a full match on a phone", tag: "Slideshow", tone: "from-pink-400 to-rose-500" },
  ];
  return (
    <Screen>
      <div className="flex flex-1 flex-col px-[5.5cqw] pt-[14cqw]">
        <Title>Hi Maya</Title>
        <p className="m-0 mt-[4cqw] text-[4.7cqw] font-bold text-muted">New briefs for you</p>
        <div className="mt-[2.4cqw] flex flex-col gap-[2.6cqw]">
          {briefs.map((b, i) => (
            <Pop key={b.title} d={0.2 + i * 0.18}>
              <div
                className={`relative rounded-[4cqw] bg-white p-[3.4cqw] transition-shadow duration-300 ${
                  i === 0 && picked ? "shadow-[0_0_0_0.8cqw_var(--accent)]" : "shadow-[0_1px_2px_rgba(15,23,32,0.06)]"
                }`}
              >
                <div className="flex items-center gap-[3cqw]">
                  <span className={`h-[11cqw] w-[11cqw] shrink-0 rounded-[2.6cqw] bg-gradient-to-br ${b.tone}`} />
                  <span className="min-w-0 flex-1">
                    <span className="block text-[4.9cqw] font-bold leading-[1.25]">{b.title}</span>
                    <span className="mt-[0.8cqw] block text-[3.9cqw] font-semibold text-muted">{b.tag}</span>
                  </span>
                </div>
                {i === 0 && picked ? (
                  <Pop className="mt-[3cqw]">
                    <div className="flex items-center justify-center gap-[1.4cqw] rounded-full bg-accent-deep py-[2.6cqw] text-[4.9cqw] font-bold text-white">
                      <Play className="h-[3.6cqw] w-[3.6cqw]" fill="currentColor" /> Film this
                    </div>
                  </Pop>
                ) : null}
                {i === 0 && picked ? (
                  <motion.span
                    className="pointer-events-none absolute left-1/2 top-1/2 h-[14cqw] w-[14cqw] -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent/30"
                    initial={{ scale: 0.2, opacity: 0.9 }}
                    animate={{ scale: 2.4, opacity: 0 }}
                    transition={{ duration: 0.7, ease }}
                  />
                ) : null}
              </div>
            </Pop>
          ))}
        </div>
      </div>
    </Screen>
  );
}

function RecordScreen() {
  const [secs, setSecs] = useState(3);
  useEffect(() => {
    const t = setInterval(() => setSecs((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, []);
  return (
    <Screen dark>
      <Image src="/brand/post-fabri.png" alt="" fill sizes="300px" className="origin-bottom scale-[1.5] object-cover" />
      <div className="absolute inset-x-0 top-0 h-[45%] bg-gradient-to-b from-black/60 to-transparent" />
      <div className="relative flex flex-1 flex-col px-[5cqw] pt-[14cqw]">
        <div className="flex items-center justify-center">
          <span className="inline-flex items-center gap-[1.6cqw] rounded-full bg-black/45 px-[3cqw] py-[1.2cqw] text-[4.4cqw] font-bold tabular-nums">
            <span className="h-[2.4cqw] w-[2.4cqw] animate-pulse rounded-full bg-red-500" /> 0:{String(secs).padStart(2, "0")}
          </span>
        </div>
        <Pop d={0.2} className="mt-[4cqw] rounded-[4cqw] bg-black/45 p-[3.6cqw] backdrop-blur">
          <p className="m-0 text-[3.8cqw] font-bold uppercase tracking-[0.08em] text-white/60">Hook</p>
          <p className="m-0 mt-[0.6cqw] text-[5.7cqw] font-bold leading-[1.3]">5 things to know before your freshman season</p>
        </Pop>
        <div className="mt-auto flex justify-center pb-[10cqw]">
          <span className="flex h-[18cqw] w-[18cqw] items-center justify-center rounded-full border-[1.2cqw] border-white">
            <span className="h-[7.5cqw] w-[7.5cqw] rounded-[1.8cqw] bg-red-500" />
          </span>
        </div>
      </div>
    </Screen>
  );
}

function EditScreen() {
  const steps = ["Captions added", "Cut to the best takes", "Music on"];
  return (
    <Screen dark>
      <Video zoomFrom={1.5} className="min-h-0 flex-1" />
      <div className="relative -mt-[6cqw] rounded-t-[6cqw] bg-white px-[5cqw] pb-[9cqw] pt-[4.4cqw] text-ink">
        <p className="m-0 flex items-center gap-[1.6cqw] text-[5.7cqw] font-extrabold">
          <Sparkles className="h-[5.4cqw] w-[5.4cqw] text-accent-deep" /> Noni edited it
        </p>
        <div className="mt-[2.6cqw] flex flex-col gap-[2.2cqw]">
          {steps.map((s, i) => (
            <Pop key={s} d={0.5 + i * 0.4} className="flex items-center gap-[2.4cqw] text-[4.9cqw] font-semibold text-ink-soft">
              <span className="flex h-[6.4cqw] w-[6.4cqw] items-center justify-center rounded-full bg-green text-white">
                {i === 2 ? <Music className="h-[3.6cqw] w-[3.6cqw]" /> : <Check className="h-[3.8cqw] w-[3.8cqw]" strokeWidth={3} />}
              </span>
              {s}
            </Pop>
          ))}
        </div>
      </div>
    </Screen>
  );
}

function ApproveScreen() {
  const ok = useAfter(1.4);
  return (
    <Screen>
      <div className="flex flex-1 flex-col px-[5.5cqw] pt-[14cqw]">
        <div className="flex items-center justify-between">
          <Title>Review</Title>
          <span className="rounded-full bg-accent-deep px-[2.4cqw] py-[0.8cqw] text-[4.2cqw] font-bold text-white">1 new</span>
        </div>
        <Pop d={0.15} className="mt-[4cqw] flex min-h-0 flex-1 justify-center">
          <div className="relative h-full w-full overflow-hidden rounded-[5cqw]">
            <Video className="h-full w-full" />
            <span className="absolute left-[3cqw] top-[3cqw] inline-flex items-center gap-[1.6cqw] rounded-full bg-white/90 py-[1cqw] pl-[1cqw] pr-[3cqw] text-[4.4cqw] font-bold">
            <span className="flex h-[6cqw] w-[6cqw] items-center justify-center rounded-full bg-amber-100 text-[4.2cqw] text-amber-600">M</span>
            Maya
          </span>
          {ok ? (
            <motion.span
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 420, damping: 16 }}
              className="absolute left-1/2 top-1/2 flex h-[22cqw] w-[22cqw] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-green text-white shadow-[0_10px_30px_-8px_rgba(31,143,95,0.6)]"
            >
              <Check className="h-[11cqw] w-[11cqw]" strokeWidth={3} />
            </motion.span>
          ) : null}
          </div>
        </Pop>
        <div className="flex gap-[2.6cqw] pb-[9cqw] pt-[4cqw]">
          <span className="flex flex-1 items-center justify-center rounded-full border border-line-strong bg-white py-[3.4cqw] text-[5.1cqw] font-bold text-ink-soft">Changes</span>
          <span
            className={`flex flex-1 items-center justify-center gap-[1.4cqw] rounded-full py-[3.4cqw] text-[5.1cqw] font-bold text-white transition-colors duration-300 ${
              ok ? "bg-green" : "bg-accent-deep"
            }`}
          >
            {ok ? <Check className="h-[4cqw] w-[4cqw]" strokeWidth={3} /> : null}
            {ok ? "Approved" : "Approve"}
          </span>
        </div>
      </div>
    </Screen>
  );
}

function PostedScreen() {
  const rows = [
    { name: "TikTok", icon: <TikTokIcon className="h-[5cqw] w-[5cqw]" />, tile: "bg-black text-white" },
    { name: "Instagram", icon: <InstagramIcon className="h-[5cqw] w-[5cqw]" />, tile: "bg-gradient-to-br from-amber-400 via-pink-500 to-purple-600 text-white" },
  ];
  return (
    <Screen>
      <div className="flex flex-1 flex-col px-[5.5cqw] pt-[14cqw]">
        <Title>Posting</Title>
        <Pop d={0.1} className="mt-[4cqw] flex items-center gap-[3.4cqw] rounded-[4.5cqw] bg-white p-[3.4cqw] shadow-[0_1px_2px_rgba(15,23,32,0.06)]">
          <span className="relative h-[20cqw] w-[13cqw] shrink-0 overflow-hidden rounded-[2.4cqw] bg-slate-200">
            <Image src="/brand/post-fabri.png" alt="" fill sizes="80px" className="object-cover" />
          </span>
          <span className="min-w-0">
            <span className="block text-[5.2cqw] font-bold leading-[1.25]">5 things athletes should know before freshman year</span>
            <span className="mt-[1cqw] block text-[4.2cqw] font-semibold text-muted">Maya · approved</span>
          </span>
        </Pop>
        <div className="mt-[3.4cqw] flex flex-col gap-[2.6cqw]">
          {rows.map((r, i) => (
            <Pop key={r.name} d={0.5 + i * 0.6} className="flex items-center gap-[3cqw] rounded-[4cqw] bg-white p-[3.2cqw] shadow-[0_1px_2px_rgba(15,23,32,0.06)]">
              <span className={`flex h-[10cqw] w-[10cqw] items-center justify-center rounded-[2.6cqw] ${r.tile}`}>{r.icon}</span>
              <span className="flex-1 text-[5.2cqw] font-bold">{r.name}</span>
              <motion.span
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.9 + i * 0.6, type: "spring", stiffness: 500, damping: 18 }}
                className="inline-flex items-center gap-[1cqw] rounded-full bg-green-soft px-[2.6cqw] py-[1cqw] text-[4.3cqw] font-bold text-green"
              >
                <Check className="h-[3.4cqw] w-[3.4cqw]" strokeWidth={3} /> Posted
              </motion.span>
            </Pop>
          ))}
        </div>
      </div>
    </Screen>
  );
}

function PaidScreen() {
  const k = (n: number) => (n >= 1000 ? `${(n / 1000).toFixed(1)}k` : `${Math.round(n)}`);
  return (
    <Screen>
      <div className="flex flex-1 flex-col px-[5.5cqw] pt-[14cqw]">
        <Title>This week</Title>
        <Pop d={0.1} className="mt-[4cqw] rounded-[5cqw] bg-gradient-to-br from-[#4fbaf2] to-[#2b8fe0] p-[5cqw] text-white">
          <div className="grid grid-cols-2 gap-[3cqw]">
            <div>
              <p className="m-0 text-[10.9cqw] font-extrabold leading-none tracking-[-0.02em]">
                <CountUp to={39200} d={0.2} format={k} />
              </p>
              <p className="m-0 mt-[1.2cqw] text-[4.2cqw] font-semibold text-white/80">views</p>
            </div>
            <div>
              <p className="m-0 text-[10.9cqw] font-extrabold leading-none tracking-[-0.02em]">
                $<CountUp to={98} d={0.2} format={(n) => `${Math.round(n)}`} />
              </p>
              <p className="m-0 mt-[1.2cqw] text-[4.2cqw] font-semibold text-white/80">sales</p>
            </div>
          </div>
          <svg viewBox="0 0 200 50" className="mt-[4cqw] h-[13cqw] w-full" aria-hidden>
            <motion.path
              d="M2 44 C 30 40, 45 30, 70 32 S 110 22, 130 18 S 175 8, 198 4"
              fill="none"
              stroke="white"
              strokeWidth="3.5"
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ delay: 0.3, duration: 1.3, ease }}
            />
          </svg>
        </Pop>
        <Pop d={0.5} className="mt-[3cqw] flex items-center justify-between rounded-[4cqw] bg-white p-[3.6cqw] shadow-[0_1px_2px_rgba(15,23,32,0.06)]">
          <span className="text-[4.9cqw] font-bold">Sign ups on MAYA10</span>
          <span className="text-[5.7cqw] font-extrabold">
            <CountUp to={4} d={0.6} format={(n) => `${Math.round(n)}`} />
          </span>
        </Pop>
        <div className="mt-auto pb-[9cqw]">
          <Pop d={1.7} className="flex items-center gap-[3cqw] rounded-[4.5cqw] bg-white p-[3.6cqw] shadow-[0_12px_28px_-12px_rgba(15,23,32,0.35)]">
            <span className="flex h-[10cqw] w-[10cqw] items-center justify-center rounded-full bg-green text-white">
              <Check className="h-[5.4cqw] w-[5.4cqw]" strokeWidth={3} />
            </span>
            <span>
              <span className="block text-[5.2cqw] font-extrabold">Maya paid $45</span>
              <span className="block text-[4.2cqw] font-semibold text-muted">From your creator budget</span>
            </span>
          </Pop>
        </div>
      </div>
    </Screen>
  );
}
type Side = "companies" | "creators";
type Step = { title: string; icon: LucideIcon; Screen: () => ReactNode; dark?: boolean; /** How long it stays up; STEP_MS if unset. */ ms?: number };

/* Four steps a side, the whole idea at a glance. */
const FLOWS: Record<Side, Step[]> = {
  companies: [
    { title: "Type a post idea", icon: FileText, Screen: BriefScreen, ms: 7200 },
    { title: "Creators film in app", icon: VideoIcon, Screen: RecordScreen, dark: true },
    { title: "Approve in one tap", icon: BadgeCheck, Screen: ApproveScreen },
    { title: "Posted automatically", icon: Share2, Screen: PostedScreen },
    { title: "Sales tracked live", icon: CircleDollarSign, Screen: PaidScreen },
  ],
  creators: [
    { title: "Pick a brief", icon: Hand, Screen: PickScreen },
    { title: "Film it", icon: VideoIcon, Screen: RecordScreen, dark: true },
    { title: "AI edits it", icon: Sparkles, Screen: EditScreen, dark: true },
    { title: "Get paid", icon: CircleDollarSign, Screen: PaidScreen },
  ],
};

/** The iPhone the steps play in, in iPhone 15 Pro proportions: a thin black
    titanium rim, a slim bezel, round corners (container units, so they stay
    circles at any size), the status bar with the Dynamic Island, and the
    home bar. Height driven: it takes its parent's height. */
function StagePhone({ children, dark = false }: { children: ReactNode; dark?: boolean }) {
  return (
    <div className="relative h-full max-w-full shrink-0" style={{ aspectRatio: 0.488, containerType: "inline-size" }}>
      {/* Side buttons */}
      <span className="absolute -left-[0.9cqw] top-[18%] h-[4.5%] w-[1.1cqw] rounded-l-[1cqw] bg-[#2a2b2f]" />
      <span className="absolute -left-[0.9cqw] top-[25.5%] h-[8%] w-[1.1cqw] rounded-l-[1cqw] bg-[#2a2b2f]" />
      <span className="absolute -left-[0.9cqw] top-[35.5%] h-[8%] w-[1.1cqw] rounded-l-[1cqw] bg-[#2a2b2f]" />
      <span className="absolute -right-[0.9cqw] top-[28%] h-[12%] w-[1.1cqw] rounded-r-[1cqw] bg-[#2a2b2f]" />
      {/* Titanium rim */}
      <div className="relative h-full w-full rounded-[15cqw] bg-[#232427] p-[1.15cqw] shadow-[0_50px_90px_-40px_rgba(15,23,42,0.55),0_18px_36px_-20px_rgba(15,23,42,0.35),inset_0_0_0_0.35cqw_rgba(255,255,255,0.16)]">
        {/* Bezel */}
        <div className="h-full w-full rounded-[13.9cqw] bg-black p-[2.5cqw]">
          {/* Screen: each step fills it (cq units); the status bar floats on
              top, dark text on the light steps and white on the dark ones. */}
          <div className="relative h-full w-full overflow-hidden rounded-[11.6cqw] bg-[#f6f7f9]" style={{ containerType: "size" }}>
            {children}
            <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-[13cqw]">
              <div className={`flex h-full items-center justify-between px-[8.5cqw] transition-colors duration-300 ${dark ? "text-white" : "text-ink"}`}>
                <span className="text-[4.1cqw] font-semibold tracking-[-0.02em]">9:41</span>
                <span className="flex items-center gap-[1.3cqw]" aria-hidden>
                  <svg viewBox="0 0 18 12" className="h-[2.8cqw] w-auto">
                    <rect x="0" y="8" width="3" height="4" rx="1" fill="currentColor" />
                    <rect x="5" y="5.5" width="3" height="6.5" rx="1" fill="currentColor" />
                    <rect x="10" y="3" width="3" height="9" rx="1" fill="currentColor" />
                    <rect x="15" y="0" width="3" height="12" rx="1" fill="currentColor" />
                  </svg>
                  <svg viewBox="0 0 16 12" className="h-[2.8cqw] w-auto">
                    <path d="M8 2.2c2.4 0 4.6.9 6.2 2.4l1.2-1.3C13.4 1.4 10.8.4 8 .4S2.6 1.4.6 3.3l1.2 1.3C3.4 3.1 5.6 2.2 8 2.2Z" fill="currentColor" />
                    <path d="M8 5.6c1.4 0 2.7.5 3.7 1.4l1.2-1.3C11.6 4.5 9.9 3.8 8 3.8S4.4 4.5 3.1 5.7L4.3 7c1-.9 2.3-1.4 3.7-1.4Z" fill="currentColor" />
                    <path d="M8 9c.6 0 1.1.2 1.5.6L8 11.2 6.5 9.6C6.9 9.2 7.4 9 8 9Z" fill="currentColor" />
                  </svg>
                  <svg viewBox="0 0 27 12" className="h-[2.8cqw] w-auto">
                    <rect x="0.5" y="0.5" width="23" height="11" rx="3.2" fill="none" stroke="currentColor" strokeOpacity="0.45" />
                    <rect x="2" y="2" width="20" height="8" rx="2" fill="currentColor" />
                    <path d="M25 4v4c.8-.3 1.3-1.1 1.3-2S25.8 4.3 25 4Z" fill="currentColor" fillOpacity="0.5" />
                  </svg>
                </span>
              </div>
              {/* Dynamic Island */}
              <span className="absolute left-1/2 top-[2.8cqw] h-[8.6cqw] w-[30cqw] -translate-x-1/2 rounded-full bg-black" />
            </div>
            {/* Home bar */}
            <span className={`pointer-events-none absolute bottom-[1.9cqw] left-1/2 z-10 h-[1.35cqw] w-[35cqw] -translate-x-1/2 rounded-full transition-colors duration-300 ${dark ? "bg-white/85" : "bg-black/75"}`} />
          </div>
        </div>
      </div>
    </div>
  );
}

export function HowItWorks() {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { amount: 0.5 });
  const [side, setSide] = useState<Side>("companies");
  const [step, setStep] = useState(0);
  const [paused, setPaused] = useState(false);
  const running = inView && !paused;
  const steps = FLOWS[side];

  useEffect(() => {
    if (!running) return;
    const t = setTimeout(() => setStep((s) => (s + 1) % steps.length), steps[step].ms ?? STEP_MS);
    return () => clearTimeout(t);
  }, [step, running, steps]);

  const Current = steps[step].Screen;
  const last = steps.length - 1;
  const pickSide = (next: Side) => {
    setSide(next);
    setStep(0);
  };

  /* Links to /#for-creators (navbar Creators, footer) open the creators side;
     /#for-businesses and /#features the companies side. */
  useEffect(() => {
    const pick = (hash: string) => {
      if (hash === "#for-creators") pickSide("creators");
      else if (hash === "#for-businesses" || hash === "#features") pickSide("companies");
    };
    const onClick = (e: MouseEvent) => {
      const href = (e.target as Element | null)?.closest?.("a[href]")?.getAttribute("href") ?? "";
      const at = href.indexOf("#");
      if (at >= 0 && (href.startsWith("#") || href.startsWith("/#"))) pick(href.slice(at));
    };
    pick(window.location.hash);
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  return (
    <section id="how" ref={ref} className="landing-screen-fixed relative px-5 md:px-8">
      {/* Older links (navbar Features and Creators, footer) land here too. */}
      <span id="features" className="absolute top-0" aria-hidden />
      <span id="for-businesses" className="absolute top-0" aria-hidden />
      <span id="for-creators" className="absolute top-0" aria-hidden />
      <div className="mx-auto flex h-full max-w-[1100px] flex-col items-center py-[clamp(16px,3svh,36px)]">
        <h2 className="display m-0 text-center text-[clamp(28px,4.8svh,46px)] font-bold leading-[1.05] tracking-[-0.02em] text-ink">How it works</h2>

        {/* Companies or creators */}
        <div className="mt-[clamp(12px,2.2svh,22px)] inline-flex rounded-full border border-line bg-white p-1 shadow-[0_1px_2px_rgba(15,23,32,0.04)]">
          {(
            [
              ["companies", "Companies"],
              ["creators", "Creators"],
            ] as const
          ).map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => pickSide(key)}
              className={`cursor-pointer rounded-full border-none px-6 py-2 text-[15px] font-bold transition-all duration-150 active:scale-[0.96] ${
                side === key ? "bg-accent-deep text-white shadow-[0_4px_12px_rgba(49,164,244,0.3)]" : "bg-transparent text-slate-500 hover:text-ink"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* The steps, left to right (wide screens) */}
        <ol
          key={side}
          className="relative m-0 mt-[clamp(14px,2.6svh,28px)] hidden w-full list-none p-0 animate-om-rise md:grid"
          style={{ gridTemplateColumns: `repeat(${steps.length}, minmax(0, 1fr))`, maxWidth: steps.length * 170 }}
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          {/* The line runs from the first circle's centre to the last one's. */}
          <span
            aria-hidden
            className="absolute top-[21px] h-[2px] rounded-full bg-line"
            style={{ left: `${50 / steps.length}%`, right: `${50 / steps.length}%` }}
          >
            <span
              className="block h-full rounded-full bg-accent transition-[width] duration-500 ease-out"
              style={{ width: `${(step / last) * 100}%` }}
            />
          </span>
          {steps.map((s, i) => {
            const Icon = s.icon;
            const active = i === step;
            const done = i < step;
            return (
              <li key={s.title} className="relative flex justify-center">
                <button
                  type="button"
                  onClick={() => setStep(i)}
                  className="group flex cursor-pointer flex-col items-center gap-2 border-none bg-transparent p-0 text-center"
                >
                  <span
                    className={`flex h-[44px] w-[44px] items-center justify-center rounded-full transition-all duration-300 ${
                      active
                        ? "scale-110 bg-accent-deep text-white shadow-[0_0_0_6px_var(--accent-soft)]"
                        : done
                          ? "bg-accent-soft text-accent-deep"
                          : "bg-white text-slate-400 shadow-[inset_0_0_0_1.5px_var(--line)] group-hover:text-ink-soft"
                    }`}
                  >
                    {done ? <Check className="h-5 w-5" strokeWidth={2.6} /> : <Icon className="h-5 w-5" strokeWidth={2.2} />}
                  </span>
                  <span className={`whitespace-nowrap text-[clamp(13px,1.8svh,15px)] font-bold leading-[1.2] transition-colors duration-200 ${active ? "text-ink" : "text-slate-400 group-hover:text-ink-soft"}`}>
                    {s.title}
                  </span>
                </button>
              </li>
            );
          })}
        </ol>

        {/* The phone acting the step out */}
        <div
          className="mt-[clamp(14px,2.6svh,28px)] flex min-h-0 w-full flex-1 cursor-pointer justify-center"
          onClick={() => setStep((s) => (s + 1) % steps.length)}
        >
          <StagePhone dark={Boolean(steps[step].dark)}>
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.div
                key={`${side}-${step}`}
                className="absolute inset-0"
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -24 }}
                transition={{ duration: 0.35, ease }}
              >
                <Current />
              </motion.div>
            </AnimatePresence>
          </StagePhone>
        </div>

        {/* Current step (small screens) */}
        <div className="mt-[clamp(12px,2.4svh,20px)] flex flex-col items-center md:hidden">
          <span className="text-[18px] font-extrabold text-ink">{steps[step].title}</span>
          <div className="mt-3 flex gap-1.5">
            {steps.map((s, i) => (
              <button
                key={s.title}
                type="button"
                aria-label={s.title}
                onClick={() => setStep(i)}
                className={`h-2 cursor-pointer rounded-full border-none p-0 transition-all duration-200 ${
                  i === step ? "w-6 bg-accent-deep" : i < step ? "w-2 bg-accent/50" : "w-2 bg-line"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
