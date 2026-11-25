import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { ScoutView } from "@/components/scout/ScoutView";
import { getSessionProfile } from "@/lib/auth";
import { loadScout } from "@/lib/scout";

export const dynamic = "force-dynamic";

/* Scout for the campaign manager: the same board as /admin/scout. The
   layout gate already verified the manager. */
export default async function ManagerScoutPage() {
  const { profile } = await getSessionProfile();
  const companyId = profile?.active_company_id;
  if (!companyId) redirect("/login?next=/manager/scout");
  const data = await loadScout(companyId);
  if (!data) redirect("/manager");
  const host = (await headers()).get("host") ?? "usenoni.app";
  const origin = `${host.startsWith("localhost") ? "http" : "https"}://${host}`;
  return <ScoutView initial={data} origin={origin} />;
}
