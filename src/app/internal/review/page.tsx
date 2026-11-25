import { ManagerShell } from "@/components/manager/ManagerShell";
import { ReviewHome } from "@/components/manager/review/ReviewHome";
import type { MarketCreator } from "@/lib/manager/market";

/* Dev preview of Review with creators who applied. 404 in production
   through the /internal layout. Accept and Decline need a real session. */
const who = (i: number, name: string, followers: number, views: number, earned: number): MarketCreator =>
  ({
    creator_id: `c${i}`,
    full_name: name,
    avatar_path: null,
    photo: null,
    age: 19 + i,
    gender: i % 2 ? "female" : "male",
    location: ["Austin", "Miami", "Toronto"][i % 3],
    country: null,
    instagram: null,
    tiktok: null,
    followers,
    total_views: views,
    total_earned_cents: earned,
    niches: [],
    portfolio: [],
    languages: [],
    match_score: 92 - i * 7,
    application_id: `a${i}`,
    application_status: "applied",
  }) as unknown as MarketCreator;

export default function ReviewPreview() {
  return (
    <ManagerShell companyName="Inkbound AI" name="Preview" people={[]} reviewCount={3}>
      <ReviewHome
        posts={[]}
        music={[]}
        accounts={[]}
        applicants={[who(0, "Maya Chen", 18200, 480000, 42000), who(1, "Jordan Price", 5300, 9800, 6500), who(2, "Ava Brooks", 260000, 1200000, 310000)]}
      />
    </ManagerShell>
  );
}
