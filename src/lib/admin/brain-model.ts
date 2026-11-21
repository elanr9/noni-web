/* The company brain as the web reads it: the shapes the brain-ingest,
   brain-survey, brain-facts and brain-context edge functions answer with
   (noni/supabase/functions/_shared/ai/contracts.ts and brainSchema.ts), and
   the pure helpers that turn a record into what a person sees. No I/O. */

export type EntityType =
  | "company"
  | "product"
  | "feature"
  | "demo_moment"
  | "persona"
  | "pain"
  | "outcome"
  | "alternative"
  | "differentiator"
  | "quote"
  | "proof"
  | "claim"
  | "objection"
  | "offer"
  | "voice_rule"
  | "glossary"
  | "compliance"
  | "goal"
  | "creator_pref"
  | "angle"
  | "learning";

export type FactStatus = "inferred" | "confirmed" | "disputed" | "stale" | "retired";

export type SourceKind =
  | "website_page"
  | "app_store"
  | "codebase"
  | "upload"
  | "survey_answer"
  | "voice_note"
  | "reference_post"
  | "own_post"
  | "review"
  | "manual";

export interface SourceDetail {
  source_id?: string;
  excerpt: string;
  kind: SourceKind | string;
  url: string | null;
  title: string | null;
  captured_at?: string | null;
}

export interface BrainFact {
  id: string;
  entity_type: EntityType;
  key: string;
  title: string;
  data: Record<string, unknown>;
  status: FactStatus;
  confidence: number;
  authority_tier: number;
  usage?: string;
  extracted_by?: string;
  updated_at?: string;
}

export interface FactView extends BrainFact {
  in_conflict: boolean;
  overdue: boolean;
  source_details: SourceDetail[];
}

export interface FactGroup {
  entity_type: EntityType;
  label: string;
  facts: FactView[];
}

export interface BrainConflict {
  id: string;
  entity_type: string;
  key: string;
  fact_ids: string[];
  field: string;
  values: Array<{ fact_id: string; value: string; authority_tier: number }>;
  detected_at?: string;
}

export interface BrainQuestion {
  id: string;
  question: string;
  why: string | null;
  entity_type: string | null;
  created_at?: string;
}

export interface FactsList {
  groups: FactGroup[];
  conflicts: BrainConflict[];
  questions: BrainQuestion[];
  coverage: number;
  missing: string[];
}

export type IngestPhase = "crawl" | "extract" | "embed" | "suggest" | "done";

export interface IngestRun {
  status: "idle" | "running" | "done" | "failed";
  phase: IngestPhase;
  progress: {
    done: string[];
    failed: Array<{ input: string; error: string }>;
    notes: string[];
  };
  error: string | null;
  started_at?: string | null;
  finished_at?: string | null;
}

export interface IngestSummary {
  sources: number;
  sources_pending: number;
  facts: number;
  facts_confirmed: number;
  conflicts_open: number;
  coverage: number;
  missing: string[];
}

export interface IngestState {
  ingest: IngestRun | null;
  summary: IngestSummary;
  started: boolean;
}

/** The short summary the founder confirms at the end of onboarding
    (brain-survey "snapshot"; app migration 147). */
export interface SnapshotItem {
  title: string;
  text: string;
  /** The same thing as one bullet of a few words; absent on older summaries. */
  short?: string;
  fact_ids: string[];
  status: "open" | "confirmed" | "dismissed";
}

export interface CompanySnapshot {
  generated_at: string;
  sells: SnapshotItem | null;
  audience: SnapshotItem | null;
  features: SnapshotItem[];
  viral: SnapshotItem | null;
}

export type SnapshotPart = "sells" | "audience" | "features" | "viral";

export interface BrainContext {
  productName: string;
  core: string;
  constraints: string;
  retrieved: string;
  approvedClaims: Array<{ id: string; wording: string; qualifier: string | null }>;
  demoMoments: Array<{
    id: string;
    title: string;
    start_state: string;
    user_action: string;
    end_state: string;
    seconds: number | null;
  }>;
  conflicts: string[];
  coverage: number;
  missing: string[];
  bannedPhrases?: string[];
}

