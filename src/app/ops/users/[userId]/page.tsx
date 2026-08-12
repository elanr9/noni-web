import { notFound } from "next/navigation";

import { UserProfile } from "@/components/ops/users/UserProfile";
import { getOpsData } from "@/lib/ops/data";

export default async function OpsUserProfilePage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const { userId } = await params;
  const data = await getOpsData();
  const person = data.people.find((p) => p.id === userId);
  if (!person) notFound();
  return (
    <UserProfile
      person={person}
      companyName={
        data.companies.find((c) => c.id === person.company)?.name ?? "—"
      }
      posts={data.posts}
      days={data.companyDays}
      briefs={data.briefs}
      briefWeeks={data.briefWeeks}
    />
  );
}
