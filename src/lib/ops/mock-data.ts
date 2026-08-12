/* Sample dataset for the /ops console, ported verbatim from
   design_handoff_ops_console/OpsApp.jsx. Agent F swaps this for real data. */

import type {
  BrainDoc,
  Brief,
  BriefWeek,
  Company,
  CompanyBilling,
  CompanyDays,
  Invite,
  InspirationAccount,
  Person,
  Post,
  StatusLike,
} from "./types";

export const SEED_COMPANIES: Company[] = [
  {
    id: "c1",
    name: "FieldVision AI",
    website: "fieldvision.ai",
    admin: { name: "Elan Rosen", email: "elan@fieldvision.ai" },
    creators: 4,
    managers: 1,
    campaigns: 3,
    posts: 128,
    views: "1.2M",
    status: "Active",
    joined: "Jun 2, 2026",
    series: [60, 72, 85, 80, 95, 110, 124, 118, 140, 156, 170, 188],
    deltas: {
      views: "+18% vs July",
      posts: "+9% vs July",
      campaigns: "1 ended Aug 3",
      creators: "+1 this month",
    },
    formats: { Video: 82, Carousel: 46 },
  },
  {
    id: "c2",
    name: "Custom Cleats Co",
    website: "customcleats.co",
    admin: { name: "Dana Whitfield", email: "dana@customcleats.co" },
    creators: 4,
    managers: 2,
    campaigns: 4,
    posts: 210,
    views: "840k",
    status: "Active",
    joined: "Jul 14, 2026",
    series: [38, 44, 52, 61, 58, 66, 72, 80, 84, 90, 96, 104],
    deltas: {
      views: "+11% vs July",
      posts: "+24% vs July",
      campaigns: "2 started in Aug",
      creators: "Steady",
    },
    formats: { Video: 118, Carousel: 92 },
  },
  {
    id: "c3",
    name: "Peak Form Labs",
    website: "peakformlabs.com",
    admin: { name: "Marcus Oduya", email: "marcus@peakformlabs.com" },
    creators: 0,
    managers: 0,
    campaigns: 0,
    posts: 0,
    views: "—",
    status: "Invite pending",
    joined: "Aug 9, 2026",
    series: [],
    deltas: {},
    formats: {},
  },
];

export const SEED_PEOPLE: Person[] = [
  { id: "p1", company: "c1", role: "Company admin", name: "Elan Rosen", email: "elan@fieldvision.ai", phone: "+1 (305) 741-2280", status: "Active", joined: "Jun 2, 2026" },
  { id: "p2", company: "c1", role: "Campaign manager", name: "Sofia Marek", email: "sofia@fieldvision.ai", phone: "+1 (786) 220-1148", status: "Active", joined: "Jun 9, 2026" },
  { id: "p3", company: "c1", role: "Creator", name: "Maya Reyes", email: "maya.reyes@gmail.com", phone: "+1 (813) 402-9917", status: "Onboarded", joined: "Jun 12, 2026", posts: 42, viewsN: 389000 },
  { id: "p4", company: "c1", role: "Creator", name: "Jordan Tate", email: "jordantate@gmail.com", phone: "+1 (407) 318-5526", status: "Onboarded", joined: "Jun 15, 2026", posts: 38, viewsN: 341000 },
  { id: "p5", company: "c1", role: "Creator", name: "Devon Kim", email: "devon.kim@gmail.com", phone: "+1 (954) 630-2211", status: "Onboarded", joined: "Jul 2, 2026", posts: 26, viewsN: 204000 },
  { id: "p6", company: "c1", role: "Creator", name: "Aliyah Grant", email: "aliyahgrant@gmail.com", phone: "+1 (321) 884-7703", status: "Pending", joined: "Aug 8, 2026", posts: 0, viewsN: 0 },
  { id: "p7", company: "c2", role: "Company admin", name: "Dana Whitfield", email: "dana@customcleats.co", phone: "+1 (646) 302-8841", status: "Active", joined: "Jul 14, 2026" },
  { id: "p8", company: "c2", role: "Campaign manager", name: "Ray Delgado", email: "ray@customcleats.co", phone: "+1 (917) 556-2384", status: "Active", joined: "Jul 18, 2026" },
  { id: "p9", company: "c2", role: "Campaign manager", name: "Tess Boyd", email: "tess@customcleats.co", phone: "+1 (718) 209-4415", status: "Active", joined: "Jul 21, 2026" },
  { id: "p10", company: "c2", role: "Creator", name: "Lena Ortiz", email: "lenaortiz@gmail.com", phone: "+1 (347) 771-0492", status: "Onboarded", joined: "Jul 20, 2026", posts: 51, viewsN: 312000 },
  { id: "p11", company: "c2", role: "Creator", name: "Sam Whitaker", email: "samwhit@gmail.com", phone: "+1 (929) 415-8830", status: "Onboarded", joined: "Jul 22, 2026", posts: 33, viewsN: 188000 },
  { id: "p12", company: "c2", role: "Creator", name: "Priya Nair", email: "priya.nair@gmail.com", phone: "+1 (201) 668-3172", status: "Onboarded", joined: "Jul 25, 2026", posts: 29, viewsN: 162000 },
  { id: "p13", company: "c2", role: "Creator", name: "Chris Boone", email: "chrisboone@gmail.com", phone: "+1 (551) 380-9906", status: "Pending", joined: "Aug 10, 2026", posts: 0, viewsN: 0 },
  { id: "p14", company: "c3", role: "Company admin", name: "Marcus Oduya", email: "marcus@peakformlabs.com", phone: "—", status: "Invite pending", joined: "Aug 9, 2026" },
];

