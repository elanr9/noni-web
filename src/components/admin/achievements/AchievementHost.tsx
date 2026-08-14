"use client";

import { CircleCheckBig, Sparkles } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";

import { Label } from "@/components/kit";
import type { SetupStepKey } from "@/lib/admin/setup";

/* Achievement toasts (AchievementToast in AdminSetupApp.jsx): a bottom
   center pill that fires once per setup step completion plus a final
   "{Company} is fully set up". Fired state persists in localStorage keyed
   by company id so a toast never repeats, even across sessions. */

export interface AchievementStep {
  key: SetupStepKey;
  done: boolean;
  /** Setup row title; it names the count only when more than one is required. */
  title: string;
}

interface Toast {
  id: string;
  title: string;
  final: boolean;
}

const FINAL_KEY = "final";

function storageKey(companyId: string): string {
  return `noni-admin-achievements:${companyId || "unknown"}`;
}

/** null means this browser has never seen the company's setup state. */
function readFired(key: string): Set<string> | null {
  try {
    const raw = window.localStorage.getItem(key);
    if (raw === null) return null;
    const parsed: unknown = JSON.parse(raw);
    return new Set(
      Array.isArray(parsed)
        ? parsed.filter((v): v is string => typeof v === "string")
        : [],
    );
  } catch {
    return new Set<string>();
  }
}

function writeFired(key: string, fired: Set<string>): void {
  try {
    window.localStorage.setItem(key, JSON.stringify([...fired]));
  } catch {
    /* Private mode: toasts still fire once per mount, just not persisted. */
  }
}

function toastTitle(step: AchievementStep): string {
  switch (step.key) {
    case "brain":
      return "Company brain filled in";
    case "billing":
      return "Budget and subscription set";
    case "managers":
      return "Campaign manager invited";
    case "creators":
      return "First creator invited";
  }
}

function AchievementToast({ toast, onDone }: { toast: Toast; onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 3400);
    return () => clearTimeout(t);
  }, [toast.id, onDone]);

  /* Portal to document.body: the page container animates with a transform,
     which would otherwise trap this position:fixed pill. */
  return createPortal(
    <div className="fixed bottom-7 left-1/2 z-[140] flex -translate-x-1/2 items-center gap-[13px] whitespace-nowrap border border-line bg-white py-3 pl-[13px] pr-[22px] shadow-raised rounded-pill animate-om-pop">
      <span
        className={`inline-flex h-[38px] w-[38px] items-center justify-center rounded-pill ${
          toast.final ? "bg-blue-100" : "bg-green-soft"
        }`}
      >
        {toast.final ? (
          <Sparkles size={17} className="text-blue-700" />
        ) : (
          <CircleCheckBig size={17} className="text-green" />
        )}
      </span>
      <span>
        <Label className="block">{toast.final ? "Setup complete" : "Step done"}</Label>
        <span className="mt-0.5 block text-[14.5px] font-bold text-ink">
          {toast.title}
        </span>
      </span>
    </div>,
    document.body,
  );
}

export function AchievementHost({
  companyId,
  companyName,
  steps,
  complete,
}: {
  companyId: string;
  companyName: string;
  steps: AchievementStep[];
  complete: boolean;
}) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    const key = storageKey(companyId);
    const fired = readFired(key);

    if (fired === null) {
      /* First visit: seed already-done steps without toasting. The
         prototype only toasts on transitions, never for the initial
         state. */
      const seed = new Set<string>();
      for (const s of steps) if (s.done) seed.add(s.key);
      if (complete) seed.add(FINAL_KEY);
      writeFired(key, seed);
      return;
    }

    const queue: Toast[] = [];
    for (const s of steps) {
      if (s.done && !fired.has(s.key)) {
        fired.add(s.key);
        queue.push({ id: s.key, title: toastTitle(s), final: false });
      }
    }
    if (complete && !fired.has(FINAL_KEY)) {
      fired.add(FINAL_KEY);
      queue.push({
        id: FINAL_KEY,
        title: `${companyName} is fully set up`,
        final: true,
      });
    }
    if (queue.length === 0) return;
    writeFired(key, fired);
    /* Deferred so the effect body only syncs the external store; the pill
       pops in right after paint. */
    const timer = setTimeout(() => setToasts((t) => [...t, ...queue]), 0);
    return () => clearTimeout(timer);
  }, [steps, complete, companyId, companyName]);

  const dismiss = useCallback(() => setToasts((t) => t.slice(1)), []);
  const current = toasts[0];
  if (!current) return null;

  return <AchievementToast key={current.id} toast={current} onDone={dismiss} />;
}
