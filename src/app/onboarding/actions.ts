"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getSessionProfile, isCompanyAdmin } from "@/lib/auth";

export type OnboardingResult = { ok: false; error: string };

export async function completeOnboarding(input: {
  fullName: string;
  phone: string;
  companyName: string;
  website: string;
}): Promise<OnboardingResult> {
  const { userId, profile } = await getSessionProfile();
  if (!userId || !isCompanyAdmin(profile)) {
    return { ok: false, error: "Company admins only." };
  }

  const fullName = input.fullName.trim();
  const phone = input.phone.trim();
  const companyName = input.companyName.trim();
  if (!fullName) return { ok: false, error: "Your name is required." };
  if (!phone) return { ok: false, error: "A phone number is required." };
  if (!companyName) return { ok: false, error: "Company name is required." };

  const supabase = await createClient();

  const { error: profileError } = await supabase
    .from("profiles")
    .update({ full_name: fullName, phone, onboarded: true })
    .eq("id", userId);
  if (profileError) return { ok: false, error: profileError.message };

  const { error: companyError } = await supabase
    .from("companies")
    .update({
      name: companyName,
      website: input.website.trim() || null,
    })
    .eq("id", profile!.company_id!);
  if (companyError) return { ok: false, error: companyError.message };

  redirect("/admin");
}
