import { TeamView } from "@/components/admin/team/TeamView";
import { getAdminData } from "@/lib/admin/data";
import { getSessionProfile } from "@/lib/auth";

export default async function AdminTeamPage() {
  const { profile } = await getSessionProfile();
  const data = await getAdminData(profile?.company_id ?? "");

  return (
    <TeamView
      companyName={data.company.name}
      managers={data.managers}
      creators={data.creators}
      managerAccess={data.company.managerAccess}
    />
  );
}
