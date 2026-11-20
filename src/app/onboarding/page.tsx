import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { peekBrainIngest } from "@/app/admin/brain/knowledge-actions";
import { OnboardingFlow } from "@/components/admin/onboarding/OnboardingFlow";
import { ONBOARDING_STEP_COOKIE, ONBOARDING_STEPS, resumeStep } from "@/lib/admin/onboarding-steps";
import { getSessionProfile, isCompanyAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";

export const metadata = { title: "Set up your company · Noni" };

export default async function OnboardingPage() {
  const { userId, profile } = await getSessionProfile();
  if (!userId) redirect("/login?next=/onboarding");
  if (!isCompanyAdmin(profile)) redirect("/admin");
  if (profile?.onboarded) redirect("/admin");

  const supabase = await createClient();
  const [companyRes, userRes, cookieStore] = await Promise.all([
    /* select("*") so the answer columns that may not be migrated yet do not
       error the query; they default when absent. */
    supabase
      .from("companies")
      .select("*")
      .eq("id", profile!.active_company_id!)
      .maybeSingle(),
    supabase.auth.getUser(),
    cookies(),
  ]);
  const company = companyRes.data as
    | ({ name: string; website: string | null } & Record<string, unknown>)
    | null;

  /* Prefill the name from the invite ops sent, then Google, when the
     profile has none yet. */
  const email = userRes.data.user?.email?.toLowerCase() ?? "";
  const { data: invite } = await createServiceClient()
    .from("company_invites")
    .select("invited_name")
    .eq("company_id", profile!.active_company_id!)
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

  /* Answers saved on an earlier visit, and the step that visit stopped on. */
  const role = typeof company?.admin_role === "string" ? company.admin_role : "";
  const doesUgc = company?.does_ugc === true;
  const count = (value: unknown) => (typeof value === "number" && value > 0 ? value : 0);
  const managerCount = count(company?.manager_count);
  const step = resumeStep(cookieStore.get(ONBOARDING_STEP_COOKIE)?.value, {
    name: profile?.full_name ?? "",
    website: company?.website ?? "",
    role,
    doesUgc,
    managerCount,
  });
  /* A choice is only shown as made once its screen has been passed. */
  const past = (other: "ugc" | "selfManager") =>
    ONBOARDING_STEPS.indexOf(step) > ONBOARDING_STEPS.indexOf(other);

  /* Only a returning admin can have a scan under way. */
  const scan = step === "welcome" ? null : await peekBrainIngest();

  return (
    <OnboardingFlow
      companyId={profile!.active_company_id!}
      companyName={company?.name ?? "your company"}
      defaultName={defaultName}
      defaultWebsite={company?.website ?? ""}
      email={email}
      resume={{
        step,
        role,
        doesUgc: past("ugc") ? doesUgc : null,
        creatorCount: count(company?.creator_count),
        managerCount,
        selfIsManager: past("selfManager") ? company?.self_is_manager === true : null,
      }}
      initialScan={scan?.ok ? scan.data : null}
    />
  );
}
