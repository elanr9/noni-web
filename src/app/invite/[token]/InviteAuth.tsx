"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { Card, Label, Pill } from "@/components/kit";
import { acceptInvite, continueInvite } from "./actions";

/* Company-admin invite screens: the landing, where Continue signs them in
   from the invite link itself (no Google, no password), and the
   wrong-account gate, which signs in as the invited address instead. */

function InviteShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-ground font-ops">
      <div className="flex shrink-0 items-center gap-[9px] px-7 py-[22px]">
        <Image src="/brand/noni-logo.svg" alt="" width={28} height={28} />
        <span className="text-[19px] font-bold tracking-[-0.6px] text-ink">
          noni
        </span>
      </div>
      <div className="flex flex-1 items-center justify-center px-6 pb-[60px]">
        <Card pad={36} className="w-[420px] max-w-full animate-om-pop text-center">
          {children}
        </Card>
      </div>
    </div>
  );
}

export function AdminInviteLanding({
  token,
  companyName,
  invitedEmail,
}: {
  token: string;
  companyName: string;
  invitedEmail: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onContinue() {
    setBusy(true);
    setError(null);
    const r = await continueInvite(token);
    if (!r.ok) {
      setBusy(false);
      setError(r.error);
      return;
    }
    router.replace(`/invite/${token}/accept`);
    router.refresh();
  }

  return (
    <InviteShell>
      <Image src="/brand/noni-logo.svg" alt="" width={46} height={46} className="mx-auto block" />
      <h1 className="mb-0 mt-5 text-[25px] font-bold tracking-[-0.6px] text-ink">{`${companyName} on Noni`}</h1>
      <button
        type="button"
        disabled={busy}
        onClick={() => void onContinue()}
        className="mt-6 flex w-full cursor-pointer items-center justify-center rounded-pill border-none bg-ink px-5 py-3.5 text-[14.5px] font-bold text-white transition-[transform,opacity] duration-150 active:scale-[0.98] disabled:opacity-60"
      >
        {busy ? "One sec…" : "Continue"}
      </button>
      {error ? <p className="mb-0 mt-3 text-[12.5px] font-semibold text-danger">{error}</p> : null}
      <p className="mb-0 mt-4 text-[12.5px] font-semibold leading-normal text-slate-400">{invitedEmail}</p>
    </InviteShell>
  );
}

/* One accept attempt per token per page load; survives Strict Mode's
   double-run of effects in dev. */
const startedTokens = new Set<string>();

export function AdminInviteGate({
  token,
  companyName,
  invitedEmail,
  currentEmail,
}: {
  token: string;
  companyName: string;
  invitedEmail: string;
  currentEmail: string;
}) {
  const router = useRouter();
  const wrongAccount =
    invitedEmail.trim().toLowerCase() !== currentEmail.trim().toLowerCase();
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (wrongAccount || startedTokens.has(token)) return;
    startedTokens.add(token);
    void (async () => {
      const result = await acceptInvite(token);
      if (!result.ok) {
        startedTokens.delete(token);
        setError(result.error);
        return;
      }
      /* Onboarding for a company still to be set up, its dashboard when it
         already is. */
      router.replace(result.destination ?? "/dash");
      router.refresh();
    })();
  }, [attempt, router, token, wrongAccount]);

  async function onSwitch() {
    setError(null);
    const r = await continueInvite(token);
    if (!r.ok) {
      setError(r.error);
      return;
    }
    router.refresh();
  }

  if (wrongAccount) {
    return (
      <InviteShell>
        <Label className="block">Wrong account</Label>
        <h1 className="mb-0 mt-2 text-[25px] font-bold tracking-[-0.6px] text-ink">
          This invite was sent to another address
        </h1>
        <p className="mb-0 mt-3 text-[13.5px] font-semibold leading-[1.55] text-slate-400">
          The invite to run {companyName} was sent to{" "}
          <span className="text-ink">{invitedEmail}</span>. You are signed in
          as <span className="text-ink">{currentEmail}</span>.
        </p>
        <Pill className="mt-6 w-full" onClick={() => void onSwitch()}>
          {`Continue as ${invitedEmail}`}
        </Pill>
        {error ? (
          <p className="mb-0 mt-3 text-[12.5px] font-semibold text-danger">
            {error}
          </p>
        ) : null}
      </InviteShell>
    );
  }

  return (
    <InviteShell>
      <Label className="block">{"You're invited"}</Label>
      <h1 className="mb-0 mt-2 text-[25px] font-bold tracking-[-0.6px] text-ink">
        {error ? "Something went wrong" : `Setting up ${companyName}…`}
      </h1>
      {error ? (
        <>
          <p className="mb-0 mt-3 text-[13.5px] font-semibold leading-[1.55] text-danger">
            {error}
          </p>
          <Pill
            className="mt-5"
            onClick={() => {
              setError(null);
              setAttempt((n) => n + 1);
            }}
          >
            Try again
          </Pill>
        </>
      ) : (
        <p className="mb-0 mt-3 text-[13.5px] font-semibold leading-[1.55] text-slate-400">
          Any companies you already work with stay on your account.
        </p>
      )}
    </InviteShell>
  );
}
