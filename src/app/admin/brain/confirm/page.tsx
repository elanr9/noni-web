import { peekBrainSnapshot } from "@/app/admin/brain/knowledge-actions";
import { BrainConfirm } from "@/components/admin/brain/BrainConfirm";
import { getAdminData } from "@/lib/admin/data";
import { getSessionProfile } from "@/lib/auth";

/* The "Check what Noni knows about you" onboarding step: a short chat that
   reads the summary back one line at a time for a yes or a fix. */
export default async function BrainConfirmPage() {
  const { profile } = await getSessionProfile();
  const [data, snapshot] = await Promise.all([
    getAdminData(profile?.active_company_id ?? ""),
    peekBrainSnapshot(),
  ]);
  return <BrainConfirm companyName={data.company.name} snapshot={snapshot} />;
}
