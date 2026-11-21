"use server";

import { revalidatePath } from "next/cache";

import {
  mockAdd,
  mockCloseQuestion,
  mockConfirm,
  mockContext,
  mockEdit,
  mockFactsList,
  mockIngestState,
  mockPollIngest,
  mockReject,
  mockResolve,
  mockSettleSnapshot,
  mockSnapshot,
  mockStartIngest,
} from "@/lib/admin/brain-mock";
import {
  brainUploadProblem,
  ENTITY_SPECS,
  type BrainContext,
  type BrainFact,
  type CompanySnapshot,
  type EntityType,
  type FactsList,
  type IngestState,
  type SnapshotPart,
} from "@/lib/admin/brain-model";
import {
  canManageCampaigns,
  getMemberPermissions,
  getSessionProfile,
  isCompanyAdmin,
  isPlatformAdmin,
} from "@/lib/auth";
import { callEdgeFunction } from "@/lib/edge";
import { createServiceClient } from "@/lib/supabase/service";

/* The company brain on the fact model. Every read and write goes through
   the brain-ingest, brain-survey, brain-facts and brain-context edge
   functions with the caller's own token, so the functions apply their rule
   (company admin, platform admin, or a manager holding manage_brand) as
   well as the gate here. Only the document upload touches the service
   client, after the gate, into the caller's own company folder. */

export type BrainResult<T> = { ok: true; data: T } | { ok: false; error: string };

const UPLOAD_BUCKET = "brain-uploads";

const UPLOAD_TYPES: Record<string, string> = {
  txt: "text/plain",
  md: "text/markdown",
  markdown: "text/markdown",
  csv: "text/csv",
  json: "application/json",
  html: "text/html",
  htm: "text/html",
};

function mockMode(): boolean {
  return process.env.NODE_ENV === "development" && process.env.ADMIN_QA_MOCK === "1";
}

type Gate = { ok: true; companyId: string; mock: boolean } | { ok: false; error: string };

async function requireBrainAccess(): Promise<Gate> {
  if (mockMode()) return { ok: true, companyId: "mock-company", mock: true };
  const { profile } = await getSessionProfile();
  const companyId = profile?.active_company_id;
  if (!companyId) return { ok: false, error: "No company on this account." };
  const allowed =
    isCompanyAdmin(profile) ||
    isPlatformAdmin(profile) ||
    (canManageCampaigns(profile) && (await getMemberPermissions(profile)).manage_brand);
  if (!allowed) return { ok: false, error: "You cannot edit this company's brain." };
  return { ok: true, companyId, mock: false };
}

/* A function that is not deployed answers 404 with no JSON body; say what
   that means instead of showing a status code. */
function readable(error: string): string {
  return /status (404|502|503|504)/.test(error) ? "The brain is not available yet." : error;
}

async function call<T>(name: string, body: Record<string, unknown>): Promise<BrainResult<T>> {
  try {
    const { data, error } = await callEdgeFunction<T>(name, body);
    if (error !== null || data === null) {
      return { ok: false, error: readable(error ?? "No answer from the brain.") };
    }
    return { ok: true, data };
  } catch {
    return { ok: false, error: "The brain could not be reached." };
  }
}

function withScheme(url: string): string {
  const trimmed = url.trim();
  if (!trimmed) return "";
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}

function clean(value: string, max: number): string {
  return value.trim().slice(0, max);
}

/* ── Scan ──────────────────────────────────────────────────────────────── */

export async function startBrainIngest(input: {
  website?: string;
  appStoreUrls?: string[];
  texts?: Array<{ title?: string; text: string }>;
  importLegacy?: boolean;
}): Promise<BrainResult<IngestState>> {
  const gate = await requireBrainAccess();
  if (!gate.ok) return gate;

  const website = withScheme(input.website ?? "");
  const stores = (input.appStoreUrls ?? []).map(withScheme).filter(Boolean).slice(0, 4);
  const texts = (input.texts ?? [])
    .map((t) => ({ title: clean(t.title ?? "", 120) || undefined, text: t.text.trim() }))
    .filter((t) => t.text);
  const importLegacy = input.importLegacy === true;
  if (!website && !stores.length && !texts.length && !importLegacy) {
    return { ok: false, error: "Nothing to add." };
  }

  if (gate.mock) return { ok: true, data: mockStartIngest(importLegacy) };
  const result = await call<IngestState>("brain-ingest", {
    action: "start",
    ...(website ? { website } : {}),
    ...(stores.length ? { app_store_urls: stores } : {}),
    ...(texts.length ? { texts } : {}),
    /* The function imports the earlier brain unless told not to; the web
       offers that once, on its own button. */
    import_legacy: importLegacy,
  });
  if (result.ok) revalidatePath("/admin/brain");
  return result;
}

