"use client";

// CONTRACT STUB — Agent B replaces the implementation. The exported name and
// prop shape below are the agreed interface consumed by Overview (Agent B)
// and Company detail Analytics tab (Agent D). Props may be extended with
// optional fields only.
import type { Company, Person, Post } from "@/lib/ops/types";

export type AnalyticsExplorerProps = {
  /** Company id to scope to, or null for platform-wide. */
  scope?: string | null;
  /** Show the company scope dropdown (Overview: true, company tab: false). */
  showScopeDropdown?: boolean;
  posts: Post[];
  people: Person[];
  companies: Company[];
  onOpenProfile?: (person: Person) => void;
  onOpenPost?: (post: Post) => void;
};

export function AnalyticsExplorer(_props: AnalyticsExplorerProps) {
  return null;
}