export const SEED_POSTS: Post[] = [
  { id: "q1", company: "c1", title: "POV: your film session runs itself", creator: "Maya Reyes", format: "Video", viewsN: 122000, earned: 340, date: "Aug 9", day: 9, link: "https://tiktok.com", tt: { views: 84000, saves: 3100, likes: 9200 }, ig: { views: 38000, saves: 1400, likes: 4100 }, sales: 1240, signups: 46 },
  { id: "q2", company: "c1", title: "3 drills college scouts actually watch", creator: "Jordan Tate", format: "Carousel", viewsN: 98000, earned: 275, date: "Aug 10", day: 10, link: "https://instagram.com", tt: { views: 61000, saves: 2400, likes: 6800 }, ig: { views: 37000, saves: 1900, likes: 3900 }, sales: 980, signups: 31 },
  { id: "q3", company: "c1", title: "How we cut film review to 10 minutes", creator: "Maya Reyes", format: "Video", viewsN: 87000, earned: 240, date: "Aug 6", day: 6, link: "https://tiktok.com", tt: { views: 52000, saves: 1800, likes: 5100 }, ig: { views: 35000, saves: 1200, likes: 3300 }, sales: 760, signups: 24 },
  { id: "q4", company: "c1", title: "Sideline setup in 60 seconds", creator: "Devon Kim", format: "Video", viewsN: 64000, earned: 180, date: "Aug 2", day: 2, link: "https://tiktok.com", tt: { views: 41000, saves: 1300, likes: 3600 }, ig: { views: 23000, saves: 800, likes: 2100 }, sales: 510, signups: 15 },
  { id: "q5", company: "c2", title: "Rating my teammates' custom cleats", creator: "Lena Ortiz", format: "Video", viewsN: 141000, earned: 395, date: "Aug 9", day: 9, link: "https://tiktok.com", tt: { views: 96000, saves: 3800, likes: 11400 }, ig: { views: 45000, saves: 1700, likes: 5200 }, sales: 1080, signups: 38 },
  { id: "q6", company: "c2", title: "Design your dream cleat in 3 taps", creator: "Sam Whitaker", format: "Carousel", viewsN: 89000, earned: 250, date: "Aug 11", day: 11, link: "https://instagram.com", tt: { views: 51000, saves: 2100, likes: 5900 }, ig: { views: 38000, saves: 2300, likes: 4400 }, sales: 640, signups: 22 },
  { id: "q7", company: "c2", title: "Unboxing the new colorway", creator: "Priya Nair", format: "Video", viewsN: 76000, earned: 215, date: "Aug 3", day: 3, link: "https://tiktok.com", tt: { views: 49000, saves: 1500, likes: 4300 }, ig: { views: 27000, saves: 900, likes: 2500 }, sales: 540, signups: 18 },
  { id: "q8", company: "c2", title: "From sketch to cleat in 6 days", creator: "Lena Ortiz", format: "Carousel", viewsN: 58000, earned: 160, date: "Aug 1", day: 1, link: "https://instagram.com", tt: { views: 33000, saves: 1100, likes: 2900 }, ig: { views: 25000, saves: 1300, likes: 2400 }, sales: 280, signups: 9 },
];

export const COMPANY_DAYS: CompanyDays = {
  c1: {
    2: { signups: 15, sales: 510, downloads: 88, views: 64000 },
    6: { signups: 24, sales: 760, downloads: 132, views: 87000 },
    9: { signups: 46, sales: 1240, downloads: 210, views: 122000 },
    10: { signups: 31, sales: 980, downloads: 164, views: 98000 },
    11: { signups: 12, sales: 310, downloads: 70, views: 31000 },
  },
  c2: {
    1: { signups: 9, sales: 280, downloads: 54, views: 58000 },
    3: { signups: 18, sales: 540, downloads: 96, views: 76000 },
    9: { signups: 38, sales: 1080, downloads: 190, views: 141000 },
    11: { signups: 22, sales: 640, downloads: 120, views: 89000 },
  },
};

