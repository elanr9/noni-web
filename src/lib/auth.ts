import {
  asRole,
  toCompanySummaries,
  type CompanyStatusRow,
  type CompanySummary,
  type Role,
} from "@/lib/company-summary";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import type { User } from "@supabase/supabase-js";

export type { CompanySummary, CompanyStatusRow, Role } from "@/lib/company-summary";
import {
  PERMISSION_DEFS,
  type PermissionKey,
  type Permissions,
} from "@/lib/permissions";

/* profiles.role is only the platform admin marker. Every other role comes
   from the membership row for the active company (current_role()). */
export type Profile = {
  id: string;
  full_name: string | null;
  role: Role | null;
  active_company_id: string | null;
  onboarded: boolean;
  email?: string | null;
};

export async function getSessionProfile(): Promise<{
  userId: string | null;
  profile: Profile | null;
}> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { userId: null, profile: null };

  const [{ data: profile }, { data: activeRole }] = await Promise.all([
    supabase
      .from("profiles")
      .select("id, full_name, role, active_company_id, onboarded")
      .eq("id", user.id)
      .maybeSingle(),
    supabase.rpc("current_role"),
  ]);

  const promoted = await ensurePlatformAdmin(user, profile?.role);
  if (promoted) return { userId: user.id, profile: promoted };

  const role: Role | null =
    profile?.role === "admin" ? "admin" : asRole(activeRole);

  return {
    userId: user.id,
    profile: profile
      ? {
          id: profile.id,
          full_name: profile.full_name,
          role,
          active_company_id: profile.active_company_id,
          onboarded: profile.onboarded ?? false,
          email: user.email ?? null,
        }
      : {
          id: user.id,
          full_name: null,
          role: null,
          active_company_id: null,
          onboarded: false,
          email: user.email,
        },
  };
}

function platformAdminAllowList(): string[] {
  return (process.env.PLATFORM_ADMIN_EMAILS ?? "")
    .split(",")
    .map((entry) => entry.trim().toLowerCase())
    .filter((entry) => entry.length > 0);
}

/* Promotes an allow listed Google account to platform admin on sign in so
   ops access never depends on a hand run SQL statement. `currentRole` is
   undefined when no profile row exists yet. Returns the admin profile when a
   promotion happened, otherwise null. */
async function ensurePlatformAdmin(
  user: User,
  currentRole: string | null | undefined,
): Promise<Profile | null> {
  const email = user.email?.toLowerCase();
  if (!email || currentRole === "admin") return null;
  const allowList = platformAdminAllowList();
  if (allowList.length === 0 || !allowList.includes(email)) return null;

  const service = createServiceClient();
  const fullName: string | null =
    typeof user.user_metadata.full_name === "string"
      ? user.user_metadata.full_name
      : null;

  if (currentRole === undefined) {
    const { data, error } = await service
      .from("profiles")
      .insert({ id: user.id, role: "admin", full_name: fullName, onboarded: true })
      .select("id, full_name, active_company_id, onboarded")
      .single();
    if (error || !data) return null;
    return { ...data, role: "admin", email };
  }

  const { data, error } = await service
    .from("profiles")
    .update({ role: "admin" })
    .eq("id", user.id)
    .select("id, full_name, active_company_id, onboarded")
    .single();
  if (error || !data) return null;
  return { ...data, role: "admin", email };
}

export function isPlatformAdmin(profile: Profile | null): boolean {
  return profile?.role === "admin";
}

export function isCompanyAdmin(profile: Profile | null): boolean {
  return profile?.role === "company_admin";
}

export function isCampaignManager(profile: Profile | null): boolean {
  return profile?.role === "campaign_manager";
}

// Guards the /manager mutations: campaign managers, plus company admins
// who work that dashboard too (admins hold every permission implicitly).
export function canManageCampaigns(profile: Profile | null): boolean {
  return isCampaignManager(profile) || isCompanyAdmin(profile);
}

// The web dashboards serve company admins (/admin), campaign managers
// (/manager), and the platform account (/ops). Creators live in the iOS app.
export function canUseWebDashboard(profile: Profile | null): boolean {
  return isCompanyAdmin(profile) || isPlatformAdmin(profile);
}

// Mirrors SQL has_permission(): admins hold every permission implicitly,
// campaign managers read their active company_members row. RLS enforces the
// same rules server side; this is only for shaping the UI.
export async function getMemberPermissions(
  profile: Profile | null,
): Promise<Record<PermissionKey, boolean>> {
  const all = isCompanyAdmin(profile) || isPlatformAdmin(profile);
  const base = Object.fromEntries(
    PERMISSION_DEFS.map((def) => [def.key, all]),
  ) as Record<PermissionKey, boolean>;
  if (all || !profile?.active_company_id) return base;

  const supabase = await createClient();
  const { data } = await supabase
    .from("company_members")
    .select("permissions")
    .eq("company_id", profile.active_company_id)
    .eq("profile_id", profile.id)
    .is("removed_at", null)
    .maybeSingle();

  const stored = (data?.permissions ?? {}) as Permissions;
  for (const def of PERMISSION_DEFS) {
    base[def.key] = stored[def.key] === true;
  }
  return base;
}

export async function listCompanySummaries(): Promise<CompanySummary[]> {
  const supabase = await createClient();
  const { data } = await supabase.rpc("company_status_summary");
  return toCompanySummaries(data as CompanyStatusRow[] | null);
}
