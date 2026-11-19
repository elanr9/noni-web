"use client";

import { Camera, Check, ChevronDown, Heart, Loader2, Plus, Smile, Sparkles } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";

import { getBrainIngestStatus } from "@/app/admin/brain/knowledge-actions";
import {
  completeOnboarding,
  saveOnboardingProgress,
  startOnboardingScan,
} from "@/app/onboarding/actions";
import { BrainSurvey } from "@/components/admin/brain/BrainSurvey";
import { GetTheApp } from "@/components/GetTheApp";
import { Field, Pill } from "@/components/kit";
import {
  failedInputLabel,
  scanLine,
  scanSteps,
  type IngestState,
} from "@/lib/admin/brain-model";
import { ONBOARDING_STEP_COOKIE, type OnboardingStepId } from "@/lib/admin/onboarding-steps";
import { IOS_APP_AVAILABILITY } from "@/lib/site-config";

/* The /admin onboarding question flow, one question per screen, ported from
   design_handoff_admin_app_web/AdminOnbFlow.jsx. Text steps use a Next
   button; choice steps flash blue and auto-advance after 120ms with no Next
   and no checkmark. Back is a quiet text button. No payment here.

   The website step starts a scan of the company (brain-ingest). Its
   progress shows in the top bar while the account questions are answered,
   then the flow hands over to BrainSurvey: a review of what the scan found
   and the founder questions. Every answer is saved as it is given and the
   current step is kept in a cookie the page reads, so a refresh resumes. */

type StepId = OnboardingStepId;
type AccountStep = Exclude<StepId, "welcome" | "scan" | "survey">;

function rememberStep(step: StepId) {
  document.cookie = `${ONBOARDING_STEP_COOKIE}=${step}; path=/onboarding; max-age=2592000; samesite=lax`;
}

const POLL_MS = 4000;

/* Segmented progress dash index per step (download shares the last dash).
   The welcome greeting sits outside the question flow, so no dash. */
const DASH_INDEX: Record<AccountStep, number> = {
  name: 0,
  role: 1,
  website: 2,
  ugc: 3,
  creators: 4,
  managers: 5,
  selfManager: 6,
  download: 6,
};

const ADMIN_ROLES = [
  "Founder",
  "Marketing",
  "Content",
  "Growth",
  "Operations",
  "Something else",
];

const CHOICE_ADVANCE_MS = 120;

function TopBar({ right }: { right?: ReactNode }) {
  return (
    <div className="flex shrink-0 items-center gap-[9px] px-5 py-[22px] sm:px-7">
      <Image src="/brand/noni-logo.svg" alt="" width={28} height={28} />
      <span className="text-[19px] font-bold tracking-[-0.6px] text-ink">
        noni
      </span>
      <span className="flex-1" />
      {right ?? null}
    </div>
  );
}

/* The scan's one-line state, shown while other questions are answered. */
function ScanStrip({ scan, error }: { scan: IngestState | null; error: string | null }) {
  if (!scan?.ingest && !error) return null;
  const status = scan?.ingest?.status;
  const stopped = Boolean(error) || status === "failed";
  return (
    <span
      role="status"
      className={`inline-flex min-w-0 items-center gap-1.5 px-3 py-[6px] text-[12.5px] font-bold rounded-pill ${
        stopped
          ? "bg-amber-soft text-amber"
          : status === "done"
            ? "bg-green-soft text-green"
            : "bg-blue-100 text-blue-700"
      }`}
    >
      {status === "running" && !error ? (
        <Loader2 size={13} className="shrink-0 animate-spin" />
      ) : status === "done" && !error ? (
        <Check size={13} className="shrink-0" />
      ) : null}
      <span className="overflow-hidden text-ellipsis whitespace-nowrap">
        {error && !scan?.ingest ? "Scan did not start" : scanLine(scan)}
      </span>
    </span>
  );
}

