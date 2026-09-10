import { redirect } from "next/navigation";
import { LibraryView } from "@/components/manager/library/LibraryView";
import { getSessionProfile } from "@/lib/auth";
import { listPostTypes } from "@/lib/manager/briefs";
import {
  countLibraryItems,
  listCreatorOptions,
  listLibraryItems,
} from "@/lib/manager/library";

/* The layout gate guarantees a campaign manager with a company; company
   scope always comes from the session profile, never from the client. */
export default async function ManagerLibraryPage() {
  const { profile } = await getSessionProfile();
  if (!profile?.company_id) redirect("/login?next=/manager");
  const companyId = profile.company_id;
  const [ideas, ideaCounts, referenceCounts, creators, postTypes] = await Promise.all([
    listLibraryItems({ companyId, source: "idea", used: "new" }),
    countLibraryItems(companyId, "idea"),
    countLibraryItems(companyId, "reference"),
    listCreatorOptions(companyId),
    listPostTypes(companyId),
  ]);

  return (
    <LibraryView
      initialIdeas={ideas}
      initialCounts={{ idea: ideaCounts, reference: referenceCounts }}
      creators={creators}
      postTypes={postTypes}
    />
  );
}
