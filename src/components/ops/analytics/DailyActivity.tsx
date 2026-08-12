"use client";

// CONTRACT STUB — Agent B replaces the implementation. Daily-activity
// calendar plus the day-detail modal, consumed by the Company detail
// Analytics tab (Agent D). Props may be extended with optional fields only.
import type { CompanyDays, Post } from "@/lib/ops/types";

export type DailyActivityProps = {
  companyId: string;
  days: CompanyDays;
  posts: Post[];
};

export function DailyActivity(_props: DailyActivityProps) {
  return null;
}
