/* Server-side data layer for the /admin dashboard. Fetches the real
   Supabase tables with the service client (the company-admin gate in the
   /admin layout runs before any of this) and shapes rows into the
   @/lib/admin/types the UI is built against, scoped to one company.

   Query patterns mirror src/lib/ops/data.ts (and through it the mobile
   repo's admin-api/analytics-api): posts join assignments/content_tasks
   for company and creator, engagement is the latest post_metrics snapshot,
   conversions come from conversion_daily, money from company_credit_ledger
   and wallet_ledger.

   Columns the /admin surface needs but that may not exist yet (onboarding
   answers on companies, subscription and Stripe fields on company_billing,
   muted on source_accounts) are read defensively off select("*") rows and
   default sensibly. The SQL to add them lives in supabase/migrations/. */

import { cache } from "react";

import { parseStoredPlan, PLAN_PRICING } from "@/lib/admin/billing";
import { currentWeekStart } from "@/lib/admin/feature-analyze";
import { createServiceClient } from "@/lib/supabase/service";

import type {
  AdminBilling,
  AdminBrief,
  AdminDataset,
  AdminInvite,
  AdminPost,
  BrainDoc,
  BriefTemplate,
  DayActivity,
  DayActivityMap,
  FeatureScreenshot,
  InspirationAccount,
  Member,
  OnboardingAnswers,
  PostFormat,
  ProductFeature,
  Stat,
  StatStrip,
  Subscription,
} from "./types";
import { parseManagerAccess } from "./types";

/* ── Raw row shapes (typed columns we rely on) ── */

interface ProfileRow {
  id: string;
  role: string | null;
  full_name: string | null;
  onboarded: boolean | null;
  created_at: string;
}

interface InviteRow {
  id: string;
  email: string;
  role: string | null;
  invited_name: string | null;
  accepted_at: string | null;
  expires_at: string | null;
  created_at: string;
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
  creator_id: string | null;
  post_id: string | null;
  amount_cents: number;
  created_at: string;
}

interface CreditLedgerRow {
  kind: string;
  amount_cents: number;
  created_at: string;
}

interface ConversionRow {
  day: string;
  new_accounts: number;
  sales_cents: number;
}

interface CampaignDateRow {
  starts_on: string | null;
  created_at: string | null;
}

/** The day the company started its first campaign on Noni (YYYY-MM-DD), or
    null with no campaigns yet. A campaign counts from starts_on, falling
    back to the day it was created. */
export function firstCampaignDayOf(rows: CampaignDateRow[]): string | null {
  let first: string | null = null;
  for (const row of rows) {
    const day = row.starts_on ?? row.created_at?.slice(0, 10) ?? null;
    if (day && (first === null || day < first)) first = day;
  }
  return first;
}

interface BrandDocRow {
  kind: string;
  content: string | null;
  updated_at: string | null;
}

interface BriefRow {
  id: string;
  format: string | null;
  title: string | null;
  hook: string | null;
  archived_at: string | null;
  created_at: string;
}

/* ── Defensive readers for columns that may not exist yet ── */

type LooseRow = Record<string, unknown>;

function readStr(row: LooseRow | null, key: string): string | null {
  const v = row?.[key];
  return typeof v === "string" ? v : null;
}

function readNum(row: LooseRow | null, key: string): number | null {
  const v = row?.[key];
  return typeof v === "number" && Number.isFinite(v) ? v : null;
}

function readBool(row: LooseRow | null, key: string): boolean | null {
  const v = row?.[key];
  return typeof v === "boolean" ? v : null;
}

/* ── Formatting helpers (same conventions as src/lib/ops/data.ts) ── */

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

function pctDelta(current: number, previous: number, vs: string): string {
  if (previous <= 0) return "";
  const pct = Math.round(((current - previous) / previous) * 100);
  return `${pct >= 0 ? "+" : ""}${pct}% vs ${vs}`;
}