/* ── Record fields ─────────────────────────────────────────────────────── */

export type FieldKind = "text" | "long" | "list" | "bool" | "int" | "enum";

export interface FieldSpec {
  key: string;
  label: string;
  kind: FieldKind;
  options?: readonly string[];
}

export interface EntitySpec {
  /** Plural heading, as the backend labels the group. */
  label: string;
  /** Singular, for "Add" and the editor title. */
  one: string;
  /** The field shown as the record's body. */
  lead: string;
  fields: FieldSpec[];
}

const text = (key: string, label: string): FieldSpec => ({ key, label, kind: "text" });
const long = (key: string, label: string): FieldSpec => ({ key, label, kind: "long" });
const list = (key: string, label: string): FieldSpec => ({ key, label, kind: "list" });
const bool = (key: string, label: string): FieldSpec => ({ key, label, kind: "bool" });
const int = (key: string, label: string): FieldSpec => ({ key, label, kind: "int" });
const pick = (key: string, label: string, options: readonly string[]): FieldSpec => ({
  key,
  label,
  kind: "enum",
  options,
});

/* Mirrors ENTITIES in brainSchema.ts. Fields filled only by imports
   (media_urls, media_url) are left out: a person does not type them. */
export const ENTITY_SPECS: Record<EntityType, EntitySpec> = {
  company: {
    label: "Company",
    one: "Company",
    lead: "one_liner",
    fields: [
      long("one_liner", "One line"),
      list("category_terms", "Category words"),
      list("markets", "Markets"),
      text("regulated", "Regulated because"),
    ],
  },
  product: {
    label: "Product",
    one: "Product",
    lead: "one_liner",
    fields: [
      text("name", "Name"),
      long("one_liner", "One line"),
      long("job", "Job it is hired for"),
      list("platforms", "Platforms"),
      text("inputs_required", "What a user brings"),
      text("output", "What a user gets"),
      list("limitations", "Limits"),
    ],
  },
  feature: {
    label: "Features",
    one: "Feature",
    lead: "description",
    fields: [
      text("name", "Name"),
      long("description", "What it does"),
      text("gating", "Plan or paywall"),
      list("platforms", "Platforms"),
      pick("maturity", "Maturity", ["stable", "beta", "changing", "unknown"]),
    ],
  },
  demo_moment: {
    label: "Demo moments",
    one: "Demo moment",
    lead: "user_action",
    fields: [
      text("feature", "Feature"),
      long("start_state", "On screen first"),
      long("user_action", "What they tap"),
      long("end_state", "Proof frame"),
      int("seconds", "Seconds"),
      text("needs_sample_data", "Sample data needed"),
      list("must_not_show", "Never show"),
      bool("is_aha", "The moment a new user gets it"),
    ],
  },
  persona: {
    label: "Personas",
    one: "Persona",
    lead: "situation",
    fields: [
      text("label", "Name"),
      long("situation", "Situation"),
      list("triggers", "Triggers"),
      pick("role", "Role", ["payer", "user", "both", "recommender", "unknown"]),
      list("vocabulary", "Words they use"),
      list("hangouts", "Where they spend time"),
      text("believable_messenger", "Who they trust"),
      text("bad_fit", "Not for"),
    ],
  },
  pain: {
    label: "Pains",
    one: "Pain",
    lead: "statement",
    fields: [
      long("statement", "In their words"),
      text("cost", "What it costs them"),
      text("workaround", "What they do today"),
      text("persona", "Persona"),
    ],
  },
  outcome: {
    label: "Outcomes",
    one: "Outcome",
    lead: "statement",
    fields: [
      long("statement", "Result"),
      text("horizon", "When it arrives"),
      text("on_screen", "How it shows on screen"),
      pick("typicality", "Typical or best case", ["typical", "best_case", "unknown"]),
    ],
  },
  alternative: {
    label: "Alternatives",
    one: "Alternative",
    lead: "falls_short",
    fields: [
      text("name", "Name"),
      pick("type", "Type", ["direct", "generic_tool", "manual", "do_nothing", "aspirational"]),
      long("does_well", "Does well"),
      long("falls_short", "Falls short"),
      bool("may_name", "Creators may name it"),
    ],
  },
  differentiator: {
    label: "Differentiators",
    one: "Differentiator",
    lead: "attribute",
    fields: [
      long("attribute", "What is different"),
      text("versus", "Compared with"),
      long("value", "What it lets a customer do"),
      text("who_cares", "Who cares most"),
      text("substantiation", "What backs it up"),
    ],
  },
  quote: {
    label: "Customer quotes",
    one: "Customer quote",
    lead: "text",
    fields: [
      long("text", "Their exact words"),
      pick("source_type", "Where it was said", [
        "app_store",
        "reddit",
        "support",
        "call",
        "survey",
        "comment",
        "review_site",
        "other",
      ]),
      pick("bucket", "Evidence of", [
        "pain",
        "trigger",
        "objection",
        "transformation",
        "standout_language",
      ]),
      text("persona", "Persona"),
      int("rating", "Stars"),
      bool("may_attribute", "The person may be named"),
    ],
  },
  proof: {
    label: "Proof",
    one: "Proof point",
    lead: "statement",
    fields: [
      long("statement", "Statement"),
      pick("type", "Type", [
        "number",
        "testimonial",
        "press",
        "award",
        "logo",
        "rating",
        "certification",
        "artefact",
      ]),
      text("value", "Figure"),
      text("as_of", "True as of"),
      pick("typicality", "Typical or best case", ["typical", "best_case", "single_case", "unknown"]),
    ],
  },
  claim: {
    label: "Claims",
    one: "Claim",
    lead: "wording",
    fields: [
      long("wording", "Exact wording"),
      pick("status", "Status", ["approved", "needs_substantiation", "banned"]),
      pick("type", "Type", [
        "performance",
        "comparative",
        "price",
        "health",
        "financial",
        "ai_capability",
        "safety",
        "feature",
        "other",
      ]),
      text("qualifier", "Must be said with"),
      text("reason", "Reason"),
      text("substantiation", "What backs it up"),
      text("market", "Market"),
    ],
  },
  objection: {
    label: "Objections",
    one: "Objection",
    lead: "statement",
    fields: [
      long("statement", "In their words"),
      long("answer", "Your answer"),
      text("persona", "Persona"),
    ],
  },
  offer: {
    label: "Offer",
    one: "Offer",
    lead: "terms",
    fields: [
      pick("kind", "Part", ["pricing", "trial", "free_tier", "promotion", "creator_code", "cta"]),
      long("terms", "Exact terms"),
      text("url", "Link"),
      text("required_wording", "Required wording"),
      text("market", "Market"),
      text("plan", "Plan"),
      text("ends_on", "Ends on"),
    ],
  },
  voice_rule: {
    label: "Voice",
    one: "Voice rule",
    lead: "rule",
    fields: [
      pick("scope", "Applies to", ["brand_voice", "creator_latitude"]),
      long("rule", "Rule"),
      list("do", "Do"),
      list("dont", "Avoid"),
      list("example_lines", "Example lines"),
      list("banned_words", "Banned words"),
    ],
  },
  glossary: {
    label: "Glossary",
    one: "Term",
    lead: "meaning",
    fields: [
      text("term", "Term"),
      text("written_form", "Written as"),
      text("pronunciation", "Said as"),
      long("meaning", "Meaning"),
      list("never_use", "Never write"),
      bool("internal_only", "Internal only"),
    ],
  },
  compliance: {
    label: "Rules",
    one: "Rule",
    lead: "rule",
    fields: [
      pick("kind", "Kind", [
        "disclosure",
        "must_not_show",
        "regulated",
        "platform",
        "music",
        "minors",
        "approval",
        "other",
      ]),
      long("rule", "Rule"),
      text("wording", "Exact wording"),
    ],
  },
  goal: {
    label: "Goals",
    one: "Goal",
    lead: "objective",
    fields: [
      long("objective", "Objective"),
      text("metric", "Measured by"),
      list("platforms", "Platforms"),
      pick("placement", "Placement", ["organic", "boosted", "asset_only", "unknown"]),
    ],
  },
  creator_pref: {
    label: "Creator fit",
    one: "Creator fit",
    lead: "role",
    fields: [
      long("role", "Who the customer trusts"),
      list("traits", "Traits"),
      pick("face", "On camera", ["face", "faceless", "either"]),
      list("exclusions", "Avoid"),
      pick("latitude", "Script freedom", ["word_for_word", "key_points", "loose", "unknown"]),
    ],
  },
  angle: {
    label: "Angles",
    one: "Angle",
    lead: "sentence",
    fields: [
      long("sentence", "Angle"),
      text("pain", "Pain"),
      text("persona", "Persona"),
      text("family", "Family"),
      text("differentiator", "Differentiator"),
      pick("status", "Status", ["candidate", "testing", "winner", "fatigued", "retired"]),
    ],
  },
  learning: {
    label: "Learnings",
    one: "Learning",
    lead: "statement",
    fields: [
      long("statement", "What was observed"),
      text("scope", "Applies to"),
      text("evidence", "Evidence"),
      int("sample_size", "Posts counted"),
      pick("strength", "Strength", ["weak", "moderate", "strong"]),
    ],
  },
};

