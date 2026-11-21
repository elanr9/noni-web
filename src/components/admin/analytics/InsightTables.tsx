"use client";

/* The ranked tables behind "which posts work": one row per post with its
   views, the sign-ups and revenue that came in on the creator's code (the
   only ones that can be tied to a post, hence "Code sign-ups"), what
   it cost and a plain verdict, and the same numbers rolled up by creator
   or by format. Click a column to rank by it. Long lists page, they never
   scroll. */
import { ArrowDown, ChevronLeft, ChevronRight, ExternalLink, Images, Play } from "lucide-react";
import { useState } from "react";

import { Avatar, Chip, type ChipTone } from "@/components/kit";
import {
  fmtCount,
  fmtMoney,
  fmtMultiple,
  fmtRate,
  fmtSignups,
  shortDay,
  sortRows,
  type GroupRow,
  type PostRow,
  type PostSort,
  type Verdict,
} from "@/lib/admin/insights";

const PAGE_SIZE = 6;

const VERDICT_TONE: Record<Verdict, ChipTone> = {
  Winner: "green",
  Average: "slate",
  "Not working": "amber",
  New: "blue",
};

interface Column {
  key: PostSort;
  label: string;
  /** Hidden until the data behind it is connected. */
  show: boolean;
}

function HeadCell({
  label,
  active,
  onClick,
  className = "",
}: {
  label: string;
  active?: boolean;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <th className={`px-2 pb-2.5 text-right font-normal ${className}`}>
      <button
        type="button"
        onClick={onClick}
        disabled={!onClick}
        className={`inline-flex items-center gap-1 whitespace-nowrap border-none bg-transparent p-0 text-[11px] font-extrabold uppercase tracking-[0.7px] ${
          active ? "text-ink" : "text-slate-400"
        } ${onClick ? "cursor-pointer hover:text-ink" : ""}`}
      >
        {label}
        {active ? <ArrowDown size={11} /> : null}
      </button>
    </th>
  );
}

function Pager({
  page,
  pages,
  total,
  noun,
  onPage,
  note,
}: {
  page: number;
  pages: number;
  total: number;
  noun: string;
  onPage: (page: number) => void;
  note?: string;
}) {
  return (
    <div className="mt-2.5 flex items-center gap-2.5">
      <span className="min-w-0 flex-1 truncate text-[12px] font-semibold text-slate-400">
        {note}
      </span>
      {pages > 1 ? (
        <>
          <span className="whitespace-nowrap text-[12px] font-semibold text-slate-400">
            {page * PAGE_SIZE + 1} to {Math.min(total, (page + 1) * PAGE_SIZE)} of {total} {noun}
          </span>
          {[
            { icon: ChevronLeft, to: page - 1, label: "Previous" },
            { icon: ChevronRight, to: page + 1, label: "Next" },
          ].map(({ icon: Icon, to, label }) => (
            <button
              key={label}
              type="button"
              aria-label={label}
              disabled={to < 0 || to >= pages}
              onClick={() => onPage(to)}
              className="inline-flex h-[30px] w-[30px] cursor-pointer items-center justify-center border border-line bg-white text-ink rounded-pill disabled:cursor-default disabled:opacity-35"
            >
              <Icon size={14} />
            </button>
          ))}
        </>
      ) : null}
    </div>
  );
}

function ViewsBar({ value, max }: { value: number; max: number }) {
  return (
    <span className="flex items-center justify-end gap-2.5">
      <span className="hidden h-1.5 w-[72px] overflow-hidden bg-fill-quiet rounded-pill min-[1180px]:block">
        <span
          className="block h-full bg-blue-600 rounded-pill"
          style={{ width: `${max > 0 ? Math.max(2, Math.round((100 * value) / max)) : 0}%` }}
        />
      </span>
      <span className="w-[46px] text-right">{fmtCount(value)}</span>
    </span>
  );
}

