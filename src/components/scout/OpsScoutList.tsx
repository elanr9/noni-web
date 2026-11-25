import Link from "next/link";

import { Avatar, Card, Chip, PageHead } from "@/components/kit";

export type OpsScoutRow = {
  id: string;
  name: string;
  website: string | null;
  matches: number;
  contacted: number;
  joined: number;
  lastRun: { status: string; at: string } | null;
};

const RUNNING = new Set(["planning", "searching", "enriching", "vetting"]);

export function OpsScoutList({ rows }: { rows: OpsScoutRow[] }) {
  return (
    <div>
      <PageHead title="Scout" />
      <Card pad={0} className="overflow-hidden">
        {rows.length === 0 ? <p className="m-0 px-5 py-[22px] text-[13.5px] font-semibold text-slate-400">No companies yet.</p> : null}
        {rows.map((r) => (
          <Link
            key={r.id}
            href={`/ops/scout/${r.id}`}
            className="flex items-center gap-3.5 border-b border-line px-5 py-4 no-underline transition-colors last:border-b-0 hover:bg-fill-quiet"
          >
            <Avatar name={r.name} size={36} />
            <span className="min-w-0 flex-1">
              <span className="block text-[15px] font-bold text-ink">{r.name}</span>
              <span className="block truncate text-[13px] font-semibold text-slate-400">{r.website ?? ""}</span>
            </span>
            {r.lastRun && RUNNING.has(r.lastRun.status) ? <Chip tone="amber">Searching</Chip> : null}
            <span className="hidden gap-5 text-right sm:flex">
              {(
                [
                  ["Matches", r.matches],
                  ["Contacted", r.contacted],
                  ["Joined", r.joined],
                ] as const
              ).map(([k, v]) => (
                <span key={k} className="flex w-[72px] flex-col">
                  <span className="text-[16px] font-bold tabular-nums text-ink">{v}</span>
                  <span className="text-[11.5px] font-semibold text-slate-400">{k}</span>
                </span>
              ))}
            </span>
          </Link>
        ))}
      </Card>
    </div>
  );
}
