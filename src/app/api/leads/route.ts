/* Lead capture endpoint for the public forms (waitlist, business sign-up,
   Enterprise contact, TestFlight invite request). Inserts into public.leads
   with the service role; RLS on that table has no policies, so nothing else
   can read or write it.

   public.leads does not exist until its migration is applied (see
   supabase/migrations/20261118000100_leads.sql). Until then the insert
   fails with an undefined-table error and the form gets a 503 with friendly
   copy instead of a crash. */

import { CONTACT_EMAIL } from "@/lib/site-config";
import { parseLead } from "@/lib/leads";
import { createServiceClient } from "@/lib/supabase/service";

const UNAVAILABLE = CONTACT_EMAIL
  ? `We could not save that right now. Email us at ${CONTACT_EMAIL} and we will get back to you.`
  : "We could not save that right now. Try again in a little while.";

export async function POST(request: Request): Promise<Response> {
  const body: unknown = await request.json().catch(() => null);
  const parsed = parseLead(body);
  if (!parsed.ok) return Response.json({ error: parsed.error }, { status: 400 });

  /* Bots that fill the honeypot get a success they cannot tell apart. */
  if (parsed.spam) return Response.json({ ok: true });

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY || !process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return Response.json({ error: UNAVAILABLE }, { status: 503 });
  }

  const { lead } = parsed;
  const { error } = await createServiceClient()
    .from("leads")
    .insert({
      kind: lead.kind,
      name: lead.name,
      email: lead.email,
      phone: lead.phone || null,
      company: lead.company || null,
      website: lead.website || null,
      message: lead.message || null,
      source: lead.source || null,
      user_agent: request.headers.get("user-agent")?.slice(0, 300) ?? null,
    });

  if (error) {
    /* 42P01 undefined_table (Postgres) / PGRST205 table not in the schema
       cache (PostgREST): the migration has not been applied yet. */
    const missingTable = error.code === "42P01" || error.code === "PGRST205";
    console.error(
      missingTable
        ? "public.leads is missing. Apply supabase/migrations/20261118000100_leads.sql."
        : `Lead insert failed: ${error.message}`,
    );
    return Response.json({ error: UNAVAILABLE }, { status: 503 });
  }

  return Response.json({ ok: true });
}