export function PostsTable({
  rows,
  showSignups,
  showRevenue,
}: {
  rows: PostRow[];
  showSignups: boolean;
  showRevenue: boolean;
}) {
  const [sort, setSort] = useState<PostSort>("views");
  const [page, setPage] = useState(0);

  const columns: Column[] = [
    { key: "views", label: "Views", show: true },
    { key: "signups", label: "Code sign-ups", show: showSignups },
    { key: "signupsPer1k", label: "Per 1k views", show: showSignups },
    { key: "salesCents", label: "Code revenue", show: showRevenue },
    { key: "costCents", label: "Cost", show: true },
  ];
  const sorted = sortRows(rows, sort);
  const pages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const at = Math.min(page, pages - 1);
  const shown = sorted.slice(at * PAGE_SIZE, (at + 1) * PAGE_SIZE);
  const maxViews = Math.max(...rows.map((r) => r.views), 1);

  if (rows.length === 0)
    return (
      <p className="m-0 py-10 text-center text-[14px] font-semibold text-slate-400">
        No posts in this period.
      </p>
    );

  return (
    <div>
      <table className="w-full border-collapse">
        <thead>
          <tr>
            <HeadCell label="Post" className="!pl-0 !text-left" />
            {columns
              .filter((c) => c.show)
              .map((c) => (
                <HeadCell
                  key={c.key}
                  label={c.label}
                  active={sort === c.key}
                  onClick={() => {
                    setSort(c.key);
                    setPage(0);
                  }}
                />
              ))}
            <HeadCell label="Verdict" className="!pr-0" />
          </tr>
        </thead>
        <tbody>
          {shown.map((r) => {
            const Icon = r.post.format === "Video" ? Play : Images;
            return (
              <tr key={r.post.id} className="border-t border-line">
                <td className="max-w-0 py-[9px] pr-2" style={{ width: "38%" }}>
                  <span className="flex items-center gap-3">
                    <span className="inline-flex h-[38px] w-[30px] shrink-0 items-center justify-center bg-blue-100 rounded-[8px]">
                      <Icon size={13} className="text-blue-700" />
                    </span>
                    <span className="min-w-0 flex-1">
                      {r.post.link ? (
                        <a
                          href={r.post.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group flex items-center gap-1.5 text-[13.5px] font-bold text-ink no-underline"
                        >
                          <span className="truncate group-hover:underline">{r.post.title}</span>
                          <ExternalLink size={11} className="shrink-0 text-slate-400" />
                        </a>
                      ) : (
                        <span className="block truncate text-[13.5px] font-bold text-ink">
                          {r.post.title}
                        </span>
                      )}
                      <span className="mt-px block truncate text-[12px] font-semibold text-slate-400">
                        {r.post.creator} · {r.post.format} · {shortDay(r.post.day)}
                      </span>
                    </span>
                  </span>
                </td>
                <td className="px-2 text-right text-[13.5px] font-bold text-ink">
                  <ViewsBar value={r.views} max={maxViews} />
                </td>
                {showSignups ? (
                  <>
                    <td className="px-2 text-right text-[13.5px] font-bold text-ink">
                      {fmtSignups(r.signups)}
                    </td>
                    <td className="px-2 text-right text-[13.5px] font-bold text-ink">
                      {fmtRate(r.signupsPer1k)}
                    </td>
                  </>
                ) : null}
                {showRevenue ? (
                  <td className="px-2 text-right text-[13.5px] font-bold text-ink">
                    {fmtMoney(r.salesCents)}
                  </td>
                ) : null}
                <td className="px-2 text-right text-[13.5px] font-semibold text-slate-500">
                  {fmtMoney(r.costCents)}
                </td>
                <td className="pl-2 text-right">
                  {r.verdict ? (
                    <Chip tone={VERDICT_TONE[r.verdict]} className="!px-2.5 !py-1">
                      {r.verdict}
                      {r.multiple !== null && r.verdict !== "New" ? ` · ${fmtMultiple(r.multiple)}` : ""}
                    </Chip>
                  ) : (
                    <span className="text-[12.5px] font-semibold text-slate-300">–</span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <Pager
        page={at}
        pages={pages}
        total={sorted.length}
        noun="posts"
        onPage={setPage}
      />
    </div>
  );
}

type GroupSort = "posts" | "views" | "viewsPerPost" | "signups" | "signupsPer1k" | "salesCents" | "costCents";

export function GroupTable({
  rows,
  noun,
  showSignups,
  showRevenue,
  onOpen,
}: {
  rows: GroupRow[];
  /** "Creator" or "Format": the first column's name. */
  noun: string;
  showSignups: boolean;
  showRevenue: boolean;
  /** Makes rows clickable, e.g. through to the creator's profile. */
  onOpen?: (row: GroupRow) => void;
}) {
  const [sort, setSort] = useState<GroupSort>("views");
  const [page, setPage] = useState(0);

  const columns: Array<{ key: GroupSort; label: string; show: boolean }> = [
    { key: "posts", label: "Posts", show: true },
    { key: "views", label: "Views", show: true },
    { key: "viewsPerPost", label: "Views per post", show: true },
    { key: "signups", label: "Code sign-ups", show: showSignups },
    { key: "signupsPer1k", label: "Per 1k views", show: showSignups },
    { key: "salesCents", label: "Code revenue", show: showRevenue },
    { key: "costCents", label: "Cost", show: true },
  ];
  const sorted = [...rows].sort((a, b) => (b[sort] ?? -1) - (a[sort] ?? -1));
  const pages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const at = Math.min(page, pages - 1);
  const shown = sorted.slice(at * PAGE_SIZE, (at + 1) * PAGE_SIZE);
  const maxViews = Math.max(...rows.map((r) => r.views), 1);

  if (rows.length === 0)
    return (
      <p className="m-0 py-10 text-center text-[14px] font-semibold text-slate-400">
        No posts in this period.
      </p>
    );

  const cell = (g: GroupRow, key: GroupSort) => {
    if (key === "views") return <ViewsBar value={g.views} max={maxViews} />;
    if (key === "posts") return String(g.posts);
    if (key === "viewsPerPost") return fmtCount(g.viewsPerPost);
    if (key === "signups") return fmtSignups(g.signups);
    if (key === "signupsPer1k") return fmtRate(g.signupsPer1k);
    if (key === "salesCents") return fmtMoney(g.salesCents);
    return fmtMoney(g.costCents);
  };

  return (
    <div>
      <table className="w-full border-collapse">
        <thead>
          <tr>
            <HeadCell label={noun} className="!pl-0 !text-left" />
            {columns
              .filter((c) => c.show)
              .map((c) => (
                <HeadCell
                  key={c.key}
                  label={c.label}
                  active={sort === c.key}
                  onClick={() => {
                    setSort(c.key);
                    setPage(0);
                  }}
                />
              ))}
            <HeadCell label="Winners" className="!pr-0" />
          </tr>
        </thead>
        <tbody>
          {shown.map((g) => (
            <tr
              key={g.key}
              onClick={onOpen ? () => onOpen(g) : undefined}
              className={`border-t border-line ${
                onOpen ? "cursor-pointer transition-colors duration-[160ms] ease-om hover:bg-fill-quiet" : ""
              }`}
            >
              <td className="py-[11px] pr-2">
                <span className="flex items-center gap-3">
                  {noun === "Creator" ? (
                    <Avatar name={g.label} size={30} />
                  ) : (
                    <span className="inline-flex h-[30px] w-[30px] shrink-0 items-center justify-center bg-blue-100 rounded-[8px]">
                      {g.label === "Video" ? (
                        <Play size={13} className="text-blue-700" />
                      ) : (
                        <Images size={13} className="text-blue-700" />
                      )}
                    </span>
                  )}
                  <span className="whitespace-nowrap text-[13.5px] font-bold text-ink">{g.label}</span>
                </span>
              </td>
              {columns
                .filter((c) => c.show)
                .map((c) => (
                  <td
                    key={c.key}
                    className={`px-2 text-right text-[13.5px] ${
                      c.key === "costCents" ? "font-semibold text-slate-500" : "font-bold text-ink"
                    }`}
                  >
                    {cell(g, c.key)}
                  </td>
                ))}
              <td className="pl-2 text-right">
                {g.winners > 0 ? (
                  <Chip tone="green" className="!px-2.5 !py-1">
                    {g.winners}
                  </Chip>
                ) : (
                  <span className="text-[12.5px] font-semibold text-slate-300">–</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <Pager
        page={at}
        pages={pages}
        total={sorted.length}
        noun={noun.toLowerCase() + "s"}
        onPage={setPage}
      />
    </div>
  );
}
