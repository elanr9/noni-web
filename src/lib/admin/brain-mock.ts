/* QA mock for the company brain (dev + ADMIN_QA_MOCK=1), in the shapes the
   brain-* edge functions answer with. State lives in memory and is changed
   in place by the actions in src/app/admin/brain/knowledge-actions.ts, the
   same pattern as MOCK_DATASET. */

import type {
  BrainConflict,
  BrainContext,
  BrainFact,
  BrainQuestion,
  CompanySnapshot,
  EntityType,
  FactGroup,
  FactsList,
  FactView,
  IngestPhase,
  IngestState,
  SnapshotItem,
  SnapshotPart,
  SourceDetail,
} from "./brain-model";
import { ENTITY_SPECS } from "./brain-model";

const SITE = "https://fieldvision.ai";

function src(kind: string, title: string, url: string | null, excerpt: string): SourceDetail {
  return { source_id: `${kind}-${title}`, kind, title, url, excerpt, captured_at: null };
}

const PRICING = (excerpt: string) => src("website_page", "fieldvision.ai/pricing", `${SITE}/pricing`, excerpt);
const HOME = (excerpt: string) => src("website_page", "fieldvision.ai", `${SITE}/`, excerpt);
const STORE = (excerpt: string) =>
  src("app_store", "App Store listing: FieldVision", "https://apps.apple.com/us/app/id1", excerpt);
const REVIEWS = (excerpt: string) =>
  src("review", "App Store reviews: FieldVision", "https://apps.apple.com/us/app/id1", excerpt);

let seq = 0;
function fact(
  entity_type: EntityType,
  title: string,
  data: Record<string, unknown>,
  sources: SourceDetail[],
  extra: Partial<FactView> = {},
): FactView {
  seq += 1;
  return {
    id: `mock-fact-${seq}`,
    entity_type,
    key: title.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    title,
    data,
    status: "inferred",
    confidence: sources.length ? 0.9 : 0.4,
    authority_tier: sources.length ? 3 : 6,
    extracted_by: "model",
    in_conflict: false,
    overdue: false,
    source_details: sources,
    ...extra,
  };
}

const TRIAL_SITE = fact(
  "offer",
  "Free trial",
  { kind: "trial", terms: "14 day free trial, no card needed" },
  [PRICING("Start your 14 day free trial. No credit card required.")],
  { in_conflict: true, status: "disputed" },
);
const TRIAL_STORE = fact(
  "offer",
  "Free trial",
  { kind: "trial", terms: "7 day free trial" },
  [STORE("Try FieldVision free for 7 days.")],
  { in_conflict: true, status: "disputed" },
);

