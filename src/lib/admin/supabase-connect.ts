/* Connect a company's own Supabase project so Analytics counts its real
   sign-ups. Server only.

   The company clicks Connect and approves Noni on Supabase's consent screen
   (a Supabase OAuth app asking for read-only access). Noni keeps the
   refresh token, encrypted in Vault, and the sync-conversions edge function
   reads a count of sign-ups per day from the project's auth.users every
   hour through Supabase's read-only query endpoint. Nothing is installed in
   the company's project and no user row is ever stored. */

import { randomBytes } from "node:crypto";

import { createServiceClient } from "@/lib/supabase/service";

const MANAGEMENT_API = "https://api.supabase.com/v1";

export interface SupabaseOAuthConfig {
  clientId: string;
  clientSecret: string;
}

export function supabaseOAuthConfig(): SupabaseOAuthConfig | null {
  const clientId = process.env.SUPABASE_OAUTH_CLIENT_ID?.trim();
  const clientSecret = process.env.SUPABASE_OAUTH_CLIENT_SECRET?.trim();
  return clientId && clientSecret ? { clientId, clientSecret } : null;
}

export function supabaseAuthorizeUrl(
  config: SupabaseOAuthConfig,
  redirectUri: string,
  state: string,
): string {
  const params = new URLSearchParams({
    client_id: config.clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    state,
  });
  return `${MANAGEMENT_API}/oauth/authorize?${params.toString()}`;
}

export interface SupabaseTokens {
  accessToken: string;
  refreshToken: string;
}

/** Trades the callback code for tokens. Null on any failure. */
export async function exchangeSupabaseCode(
  config: SupabaseOAuthConfig,
  code: string,
  redirectUri: string,
): Promise<SupabaseTokens | null> {
  const res = await fetch(`${MANAGEMENT_API}/oauth/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Accept: "application/json",
      Authorization: `Basic ${Buffer.from(`${config.clientId}:${config.clientSecret}`).toString("base64")}`,
    },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: redirectUri,
    }),
  });
  if (!res.ok) {
    console.error("supabase oauth token exchange failed:", res.status);
    return null;
  }
  const json = (await res.json().catch(() => null)) as
    | { access_token?: unknown; refresh_token?: unknown }
    | null;
  return typeof json?.access_token === "string" && typeof json.refresh_token === "string"
    ? { accessToken: json.access_token, refreshToken: json.refresh_token }
    : null;
}

export interface SupabaseProject {
  ref: string;
  name: string;
}

export async function listSupabaseProjects(accessToken: string): Promise<SupabaseProject[] | null> {
  const res = await fetch(`${MANAGEMENT_API}/projects`, {
    headers: { Authorization: `Bearer ${accessToken}`, Accept: "application/json" },
  });
  if (!res.ok) {
    console.error("supabase project list failed:", res.status);
    return null;
  }
  const json = (await res.json().catch(() => null)) as unknown;
  if (!Array.isArray(json)) return null;
  const projects: SupabaseProject[] = [];
  for (const row of json as Record<string, unknown>[]) {
    /* The Management API has called the project ref both `id` and `ref`. */
    const ref = typeof row.ref === "string" ? row.ref : typeof row.id === "string" ? row.id : null;
    if (!ref || !/^[a-z0-9]{10,40}$/.test(ref)) continue;
    if (typeof row.status === "string" && /INACTIVE|REMOVED|PAUSED/.test(row.status)) continue;
    projects.push({ ref, name: typeof row.name === "string" && row.name ? row.name : ref });
  }
  return projects;
}

/* ── The company's connection ── */

export interface SignupSource {
  lastEventAt: string | null;
  projectRef: string | null;
  projectName: string | null;
  /** Projects the company approved; the admin picks when there are several. */
  projects: SupabaseProject[];
  lastError: string | null;
}

export async function readSignupSource(companyId: string): Promise<SignupSource | null> {
  const supabase = createServiceClient();
  const { data } = await supabase
    .from("company_signup_sources")
    .select("last_event_at, project_ref, project_name, projects, last_error")
    .eq("company_id", companyId)
    .maybeSingle();
  if (!data) return null;
  const projects = Array.isArray(data.projects)
    ? (data.projects as SupabaseProject[]).filter(
        (p) => typeof p?.ref === "string" && typeof p?.name === "string",
      )
    : [];
  return {
    lastEventAt: (data.last_event_at as string | null) ?? null,
    projectRef: (data.project_ref as string | null) ?? null,
    projectName: (data.project_name as string | null) ?? null,
    projects,
    lastError: (data.last_error as string | null) ?? null,
  };
}

/** Stores the approval: the refresh token in Vault, the approved projects on
    the source row. With exactly one project it is selected straight away.
    Returns an error message, or null on success. */
export async function saveSupabaseConnection(
  companyId: string,
  refreshToken: string,
  projects: SupabaseProject[],
): Promise<string | null> {
  const supabase = createServiceClient();
  const only = projects.length === 1 ? projects[0] : null;
  const { error } = await supabase.from("company_signup_sources").upsert(
    {
      company_id: companyId,
      /* Write key for the track-signup webhook; unused by this flow. */
      token: `noni_${randomBytes(24).toString("hex")}`,
      projects,
      project_ref: only?.ref ?? null,
      project_name: only?.name ?? null,
      connected_at: only ? new Date().toISOString() : null,
      last_error: null,
    },
    { onConflict: "company_id" },
  );
  if (error) {
    console.error("supabase connection could not be saved:", error.message);
    return "Could not save the connection. Try again in a moment.";
  }
  const { error: tokenError } = await supabase.rpc("set_supabase_refresh_token", {
    p_company: companyId,
    p_token: refreshToken,
  });
  if (tokenError) {
    console.error("supabase refresh token could not be stored:", tokenError.message);
    return "Could not save the connection. Try again in a moment.";
  }
  return null;
}

/** Picks one of the approved projects. Returns an error message, or null. */
export async function selectSupabaseProject(companyId: string, ref: string): Promise<string | null> {
  const source = await readSignupSource(companyId);
  const project = source?.projects.find((p) => p.ref === ref);
  if (!project) return "That project is not available. Press Connect Supabase again.";
  const supabase = createServiceClient();
  const { error } = await supabase
    .from("company_signup_sources")
    .update({
      project_ref: project.ref,
      project_name: project.name,
      connected_at: new Date().toISOString(),
      last_error: null,
    })
    .eq("company_id", companyId);
  return error ? "Could not save your choice. Try again in a moment." : null;
}
