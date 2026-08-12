import { InvitesView } from "@/components/ops/invites/InvitesView";
import { getOpsData } from "@/lib/ops/data";

export default async function OpsInvitesPage() {
  const { invites } = await getOpsData();
  return <InvitesView invites={invites} />;
}
