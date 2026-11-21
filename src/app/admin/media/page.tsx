import { redirect } from "next/navigation";

import { MediaLibraryView } from "@/components/company/MediaLibraryView";
import { getSessionProfile } from "@/lib/auth";
import { getMediaLibrary, getThemeColor, getThemeFromSite } from "@/lib/media-library";

export default async function AdminMediaPage() {
  const { profile } = await getSessionProfile();
  const companyId = profile?.active_company_id ?? "";
  const [items, themeColor, themeFromSite] = await Promise.all([
    getMediaLibrary(companyId),
    getThemeColor(companyId),
    getThemeFromSite(companyId),
  ]);

  /* Nothing added yet: the guided flow, not an empty library. */
  if (items.length === 0) redirect("/onboarding/media");

  return <MediaLibraryView companyId={companyId} items={items} themeColor={themeColor} themeFromSite={themeFromSite} />;
}
