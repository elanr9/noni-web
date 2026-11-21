"use client";

/* Multi-company vocabulary for the web shells, matching the mobile pill.
   One source of truth: company_status_summary() feeds the pill badge, the
   popover lines and the strip. Switching goes through set_active_company()
   (never a direct profiles write) and refetches every server component. */

import { ArrowRight, Check, ChevronsUpDown } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

import { companyLogoUrl } from "@/lib/company-logo";
import {
  findSummary,
  isWebRow,
  splitSummaries,
  summaryKey,
  toCompanySummaries,
  type CompanyStatusRow,
  type CompanySummary,
  type Role,
} from "@/lib/company-summary";
import { createClient } from "@/lib/supabase/client";

const RED = "#E5484D";
const RED_SOFT = "#FDE8E9";
const RED_GHOST = "#FFF7F7";
const TOAST_KEY = "noni.switch-toast";
const TOAST_MS = 2400;

type Side = "/admin" | "/manager" | "/ops";

/* Where the web lands after switching. Creators have no web dashboard. */
function homeFor(role: Role): Side | null {
  if (role === "company_admin") return "/admin";
  if (role === "campaign_manager") return "/manager";
  if (role === "admin") return "/ops";
  return null;
}

function sideOf(pathname: string): Side | null {
  if (pathname.startsWith("/admin")) return "/admin";
  if (pathname.startsWith("/manager")) return "/manager";
  if (pathname.startsWith("/ops")) return "/ops";
  return null;
}

/* A dual role company admin may open manager pages; the layout redirects
   if onboarding said they do not run campaigns themselves. */
function mayOpen(role: Role, href: string): boolean {
  const side = sideOf(href);
  if (!side) return false;
  if (role === "admin") return side === "/ops";
  if (role === "company_admin") return side === "/admin" || side === "/manager";
  if (role === "campaign_manager") return side === "/manager";
  return false;
}

export function CompanyMark({
  name,
  logoPath,
  size,
}: {
  name: string;
  logoPath: string | null;
  size: number;
}) {
  const url = companyLogoUrl(logoPath);
  return (
    <span
      /* A logo sits on plain white, as the company drew it; the blue tint is
         only the backdrop for the first-letter fallback. */
      className={`inline-flex shrink-0 items-center justify-center overflow-hidden font-extrabold tracking-[-0.2px] text-blue-700 ${
        url ? "bg-white" : "bg-blue-100"
      }`}
      style={{
        width: size,
        height: size,
        borderRadius: Math.round(size * 0.32),
        fontSize: Math.round(size * 0.5),
      }}
    >
      {url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={url} alt="" className="h-full w-full object-cover" />
      ) : (
        name.trim().charAt(0).toUpperCase()
      )}
    </span>
  );
}

/* Red count or green check. Reused in the pill and the popover rows. */
export function WaitBadge({ count, size = 20 }: { count: number; size?: number }) {
  if (!count) {
    return (
      <span
        aria-label="Caught up"
        className="inline-flex shrink-0 items-center justify-center bg-green-soft rounded-pill"
        style={{ width: size, height: size }}
      >
        <Check size={Math.round(size * 0.62)} className="text-green" />
      </span>
    );
  }
  return (
    <span
      aria-label={`${count} waiting`}
      className="inline-flex shrink-0 items-center justify-center px-1.5 font-extrabold text-white rounded-pill"
      style={{
        minWidth: size,
        height: size,
        background: RED,
        fontSize: Math.round(size * 0.58),
      }}
    >
      {count}
    </span>
  );
}

type CompanyContextValue = {
  companies: CompanySummary[];
  /** The active company's row the web works in. */
  active: CompanySummary | null;
  /** Every side of the active company: a manager who also creates has two. */
  activeRows: CompanySummary[];
  /** Every other company's rows, sorted by what is waiting. */
  others: CompanySummary[];
  waitingElsewhere: number;
  switching: string | null;
  pickerOpen: boolean;
  setPickerOpen: (open: boolean) => void;
  /** Switches the active company and lands on `href` when that role may
      open it. `role` names the side when a company has two rows. */
  switchTo: (companyId: string, href?: string, role?: Role) => Promise<boolean>;
  /** Header mark updates the moment a new logo lands. */
  setActiveLogo: (path: string | null) => void;
};

const CompanyContext = createContext<CompanyContextValue | null>(null);

export function useCompanies(): CompanyContextValue {
  const value = useContext(CompanyContext);
  if (!value) throw new Error("useCompanies needs a CompanyProvider");
  return value;
}

