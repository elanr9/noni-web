"use client";

import { Camera, Check, ChevronDown, Heart, Plus, Smile, Sparkles } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";

import { completeOnboarding } from "@/app/onboarding/actions";
import { Field, Pill } from "@/components/kit";

/* The /admin onboarding question flow, one question per screen, ported from
   design_handoff_admin_app_web/AdminOnbFlow.jsx. Text steps use a Next
   button; choice steps flash blue and auto-advance after 120ms with no Next
   and no checkmark. Back is a quiet text button. No payment here. */

type StepId =
  | "welcome"
  | "name"
  | "role"
  | "website"
  | "ugc"
  | "creators"
  | "managers"
  | "selfManager"
  | "download"
  | "done";

/* Segmented progress dash index per step (download shares the last dash).
   The welcome greeting sits outside the question flow, so no dash. */
const DASH_INDEX: Record<Exclude<StepId, "welcome" | "done">, number> = {
  name: 0,
  role: 1,
  website: 2,
  ugc: 3,
  creators: 4,
  managers: 5,
  selfManager: 6,
  download: 6,
};

const APP_STORE_URL = "https://apps.apple.com/app/id6799189794";

const ADMIN_ROLES = [
  "Founder",
  "Marketing",
  "Content",
  "Growth",
  "Operations",
  "Something else",
];

const CHOICE_ADVANCE_MS = 120;

function TopBar() {
  return (
    <div className="flex shrink-0 items-center gap-[9px] px-7 py-[22px]">
      <Image src="/brand/noni-logo.svg" alt="" width={28} height={28} />
      <span className="text-[19px] font-bold tracking-[-0.6px] text-ink">
        noni
      </span>
    </div>
  );
}

