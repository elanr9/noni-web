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
    followers,
    total_views: views,
    total_earned_cents: earned,
    niches: [["fitness", "lifestyle"], ["tech", "education", "gaming"], ["beauty", "fashion"]][i % 3],
    portfolio: [{ url: "https://www.tiktok.com/@noni/video/1" }, { url: "https://www.tiktok.com/@noni/video/2" }],
    languages: ["english", "spanish"].slice(0, 1 + (i % 2)),
    tiktok: name.split(" ")[0].toLowerCase(),
    instagram: name.split(" ")[0].toLowerCase(),
    experience: ["pro", "some", "new"][i % 3],
    best_campaign: i === 0 ? "40 videos for a study app, 2.1M views in a month" : null,
    application_note: ["I post study and soccer content every day and my audience is mostly high school athletes.", "Happy to start this week.", null][i % 3],
    applied_at: "2026-11-24T15:00:00Z",
    match_score: 92 - i * 7,
    application_id: `a${i}`,
    application_status: "applied",
  }) as unknown as MarketCreator;

const THREAD = [
  { id: "m1", from_company: true, mine: true, body: "Loved your soccer edits. Can you start Monday?", created_at: "2026-11-25T16:02:00Z", read_at: "2026-11-25T16:05:00Z" },
  { id: "m2", from_company: false, mine: false, body: "Yes. I can do 3 a day.", created_at: "2026-11-25T16:06:00Z", read_at: "2026-11-25T16:07:00Z" },
  { id: "m3", from_company: false, mine: false, body: "Do you want them on my main or a new account?", created_at: "2026-11-25T16:06:30Z", read_at: null },
];

export default async function ReviewPreview({ searchParams }: { searchParams: Promise<{ empty?: string; many?: string; talk?: string }> }) {
  const sp = await searchParams;
  const people = [who(0, "Maya Chen", 18200, 480000, 42000), who(1, "Jordan Price", 5300, 9800, 6500), who(2, "Ava Brooks", 260000, 1200000, 310000)];
  const more = sp.many ? ["Leo Park", "Nina Alvarez", "Sam Okafor", "Ivy Tran", "Cole Reyes"].map((n, i) => who(i + 3, n, 4000 * (i + 1), 30000 * (i + 1), 2000 * i)) : [];
  return (
    <ManagerShell companyName="Inkbound AI" name="Preview" people={[]} reviewCount={sp.empty ? 0 : 3}>
      <ReviewHome
        posts={[]}
        music={[]}
        accounts={[]}
        applicants={sp.empty ? [] : [...people, ...more]}
        wanted={["fitness", "education"]}
        sampleThread={THREAD}
        startTalking={!!sp.talk}
      />
    </ManagerShell>
  );
}
