"use server";

/* The company side of Get started, before any account exists. Each answer
   is saved on a company_leads row as it is given, so a lead that stops
   halfway still reaches ops. The row id (a random uuid the browser holds)
   is the only handle; a lead can only be changed for two days and until
   ops has invited it. */

import { headers } from "next/headers";

import { createServiceClient } from "@/lib/supabase/service";

export type LeadField = "email" | "company" | "website" | "role" | "goal" | "platforms" | "creators_wanted" | "launch";
export type LeadResult = { ok: true; id: string } | { ok: false; error: string };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const UUID_RE = /^[0-9a-f-]{36}$/;
const ANSWER_KEYS: ReadonlySet<LeadField> = new Set(["goal", "platforms", "creators_wanted", "launch"]);

function clean(value: unknown, max = 200): string {
  return String(value ?? "").trim().replace(/\s+/g, " ").slice(0, max);
}

async function openLead(id: string) {
  if (!UUID_RE.test(id)) return null;
  const { data } = await createServiceClient()
    .from("company_leads")
    .select("id, name, email, company, website, answers, status, finished_at, created_at")
    .eq("id", id)
    .maybeSingle();
  if (!data) return null;
  const fresh = Date.parse(data.created_at) > Date.now() - 2 * 86400_000;
  const editable = data.status === "new" || data.status === "call_booked";
  return fresh && editable ? data : null;
}

/** Saves one answer. The first call (the work email) makes the lead. */
export async function saveLeadAnswer(input: {
  id: string | null;
  name: string;
  field: LeadField;
  value: string | string[];
}): Promise<LeadResult> {
  const db = createServiceClient();
  const value = Array.isArray(input.value) ? input.value.map((v) => clean(v, 40)).filter(Boolean).slice(0, 6) : clean(input.value);

  if (input.field === "email" && (typeof value !== "string" || !EMAIL_RE.test(value))) {
    return { ok: false, error: "That email does not look right." };
  }

  if (!input.id) {
    if (input.field !== "email") return { ok: false, error: "Start with your work email." };
    const ua = (await headers()).get("user-agent")?.slice(0, 300) ?? null;
    const { data, error } = await db
      .from("company_leads")
      .insert({ name: clean(input.name, 60) || null, email: String(value).toLowerCase(), user_agent: ua })
      .select("id")
      .single();
    if (error || !data) return { ok: false, error: "That did not save. Try again." };
    return { ok: true, id: data.id };
  }

  const lead = await openLead(input.id);
  if (!lead) return { ok: false, error: "This chat has expired. Start again from Get started." };

  const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (ANSWER_KEYS.has(input.field)) {
    patch.answers = { ...((lead.answers as Record<string, unknown>) ?? {}), [input.field]: value };
  } else if (input.field === "email") {
    patch.email = String(value).toLowerCase();
  } else {
    patch[input.field] = value;
  }
  const { error } = await db.from("company_leads").update(patch).eq("id", lead.id);
  if (error) return { ok: false, error: "That did not save. Try again." };
  return { ok: true, id: lead.id };
}

/** Every question answered: the founders hear about it at once
    (a leads row kind "call" goes out through notify-lead). */
export async function finishLead(id: string): Promise<LeadResult> {
  const lead = await openLead(id);
  if (!lead) return { ok: false, error: "This chat has expired. Start again from Get started." };
  if (lead.finished_at) return { ok: true, id: lead.id };

  const db = createServiceClient();
  await db.from("company_leads").update({ finished_at: new Date().toISOString() }).eq("id", lead.id);
  const a = (lead.answers as Record<string, unknown>) ?? {};
  const line = (label: string, v: unknown) =>
    Array.isArray(v) ? (v.length ? `${label}: ${v.join(", ")}` : "") : v ? `${label}: ${String(v)}` : "";
  await db.from("leads").insert({
    kind: "call",
    name: lead.name || lead.email || "New company",
    email: lead.email ?? "",
    company: lead.company,
    website: lead.website,
    message: [
      "Finished the Get started chat. Booking their call now.",
      line("Goal", a.goal),
      line("Platforms", a.platforms),
      line("Creators", a.creators_wanted),
      line("Launch", a.launch),
    ]
      .filter(Boolean)
      .join("\n"),
    source: "get_started",
  });
  return { ok: true, id: lead.id };
}

/** Calendly said the call is booked. */
export async function markLeadBooked(id: string): Promise<LeadResult> {
  const lead = await openLead(id);
  if (!lead) return { ok: false, error: "Not found." };
  await createServiceClient()
    .from("company_leads")
    .update({ status: "call_booked", call_booked_at: new Date().toISOString(), updated_at: new Date().toISOString() })
    .eq("id", lead.id)
    .eq("status", "new");
  return { ok: true, id: lead.id };
}
