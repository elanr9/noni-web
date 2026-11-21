/* Sample analytics for dev previews only (ADMIN_QA_MOCK=1 and
   /internal/analytics). Built by running made-up raw rows through the real
   buildInsights, so the preview exercises the same maths production does.
   Never served in production. */

import { addDays, dayKey, type InsightsData } from "./insights";
import { buildInsights, type RawConversion, type RawLedger, type RawPost } from "./insights-data";

const COMPANY = "mock-company";

const CREATORS = [
  { id: "c-maya", name: "Maya Torres", pull: 1.6, convert: 1.5 },
  { id: "c-jordan", name: "Jordan Lee", pull: 1.0, convert: 0.8 },
  { id: "c-priya", name: "Priya Shah", pull: 0.7, convert: 2.1 },
  { id: "c-sam", name: "Sam Okafor", pull: 0.45, convert: 0.5 },
];

const TITLES = [
  "I replaced my whole workflow with this",
  "POV: your first week using it",
  "3 things nobody tells you",
  "Watch me set it up in 30 seconds",
  "The feature that saved my launch",
  "Stop doing this by hand",
  "What I wish I knew sooner",
  "Before and after, one tap",
  "My honest review after a month",
  "The trick I use every morning",
];

/* Small deterministic generator so previews never change between loads. */
function rng(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

export function mockInsights(now: Date = new Date()): InsightsData {
  const rand = rng(7);
  const today = dayKey(now);
  const posts: RawPost[] = [];
  const ledger: RawLedger[] = [];
  const coded = new Map<string, RawConversion>();
  const totals = new Map<string, RawConversion>();
  const row = (map: Map<string, RawConversion>, key: string, creator: string | null, day: string) => {
    let r = map.get(key);
    if (!r) {
      r = { creator_id: creator, day, new_accounts: 0, free_trials: 0, sales_count: 0, sales_cents: 0 };
      map.set(key, r);
    }
    return r;
  };

  let n = 0;
  for (let back = 74; back >= 1; back -= 2 + Math.floor(rand() * 3)) {
    const creator = CREATORS[n % CREATORS.length];
    const video = rand() > 0.35;
    const posted = addDays(today, -back);
    const hit = rand();
    /* Most posts are ordinary, a few take off, a few go nowhere. */
    const ceiling =
      (hit > 0.88 ? 90000 : hit > 0.3 ? 9000 + rand() * 9000 : 900 + rand() * 1500) *
      creator.pull *
      (video ? 1.25 : 0.7);
    const id = `a-${n}`;
    const snapshots = [];
    for (let age = 0; age <= back; age++) {
      const grown = ceiling * (1 - Math.exp(-(age + 0.4) / 2.2));
      const views = Math.round(grown);
      snapshots.push({
        views,
        likes: Math.round(views * 0.07),
        comments: Math.round(views * 0.004),
        shares: Math.round(views * 0.006),
        saves: Math.round(views * 0.012),
        fetched_at: addDays(posted, age) + "T18:00:00Z",
      });
      const gained = age === 0 ? views : views - Math.round(ceiling * (1 - Math.exp(-(age - 0.6) / 2.2)));
      const day = addDays(posted, age);
      const signups = Math.floor((gained / 1000) * 3.2 * creator.convert * (0.6 + rand() * 0.8));
      if (signups > 0) {
        const c = row(coded, creator.id + day, creator.id, day);
        c.new_accounts += signups;
        const sales = Math.floor(signups * (0.12 + rand() * 0.1));
        c.sales_count += sales;
        c.sales_cents += sales * 2900;
        const t = row(totals, day, null, day);
        t.new_accounts += signups;
        t.free_trials += Math.round(signups * 0.4);
        t.sales_count += sales;
        t.sales_cents += sales * 2900;
      }
    }
    posts.push({
      id: `p-${n}`,
      platform: "tiktok",
      post_url: "https://www.tiktok.com/",
      posted_at: posted + "T15:00:00Z",
      assignment_id: id,
      task_id: null,
      assignments: {
        company_id: COMPANY,
        creator_id: creator.id,
        briefs: { title: TITLES[n % TITLES.length], format: video ? "video" : "photo_carousel" },
      },
      content_tasks: null,
      post_metrics: snapshots,
    });
    ledger.push({
      post_id: null,
      assignment_id: id,
      amount_cents: (video ? 1000 : 500) + Math.round(ceiling / 1000) * 100,
      created_at: addDays(posted, Math.min(back, 1)) + "T12:00:00Z",
    });
    n += 1;
  }

  /* Sign-ups that used no code: a steady trickle on top. */
  for (let back = 74; back >= 0; back--) {
    const day = addDays(today, -back);
    const t = row(totals, day, null, day);
    const organic = 2 + Math.floor(rand() * 5);
    t.new_accounts += organic;
    t.free_trials += Math.round(organic * 0.4);
    if (rand() > 0.6) {
      t.sales_count += 1;
      t.sales_cents += 2900;
    }
  }

  return buildInsights({
    companyId: COMPANY,
    posts,
    conversions: [...totals.values(), ...coded.values()],
    ledger,
    names: new Map(CREATORS.map((c) => [c.id, c.name])),
    firstCampaignDay: addDays(today, -80),
    signupsOn: true,
    salesOn: true,
    now,
  });
}

/** A company that has posted nothing and connected nothing. */
export function emptyInsights(now: Date = new Date()): InsightsData {
  return buildInsights({
    companyId: COMPANY,
    posts: [],
    conversions: [],
    ledger: [],
    names: new Map(),
    firstCampaignDay: null,
    signupsOn: false,
    salesOn: false,
    now,
  });
}
