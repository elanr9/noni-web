import { notFound } from "next/navigation";

import { getOpsData } from "@/lib/ops/data";

import { PostDetail } from "./PostDetail";

export default async function OpsPostDetailPage({
  params,
}: {
  params: Promise<{ postId: string }>;
}) {
  const { postId } = await params;
  const { posts } = await getOpsData();
  const post = posts.find((q) => q.id === postId);
  if (!post) notFound();
  return <PostDetail post={post} />;
}
