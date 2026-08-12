/* Seed dataset for /admin QA mock mode (ADMIN_QA_MOCK=1), ported verbatim
   from the design_handoff_admin_app_web prototype: ADM_CREATORS, ADM_POSTS,
   ADM_WEEKLY, ADM_DAILY and MGR_BRIEFS in AdminAnalytics.jsx, the seeded
   managers/creators/accounts in AdminSetupApp.jsx, and the stat strip in
   AnalyticsPage. Per-platform splits reproduce the prototype's tik/ig
   figures; likes and saves use its 8.5% and 1.6% of views derivation. */

import type {
  AdminBilling,
  AdminBrief,
  AdminCompany,
  AdminDataset,
  AdminInvite,
  AdminPost,
  BrainDoc,
  DayActivityMap,
  InspirationAccount,
  Member,
  PlatformStats,
  StatStrip,
} from "./types";

export const MOCK_COMPANY: AdminCompany = {
  id: "mock-fieldvision",
  name: "FieldVision AI",
  website: "fieldvision.ai",
  onboarding: {
    adminRole: "Founder",
    doesUgc: true,
    creatorCount: 2,
    managerCount: 1,
    selfIsManager: false,
  },
};

export const MOCK_MANAGERS: Member[] = [
  {
    id: "m1",
    role: "Campaign manager",
    name: "Riley Chen",
    email: "riley@fieldvision.ai",
    status: "Active",
    joined: "Aug 3, 2026",
  },
];

export const MOCK_CREATORS: Member[] = [
  {
    id: "a1",
    role: "Creator",
    name: "Maya Reyes",
    email: "maya.reyes@gmail.com",
    status: "Active",
    viewsN: 91700,
    posts: 3,
    earned: 208,
    joined: "Aug 2, 2026",
  },
  {
    id: "a2",
    role: "Creator",
    name: "Devon Kim",
    email: "devon.kim@gmail.com",
    status: "Active",
    viewsN: 68500,
    posts: 1,
    earned: 150,
    joined: "Aug 4, 2026",
  },
  {
    id: "a3",
    role: "Creator",
    name: "Jordan Tate",
    email: "jordantate@gmail.com",
    status: "Active",
    viewsN: 53600,
    posts: 2,
    earned: 120,
    joined: "Aug 2, 2026",
  },
];

export const MOCK_INVITES: AdminInvite[] = [];

/** Prototype likes/saves derivation: 8.5% and 1.6% of views. */
function stats(views: number): PlatformStats {
  return {
    views,
    likes: Math.round(views * 0.085),
    saves: Math.round(views * 0.016),
  };
}

export const MOCK_POSTS: AdminPost[] = [
  {
    id: "q1",
    title: "POV: your film session runs itself",
    creator: "Maya Reyes",
    format: "Video",
    publishedAt: "Aug 11",
    day: 11,
    viewsN: 53600,
    tt: stats(41200),
    ig: stats(12400),
    earned: 120,
    link: "",
    thumb: null,
  },
  {
    id: "q4",
    title: "Sideline camera setup in 60 seconds",
    creator: "Devon Kim",
    format: "Video",
    publishedAt: "Aug 8",
    day: 8,
    viewsN: 68500,
    tt: stats(52700),
    ig: stats(15800),
    earned: 150,
    link: "",
    thumb: null,
  },
  {
    id: "q2",
    title: "3 drills college scouts actually watch",
    creator: "Jordan Tate",
    format: "Carousel",
    publishedAt: "Aug 10",
    day: 10,
    viewsN: 38000,
    tt: stats(28900),
    ig: stats(9100),
    earned: 85,
    link: "",
    thumb: null,
  },
  {
    id: "q3",
    title: "How we cut game-film review to 10 minutes",
    creator: "Maya Reyes",
    format: "Video",
    publishedAt: "Aug 9",
    day: 9,
    viewsN: 25600,
    tt: stats(19400),
    ig: stats(6200),
    earned: 60,
    link: "",
    thumb: null,
  },
  {
    id: "q5",
    title: "One phone, full film crew",
    creator: "Jordan Tate",
    format: "Video",
    publishedAt: "Aug 6",
    day: 6,
    viewsN: 15600,
    tt: stats(11200),
    ig: stats(4400),
    earned: 35,
    link: "",
    thumb: null,
  },
  {
    id: "q6",
    title: "The drill that fixed our third downs",
    creator: "Maya Reyes",
    format: "Carousel",
    publishedAt: "Aug 5",
    day: 5,
    viewsN: 12500,
    tt: stats(8900),
    ig: stats(3600),
    earned: 28,
    link: "",
    thumb: null,
  },
];

/** Prototype ADM_WEEKLY: 12-point weekly views series in thousands. */
export const MOCK_WEEKLY_VIEWS = [4, 5, 7, 8, 10, 11, 13, 15, 17, 19, 22, 26];

/* Prototype ADM_DAILY: day → [views, signups, sales]; postIds join posts
   published that day (the prototype's dayPosts helper). */
