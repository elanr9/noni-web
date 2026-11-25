import { LeadsView, type OpsLead } from "@/components/ops/leads/LeadsView";
import { createServiceClient } from "@/lib/supabase/service";

export const dynamic = "force-dynamic";

/* Companies from Get started, newest first. The ops layout already limits
   /ops to the platform admin; the actions check again. */
export default async function OpsLeadsPage() {
  const { data } = await createServiceClient()
    .from("company_leads")
    .select("id, name, email, company, website, role, answers, status, finished_at, call_booked_at, invited_at, subscribed_at, company_id, created_at")
    .order("created_at", { ascending: false })
    .limit(300);
  return <LeadsView leads={(data ?? []) as OpsLead[]} />;
}