export async function getBrainIngestStatus(): Promise<BrainResult<IngestState>> {
  const gate = await requireBrainAccess();
  if (!gate.ok) return gate;
  if (gate.mock) return { ok: true, data: mockPollIngest() };
  return call<IngestState>("brain-ingest", { action: "status" });
}

/* Reads the current scan without moving the mock on; for first paint. */
export async function peekBrainIngest(): Promise<BrainResult<IngestState>> {
  const gate = await requireBrainAccess();
  if (!gate.ok) return gate;
  if (gate.mock) return { ok: true, data: mockIngestState() };
  return call<IngestState>("brain-ingest", { action: "status" });
}

/* Stores one text document under the company's folder of the private
   brain-uploads bucket, then asks brain-ingest to read it. */
export async function uploadBrainDocument(formData: FormData): Promise<BrainResult<IngestState>> {
  const gate = await requireBrainAccess();
  if (!gate.ok) return gate;

  const file = formData.get("file");
  if (!(file instanceof File)) return { ok: false, error: "Pick a file first." };
  const problem = brainUploadProblem(file);
  if (problem) return { ok: false, error: problem };
  if (gate.mock) return { ok: true, data: mockStartIngest(false) };

  const ext = file.name.split(".").pop()!.toLowerCase();
  const safeName = file.name.replace(/[^A-Za-z0-9._-]+/g, "-").slice(-80);
  const path = `${gate.companyId}/${crypto.randomUUID()}-${safeName}`;
  const storage = createServiceClient().storage.from(UPLOAD_BUCKET);
  const { error: uploadError } = await storage.upload(path, file, {
    contentType: UPLOAD_TYPES[ext],
    upsert: false,
  });
  if (uploadError) {
    return {
      ok: false,
      error: /bucket not found/i.test(uploadError.message)
        ? "The brain is not available yet."
        : uploadError.message,
    };
  }

  const result = await call<IngestState>("brain-ingest", {
    action: "start",
    documents: [{ bucket: UPLOAD_BUCKET, path, title: clean(file.name, 120) }],
    import_legacy: false,
  });
  /* A document nothing will read is not left behind. */
  if (!result.ok) await storage.remove([path]);
  else revalidatePath("/admin/brain");
  return result;
}

/* ── Company summary ───────────────────────────────────────────────────── */

/** The short company summary (what it sells, who it is for, core features,
    the viral one). Built on first ask when the scan has records. */
export async function getBrainSnapshot(): Promise<BrainResult<CompanySnapshot | null>> {
  const gate = await requireBrainAccess();
  if (!gate.ok) return gate;
  if (gate.mock) return { ok: true, data: mockSnapshot() };
  const out = await call<{ snapshot: CompanySnapshot | null }>("brain-survey", { action: "snapshot" });
  return out.ok ? { ok: true, data: out.data.snapshot } : out;
}

/** The stored summary, read straight from the table so the page paints at
    once. Null when none has been written yet; it is never built here. */
export async function peekBrainSnapshot(): Promise<CompanySnapshot | null> {
  const gate = await requireBrainAccess();
  if (!gate.ok) return null;
  if (gate.mock) return mockSnapshot();
  const { data } = await createServiceClient()
    .from("brain_survey")
    .select("snapshot")
    .eq("company_id", gate.companyId)
    .maybeSingle();
  return ((data as { snapshot?: CompanySnapshot | null } | null)?.snapshot ?? null) || null;
}

export async function settleBrainSnapshot(input: {
  part: SnapshotPart;
  index?: number;
  decision: "confirm" | "dismiss";
  title?: string;
  text?: string;
}): Promise<BrainResult<CompanySnapshot>> {
  const gate = await requireBrainAccess();
  if (!gate.ok) return gate;
  if (gate.mock) return { ok: true, data: mockSettleSnapshot(input) };
  const out = await call<{ snapshot: CompanySnapshot }>("brain-survey", { action: "snapshot_settle", ...input });
  return out.ok ? { ok: true, data: out.data.snapshot } : out;
}

/* ── Records ───────────────────────────────────────────────────────────── */

export async function listBrainFacts(): Promise<BrainResult<FactsList>> {
  const gate = await requireBrainAccess();
  if (!gate.ok) return gate;
  if (gate.mock) return { ok: true, data: mockFactsList() };
  return call<FactsList>("brain-facts", { action: "list" });
}

