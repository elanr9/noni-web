import { notFound } from "next/navigation";

import { AdminShell } from "@/components/admin/AdminShell";
import { ScoutView } from "@/components/scout/ScoutView";
import { loadScout } from "@/lib/scout";

/* Dev preview of Scout with a real company's data (?company=<id>). 404 in
   production through the /internal layout. Actions need a real session. */
export default async function ScoutPreviewPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const sp = await searchParams;
  const id = sp.company;
  if (typeof id !== "string") notFound();
  const data = await loadScout(id);
  if (!data) notFound();
  return (
    <AdminShell companyName={data.companyName} name="Preview" people={[]} setupRemaining={0} setupComplete>
      <ScoutView initial={data} origin="http://localhost:3000" initialOpen={typeof sp.open === "string" ? sp.open : null} />
    </AdminShell>
  );
}
