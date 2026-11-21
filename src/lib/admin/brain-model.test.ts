import { describe, expect, it } from "vitest";

import {
  brainUploadProblem,
  conflictTitle,
  coveragePercent,
  factDetails,
  factLead,
  factSourceLabel,
  factStatus,
  failedInputLabel,
  reviewQueue,
  scanLine,
  scanSteps,
  sectionFacts,
  sourceLabel,
  BRAIN_SECTIONS,
  ENTITY_SPECS,
  type FactView,
  type IngestState,
} from "./brain-model";

function fact(overrides: Partial<FactView> = {}): FactView {
  return {
    id: "f1",
    entity_type: "offer",
    key: "trial",
    title: "Free trial",
    data: { kind: "trial", terms: "14 day free trial", url: "", ends_on: "" },
    status: "inferred",
    confidence: 0.9,
    authority_tier: 3,
    in_conflict: false,
    overdue: false,
    source_details: [],
    ...overrides,
  };
}

function ingest(overrides: Partial<NonNullable<IngestState["ingest"]>> = {}, facts = 0): IngestState {
  return {
    ingest: {
      status: "running",
      phase: "crawl",
      progress: { done: [], failed: [], notes: [] },
      error: null,
      ...overrides,
    },
    summary: {
      sources: 4,
      sources_pending: 0,
      facts,
      facts_confirmed: 0,
      conflicts_open: 0,
      coverage: 0,
      missing: [],
    },
    started: false,
  };
}

describe("sourceLabel", () => {
  it("names the page of the site a fact came from", () => {
    const page = (url: string) => sourceLabel({ kind: "website_page", url, title: null });
    expect(page("https://acme.com/pricing")).toBe("From your pricing page");
    expect(page("https://acme.com/")).toBe("From your home page");
    expect(page("https://www.acme.com/help/billing/")).toBe("From acme.com/help/billing");
  });

  it("names the other kinds of source in plain words", () => {
    expect(sourceLabel({ kind: "app_store", url: null, title: "x" })).toBe("From your store listing");
    expect(sourceLabel({ kind: "survey_answer", url: null, title: "q" })).toBe("From your answer");
    expect(sourceLabel({ kind: "upload", url: null, title: "Pasted text" })).toBe("From pasted text");
    expect(sourceLabel({ kind: "upload", url: null, title: "deck.md" })).toBe("From deck.md");
    expect(sourceLabel({ kind: "manual", url: null, title: "Brand doc: product truth" })).toBe(
      "From your earlier brain",
    );
    expect(sourceLabel(undefined)).toBe("No source");
  });

  it("counts further sources and credits a typed record to the team", () => {
    const two = fact({
      source_details: [
        { kind: "website_page", url: "https://acme.com/pricing", title: null, excerpt: "a" },
        { kind: "app_store", url: null, title: null, excerpt: "b" },
      ],
    });
    expect(factSourceLabel(two)).toBe("From your pricing page and 1 more");
    expect(factSourceLabel(fact({ extracted_by: "human" }))).toBe("Added by your team");
    expect(factSourceLabel(fact({ extracted_by: "model" }))).toBe("No source");
  });
});

describe("record display", () => {
  it("leads with the entity's lead field and lists the other filled fields", () => {
    const f = fact();
    expect(factLead(f)).toBe("14 day free trial");
    expect(factDetails(f)).toEqual([{ label: "Part", value: "Trial" }]);
  });

  it("falls back to the title and hides unknowns, zeros and empty lists", () => {
    const f = fact({
      entity_type: "demo_moment",
      title: "Send a clip",
      data: { user_action: "", seconds: 0, must_not_show: [], is_aha: true, feature: "unknown" },
    });
    expect(factLead(f)).toBe("Send a clip");
    expect(factDetails(f)).toEqual([{ label: "The moment a new user gets it", value: "Yes" }]);
  });

  it("gives every entity a lead that is one of its fields", () => {
    for (const spec of Object.values(ENTITY_SPECS)) {
      expect(spec.fields.some((f) => f.key === spec.lead)).toBe(true);
    }
  });

  it("puts every entity type in exactly one section", () => {
    const placed = BRAIN_SECTIONS.flatMap((s) => s.types).sort();
    expect(placed).toEqual(Object.keys(ENTITY_SPECS).sort());
  });

  it("lets an open conflict or an overdue check outrank the stored status", () => {
    expect(factStatus(fact({ status: "confirmed" })).label).toBe("Confirmed");
    expect(factStatus(fact({ status: "confirmed", in_conflict: true })).label).toBe("Disputed");
    expect(factStatus(fact({ status: "confirmed", overdue: true })).label).toBe("Stale");
    expect(factStatus(fact()).label).toBe("Inferred");
  });

  it("names a conflict by record type and field", () => {
    expect(conflictTitle({ entity_type: "offer", field: "terms" })).toBe("Offer: exact terms");
    expect(conflictTitle({ entity_type: "mystery", field: "some_field" })).toBe("Some field");
  });
});

