/* Data shapes for the /ops console, extracted from
   design_handoff_ops_console/OpsApp.jsx. Every agent builds against these. */

export type CompanyStatus = "Active" | "Invite pending";
export type PersonStatus = "Active" | "Onboarded" | "Pending" | "Invite pending";
export type InviteStatus = "Pending" | "Accepted" | "Expired";
export type StatusLike = CompanyStatus | PersonStatus | InviteStatus;

export type Role = "Company admin" | "Campaign manager" | "Creator";
export type PostFormat = "Video" | "Carousel";
export type BriefStatus = "Active" | "Archived";

export interface CompanyAdmin {
  name: string;
  email: string;
}

export interface CompanyDeltas {
  views?: string;
  posts?: string;
  campaigns?: string;
  creators?: string;
}

export interface Company {
  id: string;
  name: string;
  website: string;
  admin: CompanyAdmin;
  creators: number;
  managers: number;
  campaigns: number;
  posts: number;
  /** Display string, e.g. "1.2M" or "—" while an invite is pending. */
  views: string;
  status: CompanyStatus;
  joined: string;
  /** Weekly views series (thousands), 12 points; empty while invite pending. */
  series: number[];
  deltas: CompanyDeltas;
  formats: Partial<Record<PostFormat, number>>;
}

export interface Person {
  id: string;
  /** Company id, e.g. "c1". */
  company: string;
  role: Role;
  name: string;
  email: string;
  phone: string;
  status: PersonStatus;
  joined: string;
  /** Creators only. */
  posts?: number;
  /** Creators only, raw view count. */
  viewsN?: number;
}

export interface PlatformStats {
  views: number;
  saves: number;
  likes: number;
}

export interface Post {
  id: string;
  /** Company id. */
  company: string;
  title: string;
  /** Creator display name, matches Person.name. */
  creator: string;
  format: PostFormat;
  viewsN: number;
  earned: number;
  /** Display date, e.g. "Aug 9". */
  date: string;
  /** Day of month in August 2026. */
  day: number;
  link: string;
  tt: PlatformStats;
  ig: PlatformStats;
  sales: number;
  signups: number;
}

export interface DayActivity {
  signups: number;
  sales: number;
  downloads: number;
  views: number;
}

/** Company id → day of month → that day's activity. */
export type CompanyDays = Record<string, Record<number, DayActivity>>;

export interface TopUp {
  amt: number;
  date: string;
}

export interface CompanyBilling {
  monthly: number;
  spent: number;
  topups: TopUp[];
  /** First name the "top up" ping goes to, e.g. "Dana". */
  pingTo: string;
}

export interface Brief {
  id: string;
  /** Company id. */
  company: string;
  title: string;
  format: PostFormat;
  status: BriefStatus;
  /** Day of month in August 2026. */
  day: number;
  hook: string;
  script: string;
  caption: string;
}

export interface Invite {
  id: string;
  name: string;
  email: string;
  /** Company display name. */
  company: string;
  /** Display string, e.g. "2 days ago", "Jul 14", "Just now". */
  sent: string;
  status: InviteStatus;
  /** Invited role display label; defaults to "Company admin". */
  role?: string;
}

export interface BrainDoc {
  name: string;
  sub: string;
  words: number;
  updated: string;
  owner: "human" | "ai";
  preview: string;
}

export interface InspirationAccount {
  handle: string;
  platform: "tiktok" | "instagram";
  kind: "Reference" | "Discovered";
}

export interface BriefWeek {
  /** Display label, e.g. "Aug 2 · 8". */
  label: string;
  /** Days of month covered, Sun–Sat. */
  days: number[];
}
