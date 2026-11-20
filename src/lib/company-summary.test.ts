import { describe, expect, it } from "vitest";

import {
  findSummary,
  splitSummaries,
  summaryKey,
  type CompanySummary,
  type Role,
} from "./company-summary";

function row(
  company_id: string,
  role: Role,
  extra: Partial<CompanySummary> = {},
): CompanySummary {
  return {
    company_id,
    name: company_id,
    logo_path: null,
    role,
    is_active: false,
    waiting: 0,
    line: "Caught up",
    ...extra,
  };
}

/* Acme: active, manager who also creates (two rows). Beta: creator only.
   Core: admin with work waiting. Dune: manager who also creates. */
const ROWS = [
  row("acme", "creator", { is_active: true, waiting: 2 }),
  row("acme", "campaign_manager", { is_active: true, waiting: 3 }),
  row("beta", "creator", { waiting: 9 }),
  row("core", "company_admin", { waiting: 4 }),
  row("dune", "campaign_manager", { waiting: 5 }),
  row("dune", "creator", { waiting: 5 }),
];

describe("summaryKey", () => {
  it("tells the two sides of one company apart", () => {
    const keys = ROWS.map(summaryKey);
    expect(new Set(keys).size).toBe(ROWS.length);
  });
});

describe("findSummary", () => {
  it("lands on the web side of a two-sided company by default", () => {
    expect(findSummary(ROWS, "acme")?.role).toBe("campaign_manager");
    expect(findSummary(ROWS, "dune")?.role).toBe("campaign_manager");
  });

  it("finds the exact side when one is named", () => {
    expect(findSummary(ROWS, "dune", "creator")?.role).toBe("creator");
    expect(findSummary(ROWS, "core", "creator")).toBeNull();
  });

  it("falls back to the creator row of a creator-only company", () => {
    expect(findSummary(ROWS, "beta")?.role).toBe("creator");
    expect(findSummary(ROWS, "nope")).toBeNull();
  });
});

describe("splitSummaries", () => {
  const split = splitSummaries(ROWS);

  it("groups both sides of the active company, web side first", () => {
    expect(split.active?.role).toBe("campaign_manager");
    expect(split.activeRows.map(summaryKey)).toEqual([
      "acme:campaign_manager",
      "acme:creator",
    ]);
    expect(split.others.some((r) => r.company_id === "acme")).toBe(false);
  });

  it("sorts other companies by web work waiting and keeps sides together", () => {
    expect(split.others.map(summaryKey)).toEqual([
      "dune:campaign_manager",
      "dune:creator",
      "core:company_admin",
      "beta:creator",
    ]);
  });

  it("counts waiting work once per company, web sides only", () => {
    expect(split.waitingElsewhere).toBe(9);
  });

  it("falls back to the first company when none is active", () => {
    const none = splitSummaries([row("beta", "creator"), row("core", "company_admin")]);
    expect(none.active?.company_id).toBe("beta");
    expect(none.others.map(summaryKey)).toEqual(["core:company_admin"]);
    expect(splitSummaries([]).active).toBeNull();
  });
});
