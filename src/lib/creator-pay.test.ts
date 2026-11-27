import { describe, expect, it } from "vitest";

import {
  companyCostCents,
  creatorPayForPost,
  estimateCampaignCost,
  viewPayCents,
  weekGuaranteedCost,
} from "./creator-pay";

describe("creatorPayForPost", () => {
  it("pays $10 for a video and $5 for a static with no views", () => {
    expect(creatorPayForPost("video", 0)).toBe(1000);
    expect(creatorPayForPost("photo_carousel", 0)).toBe(500);
  });

  it("pays $1 per FULL 1,000 views", () => {
    expect(creatorPayForPost("video", 999)).toBe(1000);
    expect(creatorPayForPost("video", 1000)).toBe(1100);
    expect(creatorPayForPost("video", 5999)).toBe(1500);
    expect(creatorPayForPost("photo_carousel", 12_345)).toBe(500 + 1200);
  });

  it("caps view pay at $300 a post", () => {
    expect(viewPayCents(500_000)).toBe(30_000);
    expect(viewPayCents(10_000_000)).toBe(30_000);
    expect(creatorPayForPost("video", 10_000_000)).toBe(31_000);
  });

  it("treats negative or bad view counts as zero", () => {
    expect(viewPayCents(-5000)).toBe(0);
    expect(viewPayCents(Number.NaN)).toBe(0);
  });
});

describe("companyCostCents", () => {
  it("charges exactly what the creator earns, with no fee", () => {
    for (const c of [0, 1, 7, 100, 500, 1000, 31_000, 123_400]) {
      expect(companyCostCents(c)).toBe(c);
    }
  });
});

describe("estimateCampaignCost", () => {
  it("prices 10 creators, 3 videos and 2 statics a week, 4 weeks, 5k views", () => {
    const e = estimateCampaignCost({
      creators: 10,
      videosPerCreator: 3,
      staticsPerCreator: 2,
      weeks: 4,
      avgViewsPerPost: 5000,
    });
    expect(e.postsTotal).toBe(200);
    expect(e.baseCreatorCents).toBe(120 * 1000 + 80 * 500);
    expect(e.viewCreatorCents).toBe(200 * 500);
    expect(e.maxViewCreatorCents).toBe(200 * 30_000);
    expect(e.companyMinCents).toBe(companyCostCents(160_000));
    expect(e.companyEstimateCents).toBe(companyCostCents(260_000));
    expect(e.companyMaxCents).toBe(companyCostCents(160_000 + 6_000_000));
  });

  it("caps the per post view estimate", () => {
    const e = estimateCampaignCost({
      creators: 1,
      videosPerCreator: 1,
      staticsPerCreator: 0,
      weeks: 1,
      avgViewsPerPost: 2_000_000,
    });
    expect(e.viewCreatorCents).toBe(30_000);
    expect(e.viewCreatorCents).toBe(e.maxViewCreatorCents);
  });

  it("returns zeros for empty input", () => {
    const e = estimateCampaignCost({
      creators: 0,
      videosPerCreator: 3,
      staticsPerCreator: 2,
      weeks: 4,
      avgViewsPerPost: 5000,
    });
    expect(e.postsTotal).toBe(0);
    expect(e.companyMaxCents).toBe(0);
  });
});

describe("weekGuaranteedCost", () => {
  it("multiplies the week's briefs by the creators who receive them", () => {
    const w = weekGuaranteedCost({ creators: 8, videoPosts: 5, staticPosts: 2 });
    expect(w.postsTotal).toBe(56);
    expect(w.creatorPayCents).toBe(8 * (5 * 1000 + 2 * 500));
    expect(w.companyCents).toBe(w.creatorPayCents);
  });

  it("is zero with no approved creators", () => {
    expect(weekGuaranteedCost({ creators: 0, videoPosts: 5, staticPosts: 2 }).companyCents).toBe(0);
  });
});
