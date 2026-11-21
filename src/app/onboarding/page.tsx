import { redirect } from "next/navigation";

import { peekBrainIngest } from "@/app/admin/brain/knowledge-actions";
import { ChatOnboarding } from "@/components/admin/onboarding/ChatOnboarding";
import { getSessionProfile, isCompanyAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";

export const metadata = { title: "Set up your company · Noni" };

/* Onboarding is a conversation (ChatOnboarding, edge function
   onboarding-chat). The chat keeps its own place, so this page only makes
   sure Noni knows the person's name before it says hello. */
export default async function OnboardingPage() {
  const { userId, profile } = await getSessionProfile();
  if (!userId) redirect("/login?next=/onboarding");
  if (!isCompanyAdmin(profile)) redirect("/admin");
  if (profile?.onboarded) redirect("/admin");

  const supabase = await createClient();
  const { data: userRes } = await supabase.auth.getUser();
  const email = userRes.user?.email?.toLowerCase() ?? "";

  if (!profile?.full_name?.trim()) {
    /* The name ops typed on the invite, then the Google account's. */
    const service = createServiceClient();
    const { data: invite } = await service
      .from("company_invites")
      .select("invited_name")
      .eq("company_id", profile!.active_company_id!)
      .eq("email", email)
      .not("invited_name", "is", null)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    const meta = (userRes.user?.user_metadata ?? {}) as Record<string, unknown>;
    const name =
      (typeof invite?.invited_name === "string" ? invite.invited_name.trim() : "") ||
      (typeof meta.full_name === "string" ? meta.full_name : typeof meta.name === "string" ? meta.name : "");
    if (name) await supabase.from("profiles").update({ full_name: name }).eq("id", userId);
  }

  const scan = await peekBrainIngest();

  return (
    <ChatOnboarding
      companyId={profile!.active_company_id!}
      email={email}
      initialScan={scan.ok ? scan.data : null}
    />
  );
}
