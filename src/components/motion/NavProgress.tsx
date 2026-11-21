"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useState, useTransition } from "react";

/* Navigation feedback for the whole site.
   - NavProgress: a thin bar across the top that starts the instant a link
     or button begins a page change and finishes when the new page is in.
   - useNavigate: router.push with a pending flag, so the button that was
     clicked can show a spinner until the page changes. */

const listeners = new Set<() => void>();

/** Starts the top bar by hand, for navigations that do not go through a
    link (router.push from a button). useNavigate calls it for you. */
export function navStart(): void {
  listeners.forEach((l) => l());
}

/* A navigation that never lands (same page, cancelled) must not leave the
   bar running. */
const GIVE_UP_MS = 10000;

function Bar() {
  const pathname = usePathname();
  const search = useSearchParams();
  const here = `${pathname}?${search.toString()}`;
  /* The URL the bar was started on. It is loading for as long as that is
     still the URL; the moment the page changes it finishes on its own. */
  const [from, setFrom] = useState<string | null>(null);
  const loading = from !== null && from === here;

  useEffect(() => {
    const start = () => setFrom(`${window.location.pathname}?${window.location.search.slice(1)}`);
    listeners.add(start);

    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as Element | null)?.closest?.("a[href]") as HTMLAnchorElement | null;
      if (!a || a.target === "_blank" || a.hasAttribute("download")) return;
      const url = new URL(a.href, window.location.href);
      if (url.origin !== window.location.origin) return;
      if (url.pathname === window.location.pathname && url.search === window.location.search) {
        return;
      }
      start();
    };
    document.addEventListener("click", onClick);
    return () => {
      listeners.delete(start);
      document.removeEventListener("click", onClick);
    };
  }, []);

  useEffect(() => {
    if (!loading) return;
    const t = window.setTimeout(() => setFrom(null), GIVE_UP_MS);
    return () => window.clearTimeout(t);
  }, [loading]);

  return (
    <div
      aria-hidden
      className={`nav-progress ${loading ? "nav-progress-on" : ""}`}
    />
  );
}

export function NavProgress() {
  return (
    <Suspense fallback={null}>
      <Bar />
    </Suspense>
  );
}

/** router.push that reports when it is still on its way. */
export function useNavigate(): { go: (href: string) => void; pending: boolean } {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const go = useCallback(
    (href: string) => {
      navStart();
      startTransition(() => router.push(href));
    },
    [router],
  );
  return { go, pending };
}
