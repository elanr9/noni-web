import { createClient } from "@/lib/supabase/server";

export type Profile = {
  id: string;
  full_name: string | null;
  role: string | null;
  company_id: string | null;
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
    .select("id, full_name, role, company_id")
    .eq("id", user.id)
    .maybeSingle();

  return {
    userId: user.id,
    profile: profile
      ? { ...profile, email: user.email ?? null }
      : { id: user.id, full_name: null, role: null, company_id: null, email: user.email },
  };
}

export function isCampaignManager(profile: Profile | null): boolean {
  return profile?.role === "campaign_manager";
}

const PLATFORM_ADMIN_EMAIL = "founders@usenoni.app";

export function isPlatformAdmin(profile: Profile | null): boolean {
  return (
    profile?.role === "admin" &&
    profile.email?.toLowerCase() === PLATFORM_ADMIN_EMAIL
  );
}

export function canManageCampaigns(profile: Profile | null): boolean {
  return isCampaignManager(profile) || isPlatformAdmin(profile);
}

export type MemberPermissions = {
  manage_brand: boolean;
  manage_features: boolean;
  manage_billing: boolean;
};

const NO_PERMISSIONS: MemberPermissions = {
  manage_brand: false,
  manage_features: false,
  manage_billing: false,
};

// UI affordances only; RLS and the billing edge function are the real gate.
// Role 'admin' (platform admin) implicitly has every permission.
export async function getMemberPermissions(
  profile: Profile | null,
): Promise<MemberPermissions> {
  if (!profile) return NO_PERMISSIONS;
  if (profile.role === "admin") {
    return { manage_brand: true, manage_features: true, manage_billing: true };
  }
  if (!profile.company_id) return NO_PERMISSIONS;

  const supabase = await createClient();
  const { data } = await supabase
    .from("company_members")
    .select("permissions")
    .eq("profile_id", profile.id)
    .eq("company_id", profile.company_id)
    .maybeSingle();

  const permissions = (data?.permissions ?? {}) as Record<string, unknown>;
  return {
    manage_brand: permissions.manage_brand === true,
    manage_features: permissions.manage_features === true,
    manage_billing: permissions.manage_billing === true,
  };
}
