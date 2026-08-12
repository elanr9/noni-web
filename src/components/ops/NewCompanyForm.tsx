"use client";

import { FormEvent, useState, useTransition } from "react";
import { createCompany } from "@/app/ops/actions";

export function NewCompanyForm() {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [website, setWebsite] = useState("");
  const [adminEmail, setAdminEmail] = useState("");

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await createCompany({
        name,
        website: website.trim() ? website.trim() : null,
        adminEmail,
      });
      if (!result.ok) setError(result.error);
    });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <input
        type="text"
        required
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Company name"
        className="w-full rounded-2xl border border-line bg-white px-4 py-3.5 text-[15px] outline-none ring-accent/30 focus:ring-4"
      />
      <input
        type="url"
        value={website}
        onChange={(e) => setWebsite(e.target.value)}
        placeholder="Website (optional)"
        className="w-full rounded-2xl border border-line bg-white px-4 py-3.5 text-[15px] outline-none ring-accent/30 focus:ring-4"
      />
      <input
        type="email"
        required
        value={adminEmail}
        onChange={(e) => setAdminEmail(e.target.value)}
        placeholder="Company admin's email"
        className="w-full rounded-2xl border border-line bg-white px-4 py-3.5 text-[15px] outline-none ring-accent/30 focus:ring-4"
      />
      <p className="text-[12px] text-muted">
        They get an email invite to set up the company on usenoni.app.
      </p>
      {error ? <p className="text-sm font-medium text-red-600">{error}</p> : null}
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-full bg-ink px-5 py-3.5 text-[15px] font-bold text-white disabled:opacity-50"
      >
        {pending ? "Creating…" : "Create company"}
      </button>
    </form>
  );
}
