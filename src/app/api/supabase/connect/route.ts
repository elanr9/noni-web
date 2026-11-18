/* Supabase OAuth callback. startSupabaseConnect sends the company admin to
   Supabase's consent screen with an HMAC signed state carrying the company
   id; Supabase returns here with a code. The refresh token goes to Vault;
   with one approved project the first sign-up pull runs right away, with
   several the admin picks one back on the Billing page. */

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { NextRequest } from "next/server";

import { getBillingContext, verifyConnectState } from "@/lib/admin/billing";
import {
  exchangeSupabaseCode,
  listSupabaseProjects,
  saveSupabaseConnection,
  supabaseOAuthConfig,
} from "@/lib/admin/supabase-connect";
import { callEdgeFunction } from "@/lib/edge";

export async function GET(request: NextRequest): Promise<Response> {
  const params = request.nextUrl.searchParams;
  const code = params.get("code");
  const state = params.get("state");
  const companyId = state ? verifyConnectState(state) : null;

  if (params.get("error") || !code || !companyId) {
    redirect("/admin/billing?supabase=declined");
  }

  /* The person finishing the flow must be this company's admin, signed in
     here: a signed state alone must not let anyone attach a project. */
  const ctx = await getBillingContext();
  if (!ctx || ctx.mock || ctx.companyId !== companyId) {
    redirect("/admin/billing?supabase=error");
  }

  const config = supabaseOAuthConfig();
  if (!config) redirect("/admin/billing?supabase=error");

  const redirectUri = `${request.nextUrl.origin}/api/supabase/connect`;
  const tokens = await exchangeSupabaseCode(config, code, redirectUri);
  if (!tokens) redirect("/admin/billing?supabase=error");

  const projects = await listSupabaseProjects(tokens.accessToken);
  if (!projects) redirect("/admin/billing?supabase=error");
  if (projects.length === 0) redirect("/admin/billing?supabase=empty");

  const error = await saveSupabaseConnection(companyId, tokens.refreshToken, projects);
  if (error) redirect("/admin/billing?supabase=error");

  /* One project: pull the sign-up history now so Analytics has numbers when
     the admin lands back. Best effort; the hourly sync retries. */
  if (projects.length === 1) {
    await callEdgeFunction("sync-conversions", { only: "signups" }).catch(() => null);
  }

  revalidatePath("/admin", "layout");
  redirect(`/admin/billing?supabase=${projects.length === 1 ? "connected" : "pick"}`);
}
