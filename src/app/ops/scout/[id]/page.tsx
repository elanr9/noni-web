import { headers } from "next/headers";
import { notFound } from "next/navigation";

import { ScoutView } from "@/components/scout/ScoutView";
import { loadScout } from "@/lib/scout";

export const dynamic = "force-dynamic";

/* Scout for any company, run by the platform admin (the ops layout gates). */
export default async function OpsScoutCompanyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await loadScout(id);
  if (!data) notFound();
  const host = (await headers()).get("host") ?? "usenoni.app";
  const origin = `${host.startsWith("localhost") ? "http" : "https"}://${host}`;
  return <ScoutView initial={data} companyId={id} origin={origin} />;
}
