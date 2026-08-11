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
