"use client";

import { FormEvent, useState, useTransition } from "react";
import { createCompany } from "@/app/ops/actions";

export function NewCompanyForm() {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [website, setWebsite] = useState("");

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await createCompany({
        name,
        website: website.trim() ? website.trim() : null,
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
