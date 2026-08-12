import { createClient } from "@/lib/supabase/server";
import {
  PERMISSION_DEFS,
  type PermissionKey,
  type Permissions,
} from "@/lib/permissions";

export type Role = "admin" | "company_admin" | "campaign_manager" | "creator";

export type Profile = {
  id: string;
  full_name: string | null;
  role: Role | null;
  company_id: string | null;
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

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, full_name, role, company_id, onboarded")
    .eq("id", user.id)
    .maybeSingle();

  return {
    userId: user.id,
    profile: profile
      ? { ...profile, onboarded: profile.onboarded ?? false, email: user.email ?? null }
      : {
          id: user.id,
          full_name: null,
          role: null,
          company_id: null,
          onboarded: false,
          email: user.email,
        },
  };
}

const PLATFORM_ADMIN_EMAIL = "founders@usenoni.app";

export function isPlatformAdmin(profile: Profile | null): boolean {
  return (
    profile?.role === "admin" &&
    profile.email?.toLowerCase() === PLATFORM_ADMIN_EMAIL
  );
}

export function isCompanyAdmin(profile: Profile | null): boolean {
  return profile?.role === "company_admin";
}

// The web dashboard is for the company admin (and the platform account).
// Campaign managers and creators live in the iOS app.
export function canUseWebDashboard(profile: Profile | null): boolean {
  return isCompanyAdmin(profile) || isPlatformAdmin(profile);
}

// Mirrors SQL has_permission(): admins hold every permission implicitly,
// campaign managers read their company_members row. RLS enforces the same
// rules server side; this is only for shaping the UI.
export async function getMemberPermissions(
  profile: Profile | null,
): Promise<Record<PermissionKey, boolean>> {
  const all = isCompanyAdmin(profile) || isPlatformAdmin(profile);
  const base = Object.fromEntries(
    PERMISSION_DEFS.map((def) => [def.key, all]),
  ) as Record<PermissionKey, boolean>;
  if (all || !profile?.company_id) return base;

  const supabase = await createClient();
  const { data } = await supabase
    .from("company_members")
    .select("permissions")
    .eq("company_id", profile.company_id)
    .eq("profile_id", profile.id)
    .maybeSingle();

  const stored = (data?.permissions ?? {}) as Permissions;
  for (const def of PERMISSION_DEFS) {
    base[def.key] = stored[def.key] === true;
  }
  return base;
}
