"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  Suspense,
  useLayoutEffect,
  useState,
  useSyncExternalStore,
} from "react";
import { createPortal } from "react-dom";

import { Label, Pill } from "@/components/kit";

/* The spotlight tour: a short introduction to the dashboard. It opens with
   a centered card, puts a spotlight on each tab in the nav with one line
   about what it is for, and closes with a centered send-off. It never
   leaves the page it started on. Activated by navigating to /admin?tour=1.
   Skippable; a tab that is not on screen (a retired Onboarding tab, the
   hidden nav on a phone) is passed over. */

interface TourStep {
  /** data-tour attribute on the target element; null shows a centered
      welcome card over the dimmed app with no cutout. */
  target: string | null;
  /** Route to sync the active tab to; null leaves the tab alone (search). */
  href: string | null;
  title: string;
  body: string;
}

const TOUR: TourStep[] = [
  {
    target: null,
    href: null,
    title: "This is your dashboard",
    body: "Everything about your creator program lives here: your results, your team, every post and your plan. Here is what each tab is for.",
  },
  {
    target: "nav-onboarding",
    href: null,
    title: "Onboarding",
    body: "Your setup steps, in order. This tab goes away once they are done.",
  },
  {
    target: "nav-analytics",
    href: null,
    title: "Analytics",
    body: "Views, sign-ups and sales from every post your creators make.",
  },
  {
    target: "nav-team",
    href: null,
    title: "Team",
    body: "Your campaign managers and creators. Invite them here.",
  },
  {
    target: "nav-posts",
    href: null,
    title: "Posts",
    body: "Every post that goes live, with its numbers.",
  },
  {
    target: "nav-brain",
    href: null,
    title: "Company Brain",
    body: "What Noni knows about your product. Every brief is written from it.",
  },
  {
    target: "nav-media",
    href: null,
    title: "Media",
    body: "Your logos, clips and screenshots for creators to use.",
  },
  {
    target: "nav-billing",
    href: null,
    title: "Billing",
    body: "Your plan and your creator budget.",
  },
  {
    target: null,
    href: null,
    title: "That's it. Good luck exploring",
    body: "Take a look around. You can't break anything.",
  },
];

/** Target for a 1-based ?tour= step, so pages with tab-hidden sections can
    force the section holding the target open while the tour points at it. */
export function tourStepTarget(step: number): string | null {
  return TOUR[step - 1]?.target ?? null;
}

const CUTOUT_PAD = 5;
const POPOVER_WIDTH = 320;
/* Rough popover height used only to pick below vs above placement. */
const POPOVER_EST_HEIGHT = 210;
const FIND_RETRY_MS = 120;
const MAX_FIND_TRIES = 5;

const DIM_SHADOW =
  "0 0 0 9999px color-mix(in srgb, var(--color-ink-900) 50%, transparent)";

const noopSubscribe = () => () => {};

interface Rect {
  top: number;
  left: number;
  width: number;
  height: number;
  bottom: number;
  right: number;
}

function PopoverBody({
  idx,
  step,
  onNext,
  onSkip,
}: {
  idx: number;
  step: TourStep;
  onNext: () => void;
  onSkip: () => void;
}) {
  const last = idx === TOUR.length - 1;
  return (
    <>
      <Label>
        {idx + 1} of {TOUR.length}
      </Label>
      <div className="mt-[7px] text-[17px] font-bold tracking-[-0.4px] text-ink">
        {step.title}
      </div>
      <p className="mb-0 mt-1.5 text-[13.5px] font-semibold leading-[1.55] text-slate-500">
        {step.body}
      </p>
      <div className="mt-4 flex items-center gap-2.5">
        <span className="h-1 flex-1 overflow-hidden rounded-pill bg-line">
          <span
            className="block h-full rounded-pill bg-blue-500 transition-[width] duration-[260ms] ease-om"
            style={{ width: `${((idx + 1) / TOUR.length) * 100}%` }}
          />
        </span>
        {last ? null : (
          <Pill size="sm" variant="ghost" onClick={onSkip}>
            Skip
          </Pill>
        )}
        <Pill size="sm" onClick={onNext}>
          {last ? "Start exploring" : "Next"}
        </Pill>
      </div>
    </>
  );
}

