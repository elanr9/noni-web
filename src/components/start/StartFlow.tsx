"use client";

import { Check, Rocket, Sparkles, Wrench } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { startCheckout } from "@/app/admin/billing/actions";
import { chooseRunPath, markCallBooked, type RunPath } from "@/app/start/actions";
import { PlanPicker } from "@/components/admin/billing/PlanPicker";
import { Burst } from "@/components/admin/brain/BrainConfirm";
import { BackButton } from "@/components/onboarding/BackButton";
import type { SubscriptionPlan } from "@/lib/admin/types";
import { themeTextColor } from "@/lib/media-library-shared";

/* The first run screen after sign up, and the only thing a company without a
   plan can open. One question: run it yourself, or have Noni do it for you.
   - Do it myself: the self serve plans, Stripe checkout, then the full
     onboarding (every question is theirs to answer).
   - Do it for me: a call with the founders, and nothing else. The founders
     hear about it at once; the workspace opens after the call, when ops puts
     the company on Done for you.
   Wears the company's color (read off its site), Noni blue until there is one. */

export type StartStep = "choose" | "plans" | "call" | "booked" | "paid";

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
  companyName,
  firstName,
  fullName = "",
  host = "usenoni.app",
  email,
  themeColor,
  bookingUrl,
  initialStep,
}: {
  companyId: string;
  companyName: string;
  firstName: string;
  /** Prefills the booking form. */
  fullName?: string;
  /** This site's host, for Calendly's embed_domain. */
  host?: string;
  email: string;
  themeColor: string | null;
  bookingUrl: string | null;
  initialStep: StartStep;
}) {
  const router = useRouter();
  const [step, setStep] = useState<StartStep>(initialStep);
  const [picked, setPicked] = useState<RunPath | null>(null);
  const [error, setError] = useState<string | null>(null);
  const accent = themeColor ?? NONI_BLUE;
  const onAccent = themeTextColor(accent);
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

  const choose = (path: RunPath) => {
    if (picked) return;
    setPicked(path);
    setError(null);
    void chooseRunPath(companyId, path).then((r) => {
      if (!r.ok) {
        setPicked(null);
        setError(r.error);
        return;
      }
      /* A beat for the pop before the next screen. */
      window.setTimeout(() => {
        setStep(path === "dfy" ? "call" : "plans");
        setPicked(null);
      }, 380);
    });
  };

  const buy = async (plan: SubscriptionPlan): Promise<boolean> => {
    setError(null);
    const r = await startCheckout(companyId, plan, "start");
    if (!r.ok) {
      setError(r.error);
      return false;
    }
    if (r.redirectUrl) window.location.assign(r.redirectUrl);
    else router.refresh();
    return true;
  };

  const back = step === "plans" || step === "call" ? () => setStep("choose") : null;

  /* One option: an icon and the sentence the company would say. The whole
     card is the button; picking it pops the icon to a check with a burst. */
  const card = (path: RunPath, Icon: typeof Wrench, sentence: string) => {
    const on = picked === path;
    return (
      <button
        type="button"
        disabled={picked !== null}
        onClick={() => choose(path)}
        className={`group relative flex w-full cursor-pointer flex-col items-start justify-between gap-10 rounded-[26px] border-2 bg-white p-8 text-left transition-[transform,box-shadow,border-color] duration-200 ease-om hover:-translate-y-1.5 hover:shadow-[0_18px_40px_rgba(15,23,42,0.12)] active:scale-[0.98] disabled:cursor-default sm:min-h-[260px] sm:w-[340px] ${
          on ? "animate-om-bounce" : ""
        }`}
        style={{
          borderColor: on ? accent : "#E6EBF1",
          boxShadow: on ? `0 18px 40px color-mix(in srgb, ${accent} 28%, transparent)` : undefined,
        }}
      >
        {on ? <Burst colors={sparks} count={16} reach={110} /> : null}
        <span
          className="inline-flex h-14 w-14 items-center justify-center rounded-[18px] transition-transform duration-200 group-hover:scale-110 group-hover:-rotate-6"
          style={{ backgroundColor: on ? accent : `color-mix(in srgb, ${accent} 14%, white)`, color: on ? onAccent : accent }}
        >
          {on ? <Check size={26} strokeWidth={3} className="animate-om-check" /> : <Icon size={26} strokeWidth={2.4} />}
        </span>
        <span className="text-[25px] font-bold leading-[1.2] tracking-[-0.6px] text-ink">{sentence}</span>
      </button>
    );
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#fbfbfc] font-ops">
      <header className="flex h-[72px] items-center gap-[9px] px-5 sm:px-7">
        {back ? <BackButton onClick={back} /> : null}
        <Image src="/brand/noni-logo.svg" alt="" width={26} height={26} />
        <span className="text-[18px] font-bold tracking-[-0.6px] text-ink">noni</span>
      </header>

      <main key={step} className="mx-auto flex w-full max-w-[1080px] flex-1 flex-col items-center justify-center gap-9 px-5 pb-20 text-center animate-om-rise">
        {step === "choose" ? (
          <>
            <h1 className="display m-0 text-[48px] font-bold leading-[1.05] tracking-[-1.6px] text-ink">
              What are you looking for?
            </h1>
            <div className="flex w-full flex-col items-stretch justify-center gap-5 sm:flex-row sm:items-stretch">
              {card("diy", Wrench, "I want to run our UGC campaigns on Noni")}
              {card("dfy", Sparkles, "I want the Noni team to run my UGC")}
            </div>
          </>
        ) : null}

        {step === "plans" ? (
          <div className="w-full text-left">
            <PlanPicker
              compact
              selfServeOnly
              onChoose={buy}
              known={{ name: firstName, email, company: companyName }}
            />
          </div>
        ) : null}

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
              <p className="m-0 text-[17px] font-medium leading-[1.55] text-slate-500">
                30 minutes with the founders. We take it from there.
              </p>
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
              We&apos;ll email {email || "you"} today to set up a quick call.
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
            <p className="m-0 max-w-[480px] text-[19px] font-medium leading-[1.55] text-slate-500">
              The invite is in {email || "your inbox"}. Talk soon.
            </p>
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
