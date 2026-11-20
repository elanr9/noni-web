import type { Database } from "@/lib/supabase/database.types";

/* Shared between server helpers and the client company switcher. Keep this
   module free of server only imports. */

export type Role = "admin" | "company_admin" | "campaign_manager" | "creator";

export function asRole(value: unknown): Role | null {
  return value === "admin" ||
    value === "company_admin" ||
    value === "campaign_manager" ||
    value === "creator"
    ? value
    : null;
}

/* One row per membership from company_status_summary(): powers the company
   switcher badges. Empty for users with no memberships. */
export type CompanySummary = {
  company_id: string;
  name: string;
  logo_path: string | null;
  role: Role;
  is_active: boolean;
  waiting: number;
  line: string;
};

export type CompanyStatusRow =
  Database["public"]["Functions"]["company_status_summary"]["Returns"][number];

/* Shared with the client switcher, which refetches the same rpc. */
export function toCompanySummaries(rows: CompanyStatusRow[] | null): CompanySummary[] {
  return (rows ?? []).flatMap((row) => {
    const role = asRole(row.role);
    if (!role || !row.company_id || !row.name) return [];
    return [
      {
        company_id: row.company_id,
        name: row.name,
        logo_path: row.logo_path,
        role,
        is_active: row.is_active === true,
        waiting: row.waiting ?? 0,
        line: row.line ?? "Caught up",
      },
    ];
  });
}


/* company_status_summary() returns one row per company AND side: a manager
   or admin who also creates there gets a second row with role "creator".
   The company id alone therefore does not identify a row. */
export function summaryKey(row: Pick<CompanySummary, "company_id" | "role">): string {
  return `${row.company_id}:${row.role}`;
}

/** Creator rows have no web dashboard; they run from the Noni app. */
export function isWebRow(row: Pick<CompanySummary, "role">): boolean {
  return row.role !== "creator";
}

/* The row a switch to `companyId` lands on: the exact side when one is
   named, otherwise the side the web can open, before the creator side. */
export function findSummary(
  rows: CompanySummary[],
  companyId: string,
  role?: Role,
): CompanySummary | null {
  const mine = rows.filter((r) => r.company_id === companyId);
  if (role) return mine.find((r) => r.role === role) ?? null;
  return mine.find(isWebRow) ?? mine[0] ?? null;
}

/* Splits the rows for the switcher. `active` is the row the header shows
   (the web side of the active company when there is one), `activeRows` is
   every side of that company, web side first, and `others` is every other
   company sorted by what is waiting, a company's sides kept together.
   `waitingElsewhere` counts web rows only: the creator side cannot be
   opened here, and a company's unread messages sit on both of its rows. */
export function splitSummaries(rows: CompanySummary[]): {
  active: CompanySummary | null;
  activeRows: CompanySummary[];
  others: CompanySummary[];
  waitingElsewhere: number;
} {
  const activeId = (rows.find((r) => r.is_active) ?? rows[0])?.company_id ?? null;
  const webFirst = (a: CompanySummary, b: CompanySummary) =>
    Number(isWebRow(b)) - Number(isWebRow(a));
  const activeRows = rows.filter((r) => r.company_id === activeId).sort(webFirst);
  const rest = rows.filter((r) => r.company_id !== activeId);
  const weight = new Map<string, number>();
  for (const r of rest) {
    if (!isWebRow(r)) continue;
    weight.set(r.company_id, (weight.get(r.company_id) ?? 0) + r.waiting);
  }
  const others = rest
    .map((row, index) => ({ row, index }))
    .sort(
      (a, b) =>
        (weight.get(b.row.company_id) ?? 0) - (weight.get(a.row.company_id) ?? 0) ||
        (a.row.company_id === b.row.company_id ? webFirst(a.row, b.row) : 0) ||
        a.index - b.index,
    )
    .map((entry) => entry.row);
  return {
    active: activeRows[0] ?? null,
    activeRows,
    others,
    waitingElsewhere: [...weight.values()].reduce((n, w) => n + w, 0),
  };
}
