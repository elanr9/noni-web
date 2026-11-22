"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";

import { rememberCurrentAccount } from "@/lib/accounts";

/** Survives React Strict Mode remounts in the same page load. */
const handledCodes = new Set<string>();

export function AuthCallbackClient({
  code,
  next,
  flowId,
  forceNew = false,
}: {
  code: string | null;
  next: string;
  flowId: string | null;
  /** Add-account flow: exchange even when a session already exists. */
  forceNew?: boolean;
}) {
  const router = useRouter();

  useEffect(() => {
    let cancelled = false;

    async function finish(
      path: string,
      supabase?: ReturnType<typeof createBrowserClient>,
    ) {
      if (cancelled) return;
      /* Remember this account so the sidebar switcher can offer it later. */
      if (supabase) await rememberCurrentAccount(supabase).catch(() => null);
      router.replace(path);
      router.refresh();
    }

    async function fail(description: string) {
      if (cancelled) return;
      const q = new URLSearchParams({
        error: "auth",
        error_description: description,
      });
      router.replace(`/login?${q.toString()}`);
    }

    async function run() {
      const safeNext = next.startsWith("/") ? next : "/dash";
      if (!code) {
        /* A refused sign-in (no invite for that email) comes back with the
           reason on the URL instead of a code. */
        const refused =
          new URLSearchParams(window.location.search).get("error_description") ??
          new URLSearchParams(window.location.hash.replace(/^#/, "")).get("error_description");
        await fail(refused ? refused.replace(/\+/g, " ") : "Missing auth code.");
        return;
      }

      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          auth: {
            // Avoid racing a second exchange against our explicit one.
            detectSessionInUrl: false,
            flowType: "pkce",
          },
        },
      );

      const {
        data: { session: existing },
      } = await supabase.auth.getSession();
      if (existing && !(forceNew && !handledCodes.has(code))) {
        handledCodes.add(code);
        await finish(safeNext, supabase);
        return;
      }

      if (handledCodes.has(code)) {
        // First Strict Mode pass already exchanged; wait for cookies to settle.
        for (let i = 0; i < 10; i++) {
          const {
            data: { session },
          } = await supabase.auth.getSession();
          if (session) {
            await finish(safeNext, supabase);
            return;
          }
          await new Promise((r) => setTimeout(r, 50));
        }
        await fail("Sign-in did not complete. Please try again.");
        return;
      }

      handledCodes.add(code);

      const { error } = await supabase.auth.exchangeCodeForSession(
        code,
        flowId ? { flowId } : undefined,
      );

      if (cancelled) return;

      if (error) {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (session) {
          await finish(safeNext, supabase);
          return;
        }
        handledCodes.delete(code);
        await fail(error.message);
        return;
      }

      await finish(safeNext, supabase);
    }

    void run();
    return () => {
      cancelled = true;
    };
  }, [code, flowId, next, router, forceNew]);

  return <SigningIn />;
}

/* While the sign in finishes: the Noni rocket inside a thin spinning ring.
   No words; the ring says it is working. */
function SigningIn() {
  return (
    <div className="grid min-h-screen place-items-center bg-[#fbfbfc]" role="status" aria-label="Signing you in">
      <span className="relative inline-flex h-16 w-16 items-center justify-center animate-om-rise">
        <span className="absolute inset-0 rounded-full border-[3px] border-blue-100" />
        <span
          className="absolute inset-0 rounded-full border-[3px] border-transparent border-t-blue-500"
          style={{ animation: "om-spin 700ms linear infinite" }}
        />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/brand/noni-logo.svg" alt="" width={28} height={28} />
      </span>
    </div>
  );
}
