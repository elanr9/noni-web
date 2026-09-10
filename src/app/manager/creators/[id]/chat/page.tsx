import { notFound, redirect } from "next/navigation";

import { ChatThread } from "@/components/manager/creators/ChatThread";
import { getSessionProfile } from "@/lib/auth";
import { getCreatorHeader } from "@/lib/manager/creators";

export default async function ManagerCreatorChatPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { userId, profile } = await getSessionProfile();
  if (!profile?.company_id) redirect("/login?next=/manager");
  const companyId = profile.company_id;
  const creator = await getCreatorHeader(companyId, id);
  if (!creator || !userId) notFound();

  return (
    <ChatThread
      companyId={companyId}
      creatorId={id}
      meId={userId}
      creatorName={creator.name}
      creatorAvatarUrl={creator.avatarUrl}
    />
  );
}