export const COMPANY_BILLING: Record<string, CompanyBilling> = {
  c1: {
    monthly: 2500,
    spent: 2140,
    topups: [
      { amt: 1000, date: "Aug 1" },
      { amt: 500, date: "Jul 18" },
      { amt: 1000, date: "Jul 2" },
    ],
    pingTo: "Elan",
  },
  c2: {
    monthly: 3000,
    spent: 1210,
    topups: [
      { amt: 1000, date: "Aug 4" },
      { amt: 2000, date: "Jul 14" },
    ],
    pingTo: "Dana",
  },
};

export const SEED_BRIEFS: Brief[] = [
  { id: "b1", company: "c1", title: "Film session runs itself", format: "Video", status: "Active", day: 9, hook: "Your film crew quit? Good.", script: "Open on an empty sideline. Mount the phone. Auto-tracking follows the play; clips land in the app before the huddle breaks.", caption: "One phone. Full film crew. #fieldvision" },
  { id: "b2", company: "c1", title: "Drills scouts watch", format: "Carousel", status: "Active", day: 10, hook: "3 drills college scouts actually pause on", script: "One slide per drill: name it, show the rep, name the metric scouts read off it.", caption: "Save this for fall camp." },
  { id: "b3", company: "c1", title: "10-minute film review", format: "Video", status: "Archived", day: 6, hook: "We cut film night to 10 minutes", script: "Before/after split: three-hour film night vs auto-clipped highlight review on the bus home.", caption: "Coaches, reclaim your Sunday." },
  { id: "b4", company: "c2", title: "Teammate cleat ratings", format: "Video", status: "Active", day: 9, hook: "Rating my teammates' custom cleats", script: "Walk the locker room, one honest rating per pair, end on your own design.", caption: "Drop your rating below." },
  { id: "b5", company: "c2", title: "Dream cleat configurator", format: "Carousel", status: "Active", day: 11, hook: "Design your dream cleat in 3 taps", script: "Slide per step: base, colorway, stitch detail. Last slide is the checkout screen.", caption: "Link in bio to build yours." },
];

export const SEED_INVITES: Invite[] = [
  { id: "i1", name: "Marcus Oduya", email: "marcus@peakformlabs.com", company: "Peak Form Labs", sent: "2 days ago", status: "Pending" },
  { id: "i2", name: "Dana Whitfield", email: "dana@customcleats.co", company: "Custom Cleats Co", sent: "Jul 14", status: "Accepted" },
  { id: "i3", name: "Elan Rosen", email: "elan@fieldvision.ai", company: "FieldVision AI", sent: "Jun 2", status: "Accepted" },
];

export const BRIEF_WEEKS: BriefWeek[] = [
  { label: "Aug 2 · 8", days: [2, 3, 4, 5, 6, 7, 8] },
  { label: "Aug 9 · 15", days: [9, 10, 11, 12, 13, 14, 15] },
  { label: "Aug 16 · 22", days: [16, 17, 18, 19, 20, 21, 22] },
];

export const BRAIN_DOCS: BrainDoc[] = [
  { name: "Product", sub: "product_truth", words: 640, updated: "Aug 4", owner: "human", preview: "FieldVision turns one sideline phone into a full film crew: auto-tracked footage, instant clips, and shareable highlights minutes after the whistle." },
  { name: "Audience", sub: "audience_niche", words: 480, updated: "Aug 6", owner: "human", preview: "High-school and small-college football programs. Coaches short on staff, players who want their own highlight reels, parents filming from the stands." },
];

export const BRAIN_ACCOUNTS: InspirationAccount[] = [
  { handle: "@fieldvision.ai", platform: "tiktok", kind: "Reference" },
  { handle: "@fieldvision.ai", platform: "instagram", kind: "Reference" },
  { handle: "@coachtape.daily", platform: "tiktok", kind: "Discovered" },
  { handle: "@fridaynightfilm", platform: "tiktok", kind: "Discovered" },
];

/* ── Shared formatters and lookups (from OpsApp.jsx) ── */

export const money = (n: number): string => "$" + n.toLocaleString();

export const moneyK = (n: number): string =>
  n >= 1000 ? "$" + (n / 1000).toFixed(1) + "k" : "$" + n;

export const fmtK = (n: number): string =>
  n >= 1e6
    ? (n / 1e6).toFixed(1) + "M"
    : n >= 1e3
      ? Math.round(n / 1e3) + "k"
      : "" + Math.round(n);

export const statusTone = (
  s: StatusLike,
): "green" | "amber" | "slate" =>
  s === "Active" || s === "Accepted" || s === "Onboarded"
    ? "green"
    : s === "Expired"
      ? "slate"
      : "amber";

export const companyName = (id: string): string =>
  SEED_COMPANIES.find((c) => c.id === id)?.name ?? "";
