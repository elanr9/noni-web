import { describe, expect, it } from "vitest";

import { isStaleCompany } from "./stale-company";

describe("isStaleCompany", () => {
  it("passes when the page was rendered for the active company", () => {
    expect(isStaleCompany("a", "a")).toBe(false);
  });

  it("refuses after a switch to another company", () => {
    expect(isStaleCompany("b", "a")).toBe(true);
  });

  it("refuses when either side is missing", () => {
    expect(isStaleCompany(null, "a")).toBe(true);
    expect(isStaleCompany("a", "")).toBe(true);
    expect(isStaleCompany(undefined, undefined)).toBe(true);
  });
});
