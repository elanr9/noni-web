"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { acceptInvite } from "./actions";

export function AcceptInvite({
  token,
  email,
  role,
}: {
  token: string;
  email: string;
  role: "company_admin" | "campaign_manager";
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [accepted, setAccepted] = useState(false);

  const isAdmin = role === "company_admin";

  function onAccept() {
    setError(null);
    startTransition(async () => {
      const result = await acceptInvite(token);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setAccepted(true);
    });
  }

  if (accepted) {
    return (
      <div className="text-center">
        <h1 className="display text-3xl font-semibold text-ink">You are in</h1>
        <p className="mt-3 text-[15px] text-muted">
          {isAdmin
            ? "Your account now runs this company. Finish a short onboarding to enter your dashboard."
            : "Your account is now a campaign manager for this company. Open the Noni app to get to work."}
        </p>
        {isAdmin ? (
          <Link
            href="/onboarding"
            className="mt-6 inline-flex rounded-full bg-ink px-5 py-3 text-sm font-bold text-white"
          >
            Continue to onboarding
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
        You are invited
      </h1>
      <p className="mt-3 text-[15px] text-muted">
        You have been invited to {isAdmin ? "run" : "manage campaigns for"} a company
        on Noni. You are signed in as{" "}
        <span className="font-semibold text-ink">{email}</span>. Accepting makes this
        account the company&apos;s {isAdmin ? "admin" : "campaign manager"}.
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
