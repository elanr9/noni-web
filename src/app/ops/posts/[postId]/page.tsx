import { notFound } from "next/navigation";

import { SEED_POSTS } from "@/lib/ops/mock-data";

import { PostDetail } from "./PostDetail";

export default async function OpsPostDetailPage({
  params,
}: {
  params: Promise<{ postId: string }>;
}) {
  const { postId } = await params;
  const post = SEED_POSTS.find((q) => q.id === postId);
  if (!post) notFound();
  return <PostDetail post={post} />;
}
