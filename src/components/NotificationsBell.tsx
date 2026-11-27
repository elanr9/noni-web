"use client";

/* Header bell across every company. Rows come from notifications_feed();
   opening one marks it read, switches company when the link points
   elsewhere, then lands on the deep link's web route. The check on an
   unread row marks it read without leaving the page. */

import { Bell, Check, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { CompanyMark, useCompanies } from "@/components/CompanySwitcher";
import { dayLabel, timeLabel } from "@/components/manager/creators/format";
import { parseDeepLink, webRouteForDeepLink } from "@/lib/deep-link";
import { createClient } from "@/lib/supabase/client";
import type { Database } from "@/lib/supabase/database.types";

const RED = "#E5484D";
const FEED_LIMIT = 50;

type FeedRow =
  Database["public"]["Functions"]["notifications_feed"]["Returns"][number];

function when(iso: string): string {
  const day = dayLabel(iso);
  return day === "Today" ? timeLabel(iso) : day;
}

export function NotificationsBell() {
  const supabase = useMemo(() => createClient(), []);
  const router = useRouter();
  const { active, switchTo } = useCompanies();
  const [items, setItems] = useState<FeedRow[]>([]);
  const [open, setOpen] = useState(false);
  const [checked, setChecked] = useState<string | null>(null);
  const wrap = useRef<HTMLDivElement>(null);

  const refetch = useCallback(async () => {
    const { data } = await supabase.rpc("notifications_feed", {
      p_limit: FEED_LIMIT,
    });
    if (data) setItems(data);
  }, [supabase]);

  useEffect(() => {
    void Promise.resolve().then(refetch);
    const channel = supabase
      .channel("notifications-bell")
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

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!wrap.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("mousedown", onDown);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const unread = items.filter((n) => !n.read_at).length;

  const markRead = (row: FeedRow) => {
    if (row.read_at) return;
    const readAt = new Date().toISOString();
    setItems((list) =>
      list.map((n) => (n.id === row.id ? { ...n, read_at: readAt } : n)),
    );
    void supabase.rpc("mark_notification_read", { p_id: row.id });
  };

  const checkOff = (row: FeedRow) => {
    markRead(row);
    setChecked(row.id);
    window.setTimeout(
      () => setChecked((id) => (id === row.id ? null : id)),
      700,
    );
  };

  const go = async (row: FeedRow) => {
    setOpen(false);
    markRead(row);
    const link = parseDeepLink(row.deep_link);
    const href = link ? webRouteForDeepLink(link) : null;
    const companyId = link?.companyId ?? row.company_id;
    if (companyId && companyId !== active?.company_id) {
      await switchTo(companyId, href ?? undefined);
      return;
    }
    if (href) router.push(href);
  };

  return (
    <div ref={wrap} className="relative shrink-0">
      <button
        type="button"
        aria-label={
          unread ? `Notifications, ${unread} unread` : "Notifications"
        }
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="relative inline-flex h-[38px] w-[38px] cursor-pointer items-center justify-center border border-line bg-white shadow-card rounded-pill transition-colors duration-[160ms] ease-om hover:bg-off-white"
      >
        <Bell size={19} className="text-ink" />
        {unread ? (
          <span
            className="absolute -right-1 -top-1 inline-flex h-[17px] min-w-[17px] items-center justify-center px-1 text-[10.5px] font-extrabold text-white rounded-pill"
            style={{
              background: RED,
              border: "2px solid var(--color-off-white)",
            }}
          >
            {unread}
          </span>
        ) : null}
      </button>
      {open ? (
        <div className="absolute right-0 top-[calc(100%+8px)] z-40 flex max-h-[70vh] w-[380px] flex-col border border-line bg-white shadow-xl rounded-[18px] animate-om-rise">
          <div className="flex items-baseline justify-between px-4 pb-2 pt-3.5">
            <span className="text-[16px] font-bold tracking-[-0.3px] text-ink">
              Notifications
            </span>
            <span className="text-[12px] font-semibold text-slate-400">
              All companies
            </span>
          </div>
          <div className="scrollbar-none min-h-0 flex-1 overflow-y-auto px-3 pb-3">
            {items.length === 0 ? (
              <div className="px-1 py-6 text-center text-[13px] font-semibold text-slate-400">
                Caught up
              </div>
            ) : (
              <div className="overflow-hidden border border-line rounded-[14px]">
                {items.map((n) => {
                  const here = n.company_id === active?.company_id;
                  const fresh = !n.read_at;
                  return (
                    <div
                      key={n.id}
                      className="flex items-start border-b border-line transition-colors duration-[160ms] ease-om last:border-b-0 hover:bg-fill-quiet"
                    >
                      <button
                        type="button"
                        onClick={() => void go(n)}
                        className="flex min-w-0 flex-1 cursor-pointer items-start gap-3 py-3 pl-3.5 text-left"
                      >
                        <span className="relative mt-px inline-flex">
                          <CompanyMark
                            name={n.company_name ?? ""}
                            logoPath={n.company_logo_path}
                            size={36}
                          />
                          {fresh ? (
                            <span
                              className="absolute -right-[3px] -top-[3px] h-[11px] w-[11px] rounded-pill"
                              style={{
                                background: RED,
                                border: "2px solid #fff",
                              }}
                            />
                          ) : null}
                        </span>
                        <span className="flex min-w-0 flex-1 flex-col gap-[3px]">
                          <span
                            className={`text-[14px] leading-[1.3] tracking-[-0.1px] text-ink ${
                              fresh ? "font-bold" : "font-medium"
                            }`}
                          >
                            {n.title}
                          </span>
                          {n.body ? (
                            <span className="overflow-hidden text-ellipsis whitespace-nowrap text-[13px] font-medium text-slate-500">
                              {n.body}
                            </span>
                          ) : null}
                          <span className="text-[12px] font-semibold text-slate-400">
                            {n.company_name}
                            {here ? "" : " · switches you there"} ·{" "}
                            {when(n.created_at)}
                          </span>
                        </span>
                      </button>
                      {fresh ? (
                        <button
                          type="button"
                          aria-label="Mark read"
                          onClick={() => checkOff(n)}
                          className="mr-3 mt-[15px] inline-flex h-[26px] w-[26px] shrink-0 cursor-pointer items-center justify-center border border-line bg-white text-slate-400 rounded-pill transition-colors duration-[160ms] ease-om hover:border-accent hover:text-accent"
                        >
                          <Check size={14} strokeWidth={2.6} />
                        </button>
                      ) : checked === n.id ? (
                        <span className="mr-3 mt-[15px] inline-flex h-[26px] w-[26px] shrink-0 items-center justify-center bg-accent text-white rounded-pill animate-om-pop">
                          <Check size={14} strokeWidth={2.6} />
                        </span>
                      ) : (
                        <ChevronRight
                          size={16}
                          className="mr-3.5 mt-5 shrink-0 text-slate-300"
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
