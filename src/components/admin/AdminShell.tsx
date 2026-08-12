"use client";

import {
  ChartColumn,
  CircleUserRound,
  DollarSign,
  House,
  Images,
  LogOut,
  Sparkles,
  Users,
  type LucideIcon,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useMemo, type ReactNode } from "react";

import { CommandSearch, type CommandItem } from "@/components/kit";
import { Avatar } from "@/components/kit/Avatar";
import { createClient } from "@/lib/supabase/client";

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  tour: string;
}

const NAV_SECTIONS: ReadonlyArray<{ label: string; items: NavItem[] }> = [
  {
    label: "Workspace",
    items: [
      { href: "/admin", label: "Onboarding", icon: House, tour: "nav-onboarding" },
      { href: "/admin/analytics", label: "Analytics", icon: ChartColumn, tour: "nav-analytics" },
      { href: "/admin/team", label: "Team", icon: Users, tour: "nav-team" },
      { href: "/admin/posts", label: "Posts", icon: Images, tour: "nav-posts" },
    ],
  },
  {
    label: "Company",
    items: [
      { href: "/admin/brain", label: "Company Brain", icon: Sparkles, tour: "nav-brain" },
      { href: "/admin/billing", label: "Billing", icon: DollarSign, tour: "nav-billing" },
    ],
  },
];

/* ⌘K reaches every page and team member. Person hits open the member's
   profile page. */
export interface AdminSearchPerson {
  id: string;
  name: string;
  role: string;
  status: string;
}

interface AdminSearchEntry extends CommandItem {
  href: string;
}

function SideItem({
  item,
  active,
  badge,
}: {
  item: NavItem;
  active: boolean;
  badge?: number;
}) {
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      data-tour={item.tour}
      className={`flex w-full items-center gap-[11px] px-[11px] py-[9px] text-[13.5px] font-bold transition-colors duration-[160ms] ease-om rounded-[11px] ${
        active ? "bg-blue-100 text-blue-700" : "text-slate-500 hover:bg-fill-quiet"
      }`}
    >
      <Icon size={17} className={active ? "text-blue-700" : "text-slate-400"} />
      <span className="flex-1 whitespace-nowrap">{item.label}</span>
      {badge ? (
        <span
          className={`px-2 py-0.5 text-[11px] font-extrabold text-blue-700 rounded-pill ${
            active ? "bg-white" : "bg-blue-100"
          }`}
        >
          {badge}
        </span>
      ) : null}
    </Link>
  );
}

export function AdminShell({
  children,
  companyName,
  name,
  people,
  setupRemaining,
  setupComplete,
}: {
  children: ReactNode;
  companyName: string;
  name?: string | null;
  people: AdminSearchPerson[];
  /** Setup steps left; badge on the Onboarding nav item. */
  setupRemaining: number;
  /** True retires the Onboarding tab from nav and search. */
  setupComplete: boolean;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const searchIndex = useMemo<AdminSearchEntry[]>(
    () => [
      ...NAV_SECTIONS.flatMap((section) =>
        section.items
          .filter((it) => it.label !== "Onboarding" || !setupComplete)
          .map(
            (it): AdminSearchEntry => ({
              id: "nav-" + it.href,
              section: "Go to",
              icon: it.icon,
              title: it.label,
              meta: section.label,
              href: it.href,
            }),
          ),
      ),
      ...people.map(
        (p): AdminSearchEntry => ({
          id: "pe-" + p.id,
          section: "Team",
          icon: CircleUserRound,
          title: p.name,
          meta: `${p.role} · ${p.status}`,
          href: `/admin/team/${p.id}`,
        }),
      ),
    ],
    [people, setupComplete],
  );

  const onSearchSelect = useCallback(
    (item: AdminSearchEntry) => router.push(item.href),
    [router],
  );

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.replace("/login");
    router.refresh();
  }

  return (
    <div className="flex h-screen overflow-hidden bg-ground text-ink font-ops">
      <aside className="flex w-[236px] shrink-0 flex-col border-r border-line bg-white px-3.5 pb-3.5 pt-[22px]">
        <div className="flex items-center gap-[9px] px-[9px]">
          <Image src="/brand/noni-logo.svg" alt="" width={30} height={30} />
          <span className="text-[20px] font-bold tracking-[-0.6px] text-ink">
            noni
          </span>
        </div>
        <div className="mb-1.5 mt-[18px] flex items-center gap-[9px] bg-fill-quiet px-[11px] py-2.5 rounded-ops-sm">
          <span className="h-[7px] w-[7px] shrink-0 bg-blue-500 rounded-pill" />
          <span className="flex-1 overflow-hidden text-ellipsis whitespace-nowrap text-[13px] font-bold text-ink">
            {companyName}
          </span>
        </div>
        <nav className="scrollbar-none flex flex-1 flex-col gap-5 overflow-y-auto pt-3.5">
          {NAV_SECTIONS.map((section) => {
            const items = section.items.filter(
              (it) => it.label !== "Onboarding" || !setupComplete,
            );
            return (
              <div key={section.label} className="flex flex-col gap-0.5">
                <span className="px-[11px] pb-1.5 text-[11px] font-extrabold uppercase tracking-[0.9px] text-slate-400">
                  {section.label}
                </span>
                {items.map((it) => (
                  <SideItem
                    key={it.href}
                    item={it}
                    active={
                      it.href === "/admin"
                        ? pathname === "/admin"
                        : pathname.startsWith(it.href)
                    }
                    badge={
                      it.label === "Onboarding" && setupRemaining > 0
                        ? setupRemaining
                        : undefined
                    }
                  />
                ))}
              </div>
            );
          })}
        </nav>
        <div className="mt-3 flex items-center gap-2.5 border-t border-line px-[9px] pt-3">
          <Avatar name={name ?? companyName} size={32} />
          <div className="min-w-0 flex-1">
            <div className="overflow-hidden text-ellipsis whitespace-nowrap text-[13px] font-bold text-ink">
              {name ?? "Admin"}
            </div>
            <div className="text-[11.5px] font-semibold text-slate-400">
              Company admin
            </div>
          </div>
          <button
            type="button"
            title="Sign out"
            aria-label="Sign out"
            onClick={() => void signOut()}
            className="inline-flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center border-none bg-transparent rounded-pill hover:bg-fill-quiet"
          >
            <LogOut size={15} className="text-slate-400" />
          </button>
        </div>
      </aside>
      <main className="flex min-w-0 flex-1 flex-col">
        <div className="flex shrink-0 justify-center px-11 pt-4">
          <div data-tour="search" className="flex w-full max-w-[560px] justify-center">
            <CommandSearch index={searchIndex} onSelect={onSearchSelect} />
          </div>
        </div>
        <div className="scrollbar-none flex-1 overflow-y-auto">
          <div
            key={pathname}
            className="mx-auto max-w-[1100px] px-11 pb-[72px] pt-[30px] animate-om-rise"
          >
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
