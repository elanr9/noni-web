"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { acceptInvite } from "./actions";

export function AcceptInvite({ token, email }: { token: string; email: string }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [accepted, setAccepted] = useState(false);

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
          Your account is now a campaign manager for this company.
        </p>
        <Link
          href="/admin"
          className="mt-6 inline-flex rounded-full bg-ink px-5 py-3 text-sm font-bold text-white"
        >
          Go to your dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="text-center">
      <h1 className="display text-3xl font-semibold text-ink">
        You are invited
      </h1>
      <p className="mt-3 text-[15px] text-muted">
        You have been invited to manage a company on Noni. You are signed in as{" "}
        <span className="font-semibold text-ink">{email}</span>. Accepting makes this
        account a campaign manager for that company.
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
