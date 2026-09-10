import { MediaLibraryView } from "@/components/company/MediaLibraryView";
import { getSessionProfile } from "@/lib/auth";
import { getMediaLibrary, getThemeColor } from "@/lib/media-library";

export default async function AdminMediaPage() {
  const { profile } = await getSessionProfile();
  const companyId = profile?.company_id ?? "";
  const [items, themeColor] = await Promise.all([
    getMediaLibrary(companyId),
    getThemeColor(companyId),
  ]);

  return <MediaLibraryView companyId={companyId} items={items} themeColor={themeColor} />;
}
