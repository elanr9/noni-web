import { PostsView } from "@/components/admin/posts/PostsView";
import { getAdminData } from "@/lib/admin/data";
import { getSessionProfile } from "@/lib/auth";

export default async function AdminPostsPage() {
  const { profile } = await getSessionProfile();
  const data = await getAdminData(profile?.company_id ?? "");

  return <PostsView posts={data.posts} dayActivity={data.dayActivity} />;
}
