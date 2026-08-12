import { UsersPage } from "@/components/ops/users/UsersPage";
import { getOpsData } from "@/lib/ops/data";

export default async function OpsUsersPage() {
  const { companies, people } = await getOpsData();
  return <UsersPage companies={companies} people={people} />;
}
