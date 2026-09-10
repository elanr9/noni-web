import { redirect } from "next/navigation";
import { MediaLibraryView } from "@/components/company/MediaLibraryView";
import { getSessionProfile } from "@/lib/auth";
import { getMediaLibrary, getThemeColor } from "@/lib/media-library";

/* The layout gate guarantees a campaign manager with a company; company
   scope always comes from the session profile, never from the client. */
export default async function ManagerMediaPage() {
  const { profile } = await getSessionProfile();
  if (!profile?.company_id) redirect("/login?next=/manager");
  const companyId = profile.company_id;
  const [items, themeColor] = await Promise.all([
    getMediaLibrary(companyId),
    getThemeColor(companyId),
  ]);

  return <MediaLibraryView companyId={companyId} items={items} themeColor={themeColor} />;
}