/* ── Sections of the Brain page ────────────────────────────────────────── */

export interface BrainSection {
  id: string;
  title: string;
  types: EntityType[];
}

export const BRAIN_SECTIONS: BrainSection[] = [
  { id: "product", title: "Product and features", types: ["company", "product", "feature"] },
  { id: "demo", title: "Demo moments", types: ["demo_moment"] },
  {
    id: "customers",
    title: "Customers and pains",
    types: ["persona", "pain", "outcome", "objection", "quote"],
  },
  { id: "proof", title: "Proof and approved claims", types: ["proof", "claim"] },
  { id: "offer", title: "Offer", types: ["offer", "goal"] },
  {
    id: "voice",
    title: "Voice and rules",
    types: ["voice_rule", "compliance", "glossary", "creator_pref"],
  },
  { id: "competitors", title: "Competitors", types: ["alternative", "differentiator"] },
  { id: "learnings", title: "Learnings", types: ["learning", "angle"] },
];

export function sectionFacts(groups: FactGroup[], section: BrainSection): FactView[] {
  return section.types.flatMap(
    (type) => groups.find((g) => g.entity_type === type)?.facts ?? [],
  );
}

/* ── Display helpers ───────────────────────────────────────────────────── */

/** "needs_substantiation" reads as "Needs substantiation". */
export function humanize(value: string): string {
  const spaced = value.replace(/_/g, " ").trim();
  return spaced ? spaced[0].toUpperCase() + spaced.slice(1) : "";
}