const DAILY: Record<number, [number, number, number]> = {
  1: [9000, 14, 120],
  2: [11200, 18, 150],
  3: [8400, 12, 95],
  4: [13100, 22, 180],
  5: [12500, 19, 160],
  6: [15600, 24, 210],
  7: [10200, 15, 130],
  8: [22400, 31, 260],
  9: [25600, 28, 240],
  10: [19800, 26, 220],
  11: [30400, 38, 320],
  12: [8100, 9, 70],
};

export const MOCK_DAY_ACTIVITY: DayActivityMap = Object.fromEntries(
  Object.entries(DAILY).map(([day, [views, signups, sales]]) => [
    day,
    {
      views,
      signups,
      sales,
      postIds: MOCK_POSTS.filter((p) => p.day === Number(day)).map((p) => p.id),
    },
  ]),
);

/* The prototype opens with billing untouched: no subscription, no limit,
   Stripe not connected. That keeps the billing setup step pending so the
   to-do, badge and achievement flows can all be exercised in mock mode. */
export const MOCK_BILLING: AdminBilling = {
  subscription: { status: "none" },
  monthlySpendLimit: null,
  spentThisMonth: 0,
  creditBalance: 0,
  autoTopUp: false,
  stripeConnected: false,
  stripeAccountId: null,
  topUpHistory: [],
};

/** Fragment the mock Connect flow writes, matching the prototype card. */
export const MOCK_STRIPE_ACCOUNT_ID = "····1FVA";

/* Docs start empty in the prototype so the brain setup step is pending. */
export const MOCK_BRAIN_DOCS: BrainDoc[] = [
  { kind: "product", title: "Product", body: "", updated: "" },
  { kind: "audience", title: "Audience", body: "", updated: "" },
];

/* BRAIN_META draft copy from AdminSetupTabs.jsx, for Agent E's editor. */
export const MOCK_BRAIN_DRAFTS: Record<"product" | "audience", string> = {
  product:
    "FieldVision turns one sideline phone into a full film crew. Put a phone on a tripod, press record, and it auto-tracks the ball, tags every play, and cuts clips coaches can send the squad the same night. Sold as a team subscription at $79/mo. The wedge: fire your film crew, one phone does the whole job. Buyers care most about time saved on film review (hours to minutes) and players getting their own highlight reels without anyone editing.",
  audience:
    "High-school and small-college football programs in the US. Coaches short on staff who still owe the team film by Monday; players who want their own highlight reels for recruiting; parents who film every game from the bleachers anyway. They live on TikTok and Instagram for drills and scheme breakdowns, and they already believe film wins games. They just hate making it.",
};

export const MOCK_INSPIRATION_ACCOUNTS: InspirationAccount[] = [
  { handle: "@fridaynightfilm", platform: "tiktok", muted: false },
  { handle: "@coachreels", platform: "tiktok", muted: false },
  { handle: "@qbschool", platform: "tiktok", muted: false },
  { handle: "@gridironlab", platform: "instagram", muted: false },
  { handle: "@sidelinescout", platform: "instagram", muted: false },
];

export const MOCK_BRIEFS: AdminBrief[] = [
  {
    id: "b1",
    title: "Film day POV",
    day: "Aug 9",
    format: "Video",
    status: "Active",
    hook: "POV: your film session runs itself",
  },
  {
    id: "b2",
    title: "Drills scouts watch",
    day: "Aug 10",
    format: "Carousel",
    status: "Active",
    hook: "3 drills college scouts actually pause on",
  },
  {
    id: "b3",
    title: "10-minute film review",
    day: "Aug 6",
    format: "Video",
    status: "Archived",
    hook: "We cut film night to 10 minutes",
  },
];

export const MOCK_STAT_STRIP: StatStrip = {
  views: { label: "Views this month", value: "214k", delta: "+18% vs July" },
  posts: { label: "Posts", value: "46", delta: "+9 this week" },
  signups: {
    label: "Sign-ups attributed",
    value: "380",
    delta: "+22% vs July",
  },
  paidToCreators: {
    label: "Paid to creators",
    value: "$2,140",
    delta: "August so far",
  },
};

/* Mock-mode mutations write this dataset in place. The dev server can
   instantiate this module once per route bundle, so the object lives on
   globalThis to keep every read and mutation on the same instance. */
const globalMock = globalThis as { __noniAdminMockDataset?: AdminDataset };

export const MOCK_DATASET: AdminDataset = (globalMock.__noniAdminMockDataset ??= {
  company: MOCK_COMPANY,
  managers: MOCK_MANAGERS,
  creators: MOCK_CREATORS,
  invites: MOCK_INVITES,
  posts: MOCK_POSTS,
  dayActivity: MOCK_DAY_ACTIVITY,
  billing: MOCK_BILLING,
  brainDocs: MOCK_BRAIN_DOCS,
  inspirationAccounts: MOCK_INSPIRATION_ACCOUNTS,
  briefs: MOCK_BRIEFS,
  statStrip: MOCK_STAT_STRIP,
  weeklyViews: MOCK_WEEKLY_VIEWS,
});