const FACTS: FactView[] = [
  fact(
    "company",
    "FieldVision AI",
    {
      one_liner: "FieldVision turns one sideline phone into a full film crew.",
      category_terms: ["game film app", "auto tracking camera"],
    },
    [HOME("One phone. A full film crew.")],
    { status: "confirmed", confidence: 1, authority_tier: 1 },
  ),
  fact(
    "product",
    "FieldVision",
    {
      name: "FieldVision",
      one_liner: "Films a game from a tripod, follows the ball and tags every play.",
      job: "Get film to the team the same night without a film crew",
      platforms: ["iOS"],
    },
    [HOME("Put a phone on a tripod and press record. FieldVision follows the ball.")],
  ),
  fact(
    "feature",
    "Auto tracking",
    { name: "Auto tracking", description: "Follows the ball without anyone holding the phone.", maturity: "stable" },
    [HOME("Our tracker follows the ball so nobody has to hold the phone.")],
  ),
  fact(
    "feature",
    "Play tagging",
    { name: "Play tagging", description: "Tags each play by down, distance and result.", gating: "Team plan" },
    [PRICING("Team plan: automatic play tagging by down and distance.")],
  ),
  fact(
    "demo_moment",
    "Clip sent the same night",
    {
      feature: "Play tagging",
      start_state: "The game list after the final whistle",
      user_action: "Open the game, tap a tagged play, tap Send to squad",
      end_state: "The clip lands in the team chat with the play name on it",
      seconds: 20,
      is_aha: true,
    },
    [],
    { confidence: 0.4, authority_tier: 6 },
  ),
  fact(
    "persona",
    "Short staffed coach",
    {
      label: "Short staffed coach",
      situation: "Owes the team film by Monday and has nobody to shoot or cut it",
      role: "both",
      vocabulary: ["film", "cut ups", "Hudl"],
    },
    [REVIEWS("I coach alone at a small school. Film used to eat my whole Sunday.")],
    { confidence: 0.7, authority_tier: 5 },
  ),
  fact(
    "pain",
    "Film review takes the whole weekend",
    { statement: "Film used to eat my whole Sunday.", cost: "Six to eight hours a week" },
    [REVIEWS("Film used to eat my whole Sunday.")],
    { confidence: 0.7, authority_tier: 5 },
  ),
  fact(
    "quote",
    "My players had clips before the bus got home",
    { text: "My players had clips before the bus got home.", bucket: "transformation", rating: 5 },
    [REVIEWS("My players had clips before the bus got home.")],
    { confidence: 0.9, authority_tier: 5 },
  ),
  fact(
    "proof",
    "4.8 stars on the App Store",
    { statement: "Rated 4.8 from 2,140 ratings", type: "rating", value: "4.8", as_of: "Nov 2026" },
    [STORE("Rating: 4.8 from 2140 ratings")],
    { overdue: true },
  ),
  fact(
    "claim",
    "Hours of film review cut to minutes",
    { wording: "Cuts film review from hours to minutes", status: "needs_substantiation", type: "performance" },
    [HOME("Film review in minutes, not hours.")],
  ),
  TRIAL_SITE,
  TRIAL_STORE,
  fact(
    "offer",
    "Team plan",
    { kind: "pricing", terms: "$79 a month per team", url: `${SITE}/pricing` },
    [PRICING("Team: $79 per month.")],
  ),
  fact(
    "alternative",
    "Hudl",
    { name: "Hudl", type: "direct", does_well: "Known by every program", falls_short: "Needs a camera rig and someone to run it" },
    [],
    { confidence: 0.4, authority_tier: 6 },
  ),
  fact(
    "voice_rule",
    "Plain coach talk",
    { scope: "brand_voice", rule: "Talk like a coach in the film room, never like an ad", dont: ["game changer", "revolutionary"] },
    [],
    { confidence: 0.4, authority_tier: 6 },
  ),
];

const CONFLICTS: BrainConflict[] = [
  {
    id: "mock-conflict-1",
    entity_type: "offer",
    key: "free-trial",
    fact_ids: [TRIAL_SITE.id, TRIAL_STORE.id],
    field: "terms",
    values: [
      { fact_id: TRIAL_SITE.id, value: "14 day free trial, no card needed", authority_tier: 3 },
      { fact_id: TRIAL_STORE.id, value: "7 day free trial", authority_tier: 3 },
    ],
  },
];

const QUESTIONS: BrainQuestion[] = [
  {
    id: "mock-question-1",
    question: "Can creators say the Team plan includes play tagging for every sport?",
    why: "A brief about soccer needed this.",
    entity_type: "claim",
  },
];

const PHASE_ORDER: IngestPhase[] = ["crawl", "extract", "embed", "suggest", "done"];

interface MockBrain {
  facts: FactView[];
  conflicts: BrainConflict[];
  questions: BrainQuestion[];
  /** -1 before any scan; otherwise an index into PHASE_ORDER that each status poll advances. */
  phase: number;
  legacyImported: boolean;
}

export const MOCK_BRAIN: MockBrain = {
  facts: FACTS,
  conflicts: CONFLICTS,
  questions: QUESTIONS,
  phase: PHASE_ORDER.length - 1,
  legacyImported: false,
};

function coverage(): { coverage: number; missing: string[] } {
  const live = MOCK_BRAIN.facts.filter((f) => f.status !== "retired");
  const confirmed = live.filter((f) => f.status === "confirmed").length;
  const missing = [
    ...(live.some((f) => f.entity_type === "demo_moment" && f.status === "confirmed")
      ? []
      : ["A confirmed demo moment"]),
    ...(MOCK_BRAIN.conflicts.length ? ["Trial terms you stand behind"] : []),
    ...(live.some((f) => f.entity_type === "claim" && f.data.status === "approved")
      ? []
      : ["An approved claim"]),
    ...(live.some((f) => f.entity_type === "compliance") ? [] : ["What creators must never say or show"]),
  ];
  return {
    coverage: Math.min(1, Math.round((0.2 + (confirmed / Math.max(live.length, 1)) * 0.8) * 100) / 100),
    missing,
  };
}

