import { InvitesView } from "@/components/ops/invites/InvitesView";
import { SEED_INVITES } from "@/lib/ops/mock-data";

/* Renders mock data for now; Agent F swaps in real Supabase rows. */
export default function OpsInvitesPage() {
  return <InvitesView invites={SEED_INVITES} />;
}