function shown(value: unknown, kind: FieldKind): string {
  if (value === null || value === undefined) return "";
  if (Array.isArray(value)) {
    return value
      .filter((v): v is string => typeof v === "string" && v.trim() !== "")
      .join(", ");
  }
  if (typeof value === "boolean") return value ? "Yes" : "";
  if (typeof value === "number") return value > 0 ? String(value) : "";
  if (typeof value !== "string") return "";
  const trimmed = value.trim();
  if (!trimmed || trimmed === "unknown") return "";
  return kind === "enum" ? humanize(trimmed) : trimmed;
}

/** The sentence a record is read by: its lead field, else its title. */
export function factLead(fact: BrainFact): string {
  const spec = ENTITY_SPECS[fact.entity_type];
  const field = spec?.fields.find((f) => f.key === spec.lead);
  const lead = field ? shown(fact.data[field.key], field.kind) : "";
  return lead || fact.title;
}

/** Every other filled field, labelled, in the order the editor lists them. */
export function factDetails(fact: BrainFact): Array<{ label: string; value: string }> {
  const spec = ENTITY_SPECS[fact.entity_type];
  if (!spec) return [];
  const title = fact.title.trim().toLowerCase();
  return spec.fields
    .filter((f) => f.key !== spec.lead)
    .map((f) => ({ label: f.label, value: shown(fact.data[f.key], f.kind) }))
    .filter((row) => row.value && row.value.toLowerCase() !== title);
}

