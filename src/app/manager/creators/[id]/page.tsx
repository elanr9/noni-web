import { notFound } from "next/navigation";

import { CreatorProfile } from "@/components/manager/creators/CreatorProfile";
import { getSessionProfile } from "@/lib/auth";
import { getManagerContext } from "@/lib/manager/context";
import { getCreatorProfile } from "@/lib/manager/creators";

export default async function ManagerCreatorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { profile } = await getSessionProfile();
  const companyId = profile?.company_id ?? "";
  const [context, creator] = await Promise.all([
    getManagerContext(companyId),
    getCreatorProfile(companyId, id),
  ]);
  if (!creator) notFound();

  return (
    <CreatorProfile
      creator={creator}
      viewFinancials={context.access.viewFinancials}
    />
  );
}
