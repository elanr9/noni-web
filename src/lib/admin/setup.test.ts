import { describe, expect, it } from "vitest";

import { MOCK_DATASET } from "./mock-data";
import { deriveSetupStatus } from "./setup";
import type { AdminDataset, Member } from "./types";

function member(overrides: Partial<Member> = {}): Member {
  return {
    id: "x",
    role: "Creator",
    name: "Test Person",
    email: "test@example.com",
    status: "Active",
    joined: "Aug 1, 2026",
    ...overrides,
  };
}

function dataset(overrides: Partial<AdminDataset> = {}): AdminDataset {
  return { ...MOCK_DATASET, ...overrides };
}

function withAnswers(
  base: AdminDataset,
  answers: Partial<AdminDataset["company"]["onboarding"]>,
): AdminDataset {
  return {
    ...base,
    company: {
      ...base.company,
      onboarding: { ...base.company.onboarding, ...answers },
    },
  };
}

const filledDocs: AdminDataset["brainDocs"] = [
  { kind: "product", title: "Product", body: "What we sell.", updated: "Aug 1" },
  { kind: "audience", title: "Audience", body: "Who buys.", updated: "Aug 1" },
];

const completeBilling: AdminDataset["billing"] = {
  subscription: {
    status: "active",
    tier: "starter",
    cadence: "annual",
    price: 75,
    renewsAt: "Aug 12, 2027",
    cardBrand: "Visa",
    cardLast4: "4242",
  },
  monthlySpendLimit: 1000,
  spentThisMonth: 0,
  creditBalance: 0,
  autoTopUp: false,
  stripeConnected: true,
  supabaseConnected: true,
  stripeAccountId: "····1FVA",
  topUpHistory: [],
};

const pastDue = {
  status: "past_due" as const,
  tier: "starter" as const,
  cadence: "annual" as const,
  price: 75,
  renewsAt: "Aug 12, 2027",
  cardBrand: "Visa",
  cardLast4: "4242",
};

