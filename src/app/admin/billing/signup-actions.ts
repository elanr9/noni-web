"use server";

/* Sign-ups from the company's own app (Billing > Connections). One click:
   the admin approves read-only access on Supabase's consent screen and
   Noni counts sign-ups from their project every hour. See
   src/lib/admin/supabase-connect.ts. */

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

import {
  getBillingContext,
  isDevServer,
  LIVE_CONNECTIONS_URL,
  oauthOrigin,
  signConnectState,
} from "@/lib/admin/billing";
import {
  readSignupSource,
  selectSupabaseProject,
  supabaseAuthorizeUrl,
  supabaseOAuthConfig,
  type SupabaseProject,
} from "@/lib/admin/supabase-connect";
import { callEdgeFunction } from "@/lib/edge";

export type SignupStatus =
  | {
      ok: true;
      /** A project is connected. */
      connected: boolean;
      /** Sign-up counts have arrived. */
      receiving: boolean;
      projectName: string | null;
      /** Several projects were approved: the admin picks one. */
      projects: SupabaseProject[] | null;
    }
  | { ok: false; error: string };

export type SignupActionResult =
  | { ok: true; redirectUrl?: string }
  | { ok: false; error: string };

const NOT_ALLOWED = "Only the company admin can connect Supabase.";

export async function getSignupStatus(): Promise<SignupStatus> {
  const ctx = await getBillingContext();
  if (!ctx) return { ok: false, error: NOT_ALLOWED };
  if (ctx.mock) {
    return { ok: true, connected: false, receiving: false, projectName: null, projects: null };
  }
  const source = await readSignupSource(ctx.companyId);
  /* Approved several projects and has not picked one yet. */
  const picking = source && !source.projectRef && source.projects.length > 1;
  return {
    ok: true,
    connected: Boolean(source?.projectRef),
    receiving: Boolean(source?.projectRef && source.lastEventAt),
    projectName: source?.projectName ?? null,
    projects: picking ? source.projects : null,
  };
}

/** Connect button: the Supabase consent screen to send the admin to. */
export async function startSupabaseConnect(): Promise<SignupActionResult> {
  const ctx = await getBillingContext();
  if (!ctx) return { ok: false, error: NOT_ALLOWED };
  const config = supabaseOAuthConfig();
  if (ctx.mock || !config) {
    /* A dev server without the OAuth keys: connect on the live site. */
    if (!ctx.mock && isDevServer()) return { ok: true, redirectUrl: LIVE_CONNECTIONS_URL };
    if (!ctx.mock) {
      console.error(
        "Supabase connect is not configured: set SUPABASE_OAUTH_CLIENT_ID and SUPABASE_OAUTH_CLIENT_SECRET.",
      );
    }
    return { ok: false, error: "Supabase could not be opened. Try again." };
  }
  const h = await headers();
  const origin = oauthOrigin(h.get("origin"));
  return {
    ok: true,
    redirectUrl: supabaseAuthorizeUrl(
      config,
      `${origin}/api/supabase/connect`,
      signConnectState(ctx.companyId),
    ),
  };
}

/** Several projects were approved: count sign-ups from the chosen one. */
export async function chooseSupabaseProject(ref: string): Promise<SignupActionResult> {
  const ctx = await getBillingContext();
  if (!ctx || ctx.mock) return { ok: false, error: NOT_ALLOWED };
  const error = await selectSupabaseProject(ctx.companyId, ref);
  if (error) return { ok: false, error };
  /* First pull now; the hourly sync keeps it fresh. */
  await callEdgeFunction("sync-conversions", { only: "signups" }).catch(() => null);
  revalidatePath("/admin", "layout");
  return { ok: true };
}
