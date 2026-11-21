import { describe, expect, it } from "vitest";

import {
  addDays,
  bucketize,
  daysBetween,
  fmtCount,
  fmtMoney,
  fmtRate,
  groupRows,
  highlights,
  median,
  pctChange,
  per1k,
  rankPosts,
  totalsOf,
  windowFor,
  type InsightDay,
  type InsightPost,
} from "./insights";
import { buildInsights, type RawPost } from "./insights-data";
import { mockInsights } from "./insights-mock";

function day(d: string, over: Partial<InsightDay> = {}): InsightDay {
  return {
    day: d,
    views: 0,
    signups: 0,
    trials: 0,
    sales: 0,
    salesCents: 0,
    codedSignups: 0,
    spendCents: 0,
    posts: 0,
    ...over,
  };
}

function feed(end: string, n: number, views = 100, signups = 1): InsightDay[] {
  return Array.from({ length: n }, (_, i) => day(addDays(end, -(n - 1 - i)), { views, signups }));
}

function post(id: string, posted: string, daily: InsightPost["daily"], over: Partial<InsightPost> = {}): InsightPost {
  return {
    id,
    title: id,
    creatorId: "c1",
    creator: "Maya Torres",
    format: "Video",
    day: posted,
    link: "",
    likes: 0,
    comments: 0,
    shares: 0,
    saves: 0,
    daily,
    ...over,
  };
}

describe("day arithmetic", () => {
  it("crosses month and year ends in UTC", () => {
    expect(addDays("2026-12-31", 1)).toBe("2027-01-01");
    expect(addDays("2026-03-01", -1)).toBe("2026-02-28");
    expect(daysBetween("2026-11-01", "2026-11-21")).toBe(20);
  });
});

describe("windowFor", () => {
  it("takes the last N days and the N before them", () => {
    const w = windowFor(feed("2026-11-21", 90), "Last 30 days");
    expect(w.current).toHaveLength(30);
    expect(w.current[29].day).toBe("2026-11-21");
    expect(w.previous).toHaveLength(30);
    expect(w.previous[29].day).toBe("2026-10-22");
  });

  it("has no comparison when the history is too short or the range is all time", () => {
    expect(windowFor(feed("2026-11-21", 40), "Last 30 days").previous).toHaveLength(0);
    expect(windowFor(feed("2026-11-21", 90), "All time").previous).toHaveLength(0);
    expect(windowFor(feed("2026-11-21", 90), "All time").current).toHaveLength(90);
    const quiet = [...feed("2026-11-01", 10, 0, 0), ...feed("2026-11-21", 20)];
    expect(windowFor(quiet, "All time").current).toHaveLength(20);
  });
});

describe("ratios", () => {
  it("is null rather than zero or infinite with nothing to divide by", () => {
    expect(per1k(5, 0)).toBeNull();
    expect(per1k(5, 2000)).toBe(2.5);
    expect(pctChange(120, 100)).toBe(20);
    expect(pctChange(50, 0)).toBeNull();
    expect(pctChange(null, 100)).toBeNull();
  });
});

describe("bucketize", () => {
  const days = feed("2026-11-21", 30);

  it("keeps a day per bucket at day grain", () => {
    const b = bucketize(days, "Day");
    expect(b).toHaveLength(30);
    expect(b[29].title).toBe("Sat, Nov 21");
  });

  it("starts weeks on Monday and loses nothing", () => {
    const b = bucketize(days, "Week");
    expect(b[b.length - 1].key).toBe("2026-11-16");
    expect(b[b.length - 1].views).toBe(600);
    expect(b.reduce((n, x) => n + x.views, 0)).toBe(totalsOf(days).views);
  });

  it("groups by calendar month", () => {
    const b = bucketize(days, "Month");
    expect(b.map((x) => x.label)).toEqual(["Oct", "Nov"]);
    expect(b[1].views).toBe(2100);
    expect(b[1].title).toBe("November 2026");
  });
});

