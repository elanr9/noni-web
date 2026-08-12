import { describe, expect, it } from "vitest";

import {
  ALL_CREATORS,
  ALL_FORMATS,
  barMax,
  creatorShare,
  creatorsWithViews,
  filterPosts,
  fmtViews,
  formatBreakdown,
  formatCounts,
  formatShare,
  money,
  monthMeta,
  postsOnDay,
  RANGES,
  rangeData,
  scaleSeries,
  topCreators,
} from "./analytics";
import {
  MOCK_CREATORS,
  MOCK_DAY_ACTIVITY,
  MOCK_MANAGERS,
  MOCK_POSTS,
  MOCK_WEEKLY_VIEWS,
} from "./mock-data";

const VIDEO_SHARE = 4 / 6;
const MAYA_SHARE = 91700 / 213800;

describe("fmtViews / money", () => {
  it("formats views like the prototype's aFmtK", () => {
    expect(fmtViews(640)).toBe("640");
    expect(fmtViews(999)).toBe("999");
    expect(fmtViews(53600)).toBe("54k");
    expect(fmtViews(91700)).toBe("92k");
    expect(fmtViews(1200000)).toBe("1.2M");
  });

  it("formats dollars with thousands separators", () => {
    expect(money(2140)).toBe("$2,140");
    expect(money(0)).toBe("$0");
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
      const { data, labels } = rangeData(range, MOCK_WEEKLY_VIEWS);
      expect(data).toHaveLength(expected[range].points);
      expect(labels).toHaveLength(expected[range].labels);
    }
  });

  it("passes the raw weekly tail through for month and 12-week ranges", () => {
    expect(rangeData("Last 12 weeks", MOCK_WEEKLY_VIEWS).data).toEqual(MOCK_WEEKLY_VIEWS);
    expect(rangeData("Last month", MOCK_WEEKLY_VIEWS).data).toEqual([15, 17, 19, 22, 26]);
  });

  it("floors synthetic buckets at 0.1 for an empty weekly series", () => {
    expect(rangeData("Last 7 days", []).data).toEqual([0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1]);
  });
});

describe("creatorsWithViews", () => {
  it("keeps only members with views, sorted descending", () => {
    const ranked = creatorsWithViews([...MOCK_MANAGERS, ...MOCK_CREATORS]);
    expect(ranked.map((p) => p.name)).toEqual(["Maya Reyes", "Devon Kim", "Jordan Tate"]);
  });

  it("returns an empty list when nobody has views", () => {
    expect(creatorsWithViews(MOCK_MANAGERS)).toEqual([]);
  });
});

describe("formatCounts / formatShare", () => {
  it("counts posts per format", () => {
    expect(formatCounts(MOCK_POSTS)).toEqual({ Video: 4, Carousel: 2 });
  });

  it("keeps everything when unfiltered or when there are no posts", () => {
    expect(formatShare(formatCounts(MOCK_POSTS), ALL_FORMATS)).toBe(1);
    expect(formatShare({}, "Video")).toBe(1);
  });

  it("computes the filtered share", () => {
    expect(formatShare(formatCounts(MOCK_POSTS), "Video")).toBeCloseTo(VIDEO_SHARE);
    expect(formatShare(formatCounts(MOCK_POSTS), "Carousel")).toBeCloseTo(2 / 6);
  });
});

describe("creatorShare / scaleSeries", () => {
  const ranked = creatorsWithViews(MOCK_CREATORS);

  it("keeps everything when unfiltered", () => {
    const { share, selected } = creatorShare(ranked, ALL_CREATORS);
    expect(share).toBe(1);
    expect(selected).toBeNull();
  });

  it("computes the selected creator's share of company views", () => {
    const { share, selected } = creatorShare(ranked, "Maya Reyes");
    expect(selected?.id).toBe("a1");
    expect(share).toBeCloseTo(MAYA_SHARE);
  });

  it("scales a series with 1-decimal rounding", () => {
    expect(scaleSeries([100, 33.4], 0.5)).toEqual([50, 16.7]);
    expect(scaleSeries(MOCK_WEEKLY_VIEWS, 1)).toEqual(MOCK_WEEKLY_VIEWS);
  });
});

