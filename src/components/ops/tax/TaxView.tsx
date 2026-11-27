"use client";

import { ChevronLeft, ChevronRight, Download, ExternalLink } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { Avatar, Card, Chip, PageHead, Pill, type ChipTone } from "@/components/kit";
import type { TaxForm, TaxRow } from "@/lib/ops/tax";

/* One calendar year of creator pay. To file: US creators at or over the
   reporting amount. No form: anyone paid without a W-9 on file. Nothing
   scrolls: rows page. */

const PER_PAGE = 7;

const FILTERS = [
  ["file", "To file"],
  ["noform", "No form"],
  ["all", "Paid"],
] as const;
type Filter = (typeof FILTERS)[number][0];

const FORM_CHIP: Record<TaxForm, [string, ChipTone]> = {
  w9: ["W-9", "green"],
  check: ["Check form", "amber"],
  missing: ["No form", "amber"],
};

function money(cents: number): string {
  return `$${(cents / 100).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function inFilter(r: TaxRow, f: Filter): boolean {
  if (f === "file") return r.needs1099;
  if (f === "noform") return r.form !== "w9";
  return true;
}

function csvCell(v: string): string {
  return /[",\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v;
}

export function TaxView({
  year,
  current,
  thresholdCents,
  rows,
}: {
  year: number;
  current: boolean;
  thresholdCents: number;
  rows: TaxRow[];
}) {
  const [filter, setFilter] = useState<Filter>(() => (rows.some((r) => r.needs1099) ? "file" : "all"));
  const [page, setPage] = useState(0);

  const shown = rows.filter((r) => inFilter(r, filter));
  const pages = Math.max(1, Math.ceil(shown.length / PER_PAGE));
  const at = Math.min(page, pages - 1);
  const visible = shown.slice(at * PER_PAGE, at * PER_PAGE + PER_PAGE);

  const download = () => {
    const lines = [
      ["Name", "Email", "Country", `Paid ${year}`, "Payouts", "Tax form", "1099-NEC"].join(","),
      ...shown.map((r) =>
        [
          csvCell(r.name),
          csvCell(r.email ?? ""),
          r.country ?? "",
          (r.paidCents / 100).toFixed(2),
          String(r.payouts),
          FORM_CHIP[r.form][0],
          r.needs1099 ? "Yes" : "No",
        ].join(","),
      ),
    ];
    const url = URL.createObjectURL(new Blob([lines.join("\n")], { type: "text/csv" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `noni-1099-${year}-${filter}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const navDisc =
    "inline-flex h-[34px] w-[34px] items-center justify-center border border-line bg-white text-ink no-underline rounded-pill";

  return (
    <div>
      <PageHead
        title="1099s"
        right={
          <>
            <span className="flex items-center gap-2">
              {year > 2025 ? (
                <Link href={`/ops/tax?y=${year - 1}`} aria-label="Earlier year" className={navDisc}>
                  <ChevronLeft size={16} />
                </Link>
              ) : (
                <span className={`${navDisc} opacity-30`} aria-hidden>
                  <ChevronLeft size={16} />
                </span>
              )}
              <span className="min-w-[56px] text-center text-[14.5px] font-bold text-ink">{year}</span>
              {current ? (
                <span className={`${navDisc} opacity-30`} aria-hidden>
                  <ChevronRight size={16} />
                </span>
              ) : (
                <Link href={`/ops/tax?y=${year + 1}`} aria-label="Later year" className={navDisc}>
                  <ChevronRight size={16} />
                </Link>
              )}
            </span>
            <Pill size="sm" icon={Download} disabled={shown.length === 0} onClick={download}>
              CSV
            </Pill>
            <a
              href="https://app.mercury.com"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-[13.5px] font-bold text-blue-600 no-underline hover:underline"
            >
              File in Mercury
              <ExternalLink size={14} />
            </a>
          </>
        }
      />
      <div className="mb-4 flex flex-wrap items-center gap-2">
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
            {label} {rows.filter((r) => inFilter(r, f)).length}
          </button>
        ))}
        <span className="ml-auto text-[13px] font-bold text-slate-400">
          {money(thresholdCents).replace(".00", "")} and up gets a 1099
        </span>
      </div>
      <Card pad={0} className="overflow-hidden">
        {visible.length === 0 ? (
          <p className="m-0 px-5 py-[22px] text-[13.5px] font-semibold text-slate-400">Nothing here.</p>
        ) : null}
        {visible.map((r) => {
          const [formLabel, formTone] = FORM_CHIP[r.form];
          const facts = [r.email, r.country, `${r.payouts} ${r.payouts === 1 ? "payout" : "payouts"}`].filter(Boolean);
          return (
            <div key={r.creatorId} className="flex min-h-[72px] items-center gap-3.5 border-b border-line px-5 py-3 last:border-b-0">
              <Avatar name={r.name} size={38} />
              <span className="min-w-0 flex-1">
                <Link href={`/ops/users/${r.creatorId}`} className="block truncate text-[15px] font-bold text-ink no-underline hover:text-blue-600">
                  {r.name}
                </Link>
                <span className="mt-0.5 block truncate text-[13px] font-semibold text-slate-400">{facts.join(" · ")}</span>
              </span>
              <span className="w-[120px] text-right text-[17px] font-bold tracking-[-0.3px] tabular-nums text-ink">
                {money(r.paidCents)}
              </span>
              <span className="flex w-[104px] justify-end">
                <Chip tone={formTone}>{formLabel}</Chip>
              </span>
              <span className="flex w-[84px] justify-end">
                {r.needs1099 ? <Chip tone="blue">1099</Chip> : null}
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
