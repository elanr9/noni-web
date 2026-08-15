"use client";

import {
  CalendarDays,
  ChartColumn,
  CircleUserRound,
  FolderOpen,
  ListChecks,
  Menu,
  Users,
  type LucideIcon,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useMemo, useState, type ReactNode } from "react";

import { AccountSwitcher } from "@/components/AccountSwitcher";
import { CommandSearch, type CommandItem } from "@/components/kit";

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

const NAV_SECTIONS: ReadonlyArray<{ label: string; items: NavItem[] }> = [
  {
    label: "Workspace",
    items: [
      { href: "/manager", label: "Review", icon: ListChecks },
      { href: "/manager/briefs", label: "Briefs", icon: CalendarDays },
      { href: "/manager/creators", label: "Creators", icon: Users },
      { href: "/manager/library", label: "Library", icon: FolderOpen },
      { href: "/manager/analytics", label: "Analytics", icon: ChartColumn },
    ],
  },
];

/* ⌘K reaches every page and creator, same behavior as the admin shell. */
export interface ManagerSearchPerson {
  id: string;
  name: string;
  status: string;
}

interface ManagerSearchEntry extends CommandItem {
  href: string;
}

function SideItem({
  item,
  active,
  badge,
  onNavigate,
}: {
  item: NavItem;
  active: boolean;
  badge?: number;
  onNavigate?: () => void;
}) {
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      onClick={onNavigate}
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

export function ManagerShell({
  children,
  companyName,
  name,
  people,
  reviewCount,
}: {
  children: ReactNode;
  companyName: string;
  name?: string | null;
  people: ManagerSearchPerson[];
  /** Items waiting in the review queues; badge on the Review nav item. */
  reviewCount: number;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const searchIndex = useMemo<ManagerSearchEntry[]>(
    () => [
      ...NAV_SECTIONS.flatMap((section) =>
        section.items.map(
          (it): ManagerSearchEntry => ({
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
        (p): ManagerSearchEntry => ({
          id: "pe-" + p.id,
          section: "Creators",
          icon: CircleUserRound,
          title: p.name,
          meta: p.status,
          href: `/manager/creators/${p.id}`,
        }),
      ),
    ],
    [people],
  );

  const onSearchSelect = useCallback(
    (item: ManagerSearchEntry) => router.push(item.href),
    [router],
  );

  const sidebar = (
    <>
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
        {NAV_SECTIONS.map((section) => (
          <div key={section.label} className="flex flex-col gap-0.5">
            <span className="px-[11px] pb-1.5 text-[11px] font-extrabold uppercase tracking-[0.9px] text-slate-400">
              {section.label}
            </span>
            {section.items.map((it) => (
              <SideItem
                key={it.href}
                item={it}
                active={
                  it.href === "/manager"
                    ? pathname === "/manager" ||
                      pathname.startsWith("/manager/review")
                    : pathname.startsWith(it.href)
                }
                badge={
                  it.label === "Review" && reviewCount > 0
                    ? reviewCount
                    : undefined
                }
                onNavigate={() => setDrawerOpen(false)}
              />
            ))}
          </div>
        ))}
      </nav>
      <div className="mt-3 border-t border-line">
        <AccountSwitcher
          name={name ?? "Campaign manager"}
          subtitle="Campaign manager"
        />
      </div>
    </>
  );

  return (
    <div className="flex h-dvh overflow-hidden bg-ground text-ink font-ops">
      <aside className="hidden w-[236px] shrink-0 flex-col border-r border-line bg-white px-3.5 pb-3.5 pt-[22px] md:flex">
        {sidebar}
      </aside>

      {drawerOpen ? (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setDrawerOpen(false)}
            className="absolute inset-0 cursor-pointer border-none bg-ink/30 animate-om-fade"
          />
          <aside className="absolute bottom-0 left-0 top-0 flex w-[280px] max-w-[85vw] flex-col bg-white px-3.5 pb-3.5 pt-[22px] shadow-xl animate-om-rise">
            {sidebar}
          </aside>
        </div>
      ) : null}

      <main className="flex min-w-0 flex-1 flex-col">
        <div className="flex shrink-0 items-center gap-2.5 px-4 pt-4 md:justify-center md:px-11">
          <button
            type="button"
            aria-label="Open menu"
            onClick={() => setDrawerOpen(true)}
            className="inline-flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center border border-line bg-white rounded-[13px] md:hidden"
          >
            <Menu size={18} className="text-slate-500" />
          </button>
          <div className="flex w-full max-w-[560px] justify-center">
            <CommandSearch index={searchIndex} onSelect={onSearchSelect} />
          </div>
        </div>
        <div className="scrollbar-none flex-1 overflow-y-auto">
          <div
            key={pathname}
            className="mx-auto w-full max-w-[1100px] px-4 pb-[72px] pt-[24px] animate-om-rise md:px-11 md:pt-[30px]"
          >
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}