describe("filterPosts", () => {
  it("returns everything sorted by views descending when unfiltered", () => {
    const all = filterPosts(MOCK_POSTS);
    expect(all.map((q) => q.id)).toEqual(["q4", "q1", "q2", "q3", "q5", "q6"]);
  });

  it("composes format and creator filters", () => {
    const filtered = filterPosts(MOCK_POSTS, { format: "Video", creator: "Maya Reyes" });
    expect(filtered.map((q) => q.id)).toEqual(["q1", "q3"]);
  });

  it("filters by format alone", () => {
    expect(filterPosts(MOCK_POSTS, { format: "Carousel" }).map((q) => q.id)).toEqual([
      "q2",
      "q6",
    ]);
  });

  it("returns an empty list when no post matches", () => {
    expect(filterPosts(MOCK_POSTS, { format: "Carousel", creator: "Devon Kim" })).toEqual([]);
  });
});

describe("postsOnDay", () => {
  it("resolves a day's postIds into posts", () => {
    expect(postsOnDay(MOCK_POSTS, MOCK_DAY_ACTIVITY[11]).map((q) => q.id)).toEqual(["q1"]);
    expect(postsOnDay(MOCK_POSTS, MOCK_DAY_ACTIVITY[8]).map((q) => q.id)).toEqual(["q4"]);
  });

  it("returns an empty list for a quiet day or a missing day", () => {
    expect(postsOnDay(MOCK_POSTS, MOCK_DAY_ACTIVITY[7])).toEqual([]);
    expect(postsOnDay(MOCK_POSTS, undefined)).toEqual([]);
  });

  it("drops ids that match no post", () => {
    const activity = { views: 0, signups: 0, sales: 0, postIds: ["missing", "q2"] };
    expect(postsOnDay(MOCK_POSTS, activity).map((q) => q.id)).toEqual(["q2"]);
  });
});

describe("topCreators / formatBreakdown / barMax", () => {
  const ranked = creatorsWithViews(MOCK_CREATORS);

  it("ranks every creator by raw views when unfiltered", () => {
    const bars = topCreators(ranked, ALL_CREATORS, 1);
    expect(bars.map((b) => b.member.name)).toEqual([
      "Maya Reyes",
      "Devon Kim",
      "Jordan Tate",
    ]);
    expect(bars.map((b) => b.views)).toEqual([91700, 68500, 53600]);
  });

  it("scales the ranking by the format share", () => {
    const bars = topCreators(ranked, ALL_CREATORS, VIDEO_SHARE);
    expect(bars.map((b) => b.views)).toEqual([
      Math.round(91700 * VIDEO_SHARE),
      Math.round(68500 * VIDEO_SHARE),
      Math.round(53600 * VIDEO_SHARE),
    ]);
  });

  it("narrows to the filtered creator", () => {
    const bars = topCreators(ranked, "Devon Kim", 1);
    expect(bars).toHaveLength(1);
    expect(bars[0].member.id).toBe("a2");
    expect(bars[0].views).toBe(68500);
  });

  it("breaks formats down and scales by the creator share", () => {
    expect(formatBreakdown(formatCounts(MOCK_POSTS), ALL_FORMATS, 1)).toEqual([
      { format: "Video", value: 4 },
      { format: "Carousel", value: 2 },
    ]);
    expect(formatBreakdown(formatCounts(MOCK_POSTS), "Video", MAYA_SHARE)).toEqual([
      { format: "Video", value: 1.7 },
    ]);
  });

  it("floors the bar max at 1 for empty datasets", () => {
    expect(barMax([])).toBe(1);
    expect(barMax([91700, 68500])).toBe(91700);
  });
});

describe("monthMeta", () => {
  it("lays out August 2026 like the prototype", () => {
    const meta = monthMeta(new Date(2026, 7, 12));
    expect(meta).toEqual({
      name: "August",
      short: "Aug",
      firstWeekday: 6,
      daysInMonth: 31,
      today: 12,
    });
  });

  it("handles a non-leap February", () => {
    const meta = monthMeta(new Date(2026, 1, 3));
    expect(meta.name).toBe("February");
    expect(meta.firstWeekday).toBe(0);
    expect(meta.daysInMonth).toBe(28);
    expect(meta.today).toBe(3);
  });
});
