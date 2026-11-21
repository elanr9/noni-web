import { redirect } from "next/navigation";

import { SetupChecklist } from "@/components/admin/todo/SetupChecklist";
import { PageHead } from "@/components/kit";
import { getAdminData } from "@/lib/admin/data";
import { deriveSetupStatus } from "@/lib/admin/setup";
import { getSessionProfile } from "@/lib/auth";

/* Onboarding tab: the next setup step, front and centre, over the whole road. */
export default async function AdminOnboardingPage() {
  const { profile } = await getSessionProfile();
  const data = await getAdminData(profile?.active_company_id ?? "");
  const setup = deriveSetupStatus(data);

  /* Tab retirement: once setup is done this tab no longer exists. */
  if (setup.complete) redirect("/admin/analytics");

  const firstName = profile?.full_name?.trim().split(/\s+/)[0] || "there";

  return (
    <div>
      <PageHead
        title={
          setup.remaining === 1
            ? `One step left, ${firstName}.`
            : `${setup.remaining} steps to your first posts, ${firstName}.`
        }
        sub={`Finish these and ${data.company.name} has creators posting for it every week.`}
      />
      <SetupChecklist steps={setup.steps} doneCount={setup.doneCount} />
    </div>
  );
}