export function mockIngestState(started = false): IngestState {
  const live = MOCK_BRAIN.facts.filter((f) => f.status !== "retired");
  const phase = MOCK_BRAIN.phase < 0 ? null : PHASE_ORDER[MOCK_BRAIN.phase];
  const done = phase === "done";
  /* A scan in flight has found only part of what it will. */
  const share = phase === null ? 0 : done ? 1 : MOCK_BRAIN.phase / (PHASE_ORDER.length - 1);
  return {
    ingest:
      phase === null
        ? null
        : {
            status: done ? "done" : "running",
            phase,
            progress: {
              done: MOCK_BRAIN.legacyImported ? ["legacy"] : [],
              failed: [],
              notes: [],
            },
            error: null,
          },
    summary: {
      sources: phase === null ? 0 : done ? 9 : 3 + MOCK_BRAIN.phase * 2,
      sources_pending: done ? 0 : 2,
      facts: Math.round(live.length * share),
      facts_confirmed: live.filter((f) => f.status === "confirmed").length,
      conflicts_open: done ? MOCK_BRAIN.conflicts.length : 0,
      ...coverage(),
    },
    started,
  };
}

export function mockStartIngest(importLegacy: boolean): IngestState {
  MOCK_BRAIN.phase = 0;
  if (importLegacy) MOCK_BRAIN.legacyImported = true;
  return mockIngestState(true);
}

/** Each poll moves the pretend scan one phase on, so the progress can be watched. */
export function mockPollIngest(): IngestState {
  if (MOCK_BRAIN.phase >= 0 && MOCK_BRAIN.phase < PHASE_ORDER.length - 1) MOCK_BRAIN.phase += 1;
  return mockIngestState();
}

export function mockFactsList(): FactsList {
  const live = MOCK_BRAIN.facts.filter((f) => f.status !== "retired");
  const types = Object.keys(ENTITY_SPECS) as EntityType[];
  const groups: FactGroup[] = types
    .map((type) => ({
      entity_type: type,
      label: ENTITY_SPECS[type].label,
      facts: live
        .filter((f) => f.entity_type === type)
        .sort((a, b) => Number(b.in_conflict) - Number(a.in_conflict) || a.confidence - b.confidence),
    }))
    .filter((g) => g.facts.length);
  return {
    groups,
    conflicts: MOCK_BRAIN.conflicts,
    questions: MOCK_BRAIN.questions,
    ...coverage(),
  };
}

function confirmInPlace(fact: FactView) {
  fact.status = "confirmed";
  fact.confidence = 1;
  fact.authority_tier = 1;
  fact.overdue = false;
  fact.in_conflict = false;
}

export function mockConfirm(id: string): BrainFact | null {
  const fact = MOCK_BRAIN.facts.find((f) => f.id === id);
  if (!fact) return null;
  confirmInPlace(fact);
  return fact;
}

export function mockEdit(
  id: string,
  edit: { title?: string; data?: Record<string, unknown> },
): BrainFact | null {
  const fact = MOCK_BRAIN.facts.find((f) => f.id === id);
  if (!fact) return null;
  if (edit.title?.trim()) fact.title = edit.title.trim();
  if (edit.data) fact.data = { ...fact.data, ...edit.data };
  fact.extracted_by = "human";
  confirmInPlace(fact);
  return fact;
}

export function mockReject(id: string): BrainFact | null {
  const fact = MOCK_BRAIN.facts.find((f) => f.id === id);
  if (!fact) return null;
  fact.status = "retired";
  return fact;
}

export function mockResolve(conflictId: string, keepId: string | null): BrainFact | null {
  const conflict = MOCK_BRAIN.conflicts.find((c) => c.id === conflictId);
  if (!conflict) return null;
  MOCK_BRAIN.conflicts = MOCK_BRAIN.conflicts.filter((c) => c.id !== conflictId);
  let kept: BrainFact | null = null;
  for (const id of conflict.fact_ids) {
    const fact = MOCK_BRAIN.facts.find((f) => f.id === id);
    if (!fact) continue;
    if (id === keepId) {
      confirmInPlace(fact);
      kept = fact;
    } else {
      fact.status = "retired";
      fact.in_conflict = false;
    }
  }
  return kept;
}

