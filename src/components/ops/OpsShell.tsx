"use client";

import {
  CircleUserRound,
  Gauge,
  LayoutGrid,
  Send,
  Users,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

import { AccountSwitcher } from "@/components/AccountSwitcher";
import { CommandSearch, type CommandItem } from "@/components/kit";
import type { Company, Invite, Person } from "@/lib/ops/types";

const NAV = [
  { href: "/ops", label: "Overview", icon: Gauge },
  { href: "/ops/companies", label: "Companies", icon: LayoutGrid },
  { href: "/ops/users", label: "Users", icon: Users },
  { href: "/ops/invites", label: "Invites", icon: Send },
] as const;

/* ── ⌘K search wiring ──────────────────────────────────────────────────
   The shell owns the command bar. Pages hook in through useOpsShell():
   - setSearchIndex(entries | null): replace the searchable index (Agent F
     swaps in real data; null restores the mock-data default).
   - setOnSelectUser(handler | null): register what happens when a person
     result is chosen (Agent E opens the profile modal here).
   - openUserProfile(person): invoke the registered handler directly. */

export interface OpsSearchEntry extends CommandItem {
  action:
    | { type: "navigate"; href: string }
    | { type: "user"; person: Person };
}

export interface OpsShellContextValue {
  setSearchIndex: (entries: OpsSearchEntry[] | null) => void;
  setOnSelectUser: (handler: ((person: Person) => void) | null) => void;
  openUserProfile: (person: Person) => void;
}

const OpsShellContext = createContext<OpsShellContextValue | null>(null);

export function useOpsShell(): OpsShellContextValue {
  const ctx = useContext(OpsShellContext);
  if (!ctx) throw new Error("useOpsShell must be used inside OpsShell");
  return ctx;
}

export interface OpsSearchData {
  companies: Company[];
  people: Person[];
  invites: Invite[];
}

function buildDefaultIndex(data: OpsSearchData): OpsSearchEntry[] {
  const names = new Map(data.companies.map((c) => [c.id, c.name]));
  return [
    ...NAV.map(
      (it): OpsSearchEntry => ({
        id: "nav-" + it.href,
        section: "Go to",
        icon: it.icon,
        title: it.label,
        meta: "Platform",
        action: { type: "navigate", href: it.href },
      }),
    ),
    ...data.companies
      .filter((c) => c.status === "Active")
      .map(
        (c): OpsSearchEntry => ({
          id: "co-" + c.id,
          section: "Companies",
          icon: LayoutGrid,
          title: c.name,
          meta: `${c.admin.email} · ${c.status}`,
          action: { type: "navigate", href: `/ops/companies/${c.id}` },
        }),
      ),
    ...data.people.map(
      (p): OpsSearchEntry => ({
        id: "pe-" + p.id,
        section: "Users",
        icon: CircleUserRound,
        title: p.name,
        meta: `${names.get(p.company) ?? ""} · ${p.role}`,
        action: { type: "user", person: p },
      }),
    ),
    ...data.invites.map(
      (iv): OpsSearchEntry => ({
        id: "in-" + iv.id,
        section: "Invites",
        icon: Send,
        title: iv.email,
        meta: `${iv.company} · ${iv.status}`,
        action: { type: "navigate", href: "/ops/invites" },
      }),
    ),
  ];
}

function SideItem({
  href,
  label,
  icon: Icon,
  active,
}: {
  href: string;
  label: string;
  icon: typeof Gauge;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={`flex w-full items-center gap-[11px] px-[11px] py-[9px] text-[13.5px] font-bold transition-colors duration-[160ms] ease-om rounded-[11px] ${
        active
          ? "bg-blue-100 text-blue-700"
          : "text-slate-500 hover:bg-fill-quiet"
      }`}
    >
      <Icon size={17} className={active ? "text-blue-700" : "text-slate-400"} />
      <span className="flex-1 whitespace-nowrap">{label}</span>
    </Link>
  );
}

export function OpsShell({
  children,
  name,
  searchData,
}: {
  children: ReactNode;
  name?: string | null;
  searchData: OpsSearchData;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [indexOverride, setIndexOverride] = useState<OpsSearchEntry[] | null>(null);
  const userHandlerRef = useRef<((person: Person) => void) | null>(null);

  const openUserProfile = useCallback(
    (person: Person) => {
      if (userHandlerRef.current) userHandlerRef.current(person);
      else router.push("/ops/users");
    },
    [router],
  );

  const contextValue = useMemo<OpsShellContextValue>(
    () => ({
      setSearchIndex: setIndexOverride,
      setOnSelectUser: (handler) => {
        userHandlerRef.current = handler;
      },
      openUserProfile,
    }),
    [openUserProfile],
  );

  const defaultIndex = useMemo(() => buildDefaultIndex(searchData), [searchData]);
  const searchIndex = indexOverride ?? defaultIndex;

  const onSearchSelect = useCallback(
    (item: OpsSearchEntry) => {
      if (item.action.type === "navigate") router.push(item.action.href);
      else openUserProfile(item.action.person);
    },
    [router, openUserProfile],
  );

  return (
    <OpsShellContext.Provider value={contextValue}>
      <div className="flex h-screen overflow-hidden bg-ground text-ink font-ops">
        <aside className="flex w-[236px] shrink-0 flex-col border-r border-line bg-white px-3.5 pb-3.5 pt-[22px]">
          <div className="flex items-center gap-[9px] px-[9px]">
            <Image src="/brand/noni-logo.svg" alt="" width={30} height={30} />
            <span className="text-[20px] font-bold tracking-[-0.6px] text-ink">
              noni
            </span>
          </div>
          <nav className="scrollbar-none flex flex-1 flex-col gap-0.5 overflow-y-auto pt-3.5">
            <span className="px-[11px] pb-1.5 text-[11px] font-extrabold uppercase tracking-[0.9px] text-slate-400">
              Platform
            </span>
            {NAV.map((it) => (
              <SideItem
                key={it.href}
                href={it.href}
                label={it.label}
                icon={it.icon}
                active={
                  it.href === "/ops"
                    ? pathname === "/ops"
                    : pathname.startsWith(it.href)
                }
              />
            ))}
          </nav>
          <div className="mt-3 border-t border-line">
            <AccountSwitcher name={name ?? "Noni ops"} subtitle="Noni admin" />
          </div>
        </aside>
        <main className="flex min-w-0 flex-1 flex-col">
          <div className="flex shrink-0 justify-center px-11 pt-4">
            <CommandSearch index={searchIndex} onSelect={onSearchSelect} />
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
    </OpsShellContext.Provider>
  );
}
