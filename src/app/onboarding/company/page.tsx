import { redirect } from "next/navigation";

import { peekBrainSnapshot } from "@/app/admin/brain/knowledge-actions";
import { BrainConfirm } from "@/components/admin/brain/BrainConfirm";
import { getAdminData } from "@/lib/admin/data";
import { getSessionProfile } from "@/lib/auth";
import { getThemeColor } from "@/lib/media-library";

export const metadata = { title: "Your company · Noni" };

/* The "Confirm your company details" onboarding step: a full screen chat,
   the same look as the first onboarding chat, where Noni says what it
   understood about the company a line at a time and the admin taps Yes or
   types what is wrong. */
export default async function CompanyChatPage() {
  const { userId, profile } = await getSessionProfile();
  if (!userId) redirect("/login?next=/onboarding/company");
  if (!profile?.active_company_id) redirect("/admin");
  const [data, snapshot, themeColor] = await Promise.all([
    getAdminData(profile.active_company_id),
    peekBrainSnapshot(),
    getThemeColor(profile.active_company_id),
  ]);
  return (
    <BrainConfirm
      companyName={data.company.name}
      firstName={profile.full_name?.trim().split(/\s+/)[0] ?? ""}
      logoPath={data.company.logoPath}
      themeColor={themeColor}
      snapshot={snapshot}
    />
  );
}
