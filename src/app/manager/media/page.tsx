import { redirect } from "next/navigation";
import { MediaLibraryView } from "@/components/company/MediaLibraryView";
import { getSessionProfile } from "@/lib/auth";
import { getMediaLibrary, getThemeColor, getThemeFromSite } from "@/lib/media-library";

/* The layout gate guarantees a campaign manager with a company; company
   scope always comes from the session profile, never from the client. */
export default async function ManagerMediaPage() {
  const { profile } = await getSessionProfile();
  if (!profile?.active_company_id) redirect("/login?next=/manager");
  const companyId = profile.active_company_id;
  const [items, themeColor, themeFromSite] = await Promise.all([
    getMediaLibrary(companyId),
    getThemeColor(companyId),
    getThemeFromSite(companyId),
  ]);

  return <MediaLibraryView companyId={companyId} items={items} themeColor={themeColor} themeFromSite={themeFromSite} />;
}