export type StatusTone = "green" | "blue" | "amber" | "slate";

/** One chip per record: an open conflict or an overdue check outranks the stored status. */
export function factStatus(fact: Pick<FactView, "status" | "in_conflict" | "overdue">): {
  label: string;
  tone: StatusTone;
} {
  if (fact.in_conflict || fact.status === "disputed") return { label: "Disputed", tone: "amber" };
  if (fact.status === "stale" || fact.overdue) return { label: "Stale", tone: "slate" };
  if (fact.status === "confirmed") return { label: "Confirmed", tone: "green" };
  if (fact.status === "retired") return { label: "Retired", tone: "slate" };
  return { label: "Inferred", tone: "blue" };
}

function pageName(url: string): string | null {
  try {
    const { pathname, hostname } = new URL(url);
    const parts = pathname.split("/").filter(Boolean);
    if (parts.length === 0) return "home page";
    if (parts.length === 1 && /^[a-z][a-z0-9-]{1,24}$/i.test(parts[0])) {
      return `${parts[0].replace(/-/g, " ").toLowerCase()} page`;
    }
    return `${hostname.replace(/^www\./, "")}${pathname.replace(/\/$/, "")}`;
  } catch {
    return null;
  }
}

/** Where a record came from, in the words of the person reading it. */
export function sourceLabel(source: Pick<SourceDetail, "kind" | "url" | "title"> | undefined): string {
  if (!source) return "No source";
  const title = source.title?.trim() ?? "";
  switch (source.kind) {
    case "website_page": {
      const page = source.url ? pageName(source.url) : null;
      if (!page) return title ? `From ${title}` : "From your site";
      return page.endsWith(" page") ? `From your ${page}` : `From ${page}`;
    }
    case "app_store":
      return "From your store listing";
    case "review":
      return "From customer reviews";
    case "survey_answer":
      return "From your answer";
    case "voice_note":
      return "From a voice note";
    case "reference_post":
      return "From a reference post";
    case "own_post":
      return "From your posts";
    case "codebase":
      return "From your codebase";
    case "upload":
      return !title || /^pasted text/i.test(title) ? "From pasted text" : `From ${title}`;
    default:
      if (/^(brand doc|legacy|model profile|banned phrases)/i.test(title)) {
        return "From your earlier brain";
      }
      return "Added by your team";
  }
}

export function factSourceLabel(fact: Pick<FactView, "source_details" | "extracted_by">): string {
  const first = fact.source_details[0];
  if (first) {
    const more = fact.source_details.length - 1;
    return more > 0 ? `${sourceLabel(first)} and ${more} more` : sourceLabel(first);
  }
  return fact.extracted_by === "human" ? "Added by your team" : "No source";
}

/** Coverage is 0 to 1; people read a whole percent. */
export function coveragePercent(coverage: number): number {
  if (!Number.isFinite(coverage)) return 0;
  return Math.max(0, Math.min(100, Math.round(coverage * 100)));
}

const PHASES: Array<{ phase: IngestPhase; label: string }> = [
  { phase: "crawl", label: "Reading your pages" },
  { phase: "extract", label: "Understanding your product" },
  { phase: "embed", label: "Organizing it" },
  { phase: "suggest", label: "Drafting your answers" },
];