describe("rankPosts", () => {
  const to = "2026-11-21";
  const posts = [
    post("hit", "2026-11-01", [["2026-11-02", 10000, 12, 5800, 2000]]),
    post("ok-a", "2026-11-03", [["2026-11-04", 1200, 1, 0, 1000]]),
    post("ok-b", "2026-11-05", [["2026-11-06", 1000, 0, 0, 1000]]),
    post("ok-c", "2026-11-07", [["2026-11-08", 900, 0, 0, 1000]]),
    post("flop", "2026-11-09", [["2026-11-10", 200, 0, 0, 1000]], { format: "Carousel" }),
    post("fresh", "2026-11-20", [["2026-11-20", 150, 0, 0, 0]]),
    post("old", "2026-09-01", [["2026-09-02", 5000, 0, 0, 0]]),
  ];

  it("ranks by views inside the window and drops posts with nothing in it", () => {
    const rows = rankPosts(posts, "2026-10-23", to);
    expect(rows.map((r) => r.post.id)).toEqual(["hit", "ok-a", "ok-b", "ok-c", "flop", "fresh"]);
  });

  it("judges each post against the usual settled post", () => {
    const rows = rankPosts(posts, "2026-10-23", to);
    const verdict = Object.fromEntries(rows.map((r) => [r.post.id, r.verdict]));
    /* Settled lifetime views, the old post included: 10000, 5000, 1200,
       1000, 900, 200 → usual is 1100. */
    expect(verdict).toEqual({
      hit: "Winner",
      "ok-a": "Average",
      "ok-b": "Average",
      "ok-c": "Average",
      flop: "Not working",
      fresh: "New",
    });
    expect(rows[0].multiple).toBeCloseTo(10000 / 1100);
    expect(rows[0].signupsPer1k).toBeCloseTo(1.2);
  });

  it("gives no verdict without enough posts to know what usual is", () => {
    const rows = rankPosts(posts.slice(0, 2), "2026-10-23", to);
    expect(rows.every((r) => r.verdict === null)).toBe(true);
  });

  it("judges an old post on its lifetime, not a quiet window", () => {
    const rows = rankPosts(
      [...posts, post("evergreen", "2026-08-01", [["2026-08-02", 40000, 0, 0, 0], ["2026-11-15", 3, 0, 0, 0]])],
      "2026-10-23",
      to,
    );
    const row = rows.find((r) => r.post.id === "evergreen")!;
    expect(row.views).toBe(3);
    expect(row.verdict).toBe("Winner");
  });

  it("filters by format and creator", () => {
    expect(rankPosts(posts, "2026-10-23", to, { format: "Carousel" }).map((r) => r.post.id)).toEqual(["flop"]);
    expect(rankPosts(posts, "2026-10-23", to, { creatorId: "nobody" })).toHaveLength(0);
  });

  it("rolls up by format and calls out what stands out", () => {
    const rows = rankPosts(posts, "2026-10-23", to);
    const formats = groupRows(rows, "format");
    expect(formats[0]).toMatchObject({ label: "Video", posts: 5, views: 13250, winners: 1 });
    const notes = highlights(rows);
    expect(notes[0].title).toBe("Best post");
    expect(notes[0].body).toContain("9.1x your usual post");
    expect(notes.some((n) => n.title === "1 post is not working")).toBe(true);
  });
});

describe("formatting", () => {
  it("keeps small numbers exact and large ones short", () => {
    expect(fmtCount(640)).toBe("640");
    expect(fmtCount(5400)).toBe("5.4k");
    expect(fmtCount(53600)).toBe("54k");
    expect(fmtCount(1200000)).toBe("1.2M");
    expect(fmtRate(null)).toBe("–");
    expect(fmtRate(0.42)).toBe("0.42");
    expect(fmtRate(4.26)).toBe("4.3");
    expect(fmtMoney(420)).toBe("$4.20");
    expect(fmtMoney(124000)).toBe("$1,240");
    expect(fmtMoney(6100)).toBe("$61");
    expect(fmtMoney(null)).toBe("–");
    expect(median([3, 1, 2])).toBe(2);
  });
});