export function CompanyProvider({
  initial,
  children,
}: {
  initial: CompanySummary[];
  children: ReactNode;
}) {
  const supabase = useMemo(() => createClient(), []);
  const router = useRouter();
  const pathname = usePathname();
  const [companies, setCompanies] = useState(initial);
  const [switching, setSwitching] = useState<string | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [toast, setToast] = useState<CompanySummary | null>(null);

  const refetch = useCallback(async () => {
    const { data } = await supabase.rpc("company_status_summary");
    if (!data) return null;
    const next = toCompanySummaries(data as CompanyStatusRow[]);
    setCompanies(next);
    return next;
  }, [supabase]);

  useEffect(() => {
    const channel = supabase
      .channel("company-switcher")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "company_activity" },
        () => void refetch(),
      )
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "notifications" },
        () => void refetch(),
      )
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [supabase, refetch]);

  /* The active company is one value shared with other tabs and the app.
     When this tab comes back into view and the account has moved to another
     company, re-render the page for it so nothing here acts on stale data.
     (The mutating server actions also refuse a stale company themselves.) */
  const activeId = useRef<string | null>(null);
  useEffect(() => {
    activeId.current = companies.find((c) => c.is_active)?.company_id ?? null;
  }, [companies]);
  useEffect(() => {
    const resync = async () => {
      if (document.visibilityState !== "visible") return;
      const before = activeId.current;
      const next = await refetch();
      if (!next) return;
      const now = next.find((c) => c.is_active)?.company_id ?? null;
      if (now !== before) router.refresh();
    };
    const onChange = () => void resync();
    document.addEventListener("visibilitychange", onChange);
    window.addEventListener("focus", onChange);
    return () => {
      document.removeEventListener("visibilitychange", onChange);
      window.removeEventListener("focus", onChange);
    };
  }, [refetch, router]);

  /* A switch that crossed sides reloaded the page; finish its toast here. */
  useEffect(() => {
    const raw = window.sessionStorage.getItem(TOAST_KEY);
    if (!raw) return;
    window.sessionStorage.removeItem(TOAST_KEY);
    const t = window.setTimeout(() => {
      try {
        setToast(JSON.parse(raw) as CompanySummary);
      } catch {
        setToast(null);
      }
    }, 0);
    return () => window.clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(null), TOAST_MS);
    return () => window.clearTimeout(t);
  }, [toast]);

  const switchTo = useCallback(
    async (companyId: string, href?: string, role?: Role) => {
      const target = findSummary(companies, companyId, role);
      if (!target || switching) return false;
      const home = homeFor(target.role);
      if (!home) return false;
      const destination = href && mayOpen(target.role, href) ? href : home;
      if (target.is_active) {
        if (href) router.push(destination);
        return true;
      }
      setSwitching(companyId);
      const { error } = await supabase.rpc("set_active_company", {
        p_company_id: companyId,
      });
      if (error) {
        setSwitching(null);
        if (error.code === "42501") void refetch();
        return false;
      }
      setPickerOpen(false);
      if (sideOf(pathname) !== sideOf(destination)) {
        window.sessionStorage.setItem(TOAST_KEY, JSON.stringify(target));
        window.location.assign(destination);
        return true;
      }
      const next = await refetch();
      setToast((next && findSummary(next, companyId, target.role)) ?? target);
      setSwitching(null);
      router.push(destination);
      router.refresh();
      return true;
    },
    [companies, switching, supabase, pathname, router, refetch],
  );

  const setActiveLogo = useCallback((path: string | null) => {
    setCompanies((list) =>
      list.map((c) => (c.is_active ? { ...c, logo_path: path } : c)),
    );
  }, []);

  const value = useMemo<CompanyContextValue>(() => {
    return {
      companies,
      ...splitSummaries(companies),
      switching,
      pickerOpen,
      setPickerOpen,
      switchTo,
      setActiveLogo,
    };
  }, [companies, switching, pickerOpen, switchTo, setActiveLogo]);

  return (
    <CompanyContext.Provider value={value}>
      {children}
      {toast ? (
        <div
          role="status"
          className="fixed bottom-7 left-1/2 z-[90] flex -translate-x-1/2 items-center gap-2.5 bg-ink px-4 py-3 text-[14px] font-semibold text-white shadow-xl rounded-[16px] animate-om-rise"
        >
          <CompanyMark name={toast.name} logoPath={toast.logo_path} size={26} />
          Now in {toast.name}
        </div>
      ) : null}
    </CompanyContext.Provider>
  );
}

function CompanyRow({
  company,
  current,
  busy,
  onPick,
}: {
  company: CompanySummary;
  current: boolean;
  busy: boolean;
  onPick: () => void;
}) {
  const appOnly = !isWebRow(company);
  const line = busy ? "Switching" : appOnly ? "Creator · in the app" : company.line;
  return (
    <button
      type="button"
      disabled={appOnly || busy}
      onClick={onPick}
      className="flex w-full items-center gap-3 border-b border-line px-3.5 py-3 text-left transition-colors duration-[160ms] ease-om last:border-b-0 hover:bg-fill-quiet disabled:cursor-default disabled:hover:bg-white"
    >
      <CompanyMark name={company.name} logoPath={company.logo_path} size={40} />
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="overflow-hidden text-ellipsis whitespace-nowrap text-[15px] font-bold tracking-[-0.2px] text-ink">
          {company.name}
        </span>
        <span
          className="inline-flex items-center gap-1.5 text-[13px] font-medium text-slate-500"
          style={company.waiting > 0 && !appOnly ? { color: RED } : undefined}
        >
          {company.waiting > 0 && !appOnly ? (
            <span className="h-1.5 w-1.5 rounded-pill" style={{ background: RED }} />
          ) : null}
          {line}
        </span>
      </span>
      {current ? (
        <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center bg-blue-500 rounded-pill">
          <Check size={14} className="text-white" />
        </span>
      ) : appOnly ? null : (
        <WaitBadge count={company.waiting} size={22} />
      )}
    </button>
  );
}