export function mockAdd(input: {
  entity_type: EntityType;
  title: string;
  data: Record<string, unknown>;
}): BrainFact {
  const added = fact(input.entity_type, input.title, input.data, [], {
    status: "confirmed",
    confidence: 1,
    authority_tier: 1,
    extracted_by: "human",
  });
  MOCK_BRAIN.facts.push(added);
  return added;
}

export function mockCloseQuestion(id: string): void {
  MOCK_BRAIN.questions = MOCK_BRAIN.questions.filter((q) => q.id !== id);
}

export function mockContext(topic: string): BrainContext {
  const live = MOCK_BRAIN.facts.filter((f) => f.status !== "retired");
  const line = (f: FactView) => `- ${f.title} [${f.id}]`;
  return {
    productName: "FieldVision",
    core: [
      "FieldVision turns one sideline phone into a full film crew.",
      "Offer: Team plan, $79 a month per team.",
      "Persona: Short staffed coach, owes the team film by Monday.",
    ].join("\n"),
    constraints: "Never say: game changer, revolutionary.\nDo not state trial length: sources disagree.",
    retrieved: topic
      ? live
          .filter((f) => ["quote", "proof", "pain", "demo_moment"].includes(f.entity_type))
          .map(line)
          .join("\n")
      : "",
    approvedClaims: live
      .filter((f) => f.entity_type === "claim" && f.data.status === "approved")
      .map((f) => ({ id: f.id, wording: String(f.data.wording ?? f.title), qualifier: null })),
    demoMoments: live
      .filter((f) => f.entity_type === "demo_moment")
      .map((f) => ({
        id: f.id,
        title: f.title,
        start_state: String(f.data.start_state ?? ""),
        user_action: String(f.data.user_action ?? ""),
        end_state: String(f.data.end_state ?? ""),
        seconds: typeof f.data.seconds === "number" ? f.data.seconds : null,
      })),
    conflicts: MOCK_BRAIN.conflicts.map(
      (c) => `Offer terms are disputed: ${c.values.map((v) => v.value).join(" or ")}`,
    ),
    ...coverage(),
  };
}

/* ── Company snapshot (mock) ── */

let mockSnap: CompanySnapshot | null = null;

function freshSnapshot(): CompanySnapshot {
  const item = (title: string, text: string, short?: string): SnapshotItem => ({ title, text, short, fact_ids: [], status: "open" });
  return {
    generated_at: new Date().toISOString(),
    sells: item("FieldVision", "An app that turns a full game into a highlight video and sends it to college coaches.", "App that gets soccer players recruited"),
    audience: item(
      "Recruits and transfers",
      "High school soccer players, and college players looking to transfer, who want to get recruited by college coaches.",
    ),
    features: [
      item("AI highlight videos", "Upload a full game and get your best plays cut into a highlight video."),
      item("Coach database", "10,000+ verified college coaches you can search by school, division or region."),
      item("Coach emails", "Send your highlight video to hundreds of coaches at once."),
      item("Profile page", "One link with your video, stats and grades for coaches to open."),
    ],
    viral: item("Hundreds of coaches in seconds", "Make a highlight video and email it to hundreds of college coaches in seconds."),
  };
}

export function mockSnapshot(): CompanySnapshot {
  mockSnap = mockSnap ?? freshSnapshot();
  return mockSnap;
}

export function mockSettleSnapshot(input: {
  part: SnapshotPart;
  index?: number;
  decision: "confirm" | "dismiss";
  title?: string;
  text?: string;
}): CompanySnapshot {
  const snap = mockSnapshot();
  const settle = (it: SnapshotItem): SnapshotItem =>
    input.decision === "dismiss"
      ? { ...it, status: "dismissed" }
      : { ...it, title: input.title?.trim() || it.title, text: input.text?.trim() || it.text, status: "confirmed" };
  mockSnap =
    input.part === "features"
      ? { ...snap, features: snap.features.map((f, i) => (i === input.index ? settle(f) : f)) }
      : { ...snap, [input.part]: snap[input.part] ? settle(snap[input.part] as SnapshotItem) : null };
  return mockSnap;
}
