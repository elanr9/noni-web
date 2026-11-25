import { redirect } from "next/navigation";

import { BriefsLibraryView } from "@/components/manager/briefs/library/BriefsLibraryView";
import { getSessionProfile } from "@/lib/auth";
import { loadBriefLibrary } from "@/lib/manager/brief-library-server";

export const dynamic = "force-dynamic";
/* Fill in with AI and Upload brief wait on the writer. */
export const maxDuration = 300;

/* The Briefs tab: the company's library of templates and outlines, the
   same as the app. The layout gate already verified the manager. */
export default async function ManagerBriefsPage({ searchParams }: { searchParams: Promise<{ open?: string; new?: string; title?: string; link?: string; item?: string }> }) {
  const { profile } = await getSessionProfile();
  const companyId = profile?.active_company_id;
  if (!companyId) redirect("/login?next=/manager/briefs");
  const [briefs, sp] = await Promise.all([loadBriefLibrary(companyId), searchParams]);
  /* Make brief in Library lands here with the idea or link to start from. */
  const seed = sp.new ? { title: (sp.title ?? "").slice(0, 140), link: sp.link ?? "", itemId: sp.item ?? null } : null;
  return <BriefsLibraryView initial={briefs} companyId={companyId} initialOpen={sp.open ?? null} seed={seed} />;
}
