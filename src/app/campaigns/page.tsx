import { redirect } from "next/navigation";

import { CampaignsBoard } from "@/components/creator/CampaignsBoard";
import { CreatorShell } from "@/components/creator/CreatorShell";
import type { CreatorCampaign, FeedListing } from "@/lib/creator-campaigns";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "Campaigns" };
export const dynamic = "force-dynamic";

/* Every campaign a creator can join and every one they are in, on one
   page. The app's Campaigns tab is the same thing. */
export default async function CampaignsPage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/campaigns");

  const { data: profile } = await supabase
    .from("creator_profiles")
    .select("birth_year, tiktok, instagram, niches")
    .eq("user_id", user.id)
    .maybeSingle();
  if (!profile) redirect("/apply?as=creator");

  const [feed, mine] = await Promise.all([
    supabase.rpc("marketplace_feed" as never),
    supabase.rpc("creator_campaigns" as never),
  ]);

  const meta = (user.user_metadata ?? {}) as Record<string, unknown>;
  const name = typeof meta.full_name === "string" ? meta.full_name : typeof meta.name === "string" ? meta.name : "";
  const { tab } = await searchParams;

  const campaigns = ((mine.data ?? []) as CreatorCampaign[]).map((c) => ({
    ...c,
    earned_month_cents: Number(c.earned_month_cents) || 0,
    earned_total_cents: Number(c.earned_total_cents) || 0,
  }));

  return (
    <CreatorShell active="campaigns">
      <CampaignsBoard
        listings={(feed.data ?? []) as FeedListing[]}
        campaigns={campaigns}
        failed={!!feed.error || !!mine.error}
        resume={profile as { birth_year: number | null; tiktok: string | null; instagram: string | null; niches: string[] | null }}
        name={name}
        startTab={tab === "mine" ? "mine" : "explore"}
      />
    </CreatorShell>
  );
}
