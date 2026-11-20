"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { acceptInvite } from "./actions";

const ALREADY_MEMBER = /already a member/i;

type InviteRole = "company_admin" | "campaign_manager" | "creator";

function friendlyError(
  raw: string,
  email: string,
  invitedEmail: string,
  companyName: string,
): string {
  if (ALREADY_MEMBER.test(raw)) {
    return `${email} is already part of ${companyName}. Open the Noni app or your dashboard and switch to it from the company menu.`;
  }
  switch (raw) {
    case "sign in with the email address the invite was sent to":
      return `This invite was sent to ${invitedEmail}. Sign in with that email (Google, or Apple sharing that email) to accept it.`;
    case "invite already accepted":
      return "This invite was already used.";
    case "invite expired":
      return "This invite has expired. Ask your company to send a new one.";
    case "this company already has an admin":
      return "This company already has an admin.";
    case "platform admin cannot accept invites":
      return "The Noni platform account cannot join companies.";
    default:
      return raw;
  }
}

export function AcceptInvite({
  token,
  email,
  invitedEmail,
  role,
  companyName = "this company",
  hasOtherCompany = false,
}: {
  token: string;
  email: string;
  /** Address the invite was sent to; shown when the signed in account differs. */
  invitedEmail: string;
  role: InviteRole;
  companyName?: string;
  /** The account already works for a different company; accepting adds
      this one, keeps the others and makes this one the active company. */
  hasOtherCompany?: boolean;
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [accepted, setAccepted] = useState<{
    destination: string | null;
    switched: boolean;
  } | null>(null);

  const isAdmin = role === "company_admin";
  const isCreator = role === "creator";

  function onAccept() {
    setError(null);
    startTransition(async () => {
      const result = await acceptInvite(token);
      if (!result.ok) {
        setError(friendlyError(result.error, email, invitedEmail, companyName));
        return;
      }
      setAccepted({ destination: result.destination, switched: result.switched });
    });
  }

  if (accepted) {
    return (
      <div className="text-center">
        <h1 className="display text-3xl font-semibold text-ink">You are in</h1>
        <p className="mt-3 text-[15px] text-muted">
          {!accepted.switched
            ? `${companyName} was added to your account. Pick it from the company menu to start working in it.`
            : isAdmin
              ? accepted.destination === "/onboarding"
                ? `Your account now runs ${companyName}. Finish a short onboarding to enter your dashboard.`
                : `Your account now runs ${companyName}.`
              : isCreator
                ? `${companyName} was added and is now your active company. Open the Noni app to see your briefs.`
                : hasOtherCompany
                  ? `${companyName} was added to your account and is now your active company. Your other companies stay in the company menu.`
                  : `Your account is now a campaign manager for ${companyName}. Open the Noni app to get to work.`}
        </p>
        {accepted.destination === "/onboarding" ? (
          <Link
            href="/onboarding"
            className="mt-6 inline-flex rounded-full bg-ink px-5 py-3 text-sm font-bold text-white"
          >
            Continue to onboarding
          </Link>
        ) : accepted.destination && (isAdmin || hasOtherCompany || !accepted.switched) ? (
          <Link
            href={accepted.destination}
            className="mt-6 inline-flex rounded-full bg-ink px-5 py-3 text-sm font-bold text-white"
          >
            Go to my dashboard
          </Link>
        ) : (
          <a
            href="noni://"
            className="mt-6 inline-flex rounded-full bg-ink px-5 py-3 text-sm font-bold text-white"
          >
            Open the Noni app
          </a>
        )}
      </div>
    );
  }

  return (
    <div className="text-center">
      <h1 className="display text-3xl font-semibold text-ink">
        {isCreator ? `You are invited to create for ${companyName}` : "You are invited"}
      </h1>
      <p className="mt-3 text-[15px] text-muted">
        {isCreator ? (
          <>
            You are signed in as{" "}
            <span className="font-semibold text-ink">{email}</span>. Accepting
            adds {companyName} to your Noni account. You keep any other
            companies you already create for and can switch between them in
            the app.
          </>
        ) : (
          <>
            You have been invited to {isAdmin ? "run" : "manage campaigns for"}{" "}
            {companyName} on Noni. You are signed in as{" "}
            <span className="font-semibold text-ink">{email}</span>.{" "}
            {hasOtherCompany
              ? `Accepting adds ${companyName} to this account and opens it. You keep your other companies and can switch between them at any time.`
              : `Accepting makes this account ${isAdmin ? "the company admin" : "a campaign manager"} for ${companyName}.`}
          </>
        )}
      </p>
      {error ? (
        <p className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      ) : null}
      <button
        type="button"
        disabled={pending}
        onClick={onAccept}
        className="mt-6 inline-flex rounded-full bg-ink px-6 py-3.5 text-[15px] font-bold text-white disabled:opacity-50"
      >
        {pending ? "Accepting…" : "Accept invite"}
      </button>
    </div>
  );
}
