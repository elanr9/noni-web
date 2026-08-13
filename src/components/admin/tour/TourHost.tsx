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

/* The spotlight tour from design_handoff_admin_app_web/AdminSetupApp.jsx:
   a dim overlay with a cutout around each target. It opens with a centered
   welcome card, walks every tab from the nav item into the features on the
   page, then ends on the ⌘K search, syncing the active tab as it goes.
   Activated by the onboarding finish screen's Look around button navigating
   to /admin?tour=1. Skippable; the last button reads "Start step 1" and
   lands on the Onboarding to-do. */

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
    href: "/admin",
    title: "Welcome to Noni!",
    body: "Let me show you around.",
  },
  {
    target: "nav-onboarding",
    href: "/admin",
    title: "Onboarding",
    body: "Your setup to-do lives here. A few steps and Noni runs itself. This tab retires once everything is done.",
  },
  {
    target: "onb-progress",
    href: "/admin",
    title: "Your progress",
    body: "This bar tracks your setup. It fills as each step is done.",
  },
  {
    target: "onb-first-step",
    href: "/admin",
    title: "First step",
    body: "Start here. Each row takes you to the right page and checks itself off when finished.",
  },
  {
    target: "nav-analytics",
    href: "/admin/analytics",
    title: "Analytics",
    body: "Views, sign-ups and earnings by post, creator and day.",
  },
  {
    target: "analytics-stats",
    href: "/admin/analytics",
    title: "At a glance",
    body: "Totals for views, sign ups and earnings across the whole team. These update as posts go live.",
  },
  {
    target: "analytics-explorer",
    href: "/admin/analytics",
    title: "Dig deeper",
    body: "See how views build week by week and which creators drive them.",
  },
  {
    target: "analytics-mode",
    href: "/admin/analytics",
    title: "Graph or Calendar",
    body: "Flip between the trend graph and a day by day calendar.",
  },
  {
    target: "nav-team",
    href: "/admin/team",
    title: "Team",
    body: "Campaign managers and creators. Invite them from here. They join by email, already in the right role.",
  },
  {
    target: "team-managers",
    href: "/admin/team",
    title: "Campaign managers",
    body: "They run weekly briefs and keep creators on pace. Invite one from here.",
  },
  {
    target: "team-creators",
    href: "/admin/team",
    title: "Creators",
    body: "Everyone posting for you, with status and earnings on each. Invite creators by email.",
  },
  {
    target: "nav-posts",
    href: "/admin/posts",
    title: "Posts",
    body: "Every post your creators publish, with views and earnings on each.",
  },
  {
    target: "posts-grid",
    href: "/admin/posts",
    title: "All posts",
    body: "Posts land here as they go live. Click any one for its views, earnings and platform detail.",
  },
  {
    target: "posts-view-toggle",
    href: "/admin/posts",
    title: "Grid or calendar",
    body: "Switch between a grid of posts and a calendar of daily activity.",
  },
  {
    target: "nav-brain",
    href: "/admin/brain",
    title: "Company Brain",
    body: "What Noni knows about your product and audience. Every brief is written from this.",
  },
  {
    target: "brain-docs",
    href: "/admin/brain",
    title: "Product and Audience",
    body: "Two living docs Noni writes and keeps current. Edit them any time and the briefs follow.",
  },
  {
    target: "brain-inspiration",
    href: "/admin/brain",
    title: "Inspiration accounts",
    body: "The accounts your customers already follow. We watch these to see what works in your niche.",
  },
  {
    target: "nav-billing",
    href: "/admin/billing",
    title: "Billing",
    body: "Your subscription and the creator budget. Top up any time.",
  },
  {
    target: "billing-subscription",
    href: "/admin/billing",
    title: "Your plan",
    body: "Your Noni subscription and when it renews.",
  },
  {
    target: "billing-budget",
    href: "/admin/billing",
    title: "Creator budget",
    body: "The pool that pays creators for views. See where every dollar goes.",
  },
  {
    target: "billing-top-up",
    href: "/admin/billing",
    title: "Top up",
    body: "Add funds any time, or let auto top up keep campaigns from stalling.",
  },
  {
    target: "search",
    href: null,
    title: "Jump anywhere",
    body: "Press ⌘K from any page to search pages, people and posts.",
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
        <Pill size="sm" variant="ghost" onClick={onSkip}>
          Skip tour
        </Pill>
        <Pill size="sm" onClick={onNext}>
          {last ? "Start step 1" : "Next"}
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
      if (!el) {
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
    if (!measure()) {
      retry = window.setInterval(() => {
        if (measure()) window.clearInterval(retry);
      }, FIND_RETRY_MS);
    }
    window.addEventListener("resize", measure);
    window.addEventListener("scroll", measure, true);
    return () => {
      window.clearInterval(retry);
      window.removeEventListener("resize", measure);
      window.removeEventListener("scroll", measure, true);
    };
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
