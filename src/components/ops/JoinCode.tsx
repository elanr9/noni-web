"use client";

import { useState, useTransition } from "react";
import { regenerateJoinCode } from "@/app/ops/actions";

type JoinCodeProps = {
  companyId: string;
  code: string;
  /** Show the regenerate action (company detail page only). */
  canRegenerate?: boolean;
};

export function JoinCode({ companyId, code, canRegenerate = false }: JoinCodeProps) {
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function onCopy(event: React.MouseEvent<HTMLButtonElement>) {
    // Cards on the companies list wrap this component in a Link.
    event.preventDefault();
    event.stopPropagation();
    void navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }

  function onRegenerate() {
    setError(null);
    startTransition(async () => {
      const result = await regenerateJoinCode({ companyId });
      if (!result.ok) setError(result.error);
    });
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="rounded-lg bg-soft px-3 py-1 font-mono text-sm font-bold tracking-[0.2em] text-ink">
        {code}
      </span>
      <button
        type="button"
        onClick={onCopy}
        className="rounded-full border border-line bg-white px-3 py-1 text-xs font-bold text-ink transition hover:border-ink/20"
      >
        {copied ? "Copied" : "Copy"}
      </button>
      {canRegenerate ? (
        <button
          type="button"
          disabled={pending}
          onClick={onRegenerate}
          className="rounded-full border border-line bg-white px-3 py-1 text-xs font-bold text-ink transition hover:border-ink/20 disabled:opacity-50"
        >
          {pending ? "Regenerating…" : "Regenerate code"}
        </button>
      ) : null}
      {error ? (
        <span className="text-xs font-medium text-red-600">{error}</span>
      ) : null}
    </div>
  );
}
