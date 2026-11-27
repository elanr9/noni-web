"use client";

import { ChevronLeft, ChevronRight, ExternalLink, Search } from "lucide-react";
import { useState } from "react";

import { Avatar, Card, Chip, PageHead, type ChipTone } from "@/components/kit";
import type { ContractRow, ContractState } from "@/lib/admin/contracts";

/* The company's creator agreements. Signed: creators on the team. Waiting:
   sent and not signed yet. Ended: signed by creators who have since left.
   Each row opens the agreement itself. Nothing scrolls: rows page. */

const PER_PAGE = 7;

const TABS: [ContractState, string][] = [
  ["signed", "Signed"],
  ["waiting", "Waiting"],
  ["ended", "Ended"],
];

const CHIP: Record<ContractState, [string, ChipTone]> = {
  signed: ["Signed", "green"],
  waiting: ["Waiting", "amber"],
  ended: ["Ended", "slate"],
};

function day(iso: string | null): string {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function ContractsView({ rows }: { rows: ContractRow[] }) {
  const [tab, setTab] = useState<ContractState>(() => TABS.map(([t]) => t).find((t) => rows.some((r) => r.state === t)) ?? "signed");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(0);

  const q = query.trim().toLowerCase();
  const shown = rows.filter((r) => r.state === tab && (!q || r.creator.toLowerCase().includes(q) || r.campaign.toLowerCase().includes(q)));
  const pages = Math.max(1, Math.ceil(shown.length / PER_PAGE));
  const at = Math.min(page, pages - 1);
  const visible = shown.slice(at * PER_PAGE, at * PER_PAGE + PER_PAGE);

  const navDisc =
    "inline-flex h-[34px] w-[34px] cursor-pointer items-center justify-center border border-line bg-white text-ink rounded-pill disabled:cursor-default disabled:opacity-30";

  return (
    <div>
      <PageHead
        title="Contracts"
        right={
          <label className="flex h-[38px] w-[240px] items-center gap-2 rounded-full border border-line bg-white px-3.5 focus-within:border-blue-500">
            <Search size={15} className="text-slate-400" />
            <input
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setPage(0);
              }}
              placeholder="Search"
              aria-label="Search contracts"
              className="min-w-0 flex-1 border-0 bg-transparent p-0 text-[14px] font-semibold text-ink outline-none placeholder:text-slate-300"
            />
          </label>
        }
      />
      <div className="mb-4 flex flex-wrap gap-2">
        {TABS.map(([t, label]) => (
          <button
            key={t}
            type="button"
            onClick={() => {
              setTab(t);
              setPage(0);
            }}
            className={`cursor-pointer rounded-full border px-4 py-1.5 text-[13.5px] font-bold transition-colors ${
              tab === t ? "border-ink bg-ink text-white" : "border-line bg-white text-slate-500 hover:text-ink"
            }`}
          >
            {label} {rows.filter((r) => r.state === t).length}
          </button>
        ))}
      </div>
      <Card pad={0} className="overflow-hidden">
        {visible.length === 0 ? <p className="m-0 px-5 py-[22px] text-[13.5px] font-semibold text-slate-400">Nothing here.</p> : null}
        {visible.map((r) => {
          const [label, tone] = CHIP[r.state];
          return (
            <a
              key={r.id}
              href={`/agreements/${r.id}`}
              target="_blank"
              rel="noreferrer"
              className="flex min-h-[72px] items-center gap-3.5 border-b border-line px-5 py-3 no-underline transition-colors last:border-b-0 hover:bg-fill-quiet"
            >
              <Avatar name={r.creator} size={38} />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[15px] font-bold text-ink">{r.creator}</span>
                <span className="mt-0.5 block truncate text-[13px] font-semibold text-slate-400">{r.campaign}</span>
              </span>
              <span className="w-[130px] text-right text-[13.5px] font-semibold tabular-nums text-slate-500">{day(r.at)}</span>
              <span className="flex w-[92px] justify-end">
                <Chip tone={tone}>{label}</Chip>
              </span>
              <ExternalLink size={16} className="text-slate-300" />
            </a>
          );
        })}
      </Card>
      {pages > 1 ? (
        <div className="mt-3 flex items-center justify-end gap-2">
          <button type="button" aria-label="Previous page" disabled={at === 0} onClick={() => setPage(at - 1)} className={navDisc}>
            <ChevronLeft size={16} />
          </button>
          <span className="text-[13px] font-bold text-slate-500">
            {at + 1} / {pages}
          </span>
          <button type="button" aria-label="Next page" disabled={at >= pages - 1} onClick={() => setPage(at + 1)} className={navDisc}>
            <ChevronRight size={16} />
          </button>
        </div>
      ) : null}
    </div>
  );
}
