import { redirect } from "next/navigation";

import { SetupChecklist } from "@/components/admin/todo/SetupChecklist";
import { PageHead } from "@/components/kit";
import { getAdminData } from "@/lib/admin/data";
import { deriveSetupStatus } from "@/lib/admin/setup";
import { getSessionProfile } from "@/lib/auth";

/* Onboarding tab: the gamified setup to-do. */
export default async function AdminOnboardingPage() {
  const { profile } = await getSessionProfile();
  const data = await getAdminData(profile?.company_id ?? "");
  const setup = deriveSetupStatus(data);

  /* Tab retirement: once setup is done this tab no longer exists. */
  if (setup.complete) redirect("/admin/analytics");

  const firstName = profile?.full_name?.trim().split(/\s+/)[0] || "there";

  return (
    <div>
      <PageHead
        title={`Hey ${firstName}.`}
        sub={`${setup.remaining} ${setup.remaining === 1 ? "step" : "steps"} and ${data.company.name} runs itself.`}
      />
      <SetupChecklist
        companyName={data.company.name}
        steps={setup.steps}
        doneCount={setup.doneCount}
      />
    </div>
  );
}
