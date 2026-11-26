"use client";

import { Check, ChevronLeft, ChevronRight, Send } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { saveBudget, sendMonthInvoice } from "@/app/ops/invoices/actions";
import { Avatar, Card, Chip, PageHead, Pill, type ChipTone } from "@/components/kit";
import { invoiceFor, shiftMonth, type InvoiceRow, type InvoiceStatus } from "@/lib/ops/invoices";

/* One month of creator budget invoices. Each row is a company: the budget
   agreed on the call (typed here), what carries over from its balance, and
   the invoice that leaves. Send is one press a row, or Send all. Nothing
   scrolls: rows page. */

const PER_PAGE = 7;

const FILTERS = [
  ["todo", "To send"],
  ["sent", "Sent"],
  ["paid", "Paid"],
] as const;
type Filter = (typeof FILTERS)[number][0];

const SENT_CHIP: Record<Exclude<InvoiceStatus, "todo">, [string, ChipTone]> = {
  billing: ["Sending", "slate"],
  open: ["Sent", "blue"],
  paid: ["Paid", "green"],
  skipped: ["Covered", "green"],
  void: ["Voided", "slate"],
  failed: ["Failed", "amber"],
};

type Done = { status: "paid" | "open" | "skipped"; amountCents: number };

function money(cents: number): string {
  const whole = cents % 100 === 0;
  return `$${(cents / 100).toLocaleString("en-US", {
    minimumFractionDigits: whole ? 0 : 2,
    maximumFractionDigits: 2,
  })}`;
}

function dollarsOf(text: string): number {
  return Number(text.replace(/[$,\s]/g, "") || "0");
}

function bucket(row: InvoiceRow): Filter {
  if (row.status === "todo") {
    /* The balance already covers the budget: nothing to send this month. */
    const covered = row.budgetCents > 0 && invoiceFor(row.budgetCents, row.balanceCents, row.unpaidCents) === 0;
    return covered ? "paid" : "todo";
  }
  return row.status === "paid" || row.status === "skipped" ? "paid" : "sent";
}

function monthLabel(month: string): string {
  const [y, m] = month.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, 1)).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