function missing(): BrainResult<never> {
  return { ok: false, error: "That record is gone." };
}

export async function confirmBrainFact(factId: string): Promise<BrainResult<{ fact: BrainFact }>> {
  const gate = await requireBrainAccess();
  if (!gate.ok) return gate;
  if (gate.mock) {
    const fact = mockConfirm(factId);
    return fact ? { ok: true, data: { fact } } : missing();
  }
  return call<{ fact: BrainFact }>("brain-facts", { action: "confirm", fact_id: factId });
}

export async function editBrainFact(input: {
  factId: string;
  title?: string;
  data?: Record<string, unknown>;
}): Promise<BrainResult<{ fact: BrainFact }>> {
  const gate = await requireBrainAccess();
  if (!gate.ok) return gate;
  if (gate.mock) {
    const fact = mockEdit(input.factId, input);
    return fact ? { ok: true, data: { fact } } : missing();
  }
  return call<{ fact: BrainFact }>("brain-facts", {
    action: "edit",
    fact_id: input.factId,
    ...(input.title?.trim() ? { title: input.title.trim() } : {}),
    ...(input.data ? { data: input.data } : {}),
  });
}

export async function rejectBrainFact(factId: string): Promise<BrainResult<{ fact: BrainFact }>> {
  const gate = await requireBrainAccess();
  if (!gate.ok) return gate;
  if (gate.mock) {
    const fact = mockReject(factId);
    return fact ? { ok: true, data: { fact } } : missing();
  }
  return call<{ fact: BrainFact }>("brain-facts", { action: "reject", fact_id: factId });
}

export async function resolveBrainConflict(input: {
  conflictId: string;
  keepFactId: string | null;
}): Promise<BrainResult<{ fact: BrainFact | null }>> {
  const gate = await requireBrainAccess();
  if (!gate.ok) return gate;
  if (gate.mock) {
    return { ok: true, data: { fact: mockResolve(input.conflictId, input.keepFactId) } };
  }
  return call<{ fact: BrainFact | null }>("brain-facts", {
    action: "resolve_conflict",
    conflict_id: input.conflictId,
    keep_fact_id: input.keepFactId,
  });
}

export async function addBrainFact(input: {
  entityType: EntityType;
  title: string;
  data: Record<string, unknown>;
}): Promise<BrainResult<{ fact: BrainFact }>> {
  const gate = await requireBrainAccess();
  if (!gate.ok) return gate;
  if (!(input.entityType in ENTITY_SPECS)) return { ok: false, error: "Unknown record type." };
  const title = clean(input.title, 200);
  if (!title) return { ok: false, error: "Give it a name." };
  if (gate.mock) {
    return { ok: true, data: { fact: mockAdd({ ...input, entity_type: input.entityType, title }) } };
  }
  return call<{ fact: BrainFact }>("brain-facts", {
    action: "add",
    entity_type: input.entityType,
    title,
    data: input.data,
  });
}

export async function answerBrainQuestion(input: {
  questionId: string;
  answer: string;
}): Promise<BrainResult<{ facts: BrainFact[]; extract_error: string | null }>> {
  const gate = await requireBrainAccess();
  if (!gate.ok) return gate;
  const answer = input.answer.trim();
  if (!answer) return { ok: false, error: "Write an answer first." };
  if (gate.mock) {
    mockCloseQuestion(input.questionId);
    return { ok: true, data: { facts: [], extract_error: null } };
  }
  return call<{ facts: BrainFact[]; extract_error: string | null }>("brain-facts", {
    action: "answer_question",
    question_id: input.questionId,
    answer,
  });
}

export async function dismissBrainQuestion(questionId: string): Promise<BrainResult<{ ok: true }>> {
  const gate = await requireBrainAccess();
  if (!gate.ok) return gate;
  if (gate.mock) {
    mockCloseQuestion(questionId);
    return { ok: true, data: { ok: true } };
  }
  return call<{ ok: true }>("brain-facts", { action: "dismiss_question", question_id: questionId });
}

/* ── What a generator is told ──────────────────────────────────────────── */

export async function getBrainContext(input: {
  topic: string;
}): Promise<BrainResult<{ context: BrainContext }>> {
  const gate = await requireBrainAccess();
  if (!gate.ok) return gate;
  const topic = clean(input.topic, 400);
  if (gate.mock) return { ok: true, data: { context: mockContext(topic) } };
  return call<{ context: BrainContext }>("brain-context", topic ? { topic } : {});
}
