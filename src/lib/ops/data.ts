/* Server-side data layer for the /ops console. Fetches the real Supabase
   tables with the service client (the platform-admin gate in the /ops layout
   runs before any of this) and shapes rows into the @/lib/ops/types the UI
   was built against.

   Query patterns mirror the mobile repo's lib/admin-api.ts and
   lib/analytics-api.ts: posts join assignments/content_tasks for company and
   creator, engagement is the latest post_metrics snapshot, conversions come
   from conversion_daily, money from company_credit_ledger and wallet_ledger. */

import { cache } from "react";

import type { OverviewStats } from "@/lib/ops/analytics";
import type {
  BrainDoc,
  Brief,
  BriefWeek,
  Company,
  CompanyBilling,
  CompanyDays,
  DayActivity,
  InspirationAccount,
  Invite,
  Person,
  Post,
  PostFormat,
  Role,
} from "@/lib/ops/types";
import { createServiceClient } from "@/lib/supabase/service";

export interface OpsDataset {
  companies: Company[];
  people: Person[];
  posts: Post[];
  invites: Invite[];
  companyDays: CompanyDays;
  billing: Record<string, CompanyBilling>;
  briefs: Brief[];
  briefWeeks: BriefWeek[];
  /** Company id → Product / Audience docs. */
  brainDocs: Record<string, BrainDoc[]>;
  /** Company id → inspiration accounts. */
  brainAccounts: Record<string, InspirationAccount[]>;
  platformStats: OverviewStats;
}

/* ── Raw row shapes (subset of columns we select) ── */

interface CompanyRow {
  id: string;
  name: string;
  website: string | null;
  created_at: string;
}

interface ProfileRow {
  id: string;
  company_id: string | null;
  role: string | null;
  full_name: string | null;
  phone: string | null;
  onboarded: boolean | null;
  created_at: string;
  expo_push_token: string | null;
}

interface InviteRow {
  id: string;
  company_id: string;
  email: string;
  role: string | null;
  accepted_at: string | null;
  expires_at: string | null;
  created_at: string;
}

interface CampaignRow {
  id: string;
  company_id: string;
  status: string | null;
  ends_on: string | null;
}

interface MetricSnapshot {
  views: number | null;
  likes: number | null;
  saves: number | null;
  fetched_at: string | null;
}

interface PostRow {
  id: string;
  platform: string | null;
  post_url: string | null;
  posted_at: string | null;
  assignment_id: string | null;
  task_id: string | null;
  assignments: {
    company_id: string;
    creator_id: string;
    briefs: { title: string | null; format: string | null } | null;
  } | null;
  content_tasks: {
    company_id: string;
    assigned_to: string | null;
    title: string | null;
    format: string | null;
  } | null;
  post_metrics: MetricSnapshot[];
}

interface LedgerRow {
  company_id: string;
  creator_id: string | null;
  post_id: string | null;
  amount_cents: number;
}

interface CreditLedgerRow {
  company_id: string;
  kind: string;
  amount_cents: number;
  created_at: string;
}

interface ConversionRow {
  company_id: string;
  day: string;
  new_accounts: number;
  free_trials: number;
  sales_cents: number;
}

interface BillingRow {
  company_id: string;
  monthly_budget_cents: number;
}

interface BrandDocRow {
  company_id: string;
  kind: string;
  content: string | null;
  human_edited: boolean | null;
  updated_at: string | null;
}

interface SourceAccountRow {
  company_id: string;
  platform: string | null;
  handle: string;
  kind: string | null;
}

interface BriefRow {
  id: string;
  company_id: string;
  format: string | null;
  title: string | null;
  hook: string | null;
  script: string | null;
  caption: string | null;
  archived_at: string | null;
  created_at: string;
}

interface RevenueRow {
  amount_cents: number | null;
  attribution_links: { assignment_id: string | null; task_id: string | null } | null;
}

/* ── Formatting helpers ── */

const MONTH_SHORT = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

