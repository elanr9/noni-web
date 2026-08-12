"use client";

import { useState, useTransition } from "react";
import { Check, Copy, RefreshCw } from "lucide-react";
import { regenerateJoinCode } from "./actions";

export function CodePanel({ initialCode }: { initialCode: string }) {
  const [code, setCode] = useState(initialCode);
  const [copied, setCopied] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  async function copy() {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  }

  function regenerate() {
    setConfirming(false);
    setError(null);
    startTransition(async () => {
      const result = await regenerateJoinCode();
      if (result.ok) setCode(result.code);
      else setError(result.error);
    });
  }

  return (
    <div className="rounded-[28px] border border-line bg-white p-8 text-center">
      <div className="text-[12px] font-semibold uppercase tracking-[0.16em] text-muted">
        Your company code
      </div>
      <div className="display mt-3 text-6xl font-semibold tracking-[0.18em] text-ink">
        {code}
      </div>
      <p className="mx-auto mt-3 max-w-sm text-[14px] text-muted">
        Creators enter this code in the Noni app to join your company. Share it
        anywhere you recruit.
      </p>

      <div className="mt-6 flex items-center justify-center gap-3">
        <button
          type="button"
          onClick={() => void copy()}
          className="inline-flex items-center gap-2 rounded-full bg-ink px-5 py-2.5 text-sm font-bold text-white transition hover:bg-ink/90"
        >
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          {copied ? "Copied" : "Copy code"}
        </button>
        <button
          type="button"
          disabled={pending}
          onClick={() => setConfirming(true)}
          className="inline-flex items-center gap-2 rounded-full border border-line bg-white px-5 py-2.5 text-sm font-semibold text-ink transition hover:bg-soft disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${pending ? "animate-spin" : ""}`} />
          Regenerate
        </button>
      </div>

      {confirming ? (
        <div className="mx-auto mt-5 max-w-sm rounded-2xl border border-line bg-soft p-4 text-left">
          <p className="text-[14px] font-semibold text-ink">Regenerate the code?</p>
          <p className="mt-1 text-[13px] text-muted">
            The old code stops working immediately. Creators who already joined keep
            their access; anyone holding the old code will need the new one.
          </p>
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              onClick={regenerate}
              className="rounded-full bg-ink px-4 py-2 text-[13px] font-bold text-white"
            >
              Yes, regenerate
            </button>
            <button
              type="button"
              onClick={() => setConfirming(false)}
              className="rounded-full border border-line bg-white px-4 py-2 text-[13px] font-semibold text-ink"
            >
              Keep current code
            </button>
          </div>
        </div>
      ) : null}

      {error ? (
        <p className="mt-4 text-[13px] font-medium text-red-600">{error}</p>
      ) : null}
    </div>
  );
}
