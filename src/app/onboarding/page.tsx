import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getSessionProfile, isCompanyAdmin } from "@/lib/auth";
import { OnboardingForm } from "./OnboardingForm";

export const metadata = { title: "Set up your company · Noni" };

export default async function OnboardingPage() {
  const { userId, profile } = await getSessionProfile();
  if (!userId) redirect("/login?next=/onboarding");
  if (!isCompanyAdmin(profile)) redirect("/admin");
  if (profile?.onboarded) redirect("/admin");

  const supabase = await createClient();
  const { data: company } = await supabase
    .from("companies")
    .select("name, website")
    .eq("id", profile!.company_id!)
    .maybeSingle();

  return (
    <div className="flex min-h-screen items-center bg-soft px-5 py-16">
      <div className="mx-auto w-full max-w-md">
        <h1 className="display text-center text-3xl font-semibold text-ink">
          Welcome to Noni
        </h1>
        <p className="mt-2 text-center text-[15px] text-muted">
          A few details before you take over{" "}
          <span className="font-semibold text-ink">{company?.name ?? "your company"}</span>.
        </p>
        <div className="mt-6 rounded-3xl border border-line bg-white p-6 sm:p-8">
          <OnboardingForm
            defaultName={profile?.full_name ?? ""}
            defaultCompanyName={company?.name ?? ""}
            defaultWebsite={company?.website ?? ""}
          />
        </div>
      </div>
    </div>
  );
}
