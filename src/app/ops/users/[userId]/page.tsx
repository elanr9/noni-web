import { notFound } from "next/navigation";

import { UserProfile } from "@/components/ops/users/UserProfile";
import { getOpsData } from "@/lib/ops/data";

export default async function OpsUserProfilePage({
  params,
  searchParams,
}: {
  params: Promise<{ userId: string }>;
  searchParams: Promise<{ company?: string | string[] }>;
}) {
  const [{ userId }, { company }] = await Promise.all([params, searchParams]);
  const data = await getOpsData();
  /* One Person row per seat: ?company picks which seat the page details,
     and every seat is listed under Companies. */
  const seats = data.people.filter((p) => p.id === userId);
  const person = seats.find((p) => p.company === company) ?? seats[0];
  if (!person) notFound();
  const companyNames = Object.fromEntries(data.companies.map((c) => [c.id, c.name]));
  return (
    <UserProfile
      person={person}
      companyName={companyNames[person.company] ?? "—"}
      memberships={data.memberships[person.id] ?? []}
      companyNames={companyNames}
      posts={data.posts}
      days={data.companyDays}
      briefs={data.briefs}
      briefWeeks={data.briefWeeks}
    />
  );
}