describe("deriveSetupStatus", () => {
  it("orders the steps plan, connections, screenshots, app, managers, creators", () => {
    const status = deriveSetupStatus(MOCK_DATASET);
    expect(status.steps.map((s) => s.key)).toEqual([
      "billing",
      "sales",
      "logo",
      "media",
      "app",
      "managers",
      "creators",
    ]);
  });

  it("counts the mock dataset as 4 of 7 done (billing, sales and logo pending)", () => {
    const status = deriveSetupStatus(MOCK_DATASET);
    expect(status.doneCount).toBe(4);
    expect(status.remaining).toBe(3);
    expect(status.complete).toBe(false);
    expect(status.steps.find((s) => s.key === "billing")?.done).toBe(false);
    expect(status.steps.find((s) => s.key === "managers")?.done).toBe(true);
    expect(status.steps.find((s) => s.key === "creators")?.done).toBe(true);
  });

  it("requires a running subscription for the plan step, not a budget", () => {
    for (const noBudget of [{ monthlySpendLimit: null }, { monthlySpendLimit: 0 }]) {
      const ok = deriveSetupStatus(
        dataset({ billing: { ...completeBilling, ...noBudget } }),
      );
      expect(ok.steps.find((s) => s.key === "billing")?.done).toBe(true);
    }
    const cases: Array<Partial<AdminDataset["billing"]>> = [
      { subscription: { status: "none" } },
      { subscription: { ...pastDue } },
    ];
    for (const broken of cases) {
      const status = deriveSetupStatus(
        dataset({ billing: { ...completeBilling, ...broken } }),
      );
      expect(status.steps.find((s) => s.key === "billing")?.done).toBe(false);
    }
    const status = deriveSetupStatus(dataset({ billing: completeBilling }));
    expect(status.steps.find((s) => s.key === "billing")?.done).toBe(true);
  });

  it("does not require Stripe Connect for billing", () => {
    const status = deriveSetupStatus(
      dataset({ billing: { ...completeBilling, stripeConnected: false, stripeAccountId: null } }),
    );
    expect(status.steps.find((s) => s.key === "billing")?.done).toBe(true);
    expect(status.steps.find((s) => s.key === "sales")?.done).toBe(false);
  });

  it("counts seeded credit as a budget and a trial as a subscription", () => {
    const status = deriveSetupStatus(
      dataset({
        billing: {
          ...completeBilling,
          subscription: { ...pastDue, status: "trialing" },
          monthlySpendLimit: null,
          creditBalance: 500,
        },
      }),
    );
    expect(status.steps.find((s) => s.key === "billing")?.done).toBe(true);
  });

  it("keeps the manager step when the onboarding count is 0", () => {
    const status = deriveSetupStatus(
      withAnswers(MOCK_DATASET, { managerCount: 0 }),
    );
    expect(status.steps.map((s) => s.key)).toEqual([
      "billing",
      "sales",
      "logo",
      "media",
      "app",
      "managers",
      "creators",
    ]);
  });

  it("titles invite steps as first invite, not the onboarding counts", () => {
    const status = deriveSetupStatus(
      withAnswers(dataset({ managers: [], creators: [] }), {
        managerCount: 2,
        creatorCount: 3,
      }),
    );
    expect(status.steps.find((s) => s.key === "managers")?.title).toBe(
      "Invite a campaign manager",
    );
    expect(status.steps.find((s) => s.key === "creators")?.title).toBe(
      "Invite your first creator",
    );
  });

  it("marks invite steps done after the first person, even if the onboarding count is higher", () => {
    const status = deriveSetupStatus(
      withAnswers(
        dataset({
          managers: [member({ id: "m1", role: "Campaign manager" })],
          creators: [member({ id: "c1" })],
        }),
        { managerCount: 3, creatorCount: 5 },
      ),
    );
    expect(status.steps.find((s) => s.key === "managers")?.done).toBe(true);
    expect(status.steps.find((s) => s.key === "creators")?.done).toBe(true);
  });

  it("defaults both invite requirements to 1 when the company is new to UGC", () => {
    const status = deriveSetupStatus(
      withAnswers(dataset({ managers: [], creators: [] }), {
        doesUgc: false,
        managerCount: 0,
        creatorCount: 0,
      }),
    );
    expect(status.steps).toHaveLength(7);
    expect(status.steps.find((s) => s.key === "managers")?.done).toBe(false);
    expect(status.steps.find((s) => s.key === "creators")?.done).toBe(false);
  });

  it("completes and retires once every step is done", () => {
    const status = deriveSetupStatus(
      dataset({ brainDocs: filledDocs, billing: completeBilling, company: { ...MOCK_DATASET.company, logoPath: "c/logo.png" } }),
    );
    expect(status.doneCount).toBe(7);
    expect(status.remaining).toBe(0);
    expect(status.complete).toBe(true);
  });

  it("leaves the screenshots step open until the media library has something", () => {
    const status = deriveSetupStatus(
      dataset({ company: { ...MOCK_DATASET.company, mediaCount: 0 } }),
    );
    expect(status.steps.find((s) => s.key === "media")?.done).toBe(false);
    expect(status.complete).toBe(false);
  });

  it("never asks the company to confirm its details", () => {
    const status = deriveSetupStatus(
      dataset({ company: { ...MOCK_DATASET.company, brainConfirmed: false } }),
    );
    expect(status.steps.map((s) => s.key)).not.toContain("brain");
  });
});

describe("deriveSetupStatus when Noni runs the campaigns", () => {
  it("asks only for the plan, the connections and the app", () => {
    const status = deriveSetupStatus(withAnswers(dataset(), { runBy: "noni" }));
    expect(status.steps.map((s) => s.key)).toEqual(["billing", "sales", "logo", "app"]);
  });

  it("marks the manager step done when the admin runs it themselves", () => {
    const status = deriveSetupStatus(withAnswers(dataset({ managers: [] }), { runBy: "me", doesUgc: false }));
    expect(status.steps.map((s) => s.key)).toEqual(["billing", "sales", "logo", "media", "app", "managers", "creators"]);
    expect(status.steps.find((s) => s.key === "managers")?.done).toBe(true);
  });

  it("links each invite step to its own Team tab", () => {
    const status = deriveSetupStatus(dataset());
    expect(status.steps.find((s) => s.key === "managers")?.href).toBe("/admin/team?tab=managers");
    expect(status.steps.find((s) => s.key === "creators")?.href).toBe("/admin/team?tab=creators");
  });

  it("keeps the manager step when someone on their team runs it", () => {
    const status = deriveSetupStatus(withAnswers(dataset(), { runBy: "team", doesUgc: false }));
    expect(status.steps.map((s) => s.key)).toEqual(["billing", "sales", "logo", "media", "app", "managers", "creators"]);
  });
});
