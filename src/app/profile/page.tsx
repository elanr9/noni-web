import { redirect } from "next/navigation";

import { CreatorProfileEditor } from "@/components/profile/CreatorProfileEditor";
import { EMPTY_PROFILE, type CreatorProfile } from "@/lib/creator-profile";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "Profile" };
export const dynamic = "force-dynamic";

/* A creator's profile on the website: the same fields as the app's
   Profile tab. Anyone signed in can open it; a creator who has not been
   through sign up yet is sent to it first. */
export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/profile");

  const { data } = await supabase.from("creator_profiles").select("*").eq("user_id", user.id).maybeSingle();
  if (!data) redirect("/apply?as=creator");

  const meta = (user.user_metadata ?? {}) as Record<string, unknown>;
  const name = typeof meta.full_name === "string" ? meta.full_name : typeof meta.name === "string" ? meta.name : "";
  const photo = typeof meta.avatar_url === "string" ? meta.avatar_url : typeof meta.picture === "string" ? meta.picture : null;

  const row = data as Partial<CreatorProfile>;
  const profile: CreatorProfile = {
    ...EMPTY_PROFILE,
    ...Object.fromEntries(Object.entries(row).filter(([, v]) => v !== undefined)),
    languages: row.languages ?? [],
    niches: row.niches ?? [],
    portfolio: Array.isArray(row.portfolio) ? row.portfolio : [],
    listed: row.listed ?? true,
  };

  return <CreatorProfileEditor initial={profile} name={name} photo={photo} />;
}
