"use client";

import { FormEvent, useState } from "react";
import { completeOnboarding } from "./actions";

const inputClass =
  "w-full rounded-xl border border-line bg-white px-4 py-3 text-[15px] text-ink placeholder:text-muted/60 outline-none transition focus:border-accent";

export function OnboardingForm({
  defaultName,
  defaultCompanyName,
  defaultWebsite,
}: {
  defaultName: string;
  defaultCompanyName: string;
  defaultWebsite: string;
}) {
  const [fullName, setFullName] = useState(defaultName);
  const [phone, setPhone] = useState("");
  const [companyName, setCompanyName] = useState(defaultCompanyName);
  const [website, setWebsite] = useState(defaultWebsite);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const result = await completeOnboarding({ fullName, phone, companyName, website });
    // completeOnboarding redirects on success; a return value is always an error.
    setBusy(false);
    setError(result.error);
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label className="mb-1.5 block text-[13px] font-semibold text-ink">
          Your name
        </label>
        <input
          required
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="First and last name"
          autoComplete="name"
          className={inputClass}
        />
      </div>
      <div>
        <label className="mb-1.5 block text-[13px] font-semibold text-ink">
          Phone number
        </label>
        <input
          required
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="+1 555 555 5555"
          autoComplete="tel"
          className={inputClass}
        />
      </div>
      <div>
        <label className="mb-1.5 block text-[13px] font-semibold text-ink">
          Company name
        </label>
        <input
          required
          value={companyName}
          onChange={(e) => setCompanyName(e.target.value)}
          placeholder="Company"
          className={inputClass}
        />
      </div>
      <div>
        <label className="mb-1.5 block text-[13px] font-semibold text-ink">
          Company website
        </label>
        <input
          type="url"
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
          placeholder="https://example.com"
          className={inputClass}
        />
      </div>
      {error ? (
        <p className="rounded-xl bg-red-50 px-3.5 py-2.5 text-[13px] font-medium text-red-600">
          {error}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={busy}
        className="w-full rounded-full bg-ink px-5 py-3 text-[15px] font-bold text-white transition hover:bg-ink/90 disabled:opacity-50"
      >
        {busy ? "Saving…" : "Enter your dashboard"}
      </button>
    </form>
  );
}
