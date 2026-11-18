/* Lead capture shared by the landing waitlist, the business "Get started"
   form, the Enterprise "Contact us" form and the TestFlight invite request.
   Client safe: the form posts here-defined shapes to /api/leads, which
   inserts into public.leads with the service role. */

export const LEAD_KINDS = ["waitlist", "business", "enterprise", "testflight"] as const;
export type LeadKind = (typeof LEAD_KINDS)[number];

export interface LeadInput {
  kind: LeadKind;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  website?: string;
  message?: string;
  /** Where the form lives, e.g. "landing", "pricing", "invite". */
  source?: string;
  /** Honeypot. Real people never fill it. */
  url?: string;
}

export type LeadResult =
  | { ok: true }
  | { ok: false; error: string };

const LIMITS = {
  name: 120,
  email: 254,
  phone: 40,
  company: 160,
  website: 300,
  message: 2000,
  source: 60,
} as const;

function str(value: unknown, max: number): string {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

export type ParsedLead =
  | { ok: true; lead: Required<Omit<LeadInput, "url">>; spam: boolean }
  | { ok: false; error: string };

/** Validates an untrusted request body into a lead row. */
export function parseLead(body: unknown): ParsedLead {
  const b = (body && typeof body === "object" ? body : {}) as Record<string, unknown>;
  const kind = LEAD_KINDS.find((k) => k === b.kind);
  if (!kind) return { ok: false, error: "Unknown form." };
  const email = str(b.email, LIMITS.email).toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { ok: false, error: "That email address does not look right." };
  }
  /* TestFlight requests come from an invite that already knows the email;
     the name is optional there. */
  const name =
    str(b.name, LIMITS.name) || (kind === "testflight" ? email.split("@")[0] : "");
  if (!name) return { ok: false, error: "Add your name." };
  const company = str(b.company, LIMITS.company);
  if ((kind === "business" || kind === "enterprise") && !company) {
    return { ok: false, error: "Add your company name." };
  }
  return {
    ok: true,
    spam: str(b.url, 300) !== "",
    lead: {
      kind,
      name,
      email,
      phone: str(b.phone, LIMITS.phone),
      company,
      website: str(b.website, LIMITS.website),
      message: str(b.message, LIMITS.message),
      source: str(b.source, LIMITS.source),
    },
  };
}

/** Client helper: posts a lead and maps every failure to readable copy. */
export async function submitLead(input: LeadInput): Promise<LeadResult> {
  try {
    const res = await fetch("/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    const json: unknown = await res.json().catch(() => null);
    if (res.ok) return { ok: true };
    const error =
      json && typeof json === "object" && typeof (json as { error?: unknown }).error === "string"
        ? (json as { error: string }).error
        : "Something went wrong. Try again in a moment.";
    return { ok: false, error };
  } catch {
    return { ok: false, error: "You look offline. Check your connection and try again." };
  }
}
