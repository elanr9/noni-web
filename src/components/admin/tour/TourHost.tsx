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
   a dim overlay with a cutout around each nav item then the ⌘K search,
   syncing the active tab as it goes. Activated by the onboarding finish
   screen's Look around button navigating to /admin?tour=1. Skippable; the
   last button reads "Start step 1" and lands on the Onboarding to-do. */

interface TourStep {
  /** data-tour attribute on the target element (set by AdminShell). */
  target: string;
  /** Route to sync the active tab to; null leaves the tab alone (search). */
  href: string | null;
  title: string;
  body: string;
}

const TOUR: TourStep[] = [
  {
    target: "nav-onboarding",
    href: "/admin",
    title: "Onboarding",
    body: "Your setup to-do lives here. A few steps and Noni runs itself. This tab retires once everything is done.",
  },
  {
    target: "nav-analytics",
    href: "/admin/analytics",
    title: "Analytics",
    body: "Views, sign-ups and earnings by post, creator and day.",
  },
  {
    target: "nav-team",
    href: "/admin/team",
    title: "Team",
    body: "Campaign managers and creators. Invite them from here. They join by email, already in the right role.",
  },
  {
    target: "nav-posts",
    href: "/admin/posts",
    title: "Posts",
    body: "Every post your creators publish, with views and earnings on each.",
  },
  {
    target: "nav-brain",
    href: "/admin/brain",
    title: "Company Brain",
    body: "What Noni knows about your product and audience. Every brief is written from this.",
  },
  {
    target: "nav-billing",
    href: "/admin/billing",
    title: "Billing",
    body: "Your subscription and the creator budget. Top up any time.",
  },
  {
    target: "search",
    href: null,
    title: "Jump anywhere",
    body: "Press ⌘K from any page to search pages, people and posts.",
  },
];

const CUTOUT_PAD = 5;
const POPOVER_WIDTH = 320;

const noopSubscribe = () => () => {};

interface Rect {
  top: number;
  left: number;
  width: number;
  height: number;
  bottom: number;
  right: number;
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

  /* Re-measure on step change and on resize so the cutout stays aligned. */
  useLayoutEffect(() => {
    function measure() {
      const el = document.querySelector(`[data-tour="${step.target}"]`);
      if (!el) {
        setRect(null);
        return;
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
    }
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [step.target]);

  if (!rect) return null;

  const isSearch = step.target === "search";
  const popover = isSearch
    ? {
        top: rect.bottom + 16,
        left: Math.max(16, rect.left + rect.width / 2 - POPOVER_WIDTH / 2),
      }
    : { top: Math.max(16, rect.top - 10), left: rect.right + 18 };
  const last = idx === TOUR.length - 1;

  return createPortal(
    <div className="fixed inset-0 z-[90]">
      <div
        className="pointer-events-none fixed"
        style={{
          top: rect.top - CUTOUT_PAD,
          left: rect.left - CUTOUT_PAD,
          width: rect.width + CUTOUT_PAD * 2,
          height: rect.height + CUTOUT_PAD * 2,
          borderRadius: isSearch ? 999 : 13,
          boxShadow:
            "0 0 0 9999px color-mix(in srgb, var(--color-ink-900) 50%, transparent), 0 0 0 2.5px var(--color-blue-500)",
          transition: "all 260ms var(--ease-om)",
        }}
      />
      <div
        key={idx}
        className="fixed animate-om-pop bg-white p-5 shadow-raised rounded-ops-md"
        style={{ ...popover, width: POPOVER_WIDTH }}
      >
        <Label>
          {idx + 1} of {TOUR.length}
        </Label>
        <div className="mt-[7px] text-[17px] font-bold tracking-[-0.4px] text-ink">
          {step.title}
        </div>
        <p className="mb-0 mt-1.5 text-[13.5px] font-semibold leading-[1.55] text-slate-500">
          {step.body}
        </p>
        <div className="mt-4 flex items-center gap-2">
          <span className="flex flex-1 gap-1">
            {TOUR.map((_, i) => (
              <span
                key={i}
                className={`h-1.5 w-1.5 rounded-pill ${
                  i === idx ? "bg-blue-500" : "bg-line"
                }`}
              />
            ))}
          </span>
          <Pill size="sm" variant="ghost" onClick={onSkip}>
            Skip tour
          </Pill>
          <Pill size="sm" onClick={onNext}>
            {last ? "Start step 1" : "Next"}
          </Pill>
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