function TourOverlay({
  idx,
  onNext,
  onSkip,
}: {
  idx: number;
  onNext: () => void;
  onSkip: () => void;
}) {
  const step = TOUR[idx];
  const [rect, setRect] = useState<Rect | null>(null);

  /* Re-measure on step change, resize and scroll so the cutout stays
     aligned. Page content streams in after tab navigations, so retry until
     the target exists, scrolling it into view the first time we find it. */
  useLayoutEffect(() => {
    /* The welcome card ignores rect, so a stale one is harmless. */
    if (!step.target) return;
    let revealed = false;
    function measure() {
      const el = document.querySelector(`[data-tour="${step.target}"]`);
      /* A nav that is collapsed on a phone is in the page but has no size. */
      if (!el || el.getBoundingClientRect().width === 0) {
        setRect(null);
        return false;
      }
      if (!revealed) {
        revealed = true;
        el.scrollIntoView({ block: "nearest" });
      }
      const r = el.getBoundingClientRect();
      setRect({
        top: r.top,
        left: r.left,
        width: r.width,
        height: r.height,
        bottom: r.bottom,
        right: r.right,
      });
      return true;
    }
    let retry = 0;
    let tries = 0;
    if (!measure()) {
      retry = window.setInterval(() => {
        tries += 1;
        if (measure()) window.clearInterval(retry);
        else if (tries >= MAX_FIND_TRIES) {
          /* The tab is not on screen: pass over it. */
          window.clearInterval(retry);
          onNext();
        }
      }, FIND_RETRY_MS);
    }
    window.addEventListener("resize", measure);
    window.addEventListener("scroll", measure, true);
    return () => {
      window.clearInterval(retry);
      window.removeEventListener("resize", measure);
      window.removeEventListener("scroll", measure, true);
    };
    // onNext changes identity each render; the step target is what matters.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step.target]);

  /* The welcome card: dim the whole app, no cutout, centered pop. */
  if (!step.target) {
    return createPortal(
      <div className="fixed inset-0 z-[90]">
        <div
          className="fixed inset-0"
          style={{
            background:
              "color-mix(in srgb, var(--color-ink-900) 50%, transparent)",
          }}
        />
        <div className="fixed inset-0 flex items-center justify-center">
          <div
            key={idx}
            className="animate-om-pop bg-white p-5 shadow-raised rounded-ops-md"
            style={{ width: POPOVER_WIDTH }}
          >
            <PopoverBody idx={idx} step={step} onNext={onNext} onSkip={onSkip} />
          </div>
        </div>
      </div>,
      document.body,
    );
  }

  if (!rect) return null;

  const isSearch = step.target === "search";
  const isNav = step.target.startsWith("nav-");

  /* Nav items get the popover to their right and search gets it below,
     as in the handoff. In-page features get it below the element, flipped
     above when there is no room, with the left edge clamped on screen. */
  let popover: { top: number; left: number; transform?: string };
  if (isSearch) {
    popover = {
      top: rect.bottom + 16,
      left: Math.max(16, rect.left + rect.width / 2 - POPOVER_WIDTH / 2),
    };
  } else if (isNav) {
    popover = { top: Math.max(16, rect.top - 10), left: rect.right + 18 };
  } else {
    const left = Math.min(
      Math.max(16, rect.left),
      window.innerWidth - POPOVER_WIDTH - 16,
    );
    popover =
      rect.bottom + 14 + POPOVER_EST_HEIGHT <= window.innerHeight
        ? { top: rect.bottom + 14, left }
        : { top: rect.top - 14, left, transform: "translateY(-100%)" };
  }

  return createPortal(
    <div className="fixed inset-0 z-[90]">
      <div
        className="pointer-events-none fixed"
        style={{
          top: rect.top - CUTOUT_PAD,
          left: rect.left - CUTOUT_PAD,
          width: rect.width + CUTOUT_PAD * 2,
          height: rect.height + CUTOUT_PAD * 2,
          borderRadius: isSearch ? 999 : isNav ? 13 : 16,
          boxShadow: `${DIM_SHADOW}, 0 0 0 2.5px var(--color-blue-500)`,
          transition: "all 260ms var(--ease-om)",
        }}
      />
      <div
        className="fixed"
        style={{ ...popover, width: POPOVER_WIDTH }}
      >
        <div
          key={idx}
          className="animate-om-pop bg-white p-5 shadow-raised rounded-ops-md"
        >
          <PopoverBody idx={idx} step={step} onNext={onNext} onSkip={onSkip} />
        </div>
      </div>
    </div>,
    document.body,
  );
}

/* The tour is URL-driven: ?tour=N means step N is showing (1-based), so
   Look around simply navigates to /admin?tour=1 and every advance is a
   navigation that also syncs the active tab. Ending drops the param and
   lands on the Onboarding to-do at /admin. */
function TourController() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  /* false during SSR, true on the client, where document.body exists. */
  const mounted = useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );

  const param = Number(searchParams.get("tour"));
  const idx =
    Number.isInteger(param) && param >= 1 && param <= TOUR.length
      ? param - 1
      : -1;

  if (!mounted || idx < 0) return null;

  const end = () => router.push("/admin");

  const next = () => {
    if (idx === TOUR.length - 1) {
      end();
      return;
    }
    const step = TOUR[idx + 1];
    /* The search step has no page of its own; keep the current tab. */
    router.push(`${step.href ?? pathname}?tour=${idx + 2}`);
  };

  return <TourOverlay idx={idx} onNext={next} onSkip={end} />;
}

export function TourHost() {
  return (
    <Suspense fallback={null}>
      <TourController />
    </Suspense>
  );
}
