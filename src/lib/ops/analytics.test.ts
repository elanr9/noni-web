import { describe, expect, it } from "vitest";

import {
  ALL_CREATORS,
  ALL_FORMATS,
  barMax,
  creatorShare,
  creatorsInScope,
  filterPosts,
  formatBreakdown,
  formatShare,
  formatsInScope,
  overviewStats,
  postsOnDay,
  RANGES,
  rangeData,
  rangeLabel,
  scaleSeries,
  seriesInScope,
  topCreators,
} from "./analytics";
import { SEED_COMPANIES, SEED_PEOPLE, SEED_POSTS } from "./mock-data";

const C1_SERIES = [60, 72, 85, 80, 95, 110, 124, 118, 140, 156, 170, 188];

describe("rangeLabel", () => {
  it("titles every range", () => {
    expect(rangeLabel("Last 24 hours")).toBe("Today on Noni");
    expect(rangeLabel("Last 7 days")).toBe("This Week on Noni");
    expect(rangeLabel("Last 2 weeks")).toBe("Last 2 Weeks on Noni");
    expect(rangeLabel("Last month")).toBe("This Month on Noni");
    expect(rangeLabel("Last 12 weeks")).toBe("Last 12 Weeks on Noni");
  });
});

describe("rangeData", () => {
  it("buckets every range to the prototype's point counts and labels", () => {
    const expected: Record<(typeof RANGES)[number], { points: number; labels: number }> = {
      "Last 24 hours": { points: 12, labels: 6 },
      "Last 7 days": { points: 7, labels: 7 },
      "Last 2 weeks": { points: 14, labels: 4 },
      "Last month": { points: 5, labels: 5 },
      "Last 12 weeks": { points: 12, labels: 6 },
    };
    for (const range of RANGES) {
      const { data, labels } = rangeData(range, C1_SERIES);
      expect(data).toHaveLength(expected[range].points);
      expect(labels).toHaveLength(expected[range].labels);
    }
  });

  it("passes the raw weekly tail through for month and 12-week ranges", () => {
    expect(rangeData("Last 12 weeks", C1_SERIES).data).toEqual(C1_SERIES);
    expect(rangeData("Last month", C1_SERIES).data).toEqual([118, 140, 156, 170, 188]);
  });

  it("floors synthetic buckets at 0.1 for an empty weekly series", () => {
    expect(rangeData("Last 7 days", []).data).toEqual([0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1]);
  });
});

describe("filterPosts", () => {
  it("returns everything sorted by views descending when unfiltered", () => {
    const all = filterPosts(SEED_POSTS);
    expect(all).toHaveLength(SEED_POSTS.length);
    expect(all[0].id).toBe("q5");
    expect(all.every((q, i) => i === 0 || all[i - 1].viewsN >= q.viewsN)).toBe(true);
  });

  it("composes scope, format and creator filters", () => {
    const filtered = filterPosts(SEED_POSTS, {
      scope: "c1",
      format: "Video",
      creator: "Maya Reyes",
    });
    expect(filtered.map((q) => q.id)).toEqual(["q1", "q3"]);
  });

  it("filters by an inclusive day range down to a single day", () => {
    const day9 = filterPosts(SEED_POSTS, { scope: "c1", dayRange: { from: 9, to: 9 } });
    expect(day9.map((q) => q.id)).toEqual(["q1"]);
  });

  it("returns an empty list when no post matches", () => {
    expect(
      filterPosts(SEED_POSTS, { scope: "c1", format: "Carousel", creator: "Maya Reyes" }),
    ).toEqual([]);
  });
});

describe("postsOnDay", () => {
  it("returns a company's posts for the day", () => {
    expect(postsOnDay(SEED_POSTS, "c1", 9).map((q) => q.id)).toEqual(["q1"]);
  });

  it("returns an empty list for a quiet day", () => {
    expect(postsOnDay(SEED_POSTS, "c1", 5)).toEqual([]);
  });
});

describe("creatorsInScope", () => {
  it("keeps only creators with views, sorted descending", () => {
    const all = creatorsInScope(SEED_PEOPLE, null);
    expect(all.map((p) => p.id)).toEqual(["p3", "p4", "p10", "p5", "p11", "p12"]);
  });

  it("scopes to one company", () => {
    expect(creatorsInScope(SEED_PEOPLE, "c1").map((p) => p.name)).toEqual([
      "Maya Reyes",
      "Jordan Tate",
      "Devon Kim",
    ]);
  });
});

