"use client";

import { FormEvent, useState, useTransition } from "react";
import { inviteCampaignManager } from "@/app/ops/actions";

export function InviteForm({ companyId }: { companyId: string }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [email, setEmail] = useState("");

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSent(false);
    startTransition(async () => {
      const result = await inviteCampaignManager({ companyId, email });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setSent(true);
      setEmail("");
    });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email address"
        className="w-full rounded-2xl border border-line bg-white px-4 py-3.5 text-[15px] outline-none ring-accent/30 focus:ring-4"
      />
      {error ? <p className="text-sm font-medium text-red-600">{error}</p> : null}
      {sent ? (
        <p className="text-sm font-medium text-[#1F8F5F]">Invite sent.</p>
      ) : null}
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-full bg-ink px-5 py-3.5 text-[15px] font-bold text-white disabled:opacity-50"
      >
        {pending ? "Sending…" : "Send invite"}
      </button>
    </form>
  );
}
