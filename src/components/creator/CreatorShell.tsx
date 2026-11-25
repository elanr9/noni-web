"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import type { ReactNode } from "react";

import { createClient } from "@/lib/supabase/client";

const NAV = [
  { key: "campaigns", label: "Campaigns", href: "/campaigns" },
  { key: "profile", label: "Profile", href: "/profile" },
] as const;

/* The creator's website: Campaigns and Profile, nothing else. */
export function CreatorShell({ active, children }: { active: "campaigns" | "profile"; children: ReactNode }) {
  const router = useRouter();
  const signOut = async () => {
    await createClient().auth.signOut({ scope: "local" });
    router.replace("/login");
  };
  return (
    <div className="flex min-h-screen flex-col bg-[#fbfbfc] font-ops">
      <header className="flex items-center gap-3 px-4 py-4 sm:px-7">
        <Link href="/" className="flex items-center gap-[9px] no-underline">
          <Image src="/brand/noni-logo.svg" alt="" width={26} height={26} />
          <span className="hidden text-[18px] font-bold tracking-[-0.6px] text-ink sm:inline">noni</span>
        </Link>
        <nav className="mx-auto flex rounded-full bg-fill-quiet p-1">
          {NAV.map((n) => {
            const on = n.key === active;
            return (
              <Link
                key={n.key}
                href={n.href}
                aria-current={on ? "page" : undefined}
                className={`rounded-full px-4 py-2 text-[14.5px] no-underline transition-all duration-[160ms] ease-om sm:px-5 ${
                  on ? "bg-white font-bold text-ink shadow-sm" : "font-semibold text-slate-500 hover:text-ink"
                }`}
              >
                {n.label}
              </Link>
            );
          })}
        </nav>
        <button
          type="button"
          onClick={signOut}
          aria-label="Sign out"
          className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border-0 bg-transparent text-slate-400 transition-colors hover:bg-fill-quiet hover:text-ink"
        >
          <LogOut size={18} />
        </button>
      </header>
      {children}
    </div>
  );
}
