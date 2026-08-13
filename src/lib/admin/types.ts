/* Data shapes for the /admin company dashboard, extracted from
   design_handoff_admin_app_web (AdminSetupApp.jsx, AdminSetupTabs.jsx,
   AdminAnalytics.jsx). The whole app works off one AdminDataset scoped to
   the signed-in admin's company. Independent of @/lib/ops on purpose. */

export type Platform = "tiktok" | "instagram";
export type PostFormat = "Video" | "Carousel";
export type MemberRole = "Campaign manager" | "Creator";
export type MemberStatus = "Active" | "Invite sent";
export type InviteStatus = "Pending" | "Accepted" | "Expired";
export type SubscriptionPlan = "monthly" | "annual";
export type BriefStatus = "Active" | "Archived";

/* Answers captured by the onboarding question flow (Agent B persists them).
   They drive the setup to-do titles and completion thresholds. */
export interface OnboardingAnswers {
  /** "Founder" | "Marketing" | "Content" | "Growth" | "Operations" | "Something else". */
  adminRole: string;
  doesUgc: boolean;
  creatorCount: number;
  managerCount: number;
  selfIsManager: boolean;
}

export interface AdminCompany {
  id: string;
  name: string;
  website: string;
  onboarding: OnboardingAnswers;
}

export interface Member {
  id: string;
  role: MemberRole;
  name: string;
  email: string;
  status: MemberStatus;
  /** Display date, e.g. "Aug 2, 2026" or "Just now". */
  joined: string;
  /** Creators only. */
  posts?: number;
  /** Creators only, raw view count this month. */
  viewsN?: number;
  /** Creators only, dollars earned this month. */
  earned?: number;
}

export interface AdminInvite {
  id: string;
  name: string;
  email: string;
  role: MemberRole;
  /** Display string, e.g. "2 days ago", "Just now". */
  sent: string;
  status: InviteStatus;
}

export interface PlatformStats {
  views: number;
  likes: number;
  saves: number;
}

export interface AdminPost {
  id: string;
  title: string;
  /** Creator display name, matches Member.name. */
  creator: string;
  format: PostFormat;
  /** Combined TikTok + Instagram views. */
  viewsN: number;
  /** Dollars paid for this post. */
  earned: number;
  /** Display date, e.g. "Aug 11". */
  publishedAt: string;
  /** Day of month in the current month, 0 when published earlier. */
  day: number;
  /** External post URL. */
  link: string;
  /** Thumbnail URL when one exists. */
  thumb: string | null;
  tt: PlatformStats;
  ig: PlatformStats;
}

export interface DayActivity {
  views: number;
  signups: number;
  /** Dollars of sales attributed that day. */
  sales: number;
  /** Posts published that day, ids into AdminDataset.posts. */
  postIds: string[];
}

/** Day of month → that day's activity. Days with no activity are absent. */
export type DayActivityMap = Record<number, DayActivity>;

export type Subscription =
  | { status: "none" }
  | {
      status: "active";
      plan: SubscriptionPlan;
      /** Dollars per month ($200 monthly, $100 annual). */
      price: number;
      /** Display date, e.g. "Sep 12, 2026". */
      renewsAt: string;
      cardBrand: string;
      cardLast4: string;
    };

export interface TopUp {
  amt: number;
  /** Display date, e.g. "Aug 4" or "Just now". */
  date: string;
}

export interface AdminBilling {
  subscription: Subscription;
  /** Dollars, null while the admin has not set one. */
  monthlySpendLimit: number | null;
  spentThisMonth: number;
  creditBalance: number;
  autoTopUp: boolean;
  stripeConnected: boolean;
  /** Masked connected-account fragment shown on the Stripe card, e.g.
      "····1FVA". Null until Connect completes. */
  stripeAccountId: string | null;
  topUpHistory: TopUp[];
}

export interface BrainDoc {
  kind: "product" | "audience";
  title: string;
  body: string;
  /** Display date of the last edit, empty while the doc is empty. */
  updated: string;
}

export interface InspirationPost {
  id: string;
  url: string;
  caption: string;
  thumbnailUrl: string;
  views: number;
  likes: number;
  shares: number;
  hook: string;
  why: string;
}

export interface InspirationAccount {
  platform: Platform;
  handle: string;
  muted: boolean;
  posts: InspirationPost[];
}

export interface ProductFeature {
  id: string;
  name: string;
  sentence: string;
  screenshotUrl: string;
  score: number | null;
  reason: string;
  rank: number | null;
}

export interface BriefTemplate {
  id: string;
  featureId: string;
  title: string;
  format: PostFormat;
  typeLabel: string;
  example: string;
  description: string;
  action: string;
  phrase: string;
}

/* Shown on campaign manager profile pages. */
export interface AdminBrief {
  id: string;
  title: string;
  format: PostFormat;
  status: BriefStatus;
  /** Display date, e.g. "Aug 9". */
  day: string;
  hook: string;
}

export interface Stat {
  label: string;
  value: string;
  delta: string;
}

/* Analytics stat strip: views / posts / sign-ups attributed / paid to
   creators, each with a delta line. */
export interface StatStrip {
  views: Stat;
  posts: Stat;
  signups: Stat;
  paidToCreators: Stat;
}

export interface AdminDataset {
  company: AdminCompany;
  managers: Member[];
  creators: Member[];
  invites: AdminInvite[];
  posts: AdminPost[];
  dayActivity: DayActivityMap;
  billing: AdminBilling;
  brainDocs: BrainDoc[];
  inspirationAccounts: InspirationAccount[];
  features: ProductFeature[];
  briefTemplates: BriefTemplate[];
  briefs: AdminBrief[];
  statStrip: StatStrip;
  /** 12-point weekly views series in thousands, oldest first. Feeds the
      analytics explorer's time ranges. */
  weeklyViews: number[];
}