describe("review order", () => {
  it("drops confirmed and conflicting records and puts the least certain first", () => {
    const groups = [
      {
        entity_type: "offer" as const,
        label: "Offer",
        facts: [
          fact({ id: "sure", confidence: 0.9 }),
          fact({ id: "done", status: "confirmed" }),
          fact({ id: "clash", in_conflict: true }),
          fact({ id: "guess", confidence: 0.4 }),
          fact({ id: "old", confidence: 0.9, overdue: true }),
          fact({ id: "argued", status: "disputed", confidence: 0.9 }),
        ],
      },
    ];
    expect(reviewQueue({ groups }).map((f) => f.id)).toEqual(["argued", "old", "guess", "sure"]);
  });

  it("gathers a section's records across its entity types in order", () => {
    const groups = [
      { entity_type: "claim" as const, label: "Claims", facts: [fact({ id: "c", entity_type: "claim" })] },
      { entity_type: "proof" as const, label: "Proof", facts: [fact({ id: "p", entity_type: "proof" })] },
    ];
    const proof = BRAIN_SECTIONS.find((s) => s.id === "proof")!;
    expect(sectionFacts(groups, proof).map((f) => f.id)).toEqual(["p", "c"]);
  });
});

describe("scan progress", () => {
  it("marks phases before the current one done and the current one active", () => {
    expect(scanSteps(ingest({ phase: "extract" }).ingest).map((s) => s.state)).toEqual([
      "done",
      "active",
      "waiting",
      "waiting",
    ]);
    expect(scanSteps(ingest({ status: "done", phase: "done" }).ingest).every((s) => s.state === "done")).toBe(true);
    expect(scanSteps(null).every((s) => s.state === "waiting")).toBe(true);
  });

  it("does not show a failed run's phase as still working", () => {
    expect(scanSteps(ingest({ status: "failed", phase: "extract" }).ingest).map((s) => s.state)).toEqual([
      "done",
      "waiting",
      "waiting",
      "waiting",
    ]);
  });

  it("writes one line with the phase and what has been found", () => {
    expect(scanLine(null)).toBe("Scan not started");
    expect(scanLine(ingest())).toBe("Reading your pages · 4 pages");
    expect(scanLine(ingest({ phase: "extract" }, 12))).toBe("Understanding your product · 4 pages");
    expect(scanLine(ingest({ status: "done", phase: "done" }, 1))).toBe("Scan finished · 4 pages");
    expect(scanLine(ingest({ status: "failed" }))).toBe("Scan stopped");
  });

  it("names an unreadable input the way it was given", () => {
    expect(failedInputLabel("website:https://acme.com/")).toBe("acme.com");
    expect(failedInputLabel("store:https://apps.apple.com/us/app/id1")).toBe("apps.apple.com/us/app/id1");
    expect(
      failedInputLabel("doc:brain-uploads/co/3f2a1b7c-9d2e-4b1a-8c3d-1a2b3c4d5e6f-deck.md"),
    ).toBe("deck.md");
    expect(failedInputLabel("legacy")).toBe("Earlier brain");
  });

  it("shows coverage as a whole percent inside 0 to 100", () => {
    expect(coveragePercent(0.624)).toBe(62);
    expect(coveragePercent(1.4)).toBe(100);
    expect(coveragePercent(Number.NaN)).toBe(0);
  });
});

describe("uploads", () => {
  it("accepts text formats and refuses what the scan cannot read", () => {
    expect(brainUploadProblem({ name: "notes.md", size: 10 })).toBeNull();
    expect(brainUploadProblem({ name: "Deck.PDF", size: 10 })).toBe("That file type cannot be read yet.");
    expect(brainUploadProblem({ name: "empty.txt", size: 0 })).toBe("That file is empty.");
    expect(brainUploadProblem({ name: "big.csv", size: 7 * 1024 * 1024 })).toBe("That file is over 6 MB.");
  });
});