/* Full-screen frame for the screens after the account questions. */
function Frame({
  children,
  width = 440,
  right,
}: {
  children: ReactNode;
  width?: number;
  right?: ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-ground font-ops">
      <TopBar right={right} />
      <div className="flex flex-1 items-start justify-center px-4 pb-[60px] pt-8 sm:px-6 sm:pt-12">
        <div className="max-w-full" style={{ width }}>
          {children}
        </div>
      </div>
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
  topRight,
}: {
  stepKey: AccountStep;
  total: number;
  title: string;
  subtitle?: string;
  children: ReactNode;
  primary?: string;
  primaryDisabled?: boolean;
  onPrimary?: () => void;
  onBack?: () => void;
  /** The scan strip, once a scan has started. */
  topRight?: ReactNode;
}) {
  const index = DASH_INDEX[stepKey];
  return (
    <div className="flex min-h-screen flex-col bg-ground font-ops">
      <TopBar right={topRight} />
      <div className="flex flex-1 items-start justify-center px-5 pb-[60px] pt-8 sm:px-6 sm:pt-12">
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
  /** The signed-in Google address; the TestFlight invite goes here. */
  email: string;
  /** Where a returning admin left off, with the answers saved so far. */
  resume?: {
    step: OnboardingStepId;
    role: string;
    doesUgc: boolean | null;
    creatorCount: number;
    managerCount: number;
    selfIsManager: boolean | null;
  };
  /** The scan as it stands, when one was started on an earlier visit. */
  initialScan?: IngestState | null;
}

export function OnboardingFlow({
  companyName,
  defaultName,
  defaultWebsite,
  email,
  resume,
  initialScan = null,
}: OnboardingFlowProps) {
  const router = useRouter();
  const [step, setStep] = useState<StepId>(resume?.step ?? "welcome");
  const [name, setName] = useState(defaultName);
  const [role, setRole] = useState(resume?.role ?? "");
  const [website, setWebsite] = useState(defaultWebsite);
  const [appStoreUrl, setAppStoreUrl] = useState("");
  const [doesUgc, setDoesUgc] = useState<boolean | null>(resume?.doesUgc ?? null);
  const [creatorCount, setCreatorCount] = useState(resume?.creatorCount ?? 0);
  const [managerCount, setManagerCount] = useState(resume?.managerCount ?? 0);
  const [selfIsManager, setSelfIsManager] = useState<boolean | null>(
    resume?.selfIsManager ?? null,
  );
  const [scan, setScan] = useState<IngestState | null>(initialScan);
  const [scanError, setScanError] = useState<string | null>(null);
  const [scanStarting, setScanStarting] = useState(false);
  /* The address the current scan was started for; a changed address scans again. */
  const [scannedSite, setScannedSite] = useState(initialScan?.ingest ? defaultWebsite.trim() : "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const total = doesUgc ? (managerCount > 0 ? 7 : 6) : 4;
  const scanStatus = scan?.ingest?.status ?? null;
  const scanRuns = scanStatus === "running";

  /* Poll the scan while it runs, whichever screen is showing. */
  useEffect(() => {
    if (!scanRuns) return;
    const id = window.setInterval(() => {
      void getBrainIngestStatus().then((result) => {
        if (result.ok) setScan(result.data);
      });
    }, POLL_MS);
    return () => window.clearInterval(id);
  }, [scanRuns]);

  function go(next: StepId) {
    setStep(next);
    rememberStep(next);
  }

  function advanceAfterPick(next: StepId) {
    window.setTimeout(() => go(next), CHOICE_ADVANCE_MS);
  }

  function startScan() {
    const site = website.trim();
    if (!site || scanStarting) return;
    setScanError(null);
    setScanStarting(true);
    void startOnboardingScan({ website: site, appStoreUrl }).then((result) => {
      setScanStarting(false);
      if (!result.ok) {
        setScanError(result.error);
        return;
      }
      setScannedSite(site);
      setScan(result.data);
    });
  }

  async function finish(href: string) {
    if (busy) return;
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
    router.push(href);
  }

  const strip = <ScanStrip scan={scan} error={scanError} />;
  /* The wait screen gives way to the survey the moment the scan is done. */
  const view: StepId = step === "scan" && scanStatus === "done" ? "survey" : step;

  if (view === "welcome") {
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
              {firstName ? `Hi ${firstName}, welcome to Noni` : "Welcome to Noni"}
            </h1>
            <Pill
              onClick={() => go("name")}
              className="mt-[28px]"
              style={{ padding: "15px 34px", fontSize: 15 }}
            >
              {`Set up ${companyName}`}
            </Pill>
          </div>
        </div>
      </div>
    );
  }

  if (view === "name") {
    return (
      <OnbStep
        stepKey="name"
        total={total}
        title="Who are you?"
        subtitle="How your team sees you inside Noni."
        primary="Next"
        primaryDisabled={!name.trim()}
        onPrimary={() => {
          void saveOnboardingProgress({ fullName: name });
          go("role");
        }}
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

  if (view === "role") {
    return (
      <OnbStep
        stepKey="role"
        total={total}
        title="What do you do?"
        subtitle="Your role at the company."
        onBack={() => go("name")}
      >
        <div className="grid grid-cols-2 gap-2.5">
          {ADMIN_ROLES.map((r) => (
            <ChoiceCard
              key={r}
              title={r}
              selected={role === r}
              onClick={() => {
                setRole(r);
                void saveOnboardingProgress({ adminRole: r });
                advanceAfterPick("website");
              }}
            />
          ))}
        </div>
      </OnbStep>
    );
  }

  if (view === "website") {
    const scanned = Boolean(scan?.ingest) && scannedSite === website.trim() && !appStoreUrl.trim();
    return (
      <OnbStep
        stepKey="website"
        total={total}
        title="What's your website?"
        primary={scanned ? "Next" : "Scan site"}
        primaryDisabled={!website.trim()}
        onPrimary={() => {
          if (!scanned) startScan();
          go("ugc");
        }}
        onBack={() => go("role")}
        topRight={strip}
      >
        <div className="flex flex-col gap-4">
          <Field
            label="Website"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            autoFocus
          />
          <Field
            label="App store link"
            value={appStoreUrl}
            onChange={(e) => setAppStoreUrl(e.target.value)}
            optional
          />
        </div>
      </OnbStep>
    );
  }

  if (view === "ugc") {
    return (
      <OnbStep
        stepKey="ugc"
        total={total}
        title="Do you already do UGC marketing?"
        onBack={() => go("website")}
        topRight={strip}
      >
        <div className="flex flex-col gap-2.5">
          <ChoiceCard
            title="Yes"
            hint="We already work with creators."
            selected={doesUgc === true}
            onClick={() => {
              setDoesUgc(true);
              void saveOnboardingProgress({ doesUgc: true });
              advanceAfterPick("creators");
            }}
          />
          <ChoiceCard
            title="Not yet"
            hint="We're starting from scratch."
            selected={doesUgc === false}
            onClick={() => {
              setDoesUgc(false);
              void saveOnboardingProgress({
                doesUgc: false,
                creatorCount: 0,
                managerCount: 0,
                selfIsManager: false,
              });
              advanceAfterPick("scan");
            }}
          />
        </div>
      </OnbStep>
    );
  }

  if (view === "creators") {
    return (
      <OnbStep
        stepKey="creators"
        total={total}
        title="How many creators do you have?"
        subtitle="You'll invite them once you're inside."
        primary={creatorCount === 0 ? "I don't have any" : "Next"}
        onPrimary={() => {
          void saveOnboardingProgress({ creatorCount });
          go("managers");
        }}
        onBack={() => go("ugc")}
        topRight={strip}
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

  if (view === "managers") {
    return (
      <OnbStep
        stepKey="managers"
        total={total}
        title="And how many campaign managers?"
        subtitle="They run weekly briefs and keep creators on pace."
        primary={managerCount === 0 ? "I don't have one" : "Next"}
        onPrimary={() => {
          void saveOnboardingProgress(
            managerCount > 0 ? { managerCount } : { managerCount, selfIsManager: false },
          );
          go(managerCount > 0 ? "selfManager" : "scan");
        }}
        onBack={() => go("creators")}
        topRight={strip}
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

  if (view === "selfManager") {
    return (
      <OnbStep
        stepKey="selfManager"
        total={total}
        title={
          managerCount === 1
            ? "Are you the campaign manager?"
            : "Are you one of the campaign managers?"
        }
        onBack={() => go("managers")}
        topRight={strip}
      >
        <div className="flex flex-col gap-2.5">
          <ChoiceCard
            title="Yes, that's me"
            selected={selfIsManager === true}
            onClick={() => {
              setSelfIsManager(true);
              void saveOnboardingProgress({ selfIsManager: true });
              advanceAfterPick("download");
            }}
          />
          <ChoiceCard
            title="No, someone else"
            selected={selfIsManager === false}
            onClick={() => {
              setSelfIsManager(false);
              void saveOnboardingProgress({ selfIsManager: false });
              advanceAfterPick("scan");
            }}
          />
        </div>
      </OnbStep>
    );
  }

  if (view === "download") {
    return (
      <OnbStep
        stepKey="download"
        total={total}
        title={
          IOS_APP_AVAILABILITY === "invite_only"
            ? "Get the Noni app to run your campaigns"
            : "Download the Noni app to run your campaigns"
        }
        subtitle={`This Google account is already set as a campaign manager for ${companyName}.`}
        topRight={strip}
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
        <div className="mt-[22px]">
          <GetTheApp
            email={email}
            name={name.trim()}
            source="onboarding"
            look="ops"
            showOpenApp={false}
            onDownload={() => go("scan")}
          />
        </div>
        <div className="mt-3 text-center">
          <button
            type="button"
            onClick={() => go("scan")}
            className="cursor-pointer border-none bg-transparent p-2 text-[13.5px] font-bold text-slate-400"
          >
            {IOS_APP_AVAILABILITY === "invite_only" ? "Next" : "I'll do this later"}
          </button>
        </div>
      </OnbStep>
    );
  }

  if (view === "scan") {
    const stopped = !scanRuns && !scanStarting;
    const failed = scan?.ingest?.progress.failed ?? [];
    return (
      <Frame>
        <div key="scan" className="animate-om-rise">
          <h1 className="m-0 text-[28px] font-bold tracking-[-0.7px] text-ink">
            {!stopped
              ? "Reading your site"
              : scan?.ingest
                ? "The scan stopped"
                : "The scan did not start"}
          </h1>
          {stopped ? (
            <p className="mb-0 mt-[9px] text-[14.5px] font-semibold leading-[1.55] text-danger">
              {scanError ?? scan?.ingest?.error ?? ""}
            </p>
          ) : (
            <>
              {scan && scan.summary.sources > 0 ? (
                <p className="mb-0 mt-[9px] text-[14.5px] font-semibold text-slate-400">
                  {`${scan.summary.sources} ${scan.summary.sources === 1 ? "source" : "sources"} · ${scan.summary.facts} ${scan.summary.facts === 1 ? "fact" : "facts"}`}
                </p>
              ) : null}
              <ul className="m-0 mt-[26px] flex list-none flex-col gap-3 p-0">
                {scanSteps(scan?.ingest ?? null).map((s) => (
                  <li key={s.label} className="flex items-center gap-3">
                    <span
                      className={`inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-pill ${
                        s.state === "done"
                          ? "bg-green-soft text-green"
                          : s.state === "active"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-fill-quiet text-slate-300"
                      }`}
                    >
                      {s.state === "done" ? (
                        <Check size={13} />
                      ) : s.state === "active" ? (
                        <Loader2 size={13} className="animate-spin" />
                      ) : null}
                    </span>
                    <span
                      className={`text-[14.5px] font-bold ${
                        s.state === "waiting" ? "text-slate-400" : "text-ink"
                      }`}
                    >
                      {s.label}
                    </span>
                  </li>
                ))}
              </ul>
            </>
          )}
          {failed.length > 0 ? (
            <ul className="m-0 mt-4 list-none p-0">
              {failed.map((f) => (
                <li key={f.input} className="text-[13px] font-semibold leading-[1.6] text-amber">
                  {`${failedInputLabel(f.input)} could not be read`}
                </li>
              ))}
            </ul>
          ) : null}
          {stopped ? (
            <Pill
              onClick={startScan}
              className="mt-[26px] w-full"
              style={{ padding: "15px 22px", fontSize: 15 }}
            >
              Scan again
            </Pill>
          ) : null}
          <div className="mt-3 text-center">
            <button
              type="button"
              onClick={() => go("survey")}
              className="cursor-pointer border-none bg-transparent p-2 text-[13.5px] font-bold text-slate-400"
            >
              {stopped ? "Answer questions without it" : "Answer questions now"}
            </button>
          </div>
        </div>
      </Frame>
    );
  }

  const exit = (
    <>
      {error ? (
        <p className="mb-3 mt-0 text-[13px] font-semibold text-danger">{error}</p>
      ) : null}
      <Pill
        onClick={() => void finish("/admin?tour=1")}
        disabled={busy}
        className="w-full"
        style={{ padding: "15px 22px", fontSize: 15 }}
      >
        {busy ? "Saving…" : "Look around"}
      </Pill>
      <div className="mt-3 text-center">
        <button
          type="button"
          onClick={() => void finish("/admin/brain")}
          className="cursor-pointer border-none bg-transparent p-2 text-[13.5px] font-bold text-slate-400"
        >
          Open Company Brain
        </button>
      </div>
    </>
  );

  return (
    <Frame width={540} right={scanRuns ? strip : undefined}>
      <BrainSurvey
        renderDone={() => exit}
        fallback={
          <>
            <Pill variant="quiet" disabled={busy} onClick={() => void finish("/admin?tour=1")}>
              {busy ? "Saving…" : "Finish setup"}
            </Pill>
            {error ? (
              <span className="basis-full text-[13px] font-semibold text-danger">{error}</span>
            ) : null}
          </>
        }
      />
    </Frame>
  );
}
