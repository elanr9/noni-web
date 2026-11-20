import { describe, expect, it } from "vitest";

import { inviteDestination } from "./destination";

describe("inviteDestination", () => {
  it("sends an admin through onboarding only until the company is set up", () => {
    expect(inviteDestination("company_admin", false)).toBe("/onboarding");
    expect(inviteDestination("company_admin", true)).toBe("/admin");
  });

  it("sends a campaign manager to the manager dashboard", () => {
    expect(inviteDestination("campaign_manager", false)).toBe("/manager");
    expect(inviteDestination("campaign_manager", true)).toBe("/manager");
  });

  it("keeps creators and unknown seats in the app", () => {
    expect(inviteDestination("creator", true)).toBeNull();
    expect(inviteDestination(null, false)).toBeNull();
  });
});
