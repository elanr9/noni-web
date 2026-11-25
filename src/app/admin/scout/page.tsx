import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { ScoutView } from "@/components/scout/ScoutView";
import { canManageCampaigns, getSessionProfile, isPlatformAdmin } from "@/lib/auth";
import { loadScout } from "@/lib/scout";

export const dynamic = "force-dynamic";

export default async function AdminScoutPage() {
  const { profile } = await getSessionProfile();
  const companyId = profile?.active_company_id;
  if (!companyId || !(canManageCampaigns(profile) || isPlatformAdmin(profile))) redirect("/admin");
  const data = await loadScout(companyId);
  if (!data) redirect("/admin");
  const host = (await headers()).get("host") ?? "usenoni.app";
  const origin = `${host.startsWith("localhost") ? "http" : "https"}://${host}`;
  return <ScoutView initial={data} origin={origin} />;
}
