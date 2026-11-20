"use client";

/* Multi-account storage for the web dashboards, mirroring the mobile app's
   lib/accounts: every signed-in session is remembered in localStorage so a
   person who is both a company admin and a campaign manager (two auth
   users) can swap without re-entering Google each time. Switching calls
   supabase.auth.setSession with the stored tokens, which rewrites the
   auth cookies so the server picks up the new user on the next request.

   Accounts that only create are remembered but never offered by the
   switcher: the web dashboards are for admins and campaign managers only.
   One account can hold seats in several companies, so the remembered role
   is the best web seat across all of them, not just the active company. */

import type { SupabaseClient } from "@supabase/supabase-js";

const STORE_KEY = "noni-web-accounts-v1";

export type StoredRole =
  | "admin"
  | "company_admin"
  | "campaign_manager"
  | "creator";

export interface StoredAccount {
  userId: string;
  email: string | null;
  fullName: string | null;
  role: StoredRole;
  accessToken: string;
  refreshToken: string;
  savedAt: number;
}

function readStore(): StoredAccount[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORE_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (a): a is StoredAccount =>
        !!a &&
        typeof a === "object" &&
        typeof (a as StoredAccount).userId === "string" &&
        typeof (a as StoredAccount).refreshToken === "string",
    );
  } catch {
    return [];
  }
}

function writeStore(accounts: StoredAccount[]) {
  try {
    window.localStorage.setItem(STORE_KEY, JSON.stringify(accounts));
  } catch {
    /* Storage full or blocked; switching simply won't remember accounts. */
  }
}

export function listStoredAccounts(): StoredAccount[] {
  return readStore();
}

/* The role remembered for an account. The platform account and an active
   admin or manager seat are kept as they are. Someone whose active company
   has them as a creator still counts as an admin or manager when any other
   company does, so the switcher keeps offering the account. */
export function webRole(
  activeRole: string | null | undefined,
  membershipRoles: ReadonlyArray<string | null | undefined>,
): StoredRole {
  if (
    activeRole === "admin" ||
    activeRole === "company_admin" ||
    activeRole === "campaign_manager"
  ) {
    return activeRole;
  }
  if (membershipRoles.includes("company_admin")) return "company_admin";
  if (membershipRoles.includes("campaign_manager")) return "campaign_manager";
  return "creator";
}

/** Accounts the web switcher may offer. Creator-only accounts stay app-only. */
export function listSwitchableAccounts(): StoredAccount[] {
  return readStore().filter((a) => a.role !== "creator");
}

export function removeStoredAccount(userId: string) {
  writeStore(readStore().filter((a) => a.userId !== userId));
}

function upsert(account: StoredAccount) {
  const rest = readStore().filter((a) => a.userId !== account.userId);
  writeStore([account, ...rest]);
}

/* Reads the live session plus the profile row and saves both tokens.
   Called after every sign-in and right before switching away, so the
   stored refresh token is always the freshest one (they rotate). */
export async function rememberCurrentAccount(
  supabase: SupabaseClient,
): Promise<StoredAccount | null> {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) return null;

  /* The role comes from the memberships (current_role() for the active
     company, my_companies() for the rest), never from profiles.role, which
     only marks the platform admin. */
  const [{ data: profile }, { data: activeRole }, { data: memberships }] =
    await Promise.all([
      supabase
        .from("profiles")
        .select("id, full_name")
        .eq("id", session.user.id)
        .maybeSingle(),
      supabase.rpc("current_role"),
      supabase.rpc("my_companies"),
    ]);
  const membershipRoles = Array.isArray(memberships)
    ? (memberships as Array<{ role?: string | null }>).map((m) => m.role)
    : [];

  const account: StoredAccount = {
    userId: session.user.id,
    email: session.user.email ?? null,
    fullName: (profile?.full_name as string | null) ?? null,
    role: webRole(activeRole as string | null, membershipRoles),
    accessToken: session.access_token,
    refreshToken: session.refresh_token,
    savedAt: Date.now(),
  };
  upsert(account);
  return account;
}

/* Swaps the live session to a stored account. Throws when the stored
   refresh token has gone stale, in which case the caller should offer
   "Sign in again" (the add-account flow). */
export async function switchToAccount(
  supabase: SupabaseClient,
  userId: string,
): Promise<void> {
  await rememberCurrentAccount(supabase);

  const target = readStore().find((a) => a.userId === userId);
  if (!target) throw new Error("That account is no longer saved here.");

  const { data, error } = await supabase.auth.setSession({
    access_token: target.accessToken,
    refresh_token: target.refreshToken,
  });
  if (error || !data.session) {
    removeStoredAccount(userId);
    throw new Error("Session expired. Sign in again for that account.");
  }

  /* setSession may have rotated the refresh token, and the account's seats
     may have changed since it was saved: re-read both from the live session.
     If that read fails, at least keep the fresh tokens. */
  const refreshed = await rememberCurrentAccount(supabase).catch(() => null);
  if (!refreshed) {
    upsert({
      ...target,
      accessToken: data.session.access_token,
      refreshToken: data.session.refresh_token,
      savedAt: Date.now(),
    });
  }
}

export function roleLabel(role: StoredRole): string {
  if (role === "admin") return "Noni platform";
  if (role === "company_admin") return "Company admin";
  if (role === "campaign_manager") return "Campaign manager";
  return "Creator";
}