describe("buildInsights", () => {
  const now = new Date("2026-11-21T12:00:00Z");
  const raw = (id: string, assignment: string, creator: string, posted: string, snaps: Array<[string, number]>): RawPost => ({
    id,
    platform: "tiktok",
    post_url: null,
    posted_at: posted + "T10:00:00Z",
    assignment_id: assignment,
    task_id: null,
    assignments: { company_id: "co", creator_id: creator, briefs: { title: assignment, format: "video" } },
    content_tasks: null,
    post_metrics: snaps.map(([d, views]) => ({
      views,
      likes: 0,
      comments: 0,
      shares: 0,
      saves: 0,
      fetched_at: d + "T20:00:00Z",
    })),
  });

  const data = buildInsights({
    companyId: "co",
    posts: [
      /* Dips on the 12th, recovers on the 13th: 1000 then 500 more. */
      raw("p1", "a1", "maya", "2026-11-10", [["2026-11-11", 1000], ["2026-11-12", 900], ["2026-11-13", 1500]]),
      raw("p1b", "a1", "maya", "2026-11-10", [["2026-11-11", 500]]),
      raw("p2", "a2", "maya", "2026-11-12", [["2026-11-13", 500]]),
      { ...raw("x", "ax", "zed", "2026-11-10", [["2026-11-11", 9999]]), assignments: { company_id: "other", creator_id: "zed", briefs: null } },
    ],
    conversions: [
      { creator_id: null, day: "2026-11-13", new_accounts: 10, free_trials: 2, sales_count: 1, sales_cents: 2900 },
      { creator_id: "maya", day: "2026-11-13", new_accounts: 5, free_trials: 0, sales_count: 1, sales_cents: 2900 },
      /* Before the first post: never counted. */
      { creator_id: null, day: "2026-11-01", new_accounts: 99, free_trials: 0, sales_count: 0, sales_cents: 0 },
    ],
    ledger: [{ post_id: "p1", assignment_id: null, amount_cents: 1000, created_at: "2026-11-11T09:00:00Z" }],
    names: new Map([["maya", "Maya Torres"]]),
    firstCampaignDay: null,
    signupsOn: true,
    salesOn: true,
    now,
  });
  const at = (d: string) => data.days.find((x) => x.day === d)!;

  it("folds platform rows into one post and ignores other companies", () => {
    expect(data.posts.map((p) => p.id).sort()).toEqual(["a1", "a2"]);
    expect(data.posts.find((p) => p.id === "a1")!.creator).toBe("Maya Torres");
  });

  it("counts views gained per day off the running high", () => {
    expect(at("2026-11-11").views).toBe(1500);
    expect(at("2026-11-12").views).toBe(0);
    expect(at("2026-11-13").views).toBe(1000);
    expect(at("2026-11-10").posts).toBe(1);
  });

  it("only counts conversions from the first post on", () => {
    expect(totalsOf(data.days).signups).toBe(10);
    expect(at("2026-11-13").codedSignups).toBe(5);
  });

  it("splits a creator's coded sign-ups across their posts by recent views", () => {
    const rows = rankPosts(data.posts, "2026-11-01", data.today);
    const a1 = rows.find((r) => r.post.id === "a1")!;
    const a2 = rows.find((r) => r.post.id === "a2")!;
    /* a1 gained 2000 that week, a2 500: 4 and 1 of the 5. */
    expect(a1.signups).toBeCloseTo(4);
    expect(a2.signups).toBeCloseTo(1);
    expect(a1.costCents).toBe(1000);
    expect(a1.salesCents + a2.salesCents).toBe(2900);
  });

  it("ends today and reaches back at least 90 days", () => {
    expect(data.days[data.days.length - 1].day).toBe("2026-11-21");
    expect(data.days.length).toBeGreaterThanOrEqual(90);
  });
});

describe("mockInsights", () => {
  it("is stable for a given day and adds up", () => {
    const now = new Date("2026-11-21T12:00:00Z");
    const a = mockInsights(now);
    expect(mockInsights(now)).toEqual(a);
    const postViews = a.posts.reduce((n, p) => n + p.daily.reduce((m, d) => m + d[1], 0), 0);
    expect(totalsOf(a.days).views).toBe(postViews);
  });
});
