import { LibraryView } from "@/components/manager/library/LibraryView";
import { getSessionProfile } from "@/lib/auth";
import { getManagerLibrary } from "@/lib/manager/library";

/* The layout gate guarantees a campaign manager with a company; company
   scope always comes from the session profile, never from the client. */
export default async function ManagerLibraryPage() {
  const { profile } = await getSessionProfile();
  const library = await getManagerLibrary(profile?.company_id ?? "");

  return <LibraryView library={library} />;
}
