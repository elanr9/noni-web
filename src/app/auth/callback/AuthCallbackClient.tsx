"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";

/** Survives React Strict Mode remounts in the same page load. */
const handledCodes = new Set<string>();

export function AuthCallbackClient({
  code,
  next,
  flowId,
}: {
  code: string | null;
  next: string;
  flowId: string | null;
}) {
  const router = useRouter();
  const [message, setMessage] = useState("Signing you in…");

  useEffect(() => {
    let cancelled = false;

    async function finish(path: string) {
      if (cancelled) return;
      setMessage("Signed in. Redirecting…");
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
      const safeNext = next.startsWith("/") ? next : "/admin";
      if (!code) {
        await fail("Missing auth code.");
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
      if (existing) {
        handledCodes.add(code);
        await finish(safeNext);
        return;
      }

      if (handledCodes.has(code)) {
        // First Strict Mode pass already exchanged; wait for cookies to settle.
        for (let i = 0; i < 10; i++) {
          const {
            data: { session },
          } = await supabase.auth.getSession();
          if (session) {
            await finish(safeNext);
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
          await finish(safeNext);
          return;
        }
        handledCodes.delete(code);
        await fail(error.message);
        return;
      }

      await finish(safeNext);
    }

    void run();
    return () => {
      cancelled = true;
    };
  }, [code, flowId, next, router]);

  return (
    <div className="grid min-h-screen place-items-center bg-soft text-[15px] text-muted">
      {message}
    </div>
  );
}