export function InvoicesView({ month, current, rows }: { month: string; current: boolean; rows: InvoiceRow[] }) {
  const router = useRouter();
  /* Opens on the first tab that has something in it. */
  const [filter, setFilter] = useState<Filter>(
    () => FILTERS.map(([f]) => f).find((f) => rows.some((r) => bucket(r) === f)) ?? "todo",
  );
  const [page, setPage] = useState(0);
  const [budgets, setBudgets] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState<Record<string, boolean>>({});
  const [done, setDone] = useState<Record<string, Done>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sendingAll, setSendingAll] = useState(false);

  const budgetText = (r: InvoiceRow) => budgets[r.companyId] ?? (r.budgetCents > 0 ? String(r.budgetCents / 100) : "");
  const budgetCents = (r: InvoiceRow) => {
    const d = dollarsOf(budgetText(r));
    return Number.isFinite(d) && d > 0 ? Math.round(d) * 100 : 0;
  };
  const amountOf = (r: InvoiceRow) => invoiceFor(budgetCents(r), r.balanceCents, r.unpaidCents);
  const canSend = (r: InvoiceRow) =>
    !done[r.companyId] &&
    r.planActive &&
    ((r.status === "todo" && amountOf(r) > 0) || r.status === "failed");

  const shown = rows.filter((r) => bucket(r) === filter);
  const count = (f: Filter) => rows.filter((r) => bucket(r) === f).length;
  const pages = Math.max(1, Math.ceil(shown.length / PER_PAGE));
  const at = Math.min(page, pages - 1);
  const visible = shown.slice(at * PER_PAGE, at * PER_PAGE + PER_PAGE);
  const sendable = rows.filter((r) => bucket(r) === "todo" && canSend(r));

  const send = async (r: InvoiceRow): Promise<boolean> => {
    const id = r.companyId;
    setBusy((b) => ({ ...b, [id]: true }));
    setErrors((e) => ({ ...e, [id]: "" }));
    const typed = budgetCents(r);
    const result = await sendMonthInvoice({
      companyId: id,
      month,
      ...(r.status === "todo" && typed !== r.budgetCents ? { budgetDollars: typed / 100 } : {}),
    });
    setBusy((b) => ({ ...b, [id]: false }));
    if (!result.ok) {
      setErrors((e) => ({ ...e, [id]: result.error }));
      return false;
    }
    setDone((d) => ({ ...d, [id]: { status: result.status, amountCents: result.amountCents } }));
    return true;
  };

  /* The row keeps its green check for a beat before it moves to its tab. */
  const settle = () => window.setTimeout(() => router.refresh(), 1400);

  const sendOne = async (r: InvoiceRow) => {
    if (await send(r)) settle();
  };

  const sendAll = async () => {
    setSendingAll(true);
    for (const r of sendable) await send(r);
    setSendingAll(false);
    settle();
  };

  const commitBudget = async (r: InvoiceRow) => {
    const typed = budgetCents(r);
    if (typed === r.budgetCents || budgets[r.companyId] === undefined) return;
    const result = await saveBudget({ companyId: r.companyId, dollars: typed / 100 });
    if (!result.ok) setErrors((e) => ({ ...e, [r.companyId]: result.error }));
    else router.refresh();
  };

  const navDisc =
    "inline-flex h-[34px] w-[34px] items-center justify-center border border-line bg-white text-ink no-underline rounded-pill";

  return (
    <div>
      <PageHead
        title="Invoices"
        right={
          <>
            <span className="flex items-center gap-2">
              <Link href={`/ops/invoices?m=${shiftMonth(month, -1)}`} aria-label="Earlier month" className={navDisc}>
                <ChevronLeft size={16} />
              </Link>
              <span className="min-w-[132px] text-center text-[14.5px] font-bold text-ink">{monthLabel(month)}</span>
              {current ? (
                <span className={`${navDisc} opacity-30`} aria-hidden>
                  <ChevronRight size={16} />
                </span>
              ) : (
                <Link href={`/ops/invoices?m=${shiftMonth(month, 1)}`} aria-label="Later month" className={navDisc}>
                  <ChevronRight size={16} />
                </Link>
              )}
            </span>
            {sendable.length > 1 || sendingAll ? (
              <Pill size="sm" icon={Send} loading={sendingAll} disabled={sendingAll} onClick={() => void sendAll()}>
                Send all {sendable.length || ""}
              </Pill>
            ) : null}
          </>
        }
      />
      <div className="mb-4 flex flex-wrap gap-2">
        {FILTERS.map(([f, label]) => (
          <button
            key={f}
            type="button"
            onClick={() => {
              setFilter(f);
              setPage(0);
            }}
            className={`cursor-pointer rounded-full border px-4 py-1.5 text-[13.5px] font-bold transition-colors ${
              filter === f ? "border-ink bg-ink text-white" : "border-line bg-white text-slate-500 hover:text-ink"
            }`}
          >
            {label} {count(f)}
          </button>
        ))}
      </div>
      <Card pad={0} className="overflow-hidden">
        {visible.length === 0 ? (
          <p className="m-0 px-5 py-[22px] text-[13.5px] font-semibold text-slate-400">Nothing here.</p>
        ) : null}
        {visible.map((r) => {
          const id = r.companyId;
          const finished = done[id];
          const todo = r.status === "todo";
          const amount = finished ? finished.amountCents : todo ? amountOf(r) : r.amountCents;
          const carried = todo ? Math.max(0, r.balanceCents) : r.carriedCents;
          const facts = [
            todo ? null : `${money(r.billedBudgetCents)} budget`,
            carried > 0 ? `${money(carried)} carried over` : null,
            todo && r.unpaidCents > 0 ? `${money(r.unpaidCents)} unpaid` : null,
            r.status === "failed" && r.error ? r.error : null,
          ].filter(Boolean);
          const [chipLabel, chipTone] = finished
            ? SENT_CHIP[finished.status]
            : !todo
              ? SENT_CHIP[r.status as Exclude<InvoiceStatus, "todo">]
              : !r.planActive
                ? (["No plan", "slate"] as [string, ChipTone])
                : budgetCents(r) > 0 && amount === 0
                  ? (["Covered", "green"] as [string, ChipTone])
                  : ["", "slate" as ChipTone];
          return (
            <div key={id} className="flex min-h-[72px] items-center gap-3.5 border-b border-line px-5 py-3 last:border-b-0">
              <Avatar name={r.name} size={38} />
              <span className="min-w-0 flex-1">
                <Link href={`/ops/companies/${id}`} className="block truncate text-[15px] font-bold text-ink no-underline hover:text-blue-600">
                  {r.name}
                </Link>
                {errors[id] ? (
                  <span role="alert" className="mt-0.5 block truncate text-[13px] font-semibold text-danger">
                    {errors[id]}
                  </span>
                ) : facts.length ? (
                  <span className="mt-0.5 block truncate text-[13px] font-semibold text-slate-400">{facts.join(" · ")}</span>
                ) : null}
              </span>
              {todo && !finished ? (
                <label className="flex items-center gap-1.5 border border-line bg-white px-3 py-2 rounded-ops-sm focus-within:border-blue-500">
                  <span className="text-[14px] font-bold text-slate-400">$</span>
                  <input
                    aria-label={`${r.name} monthly budget`}
                    inputMode="numeric"
                    placeholder="Budget"
                    value={budgetText(r)}
                    onChange={(e) => setBudgets((b) => ({ ...b, [id]: e.target.value.replace(/[^\d,]/g, "") }))}
                    onBlur={() => void commitBudget(r)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && canSend(r)) void sendOne(r);
                    }}
                    className="w-[84px] border-0 bg-transparent p-0 text-[14.5px] font-bold text-ink outline-none placeholder:font-semibold placeholder:text-slate-300"
                  />
                  <span className="text-[12.5px] font-semibold text-slate-400">/mo</span>
                </label>
              ) : null}
              <span className="w-[92px] text-right text-[17px] font-bold tracking-[-0.3px] tabular-nums text-ink">
                {todo && !finished && budgetCents(r) === 0 ? "" : money(amount)}
              </span>
              <span className="flex w-[104px] justify-end">
                {finished ? (
                  <Chip tone={chipTone} className="animate-om-bounce">
                    <Check size={13} strokeWidth={3} className="animate-om-check" />
                    {chipLabel}
                  </Chip>
                ) : canSend(r) ? (
                  <Pill size="sm" icon={Send} loading={busy[id]} disabled={busy[id] || sendingAll} onClick={() => void sendOne(r)}>
                    {r.status === "failed" ? "Retry" : "Send"}
                  </Pill>
                ) : chipLabel ? (
                  <Chip tone={chipTone}>{chipLabel}</Chip>
                ) : (
                  <Pill size="sm" icon={Send} disabled>
                    Send
                  </Pill>
                )}
              </span>
            </div>
          );
        })}
      </Card>
      {pages > 1 ? (
        <div className="mt-3 flex items-center justify-end gap-2">
          <button
            type="button"
            aria-label="Previous page"
            disabled={at === 0}
            onClick={() => setPage(at - 1)}
            className={`${navDisc} cursor-pointer disabled:cursor-default disabled:opacity-30`}
          >
            <ChevronLeft size={16} />
          </button>
          <span className="text-[13px] font-bold text-slate-500">
            {at + 1} / {pages}
          </span>
          <button
            type="button"
            aria-label="Next page"
            disabled={at >= pages - 1}
            onClick={() => setPage(at + 1)}
            className={`${navDisc} cursor-pointer disabled:cursor-default disabled:opacity-30`}
          >
            <ChevronRight size={16} />
          </button>
        </div>
      ) : null}
    </div>
  );
}
