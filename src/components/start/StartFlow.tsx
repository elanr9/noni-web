"use client";

import { ArrowRight, Check, Rocket, Sparkles, Wrench } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { startCheckout } from "@/app/admin/billing/actions";
import { chooseRunPath, type RunPath } from "@/app/start/actions";
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

export type StartStep = "choose" | "plans" | "call" | "paid";

const NONI_BLUE = "#1BA6EE";

export function StartFlow({
  companyId,
  companyName,
  firstName,
  email,
  themeColor,
  bookingUrl,
  initialStep,
}: {
  companyId: string;
  companyName: string;
  firstName: string;
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

  const card = (path: RunPath, Icon: typeof Wrench, title: string, line: string, tag?: string) => {
    const on = picked === path;
    return (
      <button
        type="button"
        disabled={picked !== null}
        onClick={() => choose(path)}
        className={`group relative flex w-full cursor-pointer flex-col items-start gap-4 rounded-[26px] border-2 bg-white p-7 text-left transition-[transform,box-shadow,border-color] duration-200 ease-om hover:-translate-y-1.5 hover:shadow-[0_18px_40px_rgba(15,23,42,0.12)] active:scale-[0.98] disabled:cursor-default sm:w-[320px] ${
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
        <span className="flex flex-col gap-1.5">
          <span className="flex items-center gap-2">
            <span className="text-[24px] font-bold tracking-[-0.6px] text-ink">{title}</span>
            {tag ? (
              <span
                className="rounded-full px-2.5 py-[3px] text-[11.5px] font-bold"
                style={{ backgroundColor: `color-mix(in srgb, ${accent} 14%, white)`, color: accent }}
              >
                {tag}
              </span>
            ) : null}
          </span>
          <span className="text-[15.5px] font-medium leading-[1.45] text-slate-500">{line}</span>
        </span>
        <span
          className="mt-1 inline-flex items-center gap-1.5 text-[15px] font-bold transition-transform duration-150 group-hover:translate-x-1"
          style={{ color: accent }}
        >
          {on ? <span className="om-spinner" /> : null}
          Pick this
          <ArrowRight size={16} strokeWidth={2.6} />
        </span>
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
              Who should run it?
            </h1>
            <div className="flex w-full flex-col items-stretch justify-center gap-5 sm:flex-row sm:items-stretch">
              {card("diy", Wrench, "Do it myself", "Run your own creators on Noni.")}
              {card("dfy", Sparkles, "Do it for me", `We run ${companyName}'s whole UGC campaign.`, "Hands off")}
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

        {step === "call" ? (
          <>
            <span
              className="relative inline-flex h-24 w-24 items-center justify-center rounded-full animate-om-check"
              style={{ backgroundColor: accent, color: "#FFFFFF" }}
            >
              <Burst colors={sparks} count={28} reach={170} />
              <Rocket size={42} strokeWidth={2.2} />
            </span>
            <h1 className="display m-0 text-[52px] font-bold leading-[1.05] tracking-[-1.8px] text-ink">
              {bookingUrl ? "Book your call" : "Let's talk soon"}
              {firstName ? `, ${firstName}` : ""}
            </h1>
            {bookingUrl ? (
              <a
                href={bookingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center gap-2 rounded-full px-9 py-[18px] text-[18px] font-bold no-underline transition-[transform,filter] duration-150 hover:-translate-y-0.5 hover:brightness-105 active:translate-y-0 active:scale-[0.96]"
                style={{
                  backgroundColor: accent,
                  color: onAccent,
                  boxShadow: `0 12px 28px color-mix(in srgb, ${accent} 34%, transparent)`,
                }}
              >
                Pick a time
                <ArrowRight size={19} className="transition-transform duration-150 group-hover:translate-x-1" />
              </a>
            ) : (
              <p className="m-0 max-w-[480px] text-[19px] font-medium leading-[1.55] text-slate-500">
                We&apos;ll email {email || "you"} today to set up a quick call.
              </p>
            )}
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