export interface ScanStep {
  label: string;
  state: "done" | "active" | "waiting";
}

/** The four phases of a scan with where the run is in them. */
export function scanSteps(run: IngestRun | null): ScanStep[] {
  const at = !run
    ? -1
    : run.status === "done" || run.phase === "done"
      ? PHASES.length
      : PHASES.findIndex((p) => p.phase === run.phase);
  return PHASES.map((p, i) => ({
    label: p.label,
    state: i < at ? "done" : i === at && run?.status === "running" ? "active" : "waiting",
  }));
}

/** One line for the strip shown while other questions are answered. */
export function scanLine(state: IngestState | null): string {
  const run = state?.ingest ?? null;
  if (!run || run.status === "idle") return "Scan not started";
  if (run.status === "failed") return "Scan stopped";
  const { sources } = state!.summary;
  const counts = sources > 0 ? `${sources} ${sources === 1 ? "page" : "pages"}` : "";
  if (run.status === "done") return counts ? `Scan finished · ${counts}` : "Scan finished";
  const label = PHASES.find((p) => p.phase === run.phase)?.label ?? "Scanning";
  return counts ? `${label} · ${counts}` : label;
}

export function scanRunning(state: IngestState | null): boolean {
  return state?.ingest?.status === "running";
}

/** An input the scan could not read, named the way the person gave it. */
export function failedInputLabel(input: string): string {
  if (input === "legacy") return "Earlier brain";
  const at = input.indexOf(":");
  const kind = at > 0 ? input.slice(0, at) : "";
  const rest = at > 0 ? input.slice(at + 1) : input;
  if (kind === "doc") return rest.split("/").pop()?.replace(/^[0-9a-f-]{8,}-/, "") ?? rest;
  if (kind === "extract") return rest;
  return rest.replace(/^https?:\/\//, "").replace(/\/$/, "");
}

/** Records still to look at, most doubtful first: the order a review screen shows. */
export function reviewQueue(list: Pick<FactsList, "groups">): FactView[] {
  const bucket = (f: FactView) =>
    f.status === "disputed" ? 0 : f.status === "stale" || f.overdue ? 1 : 2;
  return list.groups
    .flatMap((g) => g.facts)
    .filter((f) => f.status !== "confirmed" && f.status !== "retired" && !f.in_conflict)
    .sort((a, b) => bucket(a) - bucket(b) || a.confidence - b.confidence);
}

export function findFact(list: Pick<FactsList, "groups">, id: string): FactView | undefined {
  for (const group of list.groups) {
    const hit = group.facts.find((f) => f.id === id);
    if (hit) return hit;
  }
  return undefined;
}

export function conflictTitle(conflict: Pick<BrainConflict, "entity_type" | "field">): string {
  const spec = ENTITY_SPECS[conflict.entity_type as EntityType];
  const field = spec?.fields.find((f) => f.key === conflict.field);
  const what = field?.label ?? humanize(conflict.field);
  return spec ? `${spec.one}: ${what.toLowerCase()}` : what;
}

/** Extensions brain-ingest can read today; the picker offers nothing else. */
export const BRAIN_UPLOAD_EXTENSIONS = ["txt", "md", "markdown", "csv", "json", "html", "htm"];
export const BRAIN_UPLOAD_ACCEPT = BRAIN_UPLOAD_EXTENSIONS.map((e) => `.${e}`).join(",");
export const BRAIN_UPLOAD_MAX_BYTES = 6 * 1024 * 1024;

export function brainUploadProblem(file: { name: string; size: number }): string | null {
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
  if (!BRAIN_UPLOAD_EXTENSIONS.includes(ext)) return "That file type cannot be read yet.";
  if (file.size === 0) return "That file is empty.";
  if (file.size > BRAIN_UPLOAD_MAX_BYTES) return "That file is over 6 MB.";
  return null;
}
