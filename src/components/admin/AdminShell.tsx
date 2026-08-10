"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  BarChart3,
  Inbox,
  LayoutList,
  LogOut,
  Menu,
  Plus,
  Settings,
  Users,
  X,
} from "lucide-react";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

const NAV = [
  { href: "/admin", label: "Review", icon: Inbox },
  { href: "/admin/briefs", label: "Briefs", icon: Plus },
  { href: "/admin/library", label: "Library", icon: LayoutList },
  { href: "/admin/creators", label: "Creators", icon: Users },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export function AdminShell({
  children,
  name,
}: {
  children: React.ReactNode;
  name?: string | null;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.replace("/login");
    router.refresh();
  }

  const nav = (
    <nav className="flex flex-1 flex-col gap-1 px-3">
      {NAV.map((item) => {
        const active =
          item.href === "/admin"
            ? pathname === "/admin"
            : pathname.startsWith(item.href);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setOpen(false)}
            className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-[14px] font-semibold transition ${
              active
                ? "bg-accent-soft text-accent-deep"
                : "text-ink-soft hover:bg-soft hover:text-ink"
            }`}
          >
            <Icon className="h-4.5 w-4.5" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="min-h-screen bg-white md:flex">
      <aside className="hidden w-[260px] shrink-0 flex-col border-r border-line bg-white md:flex">
        <div className="px-5 py-5">
          <Link href="/" className="display text-2xl font-semibold text-ink">
            Noni
          </Link>
          <div className="mt-1 text-xs font-semibold uppercase tracking-[0.14em] text-muted">
            Admin
          </div>
        </div>
        {nav}
        <div className="mt-auto border-t border-line p-4">
          <div className="truncate px-1 text-sm font-semibold text-ink">
            {name ?? "Admin"}
          </div>
          <button
            type="button"
            onClick={() => void signOut()}
            className="mt-2 flex w-full items-center gap-2 rounded-xl px-2 py-2 text-sm font-semibold text-muted hover:bg-soft hover:text-ink"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </div>
      </aside>

      <div className="flex min-h-screen flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-line bg-white px-4 py-3 md:hidden">
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="rounded-xl p-2 hover:bg-soft"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="display text-xl font-semibold">Noni</div>
          <div className="w-9" />
        </header>

        {open ? (
          <div className="fixed inset-0 z-50 md:hidden">
            <button
              type="button"
              className="absolute inset-0 bg-ink/40"
              onClick={() => setOpen(false)}
              aria-label="Close menu"
            />
            <div className="absolute inset-y-0 left-0 flex w-[280px] flex-col bg-white shadow-xl">
              <div className="flex items-center justify-between px-4 py-4">
                <div className="display text-2xl font-semibold">Noni</div>
                <button type="button" onClick={() => setOpen(false)} className="p-2">
                  <X className="h-5 w-5" />
                </button>
              </div>
              {nav}
            </div>
          </div>
        ) : null}

        <main className="flex-1 px-4 py-6 md:px-8 md:py-8">{children}</main>
      </div>
    </div>
  );
}
