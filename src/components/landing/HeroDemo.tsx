"use client";

import { BarChart3, Check, Eye, Inbox, LayoutList, UserPlus, Users } from "lucide-react";
import Image from "next/image";

/* The landing hero's picture: Noni in one screen. A phone open on one
   campaign shows what the product does end to end: creators' videos live
   (real UGC frames), what each one brought in, one waiting for a tap to
   approve, and the creators paid. Two cards float beside it with the
   moments people care about most (a brief written, a sale from a creator's
   code). Built in code so it stays sharp and true to the app. */

const LIVE = [
  { src: "/brand/post-jake2.png", who: "Jake", views: "214k", signups: 41 },
  { src: "/brand/post-sebastian.png", who: "Sofia", views: "88k", signups: 17 },
  { src: "/brand/post-fabri.png", who: "Fabri", views: "56k", signups: 9 },
];

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex min-w-0 flex-col">
      <span className="text-[19px] font-extrabold leading-none tracking-[-0.4px] text-ink">{value}</span>
      <span className="mt-1 text-[10.5px] font-semibold text-slate-400">{label}</span>
    </div>
  );
}

export function HeroDemo() {
  return (
    <div className="relative mx-auto w-full max-w-[340px]">
      {/* The phone */}
      <div className="relative rounded-[46px] bg-ink p-[9px] shadow-[0_40px_80px_-30px_rgba(15,23,42,0.45)]">
        <div className="relative flex aspect-[9/19] flex-col overflow-hidden rounded-[38px] bg-[#f6f8fb]">
          {/* Status bar */}
          <div className="flex items-center justify-between px-6 pb-1 pt-3.5 text-[11px] font-bold text-ink">
            <span>9:41</span>
            <span className="h-[22px] w-[86px] rounded-full bg-ink" aria-hidden />
            <span className="flex items-center gap-1" aria-hidden>
              <span className="h-2 w-3 rounded-[2px] bg-ink" />
              <span className="h-2.5 w-5 rounded-[3px] border-[1.5px] border-ink" />
            </span>
          </div>

          <div className="flex-1 px-4 pb-3 pt-2">
            {/* Campaign header */}
            <div className="flex items-center justify-between">
              <div>
                <p className="m-0 text-[10.5px] font-bold uppercase tracking-[0.12em] text-slate-400">Campaign</p>
                <p className="m-0 mt-0.5 text-[19px] font-extrabold tracking-[-0.5px] text-ink">Spring launch</p>
              </div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#e8f8ee] px-2.5 py-1 text-[10.5px] font-bold text-[#16a34a]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#22c55e]" />
                8 creators live
              </span>
            </div>

            {/* Results */}
            <div className="mt-3 grid grid-cols-3 gap-2 rounded-[18px] bg-white p-3.5 shadow-[0_1px_3px_rgba(15,23,42,0.06)]">
              <Stat value="1.2M" label="views" />
              <Stat value="312" label="sign-ups" />
              <Stat value="$4.8k" label="sales" />
            </div>

            {/* Live videos */}
            <p className="m-0 mt-4 text-[11.5px] font-bold text-ink">Live now</p>
            <div className="mt-2 grid grid-cols-3 gap-2">
              {LIVE.map((v, i) => (
                <div
                  key={v.src}
                  className="relative aspect-[9/15] overflow-hidden rounded-[14px] bg-slate-200 animate-om-rise"
                  style={{ animationDelay: `${350 + i * 100}ms`, animationFillMode: "both" }}
                >
                  <Image src={v.src} alt="" fill sizes="110px" className="object-cover" priority={i === 0} />
                  <span className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/70 to-transparent" />
                  <span className="absolute left-1.5 top-1.5 rounded-full bg-black/45 px-1.5 py-[2px] text-[9px] font-bold text-white backdrop-blur-sm">
                    {v.who}
                  </span>
                  <span className="absolute bottom-1.5 left-1.5 right-1.5 flex flex-col gap-0.5 text-white">
                    <span className="inline-flex items-center gap-1 text-[10.5px] font-extrabold">
                      <Eye className="h-3 w-3" strokeWidth={2.6} />
                      {v.views}
                    </span>
                    <span className="inline-flex items-center gap-1 text-[9.5px] font-bold text-white/85">
                      <UserPlus className="h-2.5 w-2.5" strokeWidth={2.6} />
                      {v.signups} sign-ups
                    </span>
                  </span>
                </div>
              ))}
            </div>

            {/* Waiting for approval */}
            <div className="mt-3 flex items-center gap-3 rounded-[18px] bg-white p-2.5 shadow-[0_1px_3px_rgba(15,23,42,0.06)]">
              <span className="relative h-[52px] w-[38px] shrink-0 overflow-hidden rounded-[10px] bg-slate-200">
                <Image src="/brand/post-tona.png" alt="" fill sizes="40px" className="object-cover" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[12px] font-extrabold text-ink">New video from Tona</span>
                <span className="block text-[10.5px] font-semibold text-slate-400">Edited and captioned by AI</span>
              </span>
              <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-[#1BA6EE] px-3 py-1.5 text-[11px] font-bold text-white">
                <Check className="h-3 w-3" strokeWidth={3.2} />
                Approve
              </span>
            </div>

            {/* Paid */}
            <div className="mt-2 flex items-center justify-between rounded-[18px] bg-white px-3.5 py-3 shadow-[0_1px_3px_rgba(15,23,42,0.06)]">
              <span className="text-[11.5px] font-bold text-ink">Creators paid this week</span>
              <span className="text-[13px] font-extrabold text-[#16a34a]">$1,240</span>
            </div>

            {/* A brief going out */}
            <div className="mt-2 rounded-[18px] bg-white px-3.5 py-3 shadow-[0_1px_3px_rgba(15,23,42,0.06)]">
              <span className="flex items-center justify-between">
                <span className="text-[10.5px] font-bold uppercase tracking-[0.1em] text-slate-400">Next brief</span>
                <span className="text-[10.5px] font-bold text-[#1BA6EE]">5 creators filming</span>
              </span>
              <span className="mt-1 block text-[12.5px] font-extrabold leading-[1.35] text-ink">
                3 ways to get noticed by college coaches
              </span>
              <span className="mt-2 block h-1.5 overflow-hidden rounded-full bg-[#eef2f6]">
                <span className="block h-full w-[62%] rounded-full bg-[#1BA6EE]" />
              </span>
            </div>
          </div>

          {/* Tab bar, as in the app */}
          <div className="mx-3 mb-3 flex items-center justify-around rounded-[22px] bg-white px-2 py-2.5 shadow-[0_1px_3px_rgba(15,23,42,0.08)]">
            {[
              { Icon: Inbox, label: "Review", on: true },
              { Icon: LayoutList, label: "Briefs", on: false },
              { Icon: Users, label: "Creators", on: false },
              { Icon: BarChart3, label: "Analytics", on: false },
            ].map(({ Icon, label, on }) => (
              <span key={label} className={`flex flex-col items-center gap-0.5 ${on ? "text-[#1BA6EE]" : "text-slate-400"}`}>
                <Icon className="h-[17px] w-[17px]" strokeWidth={2.2} />
                <span className="text-[9px] font-bold">{label}</span>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Floating moments */}
      <div
        className="absolute -left-[150px] top-[400px] hidden w-[176px] rounded-[18px] border border-line bg-white p-3 shadow-[0_18px_40px_-18px_rgba(15,23,42,0.35)] animate-om-rise lg:block"
        style={{ animationDelay: "700ms", animationFillMode: "both" }}
      >
        <span className="flex items-center gap-2">
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-[#e8f6fe] text-[#1BA6EE]">
            <Check className="h-3.5 w-3.5" strokeWidth={3.2} />
          </span>
          <span className="text-[12px] font-extrabold text-ink">Brief written</span>
        </span>
        <span className="mt-1.5 block text-[11px] font-semibold leading-[1.4] text-slate-500">
          Hook, script and shot list, sent to 8 creators
        </span>
      </div>

      <div
        className="absolute -right-[118px] top-[150px] hidden w-[158px] rounded-[18px] border border-line bg-white p-3 shadow-[0_18px_40px_-18px_rgba(15,23,42,0.35)] animate-om-rise lg:block"
        style={{ animationDelay: "900ms", animationFillMode: "both" }}
      >
        <span className="block text-[20px] font-extrabold tracking-[-0.5px] text-[#16a34a]">+$98</span>
        <span className="mt-0.5 block text-[11px] font-semibold leading-[1.4] text-slate-500">
          Sale from Jake&apos;s code JAKE10
        </span>
      </div>
    </div>
  );
}
