"use client";

import { Check, Mail } from "lucide-react";
import { useState } from "react";

import { submitLead } from "@/lib/leads";
import { IOS_APP_AVAILABILITY, IOS_APP_URL } from "@/lib/site-config";

/* "Get the app" block for invitees and onboarding. Reads the one app link
   config (NEXT_PUBLIC_IOS_APP_URL in @/lib/site-config) and works in all
   three launch states:
   - app_store: a public App Store listing exists, link straight to it.
   - testflight: a public TestFlight link exists; explain the two-app dance.
   - invite_only: no public link yet. Noni emails a TestFlight invite, and
     the person can ask for it here so the request lands in public.leads. */

/* Apple's own TestFlight app listing, needed before any beta installs. */
const TESTFLIGHT_APP_URL = "https://apps.apple.com/app/testflight/id899247664";

type Look = "site" | "ops";

const PRIMARY: Record<Look, string> = {
  site: "inline-flex w-full items-center justify-center rounded-full bg-ink px-6 py-3.5 text-[15px] font-bold text-white no-underline transition hover:bg-ink-soft disabled:cursor-default disabled:opacity-60",
  ops: "flex w-full items-center justify-center rounded-pill bg-blue-500 px-[22px] py-[15px] text-[15px] font-bold text-white no-underline shadow-accent disabled:cursor-default disabled:opacity-60",
};

const SECONDARY: Record<Look, string> = {
  site: "inline-flex w-full items-center justify-center rounded-full border border-line bg-white px-6 py-3.5 text-[15px] font-bold text-ink no-underline transition hover:bg-soft",
  ops: "flex w-full items-center justify-center rounded-pill border border-line bg-white px-[22px] py-[13px] text-[14px] font-bold text-ink no-underline transition-colors hover:bg-fill-quiet",
};

function Steps({ items }: { items: React.ReactNode[] }) {
  return (
    <ol className="m-0 flex list-none flex-col gap-2.5 p-0 text-left">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-2.5 text-[13.5px] font-semibold leading-[1.5] text-ink">
          <span className="mt-px inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-100 text-[11.5px] font-bold text-blue-700">
            {i + 1}
          </span>
          <span>{item}</span>
        </li>
      ))}
    </ol>
  );
}

export function GetTheApp({
  email,
  name,
  source,
  look = "site",
  showOpenApp = true,
  onDownload,
}: {
  /** The address the person signs in with; their TestFlight invite goes here. */
  email: string;
  name?: string;
  /** Stored with a TestFlight request, e.g. "invite" or "onboarding". */
  source: string;
  look?: Look;
  /** Offer the noni:// deep link for people who already have the app. */
  showOpenApp?: boolean;
  /** Called after the primary download link opens. */
  onDownload?: () => void;
}) {
  const [requesting, setRequesting] = useState(false);
  const [requested, setRequested] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const who = <span className="font-bold">{email || "your email"}</span>;

  const requestInvite = async () => {
    if (requesting || requested) return;
    setRequesting(true);
    setError(null);
    const result = await submitLead({ kind: "testflight", name: name ?? "", email, source });
    setRequesting(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setRequested(true);
  };

  const openApp = showOpenApp ? (
    <a href="noni://" className={SECONDARY[look]}>
      Already have the app? Open it
    </a>
  ) : null;

  if (IOS_APP_AVAILABILITY === "app_store" && IOS_APP_URL) {
    return (
      <div className="flex flex-col gap-3">
        <a
          href={IOS_APP_URL}
          target="_blank"
          rel="noreferrer"
          onClick={onDownload}
          className={PRIMARY[look]}
        >
          Download on the App Store
        </a>
        {openApp}
        <p className="m-0 text-center text-[12.5px] font-semibold text-slate-400">
          Sign in with {who} and Noni puts you in the right place.
        </p>
      </div>
    );
  }

  if (IOS_APP_AVAILABILITY === "testflight" && IOS_APP_URL) {
    return (
      <div className="flex flex-col gap-3">
        <div className="rounded-[16px] border border-line bg-off-white p-4">
          <p className="m-0 mb-3 text-left text-[12.5px] font-bold uppercase tracking-[0.4px] text-slate-400">
            Noni is in beta on iPhone
          </p>
          <Steps
            items={[
              <>
                Install{" "}
                <a
                  href={TESTFLIGHT_APP_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="font-bold text-blue-700 underline-offset-2 hover:underline"
                >
                  TestFlight
                </a>{" "}
                from the App Store.
              </>,
              <>Open the beta link below on your iPhone and tap Install.</>,
              <>Open Noni and sign in with {who}.</>,
            ]}
          />
        </div>
        <a
          href={IOS_APP_URL}
          target="_blank"
          rel="noreferrer"
          onClick={onDownload}
          className={PRIMARY[look]}
        >
          Get the beta on TestFlight
        </a>
        {openApp}
      </div>
    );
  }

  /* invite_only: no public link configured yet. */
  return (
    <div className="flex flex-col gap-3">
      <div className="rounded-[16px] border border-line bg-off-white p-4">
        <p className="m-0 mb-3 flex items-center gap-2 text-left text-[12.5px] font-bold uppercase tracking-[0.4px] text-slate-400">
          <Mail size={14} /> We&apos;ll send you a TestFlight invite
        </p>
        <Steps
          items={[
            <>Noni is in private beta on iPhone. Your invite goes to {who}.</>,
            <>Open the email from TestFlight on your iPhone, install TestFlight, then tap Accept and Install.</>,
            <>Open Noni and sign in with {who}.</>,
          ]}
        />
      </div>
      {requested ? (
        <p
          role="status"
          className="m-0 flex items-center justify-center gap-2 rounded-full bg-green-soft px-4 py-3 text-[13.5px] font-bold text-green"
        >
          <Check size={15} /> Request sent. Watch {email || "your inbox"} for TestFlight.
        </p>
      ) : (
        <button
          type="button"
          disabled={requesting || !email}
          onClick={() => void requestInvite()}
          className={`${PRIMARY[look]} cursor-pointer border-none`}
        >
          {requesting ? "Sending request…" : "Request my TestFlight invite"}
        </button>
      )}
      {error ? (
        <p role="alert" className="m-0 text-center text-[13px] font-semibold text-danger">
          {error}
        </p>
      ) : null}
      {openApp}
    </div>
  );
}
