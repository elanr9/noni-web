import { CreatorsRoster } from "@/components/manager/creators/CreatorsRoster";
import { getSessionProfile } from "@/lib/auth";
import { getManagerContext } from "@/lib/manager/context";
import { listCreatorRoster } from "@/lib/manager/creators";

export default async function ManagerCreatorsPage() {
  const { profile } = await getSessionProfile();
  const companyId = profile?.company_id ?? "";
  const [context, roster] = await Promise.all([
    getManagerContext(companyId),
    listCreatorRoster(companyId),
  ]);

  return (
    <CreatorsRoster
      roster={roster}
      companyName={context.companyName}
      viewFinancials={context.access.viewFinancials}
      canInvite={context.access.inviteCreators}
    />
  );
}