/* Header pill: mark, name, chevrons, divider, badge. Click opens the popover. */
export function CompanyPill() {
  const {
    active,
    activeRows,
    others,
    waitingElsewhere,
    switching,
    pickerOpen,
    setPickerOpen,
    switchTo,
  } = useCompanies();
  const wrap = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!pickerOpen) return;
    const onDown = (e: MouseEvent) => {
      if (!wrap.current?.contains(e.target as Node)) setPickerOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setPickerOpen(false);
    };
    window.addEventListener("mousedown", onDown);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("keydown", onKey);
    };
  }, [pickerOpen, setPickerOpen]);

  if (!active) return null;

  return (
    <div ref={wrap} className="relative shrink-0">
      <button
        type="button"
        onClick={() => setPickerOpen(!pickerOpen)}
        aria-expanded={pickerOpen}
        aria-label={`Company: ${active.name}. ${
          waitingElsewhere ? `${waitingElsewhere} waiting in other companies` : "Caught up everywhere"
        }`}
        className="inline-flex h-[38px] max-w-[280px] cursor-pointer items-center gap-2 border border-line bg-white pl-[7px] pr-2 shadow-card rounded-pill transition-colors duration-[160ms] ease-om hover:bg-off-white"
      >
        <CompanyMark name={active.name} logoPath={active.logo_path} size={24} />
        <span className="overflow-hidden text-ellipsis whitespace-nowrap text-[14px] font-bold tracking-[-0.2px] text-ink">
          {active.name}
        </span>
        <ChevronsUpDown size={15} className="shrink-0 text-slate-400" />
        <span className="h-[18px] w-px shrink-0 bg-line" />
        <WaitBadge count={waitingElsewhere} size={20} />
      </button>
      {pickerOpen ? (
        <div className="absolute left-0 top-[calc(100%+8px)] z-40 flex w-[340px] flex-col gap-3 border border-line bg-white p-3 shadow-xl rounded-[18px] animate-om-rise">
          <div className="overflow-hidden border border-line rounded-[14px]">
            {activeRows.map((c) => (
              <CompanyRow
                key={summaryKey(c)}
                company={c}
                current={c === active}
                busy={false}
                onPick={() => setPickerOpen(false)}
              />
            ))}
          </div>
          {others.length ? (
            <div>
              <div className="px-0.5 pb-2 text-[11px] font-extrabold uppercase tracking-[0.9px] text-slate-400">
                Other companies
              </div>
              <div className="overflow-hidden border border-line rounded-[14px]">
                {others.map((c) => (
                  <CompanyRow
                    key={summaryKey(c)}
                    company={c}
                    current={false}
                    busy={switching === c.company_id && isWebRow(c)}
                    onPick={() => void switchTo(c.company_id, undefined, c.role)}
                  />
                ))}
              </div>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

/* Under a page title when another company needs you. Hidden when nothing
   is waiting elsewhere. */
export function ElsewhereStrip() {
  const { others, switchTo, setPickerOpen } = useCompanies();
  const waiting = others.filter((c) => c.waiting > 0 && isWebRow(c));
  if (!waiting.length) return null;
  const first = waiting[0];
  const rest = waiting.length - 1;
  return (
    <div
      className="mb-5 flex items-center gap-2.5 py-2.5 pl-2.5 pr-3 rounded-[14px]"
      style={{ background: RED_GHOST, border: `1px solid ${RED_SOFT}` }}
    >
      <span className="relative inline-flex">
        <CompanyMark name={first.name} logoPath={first.logo_path} size={30} />
        <span
          className="absolute -right-[3px] -top-[3px] h-2.5 w-2.5 rounded-pill"
          style={{ background: RED, border: `2px solid ${RED_GHOST}` }}
        />
      </span>
      <span className="flex min-w-0 flex-1 flex-col gap-px">
        <span className="text-[14px] font-bold tracking-[-0.1px] text-ink">
          {first.name} needs you
        </span>
        <span className="overflow-hidden text-ellipsis whitespace-nowrap text-[13px] font-medium text-slate-500">
          {first.line}
          {rest ? ` · ${rest} more` : ""}
        </span>
      </span>
      {rest ? (
        <button
          type="button"
          onClick={() => setPickerOpen(true)}
          className="cursor-pointer px-1 py-1.5 text-[13px] font-bold text-slate-500"
        >
          All
        </button>
      ) : null}
      <button
        type="button"
        onClick={() => void switchTo(first.company_id, undefined, first.role)}
        className="inline-flex cursor-pointer items-center gap-1 whitespace-nowrap bg-ink py-[7px] pl-3 pr-[11px] text-[13px] font-bold text-white rounded-pill"
      >
        Switch
        <ArrowRight size={13} />
      </button>
    </div>
  );
}
