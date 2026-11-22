import { redirect } from "next/navigation";

import { peekBrainSnapshot, peekTopFeatures } from "@/app/admin/brain/knowledge-actions";
import { MediaSetup } from "@/components/company/MediaSetup";
import { bulletOf } from "@/lib/admin/brain-model";
import { getAdminData } from "@/lib/admin/data";
import { getSessionProfile } from "@/lib/auth";
import { getMediaLibrary, getThemeColor } from "@/lib/media-library";

export const metadata = { title: "Your product · Noni" };

/* The "Add screenshots" onboarding step as a guided flow: one thing per
   screen (screenshots, a recording, the color), in the chat's full screen
   look, instead of the Media library's tabs. */
export default async function MediaSetupPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { userId, profile } = await getSessionProfile();
  if (!userId) redirect("/login?next=/onboarding/media");
  const companyId = profile?.active_company_id;
  if (!companyId) redirect("/admin");
  const [data, items, themeColor, snapshot, top] = await Promise.all([
    getAdminData(companyId),
    getMediaLibrary(companyId),
    getThemeColor(companyId),
    peekBrainSnapshot(),
    peekTopFeatures(),
  ]);
  /* One screenshot per top feature the company picked in the company chat;
     with no pick yet (three or fewer features), the features themselves. */
  const features = (
    top.length > 0
      ? top
      : [...new Set((snapshot?.features ?? []).filter((f) => f.status !== "dismissed").map((f) => bulletOf(f, "features")))]
  )
    .filter(Boolean)
    .slice(0, 3);
  return (
    <MediaSetup
      start={(await searchParams).step === "color" ? "color" : "shots"}
      companyId={companyId}
      name={snapshot?.sells?.title?.trim() || data.company.name}
      themeColor={themeColor}
      features={features}
      shots={items.filter((i) => i.kind === "screenshot").map((i) => ({ url: i.previewUrl, title: i.title }))}
      recordings={items.filter((i) => i.kind === "recording").map((i) => i.previewUrl)}
    />
  );
}
