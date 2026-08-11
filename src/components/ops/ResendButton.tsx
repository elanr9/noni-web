"use client";

import { useState, useTransition } from "react";
import { resendInvite } from "@/app/ops/actions";

export function ResendButton({ inviteId }: { inviteId: string }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  function onClick() {
    setError(null);
    setSent(false);
    startTransition(async () => {
      const result = await resendInvite({ inviteId });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setSent(true);
    });
  }

  return (
    <div className="flex items-center gap-3">
      {error ? <span className="text-sm font-medium text-red-600">{error}</span> : null}
      {sent ? (
        <span className="text-sm font-medium text-[#1F8F5F]">Sent</span>
      ) : null}
      <button
        type="button"
        disabled={pending}
        onClick={onClick}
        className="rounded-full border border-line bg-white px-4 py-2 text-sm font-bold text-ink transition hover:border-ink/20 disabled:opacity-50"
      >
        {pending ? "Sending…" : "Resend"}
      </button>
    </div>
  );
}
