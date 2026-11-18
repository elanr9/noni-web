/* Stripe Connect OAuth callback (Agent C). The startStripeConnect action
   sends the admin to connect.stripe.com with scope read_write and an HMAC
   signed state carrying the company id; Stripe returns here with a code to
   exchange for the connected account id. Stripe grants read and write, but
   Noni only reads: the account only powers the sales and sign-up numbers in
   Analytics. */

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { NextRequest } from "next/server";

import { getStripe, verifyConnectState, writeBilling } from "@/lib/admin/billing";
import { callEdgeFunction } from "@/lib/edge";

export async function GET(request: NextRequest): Promise<Response> {
  const params = request.nextUrl.searchParams;
  const code = params.get("code");
  const state = params.get("state");
  const companyId = state ? verifyConnectState(state) : null;

  /* The admin declined on Stripe's side, or the state was tampered with. */
  if (params.get("error") || !code || !companyId) {
    redirect("/admin/billing?connect=declined");
  }

  const stripe = getStripe();
  if (!stripe) redirect("/admin/billing?connect=error");

  let accountId: string | undefined;
  try {
    const token = await stripe.oauth.token({
      grant_type: "authorization_code",
      code,
    });
    accountId = token.stripe_user_id;
  } catch {
    redirect("/admin/billing?connect=error");
  }
  if (!accountId) redirect("/admin/billing?connect=error");

  /* Never attach Noni's own Stripe account (the one behind
     STRIPE_SECRET_KEY) to a customer company. */
  let platformAccountId: string | null = null;
  try {
    platformAccountId = (await stripe.accounts.retrieve(null)).id;
  } catch {
    redirect("/admin/billing?connect=error");
  }
  if (!platformAccountId || accountId === platformAccountId) {
    redirect("/admin/billing?connect=error");
  }

  const error = await writeBilling(companyId, {
    stripe_connected: true,
    stripe_account_id: accountId,
  });
  if (error) redirect("/admin/billing?connect=error");

  /* Pull the first 90 days of sales and sign-ups now, so Analytics has
     numbers when the admin lands back on the page; the daily sync keeps them
     fresh after that. Best effort: a slow or failed pull never blocks the
     connect, the nightly run picks it up. */
  await callEdgeFunction("sync-conversions", { days: 90 }).catch(() => null);

  revalidatePath("/admin", "layout");
  redirect("/admin/billing");
}
