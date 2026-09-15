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

