import { describe, expect, it } from "vitest";

import { invoiceFor, shiftMonth } from "./invoices";

describe("monthly budget invoice", () => {
  it("is the whole budget with nothing carried over", () => {
    expect(invoiceFor(200000, 0, 0)).toBe(200000);
  });
  it("carries leftover balance into the next month", () => {
    expect(invoiceFor(200000, 24000, 0)).toBe(176000);
  });
  it("sends nothing when the balance covers the budget", () => {
    expect(invoiceFor(100000, 130000, 0)).toBe(0);
  });
  it("does not bill an unpaid earlier invoice twice", () => {
    expect(invoiceFor(500000, 0, 100000)).toBe(400000);
  });
  it("steps months across a year", () => {
    expect(shiftMonth("2026-12", 1)).toBe("2027-01");
    expect(shiftMonth("2026-01", -1)).toBe("2025-12");
  });
});