describe("formatsInScope / seriesInScope", () => {
  it("aggregates active companies platform-wide", () => {
    expect(formatsInScope(SEED_COMPANIES, null)).toEqual({ Video: 200, Carousel: 138 });
    const summed = seriesInScope(SEED_COMPANIES, null);
    expect(summed).toHaveLength(12);
    expect(summed[0]).toBe(98);
    expect(summed[11]).toBe(292);
  });

  it("returns the scoped company's own data", () => {
    expect(formatsInScope(SEED_COMPANIES, "c1")).toEqual({ Video: 82, Carousel: 46 });
    expect(seriesInScope(SEED_COMPANIES, "c1")).toEqual(C1_SERIES);
  });

  it("returns an empty series for an invite-pending company", () => {
    expect(seriesInScope(SEED_COMPANIES, "c3")).toEqual([]);
  });
});

describe("formatShare / creatorShare / scaleSeries", () => {
  it("keeps everything when unfiltered or when there are no posts", () => {
    expect(formatShare({ Video: 82, Carousel: 46 }, ALL_FORMATS)).toBe(1);
    expect(formatShare({}, "Video")).toBe(1);
    expect(creatorShare(creatorsInScope(SEED_PEOPLE, "c1"), ALL_CREATORS).share).toBe(1);
  });

  it("computes the filtered share", () => {
    expect(formatShare({ Video: 82, Carousel: 46 }, "Video")).toBeCloseTo(82 / 128);
    const { share, selected } = creatorShare(creatorsInScope(SEED_PEOPLE, "c1"), "Maya Reyes");
    expect(selected?.id).toBe("p3");
    expect(share).toBeCloseTo(389000 / 934000);
  });

  it("scales a series with 1-decimal rounding", () => {
    expect(scaleSeries([100, 33.4], 0.5)).toEqual([50, 16.7]);
  });
});

describe("topCreators / formatBreakdown / barMax", () => {
  const c1Creators = creatorsInScope(SEED_PEOPLE, "c1");

  it("lists every scoped creator in thousands when unfiltered", () => {
    expect(topCreators(c1Creators, ALL_CREATORS, 1).map((b) => b.value)).toEqual([
      389, 341, 204,
    ]);
  });

  it("narrows to the filtered creator and scales by the format share", () => {
    const bars = topCreators(c1Creators, "Maya Reyes", 82 / 128);
    expect(bars).toHaveLength(1);
    expect(bars[0].value).toBe(249);
  });

  it("breaks formats down and scales by the creator share", () => {
    expect(formatBreakdown({ Video: 82, Carousel: 46 }, ALL_FORMATS, 1)).toEqual([
      { format: "Video", value: 82 },
      { format: "Carousel", value: 46 },
    ]);
    expect(formatBreakdown({ Video: 82, Carousel: 46 }, "Video", 0.5)).toEqual([
      { format: "Video", value: 41 },
    ]);
  });

  it("floors the bar max at 1 for empty datasets", () => {
    expect(barMax([])).toBe(1);
  });
});

describe("overviewStats", () => {
  it("aggregates the platform when unscoped", () => {
    expect(overviewStats(SEED_COMPANIES, SEED_PEOPLE, null)).toEqual({
      views: "2.0M",
      posts: 338,
      campaigns: 7,
      creators: 8,
      dViews: "+15% vs July",
      dPosts: "+14% vs July",
      dCamp: "2 companies",
    });
  });

  it("returns the scoped company's stats and deltas", () => {
    expect(overviewStats(SEED_COMPANIES, SEED_PEOPLE, "c1")).toEqual({
      views: "1.2M",
      posts: 128,
      campaigns: 3,
      creators: 4,
      dViews: "+18% vs July",
      dPosts: "+9% vs July",
      dCamp: "1 ended Aug 3",
    });
  });

  it("omits deltas for a company that has none", () => {
    const stats = overviewStats(SEED_COMPANIES, SEED_PEOPLE, "c3");
    expect(stats.views).toBe("—");
    expect(stats.dViews).toBeUndefined();
  });
});
