"use client";

import { useEffect } from "react";

import { celebrate } from "@/components/motion/Celebration";
import type { SetupStepKey } from "@/lib/admin/setup";

/* Setup step celebrations: each step is celebrated once when it gets
   finished, plus a last one when the whole setup is done. What has fired is
   kept in localStorage by company id, so none repeats across sessions. */

export interface AchievementStep {
  key: SetupStepKey;
  done: boolean;
  /** Setup row title; it names the count only when more than one is required. */
  title: string;
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

function stepTitle(step: AchievementStep): string {
  switch (step.key) {
    case "billing":
      return "Plan started!";
    case "app":
      return "The app is on its way!";
    case "sales":
      return "Supabase and Stripe connected!";
    case "logo":
      return "Logo added!";
    case "media":
      return "Screenshots added!";
    case "managers":
      return "Campaign manager invited!";
    case "creators":
      return "First creator invited!";
  }
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
  useEffect(() => {
    const key = storageKey(companyId);
    const fired = readFired(key);

    if (fired === null) {
      /* First visit: seed already-done steps without celebrating. Only a
         step that gets finished is celebrated, never the state it opens in. */
      const seed = new Set<string>();
      for (const s of steps) if (s.done) seed.add(s.key);
      if (complete) seed.add(FINAL_KEY);
      writeFired(key, seed);
      return;
    }

    const queue: string[] = [];
    for (const s of steps) {
      if (s.done && !fired.has(s.key)) {
        fired.add(s.key);
        queue.push(stepTitle(s));
      }
    }
    if (complete && !fired.has(FINAL_KEY)) {
      fired.add(FINAL_KEY);
      queue.push(`${companyName} is all set!`);
    }
    if (queue.length === 0) return;
    writeFired(key, fired);
    for (const title of queue) celebrate(title);
  }, [steps, complete, companyId, companyName]);

  return null;
}