/** Latest snapshot taken at or before `cutoff`, or null. */
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

/** View delta a set of metric rows gained inside [from, to). */
function viewDelta(rows: MetricSnapshot[], from: number, to: number): number {
  const end = snapshotAt(rows, to);
  if (!end) return 0;
  const start = snapshotAt(rows, from);
  return Math.max(0, (end.views ?? 0) - (start?.views ?? 0));
}

/* ── Post grouping ──
   DB posts are one row per platform per published assignment/task. The
   design AdminPost is the creator's post with TikTok + Instagram stats
   side by side, so rows group by assignment (or legacy task). */

interface PostGroup {
  post: AdminPost;
  creatorId: string | null;
  rowIds: string[];
  metricRows: MetricSnapshot[];
  postedAt: number;
}

function groupPosts(
  rows: PostRow[],
  companyId: string,
  profileNames: Map<string, string>,
  now: Date,
): PostGroup[] {
  const groups = new Map<string, PostGroup>();
  const monthKey = `${now.getFullYear()}-${now.getMonth()}`;

  for (const row of rows) {
    const owner = row.assignments ?? null;
    const task = row.content_tasks ?? null;
    const rowCompany = owner?.company_id ?? task?.company_id;
    if (rowCompany !== companyId || !row.posted_at) continue;

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
          title: owner?.briefs?.title ?? task?.title ?? "Post",
          creator:
            (creatorId ? profileNames.get(creatorId) : null) ?? "Creator",
          format: toFormat(owner?.briefs?.format ?? task?.format),
          viewsN: 0,
          earned: 0,
          publishedAt: fmtShortDate(row.posted_at),
          day: inCurrentMonth ? posted.getDate() : 0,
          link: row.post_url ?? "",
          thumb: null,
          tt: { views: 0, likes: 0, saves: 0 },
          ig: { views: 0, likes: 0, saves: 0 },
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
      group.post.publishedAt = fmtShortDate(row.posted_at);
      group.post.day = inCurrentMonth ? posted.getDate() : 0;
    }

    const latest = snapshotAt(row.post_metrics, Date.now());
    const stats = {
      views: latest?.views ?? 0,
      likes: latest?.likes ?? 0,
      saves: latest?.saves ?? 0,
    };
    const side = row.platform === "instagram" ? "ig" : "tt";
    group.post[side] = {
      views: group.post[side].views + stats.views,
      likes: group.post[side].likes + stats.likes,
      saves: group.post[side].saves + stats.saves,
    };
    group.post.viewsN = group.post.tt.views + group.post.ig.views;
  }

  return [...groups.values()];
}

/* ── The dataset ── */

const EMPTY_ONBOARDING: OnboardingAnswers = {
  adminRole: "",
  doesUgc: false,
  creatorCount: 0,
  managerCount: 0,
  selfIsManager: false,
};

const EMPTY_DOCS: BrainDoc[] = [
  { kind: "product", title: "Product", body: "", updated: "" },
  { kind: "audience", title: "Audience", body: "", updated: "" },
];

const EMPTY_BILLING: AdminBilling = {
  subscription: { status: "none" },
  monthlySpendLimit: null,
  spentThisMonth: 0,
  creditBalance: 0,
  autoTopUp: false,
  stripeConnected: false,
  stripeAccountId: null,
  topUpHistory: [],
};

function emptyStat(label: string): Stat {
  return { label, value: "0", delta: "" };
}

/** For the platform support account (no company) and missing company rows. */
function emptyDataset(companyId: string): AdminDataset {
  return {
    company: {
      id: companyId,
      name: "Your company",
      website: "",
      onboarding: EMPTY_ONBOARDING,
      managerAccess: parseManagerAccess(null),
    },
    managers: [],
    creators: [],
    invites: [],
    posts: [],
    dayActivity: {},
    billing: EMPTY_BILLING,
    brainDocs: EMPTY_DOCS,
    inspirationAccounts: [],
    features: [],
    briefTemplates: [],
    briefs: [],
    statStrip: {
      views: emptyStat("Views this month"),
      posts: emptyStat("Posts"),
      signups: emptyStat("Sign-ups attributed"),
      paidToCreators: emptyStat("Paid to creators"),
    },
    weeklyViews: [],
  };
}

