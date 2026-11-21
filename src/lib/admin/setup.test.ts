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
  it("orders the steps billing, managers, creators", () => {
    const status = deriveSetupStatus(MOCK_DATASET);
    expect(status.steps.map((s) => s.key)).toEqual([
      "billing",
      "managers",
      "creators",
    ]);
  });

  it("counts the mock dataset as 2 of 3 done (invites in, billing pending)", () => {
    const status = deriveSetupStatus(MOCK_DATASET);
    expect(status.doneCount).toBe(2);
    expect(status.remaining).toBe(1);
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

  it("omits the manager step entirely when the onboarding count is 0", () => {
    const status = deriveSetupStatus(
      withAnswers(MOCK_DATASET, { managerCount: 0 }),
    );
    expect(status.steps.map((s) => s.key)).toEqual([
      "billing",
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
      "Invite your first campaign manager",
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
    expect(status.steps.find((s) => s.key === "creators")?.sub).not.toContain(
      "invited so far",
    );
  });

  it("defaults both invite requirements to 1 when the company is new to UGC", () => {
    const status = deriveSetupStatus(
      withAnswers(dataset({ managers: [], creators: [] }), {
        doesUgc: false,
        managerCount: 0,
        creatorCount: 0,
      }),
    );
    expect(status.steps).toHaveLength(3);
    expect(status.steps.find((s) => s.key === "managers")?.done).toBe(false);
    expect(status.steps.find((s) => s.key === "creators")?.done).toBe(false);
  });

  it("completes and retires once every step is done", () => {
    const status = deriveSetupStatus(
      dataset({ brainDocs: filledDocs, billing: completeBilling }),
    );
    expect(status.doneCount).toBe(3);
    expect(status.remaining).toBe(0);
    expect(status.complete).toBe(true);
  });
});
