import { redirect } from "next/navigation";

import { OnboardingFlow } from "@/components/admin/onboarding/OnboardingFlow";
import { getSessionProfile, isCompanyAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";

export const metadata = { title: "Set up your company · Noni" };

export default async function OnboardingPage() {
  /* TEMPORARY QA BYPASS — mirrors the /admin layout envs so the question
     flow can be QA'd without real auth. Remove before finishing. */
  if (
    process.env.NODE_ENV === "development" &&
    process.env.ADMIN_QA_BYPASS === "1"
  ) {
    return (
      <OnboardingFlow
        companyName="FieldVision AI"
        defaultName="Elan Rosen"
        defaultWebsite="fieldvision.ai"
      />
    );
  }

  const { userId, profile } = await getSessionProfile();
  if (!userId) redirect("/login?next=/onboarding");
  if (!isCompanyAdmin(profile)) redirect("/admin");
  if (profile?.onboarded) redirect("/admin");

  const supabase = await createClient();
  const [companyRes, userRes] = await Promise.all([
    supabase
      .from("companies")
      .select("name, website")
      .eq("id", profile!.company_id!)
      .maybeSingle(),
    supabase.auth.getUser(),
  ]);
  const company = companyRes.data as { name: string; website: string | null } | null;

  /* Prefill the name from the invite ops sent, then Google, when the
     profile has none yet. */
  const email = userRes.data.user?.email?.toLowerCase() ?? "";
  const { data: invite } = await createServiceClient()
    .from("company_invites")
    .select("invited_name")
    .eq("company_id", profile!.company_id!)
    .eq("email", email)
    .not("invited_name", "is", null)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  const invitedName =
    typeof invite?.invited_name === "string" ? invite.invited_name.trim() : "";

  const meta = (userRes.data.user?.user_metadata ?? {}) as Record<string, unknown>;
  const googleName =
    typeof meta.full_name === "string"
      ? meta.full_name
      : typeof meta.name === "string"
        ? meta.name
        : "";
  const defaultName = profile?.full_name?.trim() || invitedName || googleName;

  return (
    <OnboardingFlow
      companyName={company?.name ?? "your company"}
      defaultName={defaultName}
      defaultWebsite={company?.website ?? ""}
    />
  );
}
