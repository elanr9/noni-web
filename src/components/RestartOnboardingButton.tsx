"use client";

import { RotateCcw } from "lucide-react";
import { useState } from "react";

import { restartOnboarding } from "@/app/onboarding/actions";

/* Testing only (allowlisted accounts): wipes this company's onboarding and
   scan, then opens onboarding fresh. Asks once more before it wipes. */
export function RestartOnboardingButton({ variant = "menu" }: { variant?: "menu" | "pill" }) {
  const [armed, setArmed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const run = async () => {
    if (!armed) {
      setArmed(true);
      window.setTimeout(() => setArmed(false), 4000);
      return;
    }
    setBusy(true);
    setError(null);
    const r = await restartOnboarding();
    if (!r.ok) {
      setBusy(false);
      setError(r.error);
      return;
    }
    /* A full load, so nothing from the old run is left in memory. */
    window.location.assign("/onboarding");
  };

  const label = busy ? "Restarting…" : armed ? "Tap again to wipe and restart" : "Restart onboarding";

  if (variant === "pill") {
    return (
      <button
        type="button"
        onClick={() => void run()}
        disabled={busy}
        title={error ?? "Testing: start onboarding over"}
        className={`inline-flex cursor-pointer items-center gap-1.5 rounded-full border px-3 py-1.5 text-[12.5px] font-bold transition-colors disabled:opacity-60 ${
          armed ? "border-danger bg-danger text-white" : "border-line bg-white text-slate-500 hover:text-ink"
        }`}
      >
        <RotateCcw size={13} />
        {error ? "Could not restart" : label}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={() => void run()}
      disabled={busy}
      className={`flex w-full cursor-pointer items-center gap-2.5 rounded-[11px] border-none px-2.5 py-2 text-left text-[12.5px] font-bold disabled:opacity-50 ${
        armed ? "bg-red-50 text-red-600" : "bg-transparent text-slate-500 hover:bg-fill-quiet"
      }`}
    >
      <span className="inline-flex h-7 w-7 items-center justify-center rounded-pill bg-fill-quiet">
        <RotateCcw size={14} className={armed ? "text-red-600" : "text-slate-500"} />
      </span>
      {error ?? label}
    </button>
  );
}
