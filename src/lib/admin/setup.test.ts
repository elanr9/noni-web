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
    plan: "annual",
    price: 100,
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

describe("deriveSetupStatus", () => {
  it("orders the steps brain, billing, managers, creators", () => {
    const status = deriveSetupStatus(MOCK_DATASET);
    expect(status.steps.map((s) => s.key)).toEqual([
      "brain",
      "billing",
      "managers",
      "creators",
    ]);
  });

  it("counts the mock dataset as 2 of 4 done (invites in, brain and billing pending)", () => {
    const status = deriveSetupStatus(MOCK_DATASET);
    expect(status.doneCount).toBe(2);
    expect(status.remaining).toBe(2);
    expect(status.complete).toBe(false);
    expect(status.steps.find((s) => s.key === "brain")?.done).toBe(false);
    expect(status.steps.find((s) => s.key === "billing")?.done).toBe(false);
    expect(status.steps.find((s) => s.key === "managers")?.done).toBe(true);
    expect(status.steps.find((s) => s.key === "creators")?.done).toBe(true);
  });

  it("marks brain done only when Product AND Audience have content", () => {
    const productOnly = dataset({
      brainDocs: [
        { kind: "product", title: "Product", body: "Filled.", updated: "Aug 1" },
        { kind: "audience", title: "Audience", body: "   ", updated: "" },
      ],
    });
    expect(
      deriveSetupStatus(productOnly).steps.find((s) => s.key === "brain")?.done,
    ).toBe(false);
    expect(
      deriveSetupStatus(dataset({ brainDocs: filledDocs })).steps.find(
        (s) => s.key === "brain",
      )?.done,
    ).toBe(true);
  });

  it("requires subscription AND spend limit AND Stripe for billing", () => {
    const cases: Array<Partial<AdminDataset["billing"]>> = [
      { subscription: { status: "none" } },
      { monthlySpendLimit: null },
      { monthlySpendLimit: 0 },
      { stripeConnected: false },
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

  it("omits the manager step entirely when the onboarding count is 0", () => {
    const status = deriveSetupStatus(
      withAnswers(MOCK_DATASET, { managerCount: 0 }),
    );
    expect(status.steps.map((s) => s.key)).toEqual([
      "brain",
      "billing",
      "creators",
    ]);
  });

  it("titles invite steps with the onboarding counts", () => {
    const status = deriveSetupStatus(
      withAnswers(dataset({ managers: [], creators: [] }), {
        managerCount: 2,
        creatorCount: 3,
      }),
    );
    expect(status.steps.find((s) => s.key === "managers")?.title).toBe(
      "Invite your 2 campaign managers",
    );
    expect(status.steps.find((s) => s.key === "creators")?.title).toBe(
      "Invite your 3 creators",
    );
  });

  it("tracks invited-so-far in the subtitle while partway there", () => {
    const status = deriveSetupStatus(
      withAnswers(
        dataset({
          creators: [member({ id: "c1" })],
        }),
        { creatorCount: 2 },
      ),
    );
    const creators = status.steps.find((s) => s.key === "creators");
    expect(creators?.done).toBe(false);
    expect(creators?.sub).toContain("1 of 2 invited so far.");
  });

  it("defaults both invite requirements to 1 when the company is new to UGC", () => {
    const status = deriveSetupStatus(
      withAnswers(dataset({ managers: [], creators: [] }), {
        doesUgc: false,
        managerCount: 0,
        creatorCount: 0,
      }),
    );
    expect(status.steps).toHaveLength(4);
    expect(status.steps.find((s) => s.key === "managers")?.done).toBe(false);
    expect(status.steps.find((s) => s.key === "creators")?.done).toBe(false);
  });

  it("completes and retires once every step is done", () => {
    const status = deriveSetupStatus(
      dataset({ brainDocs: filledDocs, billing: completeBilling }),
    );
    expect(status.doneCount).toBe(4);
    expect(status.remaining).toBe(0);
    expect(status.complete).toBe(true);
  });
});
