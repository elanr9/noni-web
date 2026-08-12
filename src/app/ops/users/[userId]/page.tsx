import { notFound } from "next/navigation";

import { UserProfile } from "@/components/ops/users/UserProfile";
import { SEED_PEOPLE } from "@/lib/ops/mock-data";

export default async function OpsUserProfilePage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const { userId } = await params;
  const person = SEED_PEOPLE.find((p) => p.id === userId);
  if (!person) notFound();
  return <UserProfile person={person} />;
}