function ChoiceCard({
  title,
  hint,
  selected,
  onClick,
}: {
  title: string;
  hint?: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full cursor-pointer items-center gap-2.5 rounded-[14px] border text-left transition-colors duration-[160ms] ease-om ${
        hint ? "px-[18px] py-[15px]" : "px-4 py-3.5"
      } ${
        selected
          ? "border-transparent bg-blue-100"
          : "border-line bg-white hover:border-blue-300 hover:bg-fill-quiet"
      }`}
    >
      <span className="min-w-0 flex-1">
        <span
          className={`block whitespace-nowrap text-[14.5px] font-bold ${
            selected ? "text-blue-700" : "text-ink"
          }`}
        >
          {title}
        </span>
        {hint ? (
          <span className="mt-0.5 block text-[13px] font-semibold text-slate-400">
            {hint}
          </span>
        ) : null}
      </span>
    </button>
  );
}

function CountButton({
  onClick,
  disabled,
  label,
  children,
}: {
  onClick: () => void;
  disabled: boolean;
  label: string;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={disabled ? undefined : onClick}
      className={`inline-flex h-[46px] w-[46px] items-center justify-center rounded-pill border border-line bg-white shadow-card ${
        disabled ? "opacity-35" : "cursor-pointer"
      }`}
    >
      {children}
    </button>
  );
}

function CountPicker({
  value,
  onChange,
  unit,
  zeroUnit,
}: {
  value: number;
  onChange: (value: number) => void;
  unit: string;
  zeroUnit: string;
}) {
  return (
    <div className="flex items-center justify-center gap-[22px] py-2.5">
      <CountButton
        label="Fewer"
        disabled={value === 0}
        onClick={() => onChange(value - 1)}
      >
        <ChevronDown size={17} className="text-ink" />
      </CountButton>
      <span className="min-w-[130px] text-center">
        <span className="block text-[46px] font-bold leading-none tracking-[-1.2px] text-ink">
          {value}
        </span>
        <span className="mt-1.5 block text-[13.5px] font-semibold text-slate-400">
          {value === 0 ? zeroUnit : unit}
        </span>
      </span>
      <CountButton label="More" disabled={false} onClick={() => onChange(value + 1)}>
        <Plus size={17} className="text-ink" />
      </CountButton>
    </div>
  );
}

/* One-question screen: dashes, big question, fields, one pill, quiet Back. */
function OnbStep({
  stepKey,
  total,
  title,
  subtitle,
  children,
  primary,
  primaryDisabled,
  onPrimary,
  onBack,
}: {
  stepKey: Exclude<StepId, "welcome" | "done">;
  total: number;
  title: string;
  subtitle?: string;
  children: ReactNode;
  primary?: string;
  primaryDisabled?: boolean;
  onPrimary?: () => void;
  onBack?: () => void;
}) {
  const index = DASH_INDEX[stepKey];
  return (
    <div className="flex min-h-screen flex-col bg-ground font-ops">
      <TopBar />
      <div className="flex flex-1 items-start justify-center px-6 pb-[60px] pt-12">
        <div key={stepKey} className="w-[440px] max-w-full animate-om-rise">
          <div className="mb-[30px] flex gap-1.5">
            {Array.from({ length: total }).map((_, i) => (
              <span
                key={i}
                className={`h-1 flex-1 rounded-pill transition-colors duration-[160ms] ease-om ${
                  i <= index ? "bg-blue-500" : "bg-line"
                }`}
              />
            ))}
          </div>
          <h1 className="m-0 text-[28px] font-bold tracking-[-0.7px] text-ink">
            {title}
          </h1>
          {subtitle ? (
            <p className="mb-0 mt-[9px] text-[14.5px] font-semibold leading-[1.55] text-slate-400">
              {subtitle}
            </p>
          ) : null}
          <div className="mt-[26px]">{children}</div>
          {primary ? (
            <Pill
              onClick={primaryDisabled ? undefined : onPrimary}
              disabled={primaryDisabled}
              className="mt-[26px] w-full"
              style={{ padding: "15px 22px", fontSize: 15 }}
            >
              {primary}
            </Pill>
          ) : null}
          {onBack ? (
            <div className="mt-3 text-center">
              <button
                type="button"
                onClick={onBack}
                className="cursor-pointer border-none bg-transparent p-2 text-[13.5px] font-bold text-slate-400"
              >
                Back
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export interface OnboardingFlowProps {
  companyName: string;
  /** Prefilled from the profile or the Google account. */
  defaultName: string;
  /** Prefilled from the company row the ops console created. */
  defaultWebsite: string;
}

export function OnboardingFlow({
  companyName,
  defaultName,
  defaultWebsite,
}: OnboardingFlowProps) {
  const router = useRouter();
  const [step, setStep] = useState<StepId>("welcome");
  const [name, setName] = useState(defaultName);
  const [role, setRole] = useState("");
  const [website, setWebsite] = useState(defaultWebsite);
  const [doesUgc, setDoesUgc] = useState<boolean | null>(null);
  const [creatorCount, setCreatorCount] = useState(0);
  const [managerCount, setManagerCount] = useState(0);
  const [selfIsManager, setSelfIsManager] = useState<boolean | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const total = doesUgc ? (managerCount > 0 ? 7 : 6) : 4;

  function advanceAfterPick(next: StepId) {
    window.setTimeout(() => setStep(next), CHOICE_ADVANCE_MS);
  }

  async function onLookAround() {
    setBusy(true);
    setError(null);
    const result = await completeOnboarding({
      fullName: name.trim(),
      adminRole: role,
      website: website.trim(),
      doesUgc: doesUgc === true,
      creatorCount: doesUgc ? creatorCount : 0,
      managerCount: doesUgc ? managerCount : 0,
      selfIsManager: doesUgc && managerCount > 0 ? selfIsManager === true : false,
    });
    if (!result.ok) {
      setBusy(false);
      setError(result.error);
      return;
    }
    router.push("/admin?tour=1");
  }

  if (step === "welcome") {
    const firstName = defaultName.trim().split(/\s+/)[0] ?? "";
    return (
      <div className="flex min-h-screen flex-col bg-ground font-ops">
        <TopBar />
        <div className="flex flex-1 items-center justify-center px-6 pb-[80px]">
          <div className="w-[440px] max-w-full animate-om-pop text-center">
            <div className="mx-auto grid w-fit grid-cols-2 gap-2.5">
              <span className="flex h-[92px] w-[92px] items-center justify-center rounded-[24px] bg-amber-soft">
                <Sparkles size={34} className="text-amber" />
              </span>
              <span className="flex h-[92px] w-[92px] items-center justify-center rounded-[24px] bg-accent-soft">
                <Camera size={34} className="text-blue-500" />
              </span>
              <span className="flex h-[92px] w-[92px] items-center justify-center rounded-[24px] bg-danger-soft">
                <Heart size={34} className="text-danger" />
              </span>
              <span className="flex h-[92px] w-[92px] items-center justify-center rounded-[24px] bg-green-soft">
                <Smile size={34} className="text-green" />
              </span>
            </div>
            <h1 className="mb-0 mt-8 text-[30px] font-bold tracking-[-0.8px] text-ink">
              {firstName ? `Hi ${firstName}, welcome to Noni!` : "Welcome to Noni!"}
            </h1>
            <p className="mb-0 mt-2.5 text-[14.5px] font-semibold leading-[1.6] text-slate-400">
              {`We're so glad you're here. A few quick questions and ${companyName} is up and running.`}
            </p>
            <Pill
              onClick={() => setStep("name")}
              className="mt-[28px]"
              style={{ padding: "15px 34px", fontSize: 15 }}
            >
              {"Let's get started"}
            </Pill>
          </div>
        </div>
      </div>
    );
  }

  if (step === "name") {
    return (
      <OnbStep
        stepKey="name"
        total={total}
        title="Who are you?"
        subtitle="How your team sees you inside Noni."
        primary="Next"
        primaryDisabled={!name.trim()}
        onPrimary={() => setStep("role")}
      >
        <Field
          label="Your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoFocus
        />
      </OnbStep>
    );
  }

  if (step === "role") {
    return (
      <OnbStep
        stepKey="role"
        total={total}
        title="What do you do?"
        subtitle="Your role at the company."
        onBack={() => setStep("name")}
      >
        <div className="grid grid-cols-2 gap-2.5">
          {ADMIN_ROLES.map((r) => (
            <ChoiceCard
              key={r}
              title={r}
              selected={role === r}
              onClick={() => {
                setRole(r);
                advanceAfterPick("website");
              }}
            />
          ))}
        </div>
      </OnbStep>
    );
  }

  if (step === "website") {
    return (
      <OnbStep
        stepKey="website"
        total={total}
        title="What's your website?"
        subtitle="We'll scan your site to learn your company and brand."
        primary="Next"
        primaryDisabled={!website.trim()}
        onPrimary={() => setStep("ugc")}
        onBack={() => setStep("role")}
      >
        <Field
          label="Website"
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
        />
      </OnbStep>
    );
  }

  if (step === "ugc") {
    return (
      <OnbStep
        stepKey="ugc"
        total={total}
        title="Do you already do UGC marketing?"
        onBack={() => setStep("website")}
      >
        <div className="flex flex-col gap-2.5">
          <ChoiceCard
            title="Yes"
            hint="We already work with creators."
            selected={doesUgc === true}
            onClick={() => {
              setDoesUgc(true);
              advanceAfterPick("creators");
            }}
          />
          <ChoiceCard
            title="Not yet"
            hint="We're starting from scratch."
            selected={doesUgc === false}
            onClick={() => {
              setDoesUgc(false);
              advanceAfterPick("done");
            }}
          />
        </div>
      </OnbStep>
    );
  }

  if (step === "creators") {
    return (
      <OnbStep
        stepKey="creators"
        total={total}
        title="How many creators do you have?"
        subtitle="You'll invite them once you're inside."
        primary={creatorCount === 0 ? "I don't have any" : "Next"}
        onPrimary={() => setStep("managers")}
        onBack={() => setStep("ugc")}
      >
        <CountPicker
          value={creatorCount}
          onChange={setCreatorCount}
          unit={creatorCount === 1 ? "creator" : "creators"}
          zeroUnit="no creators yet"
        />
      </OnbStep>
    );
  }

  if (step === "managers") {
    return (
      <OnbStep
        stepKey="managers"
        total={total}
        title="And how many campaign managers?"
        subtitle="They run weekly briefs and keep creators on pace."
        primary={managerCount === 0 ? "I don't have one" : "Next"}
        onPrimary={() => setStep(managerCount > 0 ? "selfManager" : "done")}
        onBack={() => setStep("creators")}
      >
        <CountPicker
          value={managerCount}
          onChange={setManagerCount}
          unit={managerCount === 1 ? "campaign manager" : "campaign managers"}
          zeroUnit="no campaign manager yet"
        />
      </OnbStep>
    );
  }

  if (step === "selfManager") {
    return (
      <OnbStep
        stepKey="selfManager"
        total={total}
        title={
          managerCount === 1
            ? "Are you the campaign manager?"
            : "Are you one of the campaign managers?"
        }
        onBack={() => setStep("managers")}
      >
        <div className="flex flex-col gap-2.5">
          <ChoiceCard
            title="Yes, that's me"
            selected={selfIsManager === true}
            onClick={() => {
              setSelfIsManager(true);
              advanceAfterPick("download");
            }}
          />
          <ChoiceCard
            title="No, someone else"
            selected={selfIsManager === false}
            onClick={() => {
              setSelfIsManager(false);
              advanceAfterPick("done");
            }}
          />
        </div>
      </OnbStep>
    );
  }

  if (step === "download") {
    return (
      <OnbStep
        stepKey="download"
        total={total}
        title="Download the Noni App to run your campaigns!"
        subtitle={`This Google account is already set as a campaign manager for ${companyName}.`}
      >
        <div className="flex justify-center">
          <span className="inline-block rounded-[30px] bg-ink-900 p-[6px] shadow-card">
            <Image
              src="/brand/review-phone-crop.png"
              alt="The Noni app"
              width={150}
              height={319}
              quality={95}
              className="block h-[319px] w-[150px] rounded-[24px] object-cover object-top"
            />
          </span>
        </div>
        <a
          href={APP_STORE_URL}
          target="_blank"
          rel="noreferrer"
          onClick={() => setStep("done")}
          className="mt-[22px] flex w-full items-center justify-center rounded-pill bg-blue-500 font-bold text-white no-underline shadow-accent"
          style={{ padding: "15px 22px", fontSize: 15 }}
        >
          Download now
        </a>
      </OnbStep>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-ground p-6 font-ops">
      <div className="w-[420px] max-w-full animate-om-pop text-center">
        <span className="inline-flex h-16 w-16 items-center justify-center rounded-pill bg-green-soft">
          <Check size={28} className="text-green" />
        </span>
        <h1 className="mb-0 mt-5 text-[30px] font-bold tracking-[-0.8px] text-ink">
          {"That's it."}
        </h1>
        <p className="mb-0 mt-2.5 text-[14.5px] font-semibold leading-[1.6] text-slate-400">
          {`${companyName} is live on Noni. Your setup steps are waiting inside. We'll show you around first.`}
        </p>
        {error ? (
          <p className="mb-0 mt-4 text-[13px] font-semibold text-danger">
            {error}
          </p>
        ) : null}
        <Pill
          onClick={busy ? undefined : () => void onLookAround()}
          disabled={busy}
          className="mt-[26px]"
          style={{ padding: "15px 34px", fontSize: 15 }}
        >
          {busy ? "Saving…" : "Look around"}
        </Pill>
      </div>
    </div>
  );
}