function fmtLongDate(iso: string): string {
  const d = new Date(iso);
  return `${MONTH_SHORT[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

function fmtShortDate(iso: string): string {
  const d = new Date(iso);
  return `${MONTH_SHORT[d.getMonth()]} ${d.getDate()}`;
}

function fmtRelative(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(ms / 60000);
  if (minutes < 2) return "Just now";
  if (minutes < 60) return `${minutes} minutes ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return hours === 1 ? "1 hour ago" : `${hours} hours ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return days === 1 ? "1 day ago" : `${days} days ago`;
  return fmtShortDate(iso);
}

function fmtViews(n: number): string {
  if (n >= 1e6) return (n / 1e6).toFixed(1) + "M";
  if (n >= 1e3) return Math.round(n / 1e3) + "k";
  return String(Math.round(n));
}

/** "elan.romo09@x.com" → "Elan Romo". Invites store no display name. */
function nameFromEmail(email: string): string {
  const words = (email.split("@")[0] ?? email)
    .split(/[._-]+/)
    .map((w) => w.replace(/\d+$/, ""))
    .filter(Boolean);
  if (words.length === 0) return email;
  return words.map((w) => w[0].toUpperCase() + w.slice(1)).join(" ");
}

function toFormat(format: string | null | undefined): PostFormat {
  return format === "photo_carousel" || format === "carousel" ? "Carousel" : "Video";
}

function pctDelta(current: number, previous: number, vs: string): string | undefined {
  if (previous <= 0) return undefined;
  const pct = Math.round(((current - previous) / previous) * 100);
  return `${pct >= 0 ? "+" : ""}${pct}% vs ${vs}`;
}

/** Latest snapshot taken at or before `cutoff`, or null (mobile analytics-api). */
function snapshotAt(rows: MetricSnapshot[], cutoff: number): MetricSnapshot | null {
  let latest: MetricSnapshot | null = null;
  let latestTime = -Infinity;
  for (const row of rows) {
    if (row.fetched_at === null) continue;
    const t = new Date(row.fetched_at).getTime();
    if (t <= cutoff && t > latestTime) {
      latest = row;
      latestTime = t;
    }
  }
  return latest;
}

/* ── Post grouping ──
   DB posts are one row per platform per published assignment/task. The design
   Post is the creator's post with TikTok + Instagram stats side by side, so
   rows group by assignment (or legacy task). */

interface PostGroup {
  post: Post;
  creatorId: string | null;
  rowIds: string[];
  metricRows: MetricSnapshot[];
  postedAt: number;
}

function groupPosts(
  rows: PostRow[],
  profileNames: Map<string, string>,
  now: Date,
): PostGroup[] {
  const groups = new Map<string, PostGroup>();
  const monthKey = `${now.getFullYear()}-${now.getMonth()}`;

  for (const row of rows) {
    const owner = row.assignments ?? null;
    const task = row.content_tasks ?? null;
    const companyId = owner?.company_id ?? task?.company_id;
    if (!companyId || !row.posted_at) continue;

    const key = row.assignment_id ?? row.task_id ?? row.id;
    const posted = new Date(row.posted_at);
    const creatorId = owner?.creator_id ?? task?.assigned_to ?? null;
    const inCurrentMonth =
      `${posted.getFullYear()}-${posted.getMonth()}` === monthKey;

    let group = groups.get(key);
    if (!group) {
      group = {
        post: {
          id: key,
          company: companyId,
          title: owner?.briefs?.title ?? task?.title ?? "Post",
          creator:
            (creatorId ? profileNames.get(creatorId) : null) ?? "Creator",
          format: toFormat(owner?.briefs?.format ?? task?.format),
          viewsN: 0,
          earned: 0,
          date: fmtShortDate(row.posted_at),
          day: inCurrentMonth ? posted.getDate() : 0,
          link: row.post_url ?? "",
          tt: { views: 0, saves: 0, likes: 0 },
          ig: { views: 0, saves: 0, likes: 0 },
          sales: 0,
          signups: 0,
        },
        creatorId,
        rowIds: [],
        metricRows: [],
        postedAt: posted.getTime(),
      };
      groups.set(key, group);
    }

    group.rowIds.push(row.id);
    group.metricRows.push(...row.post_metrics);
    if (!group.post.link && row.post_url) group.post.link = row.post_url;
    if (posted.getTime() < group.postedAt) {
      group.postedAt = posted.getTime();
      group.post.date = fmtShortDate(row.posted_at);
      group.post.day = inCurrentMonth ? posted.getDate() : 0;
    }

    const latest = snapshotAt(row.post_metrics, Date.now());
    const stats = {
      views: latest?.views ?? 0,
      saves: latest?.saves ?? 0,
      likes: latest?.likes ?? 0,
    };
    if (row.platform === "instagram") {
      group.post.ig = {
        views: group.post.ig.views + stats.views,
        saves: group.post.ig.saves + stats.saves,
        likes: group.post.ig.likes + stats.likes,
      };
    } else {
      group.post.tt = {
        views: group.post.tt.views + stats.views,
        saves: group.post.tt.saves + stats.saves,
        likes: group.post.tt.likes + stats.likes,
      };
    }
    group.post.viewsN = group.post.tt.views + group.post.ig.views;
  }

  return [...groups.values()];
}

/** View delta a set of metric rows gained inside [from, to). */
function viewDelta(rows: MetricSnapshot[], from: number, to: number): number {
  const end = snapshotAt(rows, to);
  if (!end) return 0;
  const start = snapshotAt(rows, from);
  return Math.max(0, (end.views ?? 0) - (start?.views ?? 0));
}

/* ── Week derivation (Sun–Sat inside the current month) ── */

function deriveBriefWeeks(now: Date): BriefWeek[] {
  const year = now.getFullYear();
  const month = now.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstSunday = ((7 - new Date(year, month, 1).getDay()) % 7) + 1;
  const weeks: BriefWeek[] = [];
  for (let start = firstSunday; start <= daysInMonth; start += 7) {
    const days: number[] = [];
    for (let d = start; d < start + 7 && d <= daysInMonth; d++) days.push(d);
    weeks.push({
      label: `${MONTH_SHORT[month]} ${days[0]} · ${days[days.length - 1]}`,
      days,
    });
  }
  return weeks;
}

/* ── The dataset ── */

async function fetchOpsData(): Promise<OpsDataset> {
  const supabase = createServiceClient();
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const prevMonthName = prevMonthStart.toLocaleString("en-US", { month: "long" });
  const monthStartDay = `${monthStart.getFullYear()}-${String(
    monthStart.getMonth() + 1,
  ).padStart(2, "0")}-01`;

  const [
    companiesRes,
    profilesRes,
    usersRes,
    invitesRes,
    campaignsRes,
    postsRes,
    ledgerRes,
    creditLedgerRes,
    conversionsRes,
    billingRes,
    brandDocsRes,
    sourceAccountsRes,
    briefsRes,
    revenueRes,
  ] = await Promise.all([
    supabase.from("companies").select("id, name, website, created_at"),
    supabase
      .from("profiles")
      .select(
        "id, company_id, role, full_name, phone, onboarded, created_at, expo_push_token",
      ),
    supabase.auth.admin.listUsers({ page: 1, perPage: 1000 }),
    supabase
      .from("company_invites")
      .select("id, company_id, email, role, accepted_at, expires_at, created_at")
      .order("created_at", { ascending: false }),
    supabase.from("campaigns").select("id, company_id, status, ends_on"),
    supabase
      .from("posts")
      .select(
        `id, platform, post_url, posted_at, assignment_id, task_id,
         assignments:assignment_id ( company_id, creator_id, briefs:brief_id ( title, format ) ),
         content_tasks:task_id ( company_id, assigned_to, title, format ),
         post_metrics ( views, likes, saves, fetched_at )`,
      )
      .neq("status", "failed"),
    supabase
      .from("wallet_ledger")
      .select("company_id, creator_id, post_id, amount_cents")
      .gt("amount_cents", 0),
    supabase
      .from("company_credit_ledger")
      .select("company_id, kind, amount_cents, created_at")
      .order("created_at", { ascending: false }),
    supabase
      .from("conversion_daily")
      .select("company_id, day, new_accounts, free_trials, sales_cents")
      .is("creator_id", null)
      .gte("day", monthStartDay),
    supabase.from("company_billing").select("company_id, monthly_budget_cents"),
    supabase
      .from("brand_docs")
      .select("company_id, kind, content, human_edited, updated_at"),
    supabase
      .from("source_accounts")
      .select("company_id, platform, handle, kind")
      .order("kind")
      .order("handle"),
    supabase
      .from("briefs")
      .select(
        "id, company_id, format, title, hook, script, caption, archived_at, created_at",
      )
      .order("created_at", { ascending: false }),
    supabase
      .from("revenue_events")
      .select("amount_cents, attribution_links ( assignment_id, task_id )"),
  ]);

  const companyRows = (companiesRes.data ?? []) as CompanyRow[];
  const profileRows = (profilesRes.data ?? []) as ProfileRow[];
  const inviteRows = (invitesRes.data ?? []) as InviteRow[];
  const campaignRows = (campaignsRes.data ?? []) as CampaignRow[];
  const postRows = (postsRes.data ?? []) as unknown as PostRow[];
  const ledgerRows = (ledgerRes.data ?? []) as LedgerRow[];
  const creditRows = (creditLedgerRes.data ?? []) as CreditLedgerRow[];
  const conversionRows = (conversionsRes.data ?? []) as ConversionRow[];
  const billingRows = (billingRes.data ?? []) as BillingRow[];
  const brandDocRows = (brandDocsRes.data ?? []) as BrandDocRow[];
  const sourceAccountRows = (sourceAccountsRes.data ?? []) as SourceAccountRow[];
  const briefRows = (briefsRes.data ?? []) as BriefRow[];
  const revenueRows = (revenueRes.data ?? []) as unknown as RevenueRow[];

  const emailById = new Map<string, string>();
  for (const user of usersRes.data?.users ?? []) {
    if (user.email) emailById.set(user.id, user.email);
  }

  const profileNames = new Map<string, string>();
  for (const p of profileRows) {
    profileNames.set(p.id, p.full_name?.trim() || nameFromEmail(emailById.get(p.id) ?? "User"));
  }

  /* Posts */
  const groups = groupPosts(postRows, profileNames, now);

  const earnedByPostRow = new Map<string, number>();
  for (const row of ledgerRows) {
    if (row.post_id) {
      earnedByPostRow.set(
        row.post_id,
        (earnedByPostRow.get(row.post_id) ?? 0) + row.amount_cents,
      );
    }
  }
  const revenueByAssignment = new Map<string, number>();
  for (const row of revenueRows) {
    const key = row.attribution_links?.assignment_id ?? row.attribution_links?.task_id;
    if (key) {
      revenueByAssignment.set(
        key,
        (revenueByAssignment.get(key) ?? 0) + (row.amount_cents ?? 0),
      );
    }
  }
  for (const g of groups) {
    const cents = g.rowIds.reduce((n, id) => n + (earnedByPostRow.get(id) ?? 0), 0);
    g.post.earned = Math.round(cents / 100);
    g.post.sales = Math.round((revenueByAssignment.get(g.post.id) ?? 0) / 100);
  }
  const posts = groups
    .map((g) => g.post)
    .sort((a, b) => b.viewsN - a.viewsN);

  /* Companies */
  const profilesByCompany = new Map<string, ProfileRow[]>();
  for (const p of profileRows) {
    if (!p.company_id) continue;
    const list = profilesByCompany.get(p.company_id) ?? [];
    list.push(p);
    profilesByCompany.set(p.company_id, list);
  }

  const groupsByCompany = new Map<string, PostGroup[]>();
  for (const g of groups) {
    const list = groupsByCompany.get(g.post.company) ?? [];
    list.push(g);
    groupsByCompany.set(g.post.company, list);
  }

  const isAdminRole = (role: string | null) =>
    role === "company_admin" || role === "admin";

  const weekMs = 7 * 24 * 60 * 60 * 1000;
  const companies: Company[] = companyRows.map((c) => {
    const members = profilesByCompany.get(c.id) ?? [];
    const companyGroups = groupsByCompany.get(c.id) ?? [];
    const metricRows = companyGroups.flatMap((g) => g.metricRows);
    /* No accepted members yet → the admin invite is still out. */
    const pending = members.length === 0;

    const adminProfile = [...members]
      .filter((p) => isAdminRole(p.role))
      .sort((a, b) => a.created_at.localeCompare(b.created_at))[0];
    const pendingInvite = inviteRows.find(
      (iv) => iv.company_id === c.id && !iv.accepted_at,
    );
    const admin = adminProfile
      ? {
          name: profileNames.get(adminProfile.id) ?? "Admin",
          email: emailById.get(adminProfile.id) ?? "—",
        }
      : pendingInvite
        ? { name: nameFromEmail(pendingInvite.email), email: pendingInvite.email }
        : { name: "—", email: "—" };

    const activeCampaigns = campaignRows.filter(
      (cp) =>
        cp.company_id === c.id &&
        cp.status !== "ended" &&
        cp.status !== "archived" &&
        (!cp.ends_on || new Date(cp.ends_on) >= monthStart),
    ).length;

    const monthGroups = companyGroups.filter(
      (g) => g.postedAt >= monthStart.getTime(),
    );
    const prevMonthGroups = companyGroups.filter(
      (g) =>
        g.postedAt >= prevMonthStart.getTime() &&
        g.postedAt < monthStart.getTime(),
    );
    const monthViews = viewDelta(metricRows, monthStart.getTime(), Date.now());
    const prevMonthViews = viewDelta(
      metricRows,
      prevMonthStart.getTime(),
      monthStart.getTime(),
    );

    /* 12-point weekly views series in thousands, oldest first. */
    const series = pending
      ? []
      : Array.from({ length: 12 }, (_, i) => {
          const end = Date.now() - (11 - i) * weekMs;
          return +(viewDelta(metricRows, end - weekMs, end) / 1000).toFixed(1);
        });

    const formats: Partial<Record<PostFormat, number>> = {};
    for (const g of companyGroups) {
      formats[g.post.format] = (formats[g.post.format] ?? 0) + 1;
    }

    const deltas: Company["deltas"] = {};
    const dViews = pctDelta(monthViews, prevMonthViews, prevMonthName);
    const dPosts = pctDelta(monthGroups.length, prevMonthGroups.length, prevMonthName);
    if (dViews) deltas.views = dViews;
    if (dPosts) deltas.posts = dPosts;

    return {
      id: c.id,
      name: c.name,
      website: c.website ?? "",
      admin,
      creators: members.filter((p) => p.role === "creator").length,
      managers: members.filter((p) => p.role === "campaign_manager").length,
      campaigns: activeCampaigns,
      posts: monthGroups.length,
      views: pending ? "—" : fmtViews(monthViews),
      status: pending ? "Invite pending" : "Active",
      joined: fmtLongDate(c.created_at),
      series,
      deltas,
      formats,
    };
  });

  const companyNameOf = new Map(companies.map((c) => [c.id, c.name]));

  /* People */
  const ROLE_OF: Record<string, Role> = {
    admin: "Company admin",
    company_admin: "Company admin",
    campaign_manager: "Campaign manager",
    creator: "Creator",
  };

  const statsByCreator = new Map<string, { posts: number; views: number }>();
  for (const g of groups) {
    if (!g.creatorId) continue;
    const s = statsByCreator.get(g.creatorId) ?? { posts: 0, views: 0 };
    s.posts += 1;
    s.views += g.post.viewsN;
    statsByCreator.set(g.creatorId, s);
  }

  const people: Person[] = profileRows
    .filter((p) => p.company_id && p.role && ROLE_OF[p.role])
    .map((p) => {
      const role = ROLE_OF[p.role as string];
      const person: Person = {
        id: p.id,
        company: p.company_id as string,
        role,
        name: profileNames.get(p.id) ?? "User",
        email: emailById.get(p.id) ?? "—",
        phone: p.phone ?? "—",
        status:
          role === "Creator" ? (p.onboarded ? "Onboarded" : "Pending") : "Active",
        joined: fmtLongDate(p.created_at),
      };
      if (role === "Creator") {
        const s = statsByCreator.get(p.id);
        person.posts = s?.posts ?? 0;
        person.viewsN = s?.views ?? 0;
      }
      return person;
    });

  /* Pending admins of invite-pending companies exist only as invites; give
     them a Person so ⌘K and the profile modal can show them (the Users page
     filters to active companies, so they stay off it). */
  for (const iv of inviteRows) {
    const company = companies.find((c) => c.id === iv.company_id);
    if (!company || company.status !== "Invite pending" || iv.accepted_at) continue;
    people.push({
      id: `invite-${iv.id}`,
      company: iv.company_id,
      role: "Company admin",
      name: nameFromEmail(iv.email),
      email: iv.email,
      phone: "—",
      status: "Invite pending",
      joined: fmtLongDate(iv.created_at),
    });
  }

  /* Invites */
  const emailToProfileName = new Map<string, string>();
  for (const p of profileRows) {
    const email = emailById.get(p.id);
    if (email && p.full_name?.trim()) {
      emailToProfileName.set(email.toLowerCase(), p.full_name.trim());
    }
  }
  const invites: Invite[] = inviteRows.map((iv) => ({
    id: iv.id,
    name:
      emailToProfileName.get(iv.email.toLowerCase()) ?? nameFromEmail(iv.email),
    email: iv.email,
    company: companyNameOf.get(iv.company_id) ?? "—",
    sent: fmtRelative(iv.created_at),
    status: iv.accepted_at
      ? "Accepted"
      : iv.expires_at && new Date(iv.expires_at) < now
        ? "Expired"
        : "Pending",
    role: iv.role === "company_admin" ? "Company admin" : "Campaign manager",
  }));

  /* Daily activity: conversions per day + posts published that day.
     Downloads have no source table yet, so they stay 0. */
  const companyDays: CompanyDays = {};
  const dayOf = (isoDay: string) => Number(isoDay.slice(8, 10));
  const ensureDay = (companyId: string, day: number): DayActivity => {
    const forCompany = (companyDays[companyId] ??= {});
    return (forCompany[day] ??= { signups: 0, sales: 0, downloads: 0, views: 0 });
  };
  for (const row of conversionRows) {
    const entry = ensureDay(row.company_id, dayOf(row.day));
    entry.signups += row.new_accounts;
    entry.sales += Math.round(row.sales_cents / 100);
    entry.downloads += row.free_trials;
  }
  for (const g of groups) {
    if (g.post.day > 0) {
      ensureDay(g.post.company, g.post.day).views += g.post.viewsN;
    }
  }

  /* Billing */
  const billing: Record<string, CompanyBilling> = {};
  for (const c of companies) {
    if (c.status !== "Active") continue;
    const row = billingRows.find((b) => b.company_id === c.id);
    const ledger = creditRows.filter((r) => r.company_id === c.id);
    const spentCents = ledger
      .filter(
        (r) => r.amount_cents < 0 && new Date(r.created_at) >= monthStart,
      )
      .reduce((n, r) => n - r.amount_cents, 0);
    billing[c.id] = {
      monthly: Math.round((row?.monthly_budget_cents ?? 0) / 100),
      spent: Math.round(spentCents / 100),
      topups: ledger
        .filter((r) => r.kind === "topup" && r.amount_cents > 0)
        .map((r) => ({
          amt: Math.round(r.amount_cents / 100),
          date: fmtShortDate(r.created_at),
        })),
      pingTo: c.admin.name.split(" ")[0] ?? c.admin.name,
    };
  }

  /* Company Brain */
  const brainDocs: Record<string, BrainDoc[]> = {};
  const DOC_META: Record<string, { name: string; sub: string }> = {
    product_truth: { name: "Product", sub: "product_truth" },
    audience_niche: { name: "Audience", sub: "audience_niche" },
  };
  for (const row of brandDocRows) {
    const meta = DOC_META[row.kind];
    if (!meta) continue;
    const content = row.content ?? "";
    (brainDocs[row.company_id] ??= []).push({
      name: meta.name,
      sub: meta.sub,
      words: content.trim() ? content.trim().split(/\s+/).length : 0,
      updated: row.updated_at ? fmtShortDate(row.updated_at) : "—",
      owner: row.human_edited ? "human" : "ai",
      preview: content,
    });
  }
  for (const docs of Object.values(brainDocs)) {
    docs.sort((a, b) => (a.name === "Product" ? -1 : b.name === "Product" ? 1 : 0));
  }

  const brainAccounts: Record<string, InspirationAccount[]> = {};
  for (const row of sourceAccountRows) {
    (brainAccounts[row.company_id] ??= []).push({
      handle: row.handle.startsWith("@") ? row.handle : "@" + row.handle,
      platform: row.platform === "instagram" ? "instagram" : "tiktok",
      kind: row.kind === "reference" ? "Reference" : "Discovered",
    });
  }

  /* Briefs: pinned days come from assignment schedules once campaigns run;
     until then a brief sits on the day it was created (current month only). */
  const briefs: Brief[] = briefRows.map((b) => {
    const created = new Date(b.created_at);
    const inCurrentMonth =
      created.getFullYear() === now.getFullYear() &&
      created.getMonth() === now.getMonth();
    return {
      id: b.id,
      company: b.company_id,
      title: b.title?.trim() || "Untitled brief",
      format: toFormat(b.format),
      status: b.archived_at ? "Archived" : "Active",
      day: inCurrentMonth ? created.getDate() : 0,
      hook: b.hook ?? "",
      script: b.script ?? "",
      caption: b.caption ?? "",
    };
  });

  /* Platform stats (unscoped Overview strip) */
  const activeCompanies = companies.filter((c) => c.status === "Active");
  const allMetricRows = groups.flatMap((g) => g.metricRows);
  const platformMonthViews = viewDelta(allMetricRows, monthStart.getTime(), Date.now());
  const platformPrevViews = viewDelta(
    allMetricRows,
    prevMonthStart.getTime(),
    monthStart.getTime(),
  );
  const monthPosts = groups.filter((g) => g.postedAt >= monthStart.getTime()).length;
  const prevMonthPosts = groups.filter(
    (g) => g.postedAt >= prevMonthStart.getTime() && g.postedAt < monthStart.getTime(),
  ).length;
  const platformStats: OverviewStats = {
    views: fmtViews(platformMonthViews),
    posts: monthPosts,
    campaigns: activeCompanies.reduce((n, c) => n + c.campaigns, 0),
    creators: people.filter((p) => p.role === "Creator").length,
    dCamp: `${activeCompanies.length} ${activeCompanies.length === 1 ? "company" : "companies"}`,
  };
  const dViews = pctDelta(platformMonthViews, platformPrevViews, prevMonthName);
  const dPosts = pctDelta(monthPosts, prevMonthPosts, prevMonthName);
  if (dViews) platformStats.dViews = dViews;
  if (dPosts) platformStats.dPosts = dPosts;

  return {
    companies,
    people,
    posts,
    invites,
    companyDays,
    billing,
    briefs,
    briefWeeks: deriveBriefWeeks(now),
    brainDocs,
    brainAccounts,
    platformStats,
  };
}

/** One fetch per request, shared by the layout (⌘K index) and every page. */
export const getOpsData = cache(async (): Promise<OpsDataset> => {
  return fetchOpsData();
});