async function fetchAdminData(companyId: string): Promise<AdminDataset> {
  if (!companyId) return emptyDataset("");

  const supabase = createServiceClient();
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const monthName = now.toLocaleString("en-US", { month: "long" });
  const prevMonthName = prevMonthStart.toLocaleString("en-US", { month: "long" });
  const prevMonthStartDay = `${prevMonthStart.getFullYear()}-${String(
    prevMonthStart.getMonth() + 1,
  ).padStart(2, "0")}-01`;

  const [
    companyRes,
    profilesRes,
    usersRes,
    invitesRes,
    postsRes,
    ledgerRes,
    creditLedgerRes,
    conversionsRes,
    campaignsRes,
    billingRes,
    brandDocsRes,
    sourceAccountsRes,
    briefsRes,
    companyMembersRes,
    creatorWalletsRes,
    featuresRes,
    featureScreenshotsRes,
    briefTemplatesRes,
    sourcePostsRes,
  ] = await Promise.all([
    /* select("*") so onboarding-answer columns that have not been migrated
       yet do not error the query; readers default when absent. */
    supabase.from("companies").select("*").eq("id", companyId).maybeSingle(),
    supabase
      .from("profiles")
      .select("id, role, full_name, onboarded, created_at")
      .eq("company_id", companyId),
    supabase.auth.admin.listUsers({ page: 1, perPage: 1000 }),
    supabase
      .from("company_invites")
      .select("id, email, role, invited_name, accepted_at, expires_at, created_at")
      .eq("company_id", companyId)
      .order("created_at", { ascending: false }),
    /* posts carry no company_id; company lives on the joined assignment or
       task, so fetch like /ops does and scope while grouping. */
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
      .select("creator_id, post_id, amount_cents, created_at")
      .eq("company_id", companyId)
      .gt("amount_cents", 0),
    supabase
      .from("company_credit_ledger")
      .select("kind, amount_cents, created_at")
      .eq("company_id", companyId)
      .order("created_at", { ascending: false }),
    supabase
      .from("conversion_daily")
      .select("day, new_accounts, sales_cents")
      .eq("company_id", companyId)
      .is("creator_id", null)
      .gte("day", prevMonthStartDay),
    /* Conversion numbers only count from the company's first campaign, so
       Stripe history predating Noni never shows in Analytics. */
    supabase
      .from("campaigns")
      .select("starts_on, created_at")
      .eq("company_id", companyId),
    supabase
      .from("company_billing")
      .select("*")
      .eq("company_id", companyId)
      .maybeSingle(),
    supabase
      .from("brand_docs")
      .select("kind, content, updated_at")
      .eq("company_id", companyId),
    supabase
      .from("source_accounts")
      .select("*")
      .eq("company_id", companyId)
      .order("handle"),
    supabase
      .from("briefs")
      .select("id, format, title, hook, archived_at, created_at")
      .eq("company_id", companyId)
      .order("created_at", { ascending: false }),
    /* Seeded by the onboarding self-as-manager answer; the table is owned
       by the mobile repo, so tolerate it being absent. */
    supabase
      .from("company_members")
      .select("profile_id")
      .eq("company_id", companyId),
    /* A wallet row only exists once someone has used the creator side of
       the mobile app, so it marks admins/managers who also record. */
    supabase
      .from("creator_wallets")
      .select("creator_id")
      .eq("company_id", companyId),
    supabase
      .from("brain_features")
      .select(
        "id, name, sentence, screenshot_path, score, reason, rank, idea_title, idea_example, idea_action",
      )
      .eq("company_id", companyId)
      .order("rank", { ascending: true }),
    supabase
      .from("feature_screenshots")
      .select("id, feature_id, path, source, shape, sort_order")
      .eq("company_id", companyId)
      .order("sort_order"),
    supabase
      .from("brief_templates")
      .select(
        "id, feature_id, title, format, type_label, example, description, action, phrase, sort_order",
      )
      .eq("company_id", companyId)
      .eq("week_start", currentWeekStart())
      .order("sort_order"),
    supabase
      .from("source_posts")
      .select(
        "id, platform, handle, url, caption, thumbnail_url, views, likes, shares, hook, why",
      )
      .eq("company_id", companyId)
      .order("score", { ascending: false }),
  ]);

  const companyRow = (companyRes.data ?? null) as LooseRow | null;
  if (!companyRow) return emptyDataset(companyId);

  const profileRows = (profilesRes.data ?? []) as ProfileRow[];
  const inviteRows = (invitesRes.data ?? []) as InviteRow[];
  const postRows = (postsRes.data ?? []) as unknown as PostRow[];
  const ledgerRows = (ledgerRes.data ?? []) as LedgerRow[];
  const creditRows = (creditLedgerRes.data ?? []) as CreditLedgerRow[];
  const firstCampaignDay = firstCampaignDayOf(
    (campaignsRes.data ?? []) as CampaignDateRow[],
  );
  /* No campaign yet means no conversion numbers at all: Stripe sales and
     sign-ups only count from the day the first campaign started on Noni. */
  const conversionRows = (
    (conversionsRes.data ?? []) as ConversionRow[]
  ).filter((r) => firstCampaignDay !== null && r.day >= firstCampaignDay);
  const billingRow = (billingRes.data ?? null) as LooseRow | null;
  const brandDocRows = (brandDocsRes.data ?? []) as BrandDocRow[];
  const sourceAccountRows = (sourceAccountsRes.data ?? []) as LooseRow[];
  const briefRows = (briefsRes.data ?? []) as BriefRow[];
  const companyMemberRows = (companyMembersRes.data ?? []) as Array<{
    profile_id: string;
  }>;
  const creatorWalletRows = (creatorWalletsRes.data ?? []) as Array<{
    creator_id: string;
  }>;
  const featureRows = (featuresRes.data ?? []) as Array<{
    id: string;
    name: string | null;
    sentence: string | null;
    screenshot_path: string | null;
    score: number | null;
    reason: string | null;
    rank: number | null;
    idea_title: string | null;
    idea_example: string | null;
    idea_action: string | null;
  }>;
  const featureScreenshotRows = (featureScreenshotsRes.data ?? []) as Array<{
    id: string;
    feature_id: string;
    path: string;
    source: string;
    shape: string;
    sort_order: number;
  }>;
  const templateRows = (briefTemplatesRes.data ?? []) as Array<{
    id: string;
    feature_id: string | null;
    title: string | null;
    format: string | null;
    type_label: string | null;
    example: string | null;
    description: string | null;
    action: string | null;
    phrase: string | null;
  }>;
  const sourcePostRows = (sourcePostsRes.data ?? []) as Array<{
    id: string;
    platform: string | null;
    handle: string | null;
    url: string | null;
    caption: string | null;
    thumbnail_url: string | null;
    views: number | null;
    likes: number | null;
    shares: number | null;
    hook: string | null;
    why: string | null;
  }>;

  const emailById = new Map<string, string>();
  for (const user of usersRes.data?.users ?? []) {
    if (user.email) emailById.set(user.id, user.email);
  }

  const profileNames = new Map<string, string>();
  for (const p of profileRows) {
    profileNames.set(
      p.id,
      p.full_name?.trim() || nameFromEmail(emailById.get(p.id) ?? "User"),
    );
  }

  /* Company + onboarding answers (columns may not exist yet) */
  const onboarding: OnboardingAnswers = {
    adminRole: readStr(companyRow, "admin_role") ?? "",
    doesUgc: readBool(companyRow, "does_ugc") ?? false,
    creatorCount: readNum(companyRow, "creator_count") ?? 0,
    managerCount: readNum(companyRow, "manager_count") ?? 0,
    selfIsManager: readBool(companyRow, "self_is_manager") ?? false,
  };
  const company = {
    id: companyId,
    name: readStr(companyRow, "name") ?? "Your company",
    website: readStr(companyRow, "website") ?? "",
    onboarding,
    managerAccess: parseManagerAccess(companyRow?.settings),
  };

  /* Posts */
  const groups = groupPosts(postRows, companyId, profileNames, now);

  const earnedByPostRow = new Map<string, number>();
  for (const row of ledgerRows) {
    if (row.post_id) {
      earnedByPostRow.set(
        row.post_id,
        (earnedByPostRow.get(row.post_id) ?? 0) + row.amount_cents,
      );
    }
  }
  for (const g of groups) {
    const cents = g.rowIds.reduce((n, id) => n + (earnedByPostRow.get(id) ?? 0), 0);
    g.post.earned = Math.round(cents / 100);
  }
  const posts = groups.map((g) => g.post).sort((a, b) => b.viewsN - a.viewsN);

  /* Members: accepted profiles plus still-pending invites, so invite-sent
     rows show on Team and count toward the setup steps the moment the
     invite goes out (matches the prototype). */
  const statsByCreator = new Map<string, { posts: number; views: number; earned: number }>();
  for (const g of groups) {
    if (!g.creatorId) continue;
    const s = statsByCreator.get(g.creatorId) ?? { posts: 0, views: 0, earned: 0 };
    s.posts += 1;
    s.views += g.post.viewsN;
    s.earned += g.post.earned;
    statsByCreator.set(g.creatorId, s);
  }

  const managers: Member[] = [];
  const creators: Member[] = [];
  for (const p of profileRows) {
    if (p.role === "campaign_manager") {
      managers.push({
        id: p.id,
        role: "Campaign manager",
        name: profileNames.get(p.id) ?? "User",
        email: emailById.get(p.id) ?? "",
        status: p.onboarded ? "Active" : "Invite sent",
        joined: fmtLongDate(p.created_at),
      });
    } else if (p.role === "creator") {
      const s = statsByCreator.get(p.id);
      creators.push({
        id: p.id,
        role: "Creator",
        name: profileNames.get(p.id) ?? "User",
        email: emailById.get(p.id) ?? "",
        status: p.onboarded ? "Active" : "Invite sent",
        joined: fmtLongDate(p.created_at),
        posts: s?.posts ?? 0,
        viewsN: s?.views ?? 0,
        earned: s?.earned ?? 0,
      });
    }
  }

  /* Self-as-manager: the onboarding "Yes" answer writes
     companies.self_is_manager and a company_members row for the admin, not
     a campaign_manager profile role, so surface company_admin profiles
     matching either signal as Active managers (README: "Yes also seeds the
     admin as an Active campaign manager on Team and counts toward the
     invite step"). */
  const memberProfileIds = new Set(companyMemberRows.map((r) => r.profile_id));
  for (const p of profileRows) {
    if (p.role !== "company_admin") continue;
    if (!onboarding.selfIsManager && !memberProfileIds.has(p.id)) continue;
    managers.unshift({
      id: p.id,
      role: "Campaign manager",
      name: profileNames.get(p.id) ?? "User",
      email: emailById.get(p.id) ?? "",
      status: p.onboarded ? "Active" : "Invite sent",
      joined: fmtLongDate(p.created_at),
    });
  }

  /* Dual-role members: admins and campaign managers who also record show
     in the creators list too. */
  const creatorWalletIds = new Set(creatorWalletRows.map((r) => r.creator_id));
  for (const p of profileRows) {
    if (p.role !== "campaign_manager" && p.role !== "company_admin") continue;
    if (!creatorWalletIds.has(p.id)) continue;
    const s = statsByCreator.get(p.id);
    creators.push({
      id: p.id,
      role: "Creator",
      name: profileNames.get(p.id) ?? "User",
      email: emailById.get(p.id) ?? "",
      status: p.onboarded ? "Active" : "Invite sent",
      joined: fmtLongDate(p.created_at),
      posts: s?.posts ?? 0,
      viewsN: s?.views ?? 0,
      earned: s?.earned ?? 0,
    });
  }

  const acceptedEmails = new Set(
    profileRows
      .map((p) => emailById.get(p.id)?.toLowerCase())
      .filter((e): e is string => Boolean(e)),
  );
  const invites: AdminInvite[] = [];
  for (const iv of inviteRows) {
    const role = iv.role === "campaign_manager" ? "Campaign manager" : "Creator";
    if (iv.role !== "campaign_manager" && iv.role !== "creator") continue;
    const expired = Boolean(iv.expires_at && new Date(iv.expires_at) < now);
    const inviteName = iv.invited_name?.trim() || nameFromEmail(iv.email);
    invites.push({
      id: iv.id,
      name: inviteName,
      email: iv.email,
      role,
      sent: fmtRelative(iv.created_at),
      status: iv.accepted_at ? "Accepted" : expired ? "Expired" : "Pending",
    });
    const pending =
      !iv.accepted_at && !expired && !acceptedEmails.has(iv.email.toLowerCase());
    if (!pending) continue;
    const row: Member = {
      id: `invite-${iv.id}`,
      role,
      name: inviteName,
      email: iv.email,
      status: "Invite sent",
      joined: fmtRelative(iv.created_at),
    };
    if (role === "Campaign manager") managers.push(row);
    else creators.push(row);
  }

  /* Daily activity */
  const dayActivity: DayActivityMap = {};
  const ensureDay = (day: number): DayActivity =>
    (dayActivity[day] ??= { views: 0, signups: 0, sales: 0, postIds: [] });
  const monthStartIso = `${monthStart.getFullYear()}-${String(
    monthStart.getMonth() + 1,
  ).padStart(2, "0")}-01`;
  for (const row of conversionRows) {
    if (row.day < monthStartIso) continue;
    const entry = ensureDay(Number(row.day.slice(8, 10)));
    entry.signups += row.new_accounts;
    entry.sales += Math.round(row.sales_cents / 100);
  }
  for (const g of groups) {
    if (g.post.day > 0) {
      const entry = ensureDay(g.post.day);
      entry.views += g.post.viewsN;
      entry.postIds.push(g.post.id);
    }
  }

  /* Billing (subscription and Stripe columns may not exist yet) */
  const subActive = readStr(billingRow, "subscription_status") === "active";
  const { tier, cadence } = parseStoredPlan(readStr(billingRow, "subscription_plan"));
  const fallbackPricing = Object.values(PLAN_PRICING).find(
    (p) => p.tier === tier && p.cadence === cadence,
  );
  const renewsAtIso = readStr(billingRow, "subscription_renews_at");
  const subscription: Subscription = subActive
    ? {
        status: "active",
        tier,
        cadence,
        price:
          readNum(billingRow, "subscription_price_cents") !== null
            ? Math.round((readNum(billingRow, "subscription_price_cents") ?? 0) / 100)
            : (fallbackPricing?.monthlyPriceCents ?? 0) / 100,
        renewsAt: renewsAtIso ? fmtLongDate(renewsAtIso) : "",
        cardBrand: readStr(billingRow, "card_brand") ?? "Card",
        cardLast4: readStr(billingRow, "card_last4") ?? "",
      }
    : { status: "none" };

  const spentCents = creditRows
    .filter((r) => r.amount_cents < 0 && new Date(r.created_at) >= monthStart)
    .reduce((n, r) => n - r.amount_cents, 0);
  const budgetCents = readNum(billingRow, "monthly_budget_cents") ?? 0;
  const rawAccountId = readStr(billingRow, "stripe_account_id");
  const billing: AdminBilling = {
    subscription,
    monthlySpendLimit: budgetCents > 0 ? Math.round(budgetCents / 100) : null,
    spentThisMonth: Math.round(spentCents / 100),
    creditBalance: Math.round((readNum(billingRow, "credit_balance_cents") ?? 0) / 100),
    autoTopUp: readBool(billingRow, "auto_top_up") ?? false,
    stripeConnected:
      (readBool(billingRow, "stripe_connected") ?? false) ||
      Boolean(rawAccountId),
    stripeAccountId: rawAccountId
      ? "····" + rawAccountId.slice(-4).toUpperCase()
      : null,
    topUpHistory: creditRows
      .filter(
        (r) => (r.kind === "topup" || r.kind === "budget") && r.amount_cents > 0,
      )
      .map((r) => ({
        amt: Math.round(r.amount_cents / 100),
        date: fmtShortDate(r.created_at),
        kind: r.kind === "budget" ? ("budget" as const) : ("topup" as const),
      })),
  };

  /* Company Brain: both docs always present, filled from brand_docs. */
  const brainDocs: BrainDoc[] = EMPTY_DOCS.map((doc) => ({ ...doc }));
  const KIND_OF: Record<string, "product" | "audience"> = {
    product_truth: "product",
    audience_niche: "audience",
  };
  for (const row of brandDocRows) {
    const kind = KIND_OF[row.kind];
    if (!kind) continue;
    const doc = brainDocs.find((d) => d.kind === kind);
    if (!doc) continue;
    doc.body = row.content ?? "";
    doc.updated = row.updated_at && doc.body.trim() ? fmtShortDate(row.updated_at) : "";
  }

  const postsByAccount = new Map<string, InspirationAccount["posts"]>();
  for (const row of sourcePostRows) {
    const platform = row.platform === "instagram" ? "instagram" : "tiktok";
    const handle = (row.handle ?? "").replace(/^@+/, "").toLowerCase();
    const key = `${platform}:${handle}`;
    const list = postsByAccount.get(key) ?? [];
    list.push({
      id: row.id,
      url: row.url ?? "",
      caption: row.caption ?? "",
      thumbnailUrl: row.thumbnail_url ?? "",
      views: row.views ?? 0,
      likes: row.likes ?? 0,
      shares: row.shares ?? 0,
      hook: row.hook ?? "",
      why: row.why ?? "",
    });
    postsByAccount.set(key, list);
  }

  const inspirationAccounts: InspirationAccount[] = sourceAccountRows.map((row) => {
    const handle = readStr(row, "handle") ?? "";
    const platform = readStr(row, "platform") === "instagram" ? "instagram" : "tiktok";
    const key = `${platform}:${handle.replace(/^@+/, "").toLowerCase()}`;
    return {
      handle: handle.startsWith("@") ? handle : "@" + handle,
      platform,
      muted: readBool(row, "muted") ?? false,
      posts: postsByAccount.get(key) ?? [],
    };
  });

  const publicShotUrl = (path: string): string =>
    path
      ? supabase.storage.from("product-features").getPublicUrl(path).data.publicUrl
      : "";

  const shotsByFeature = new Map<string, FeatureScreenshot[]>();
  for (const row of featureScreenshotRows) {
    const list = shotsByFeature.get(row.feature_id) ?? [];
    list.push({
      id: row.id,
      url: publicShotUrl(row.path),
      source: row.source === "noni" ? "noni" : "upload",
      shape: row.shape === "laptop" ? "laptop" : "phone",
    });
    shotsByFeature.set(row.feature_id, list);
  }

  const features: ProductFeature[] = featureRows.map((row) => {
    const path = row.screenshot_path ?? "";
    return {
      id: row.id,
      name: row.name?.trim() ?? "",
      sentence: row.sentence ?? "",
      screenshotUrl: publicShotUrl(path),
      screenshots: shotsByFeature.get(row.id) ?? [],
      score: row.score,
      reason: row.reason ?? "",
      rank: row.rank,
      ideaTitle: row.idea_title ?? "",
      ideaExample: row.idea_example ?? "",
      ideaAction: row.idea_action ?? "",
    };
  });

  const briefTemplates: BriefTemplate[] = templateRows.map((row) => ({
    id: row.id,
    featureId: row.feature_id ?? "",
    title: row.title?.trim() || "Untitled brief",
    format: toFormat(row.format),
    typeLabel: row.type_label ?? "",
    example: row.example ?? "",
    description: row.description ?? "",
    action: row.action ?? "",
    phrase: row.phrase ?? "",
  }));

  const briefs: AdminBrief[] = briefRows.map((b) => ({
    id: b.id,
    title: b.title?.trim() || "Untitled brief",
    format: toFormat(b.format),
    status: b.archived_at ? "Archived" : "Active",
    day: fmtShortDate(b.created_at),
    hook: b.hook ?? "",
  }));

  /* Stat strip + weekly series */
  const allMetricRows = groups.flatMap((g) => g.metricRows);
  const monthViews = viewDelta(allMetricRows, monthStart.getTime(), Date.now());
  const prevMonthViews = viewDelta(
    allMetricRows,
    prevMonthStart.getTime(),
    monthStart.getTime(),
  );
  const monthGroups = groups.filter((g) => g.postedAt >= monthStart.getTime());
  const weekMs = 7 * 24 * 60 * 60 * 1000;
  const weekPosts = groups.filter((g) => g.postedAt >= Date.now() - weekMs).length;

  let monthSignups = 0;
  let prevMonthSignups = 0;
  for (const row of conversionRows) {
    if (row.day >= monthStartIso) monthSignups += row.new_accounts;
    else prevMonthSignups += row.new_accounts;
  }

  const paidCents = ledgerRows
    .filter((r) => new Date(r.created_at) >= monthStart)
    .reduce((n, r) => n + r.amount_cents, 0);

  const statStrip: StatStrip = {
    views: {
      label: "Views this month",
      value: fmtViews(monthViews),
      delta: pctDelta(monthViews, prevMonthViews, prevMonthName),
    },
    posts: {
      label: "Posts",
      value: String(monthGroups.length),
      delta: weekPosts > 0 ? `+${weekPosts} this week` : "",
    },
    signups: {
      label: "Sign-ups attributed",
      value: String(monthSignups),
      delta: pctDelta(monthSignups, prevMonthSignups, prevMonthName),
    },
    paidToCreators: {
      label: "Paid to creators",
      value: "$" + Math.round(paidCents / 100).toLocaleString("en-US"),
      delta: `${monthName} so far`,
    },
  };

  const weeklyViews = Array.from({ length: 12 }, (_, i) => {
    const end = Date.now() - (11 - i) * weekMs;
    return +(viewDelta(allMetricRows, end - weekMs, end) / 1000).toFixed(1);
  });

  return {
    company,
    managers,
    creators,
    invites,
    posts,
    dayActivity,
    billing,
    brainDocs,
    inspirationAccounts,
    features,
    briefTemplates,
    briefs,
    statStrip,
    weeklyViews,
  };
}

/* TEMPORARY QA MOCK SWITCH — visual QA only. Remove before finishing.
   Serves the prototype seed dataset so every screen has rich data. */
async function qaMockData(): Promise<AdminDataset> {
  const mock = await import("./mock-data");
  return mock.MOCK_DATASET;
}

/** One fetch per request, shared by the layout (shell + ⌘K index + setup
    badge) and every page. */
export const getAdminData = cache(
  async (companyId: string): Promise<AdminDataset> => {
    if (
      process.env.NODE_ENV === "development" &&
      process.env.ADMIN_QA_MOCK === "1"
    ) {
      return qaMockData();
    }
    return fetchAdminData(companyId);
  },
);
