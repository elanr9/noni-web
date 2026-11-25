"use client";

import { ArrowRight, Check, Rocket } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { markCallBooked, startPlanCheckout } from "@/app/start/actions";
import { Burst } from "@/components/admin/brain/BrainConfirm";
import { themeTextColor } from "@/lib/media-library-shared";

/* Where a company waits between the onboarding chat and its dashboard.
   - call: book the call with the founders (Calendly, inline). Every company
     books one; the plan and the creator budget are agreed on it.
   - booked: the call is on the calendar.
   - offer: after the call ops sent the plan; one button starts it in Stripe
     Checkout.
   - paid: back from Checkout, waiting for the webhook to open the dashboard.
   Wears the company's color (read off its site), Noni blue until there is one. */

export type StartStep = "call" | "booked" | "offer" | "paid";

const NONI_BLUE = "#1BA6EE";

/* The founders' Calendly as an inline embed, filled in with who they are.
   embed_domain + embed_type make Calendly post its events (event_scheduled)
   back to this page. */
function calendlySrc(url: string, host: string, who: { name: string; email: string; color: string }): string {
  const u = new URL(url);
  u.searchParams.set("embed_domain", host);
  u.searchParams.set("embed_type", "Inline");
  u.searchParams.set("hide_gdpr_banner", "1");
  u.searchParams.set("hide_event_type_details", "1");
  u.searchParams.set("primary_color", who.color.replace("#", ""));
  if (who.name) u.searchParams.set("name", who.name);
  if (who.email) u.searchParams.set("email", who.email);
  return u.toString();
}

