import { describe, expect, it } from "vitest";

import { webRole } from "./accounts";

describe("webRole", () => {
  it("keeps the platform account and an active web seat", () => {
    expect(webRole("admin", ["creator"])).toBe("admin");
    expect(webRole("company_admin", ["campaign_manager"])).toBe("company_admin");
    expect(webRole("campaign_manager", ["company_admin"])).toBe("campaign_manager");
  });

  it("offers a creator in the active company who manages another one", () => {
    expect(webRole("creator", ["creator", "campaign_manager"])).toBe("campaign_manager");
    expect(webRole("creator", ["campaign_manager", "company_admin"])).toBe("company_admin");
  });

  it("uses the other seats when there is no active company", () => {
    expect(webRole(null, ["campaign_manager"])).toBe("campaign_manager");
  });

  it("stays creator when no company has them as admin or manager", () => {
    expect(webRole("creator", ["creator", "creator"])).toBe("creator");
    expect(webRole(null, [])).toBe("creator");
    expect(webRole(undefined, [null, undefined])).toBe("creator");
  });
});