export function StartFlow({
  companyId,
  firstName,
  fullName = "",
  host = "usenoni.app",
  email,
  themeColor,
  bookingUrl,
  initialStep,
  offer,
}: {
  companyId: string;
  companyName?: string;
  firstName: string;
  /** Prefills the booking form. */
  fullName?: string;
  /** This site's host, for Calendly's embed_domain. */
  host?: string;
  email: string;
  themeColor: string | null;
  bookingUrl: string | null;
  initialStep: StartStep;
  /** The plan agreed on the call, as lines to show. */
  offer?: { plan: string; budget: string | null } | null;
}) {
  const router = useRouter();
  const [step, setStep] = useState<StartStep>(initialStep);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const accent = themeColor ?? NONI_BLUE;
  const sparks = [accent, "#22C55E", "#FBBF24", accent];

  /* Paid: the webhook opens the workspace; the page moves on when it lands. */
  useEffect(() => {
    if (step !== "paid") return;
    const id = window.setInterval(() => router.refresh(), 2000);
    return () => window.clearInterval(id);
  }, [step, router]);

  /* Calendly confirms the booking: the screen turns into "You're booked". */
  useEffect(() => {
    if (step !== "call") return;
    const onMessage = (e: MessageEvent) => {
      if (e.origin !== "https://calendly.com") return;
      const data = e.data as { event?: string } | null;
      if (data?.event !== "calendly.event_scheduled") return;
      setStep("booked");
      void markCallBooked(companyId);
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [step, companyId]);

  const start = async () => {
    if (starting) return;
    setStarting(true);
    setError(null);
    const r = await startPlanCheckout(companyId);
    if (!r.ok) {
      setStarting(false);
      setError(r.error);
      return;
    }
    if (r.redirectUrl?.startsWith("/")) router.push(r.redirectUrl);
    else if (r.redirectUrl) window.location.assign(r.redirectUrl);
    else router.refresh();
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#fbfbfc] font-ops">
      <header className="flex h-[72px] items-center gap-[9px] px-5 sm:px-7">
        <Image src="/brand/noni-logo.svg" alt="" width={26} height={26} />
        <span className="text-[18px] font-bold tracking-[-0.6px] text-ink">noni</span>
      </header>

      <main key={step} className="mx-auto flex w-full max-w-[1080px] flex-1 flex-col items-center justify-center gap-9 px-5 pb-20 text-center animate-om-rise">
        {step === "call" && bookingUrl ? (
          <div className="flex w-full flex-col items-center gap-8 lg:flex-row lg:items-center lg:gap-14 lg:text-left">
            <div className="flex flex-col items-center gap-6 lg:w-[360px] lg:shrink-0 lg:items-start">
              <span
                className="relative inline-flex h-20 w-20 items-center justify-center rounded-full animate-om-check"
                style={{ backgroundColor: accent, color: "#FFFFFF" }}
              >
                <Burst colors={sparks} count={24} reach={150} />
                <Rocket size={36} strokeWidth={2.2} />
              </span>
              <h1 className="display m-0 text-[46px] font-bold leading-[1.05] tracking-[-1.6px] text-ink">
                Book your call{firstName ? `, ${firstName}` : ""}
              </h1>
            </div>
            <div className="h-[660px] w-full max-w-[640px] overflow-hidden rounded-[24px] border border-line bg-white shadow-[0_12px_32px_rgba(15,23,42,0.08)]">
              <iframe
                title="Book a call with Noni"
                src={calendlySrc(bookingUrl, host, { name: fullName, email, color: accent })}
                className="h-full w-full border-0"
              />
            </div>
          </div>
        ) : null}

        {step === "call" && !bookingUrl ? (
          <>
            <span
              className="relative inline-flex h-24 w-24 items-center justify-center rounded-full animate-om-check"
              style={{ backgroundColor: accent, color: "#FFFFFF" }}
            >
              <Burst colors={sparks} count={28} reach={170} />
              <Rocket size={42} strokeWidth={2.2} />
            </span>
            <h1 className="display m-0 text-[52px] font-bold leading-[1.05] tracking-[-1.8px] text-ink">
              Let&apos;s talk soon{firstName ? `, ${firstName}` : ""}
            </h1>
            <p className="m-0 max-w-[480px] text-[19px] font-medium leading-[1.55] text-slate-500">
              We&apos;ll email {email || "you"} today to set up a call.
            </p>
          </>
        ) : null}

        {step === "booked" ? (
          <>
            <span
              className="relative inline-flex h-24 w-24 items-center justify-center rounded-full animate-om-check"
              style={{ backgroundColor: "#22C55E", color: "#FFFFFF" }}
            >
              <Burst colors={sparks} count={36} reach={190} />
              <Check size={46} strokeWidth={3.5} />
            </span>
            <h1 className="display m-0 text-[52px] font-bold leading-[1.05] tracking-[-1.8px] text-ink">
              You&apos;re booked{firstName ? `, ${firstName}` : ""}!
            </h1>
          </>
        ) : null}

        {step === "offer" && offer ? (
          <>
            <h1 className="display m-0 text-[48px] font-bold leading-[1.05] tracking-[-1.6px] text-ink">Your plan</h1>
            <div className="flex w-full max-w-[520px] flex-col gap-3 rounded-[24px] border border-line bg-white p-7 text-left shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
              <p className="m-0 text-[19px] font-bold leading-[1.4] tracking-[-0.3px] text-ink">{offer.plan}</p>
              {offer.budget ? (
                <p className="m-0 border-t border-line pt-3 text-[16px] font-semibold leading-[1.5] text-slate-500">{offer.budget}</p>
              ) : null}
            </div>
            <button
              type="button"
              onClick={() => void start()}
              disabled={starting}
              className="group inline-flex cursor-pointer items-center gap-2 rounded-full border-none px-9 py-[18px] text-[18px] font-bold transition-[transform,filter] duration-150 hover:-translate-y-0.5 hover:brightness-105 active:translate-y-0 active:scale-[0.96] disabled:opacity-60"
              style={{ backgroundColor: accent, color: themeTextColor(accent) }}
            >
              {starting ? "One sec…" : "Start subscription"}
              {starting ? null : <ArrowRight size={19} className="transition-transform duration-150 group-hover:translate-x-1" />}
            </button>
          </>
        ) : null}

        {step === "paid" ? (
          <>
            <span
              className="relative inline-flex h-24 w-24 items-center justify-center rounded-full animate-om-check"
              style={{ backgroundColor: "#22C55E", color: "#FFFFFF" }}
            >
              <Burst colors={sparks} count={30} reach={170} />
              <Check size={46} strokeWidth={3.5} />
            </span>
            <h1 className="display m-0 text-[52px] font-bold leading-[1.05] tracking-[-1.8px] text-ink">
              You&apos;re in!
            </h1>
            <p className="m-0 inline-flex items-center gap-2 text-[17px] font-semibold text-slate-500">
              <span className="om-spinner" />
              Opening your workspace
            </p>
          </>
        ) : null}

        {error ? <p className="m-0 text-[14px] font-semibold text-danger">{error}</p> : null}
      </main>
    </div>
  );
}
