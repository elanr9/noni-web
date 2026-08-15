import { createServiceClient } from "@/lib/supabase/service";
import { signedMediaUrl } from "@/lib/manager/storage";

/* Server reads for the /manager Creators surface. Query shapes mirror the
   mobile repo's lib/admin-api.ts (fetchCreatorLeaderboard and
   fetchCreatorDetail): views come off assignments.metrics, posts count
   assignments in status "posted", earnings sum positive wallet_ledger rows.
   Every query is scoped by the company_id from the session profile. */

/** Shape of assignments.metrics jsonb, written by the metrics poller
    (mirrors parseAssignmentMetrics in the mobile repo's lib/tasks-api.ts). */
export type AssignmentMetrics = {
  views?: number;
  likes?: number;
};

export function parseAssignmentMetrics(metrics: unknown): AssignmentMetrics {
  if (metrics === null || typeof metrics !== "object" || Array.isArray(metrics)) {
    return {};
  }
  const raw = metrics as Record<string, unknown>;
  const out: AssignmentMetrics = {};
  if (typeof raw.views === "number") out.views = raw.views;
  if (typeof raw.likes === "number") out.likes = raw.likes;
  return out;
}

export type CreatorStatus = "Active" | "Invite sent";

export interface RosterCreator {
  id: string;
  name: string;
  avatarUrl: string | null;
  status: CreatorStatus;
  posts: number;
  views: number;
  earnedMonthCents: number;
}

export interface RosterInvite {
  id: string;
  name: string;
  email: string;
  sentAt: string;
}

export interface CreatorRoster {
  creators: RosterCreator[];
  invites: RosterInvite[];
}

type ProfileRow = {
  id: string;
  full_name: string | null;
  avatar_path: string | null;
  onboarded: boolean | null;
};

type AssignmentStatRow = {
  id: string;
  creator_id: string;
  status: string;
  metrics: unknown;
};

export async function listCreatorRoster(
  companyId: string,
): Promise<CreatorRoster> {
  const supabase = createServiceClient();
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

  const [profilesRes, assignmentsRes, ledgerRes, invitesRes] = await Promise.all([
    /* Same population as mobile fetchCreatorLeaderboard: creators plus
       admins and managers who also record. */
    supabase
      .from("profiles")
      .select("id, full_name, avatar_path, onboarded")
      .eq("company_id", companyId)
      .or("role.eq.creator,can_create.eq.true")
      .order("full_name"),
    supabase
      .from("assignments")
      .select("id, creator_id, status, metrics")
      .eq("company_id", companyId),
    supabase
      .from("wallet_ledger")
      .select("creator_id, amount_cents")
      .eq("company_id", companyId)
      .gt("amount_cents", 0)
      .gte("created_at", monthStart),
    supabase
      .from("company_invites")
      .select("id, email, invited_name, created_at")
      .eq("company_id", companyId)
      .eq("role", "creator")
      .is("accepted_at", null)
      .order("created_at", { ascending: false }),
  ]);

  const profiles = (profilesRes.data ?? []) as ProfileRow[];
  const assignments = (assignmentsRes.data ?? []) as AssignmentStatRow[];
  const ledger = (ledgerRes.data ?? []) as Array<{
    creator_id: string;
    amount_cents: number;
  }>;

  const rows = new Map<string, RosterCreator>(
    profiles.map((p) => [
      p.id,
      {
        id: p.id,
        name: p.full_name?.trim() || "Creator",
        avatarUrl: null,
        status: p.onboarded ? "Active" : "Invite sent",
        posts: 0,
        views: 0,
        earnedMonthCents: 0,
      },
    ]),
  );

  for (const a of assignments) {
    const row = rows.get(a.creator_id);
    if (!row) continue;
    row.views += parseAssignmentMetrics(a.metrics).views ?? 0;
    if (a.status === "posted") row.posts += 1;
  }
  for (const entry of ledger) {
    const row = rows.get(entry.creator_id);
    if (row) row.earnedMonthCents += entry.amount_cents;
  }

  await Promise.all(
    profiles
      .filter((p) => p.avatar_path)
      .map(async (p) => {
        const url = await signedMediaUrl("avatars", p.avatar_path);
        const row = rows.get(p.id);
        if (row) row.avatarUrl = url;
      }),
  );

  const invites: RosterInvite[] = (
    (invitesRes.data ?? []) as Array<{
      id: string;
      email: string;
      invited_name: string | null;
      created_at: string;
    }>
  ).map((i) => ({
    id: i.id,
    name: i.invited_name?.trim() || i.email,
    email: i.email,
    sentAt: i.created_at,
  }));

  return { creators: [...rows.values()], invites };
}

export interface CreatorAssignmentRow {
  id: string;
  briefTitle: string;
  briefFormat: string;
  status: string;
  scheduledDate: string;
  views: number;
  likes: number;
  postUrl: string | null;
}

export interface CreatorProfileData {
  id: string;
  name: string;
  avatarUrl: string | null;
  status: CreatorStatus;
  joined: string;
  phone: string | null;
  posts: number;
  views: number;
  earnedCents: number;
  streak: { current: number; longest: number } | null;
  wallet: { availableCents: number; pendingCents: number } | null;
  currentAssignments: CreatorAssignmentRow[];
  recentPosts: CreatorAssignmentRow[];
}

type AssignmentDetailRow = {
  id: string;
  status: string;
  scheduled_date: string;
  metrics: unknown;
  post_url: string | null;
  briefs: { id: string; title: string; format: string } | null;
};

export async function getCreatorProfile(
  companyId: string,
  creatorId: string,
): Promise<CreatorProfileData | null> {
  const supabase = createServiceClient();

  const [profileRes, assignmentsRes, ledgerRes, streakRes, walletRes] =
    await Promise.all([
      supabase
        .from("profiles")
        .select("id, full_name, avatar_path, onboarded, created_at, phone")
        .eq("company_id", companyId)
        .eq("id", creatorId)
        .maybeSingle(),
      /* Mirrors mobile fetchCreatorDetail: assignments joined with briefs,
         newest scheduled day first. */
      supabase
        .from("assignments")
        .select(
          "id, status, scheduled_date, metrics, post_url, briefs:brief_id ( id, title, format )",
        )
        .eq("company_id", companyId)
        .eq("creator_id", creatorId)
        .order("scheduled_date", { ascending: false })
        .order("slot_index", { ascending: true }),
      supabase
        .from("wallet_ledger")
        .select("amount_cents")
        .eq("company_id", companyId)
        .eq("creator_id", creatorId)
        .gt("amount_cents", 0),
      supabase
        .from("creator_streaks")
        .select("current_streak, longest_streak")
        .eq("company_id", companyId)
        .eq("creator_id", creatorId)
        .maybeSingle(),
      supabase
        .from("creator_wallets")
        .select("available_cents, pending_cents")
        .eq("company_id", companyId)
        .eq("creator_id", creatorId)
        .maybeSingle(),
    ]);

  const profile = profileRes.data as {
    id: string;
    full_name: string | null;
    avatar_path: string | null;
    onboarded: boolean | null;
    created_at: string;
    phone: string | null;
  } | null;
  if (!profile) return null;

  const assignments = ((assignmentsRes.data ?? []) as unknown[]).map((raw) => {
    const row = raw as AssignmentDetailRow;
    const metrics = parseAssignmentMetrics(row.metrics);
    return {
      id: row.id,
      briefTitle: row.briefs?.title ?? "Post",
      briefFormat: row.briefs?.format ?? "video",
      status: row.status,
      scheduledDate: row.scheduled_date,
      views: metrics.views ?? 0,
      likes: metrics.likes ?? 0,
      postUrl: row.post_url,
    } satisfies CreatorAssignmentRow;
  });

  const earnedCents = (
    (ledgerRes.data ?? []) as Array<{ amount_cents: number }>
  ).reduce((sum, entry) => sum + entry.amount_cents, 0);

  const streakRow = streakRes.data as {
    current_streak: number;
    longest_streak: number;
  } | null;
  const walletRow = walletRes.data as {
    available_cents: number;
    pending_cents: number;
  } | null;

  return {
    id: profile.id,
    name: profile.full_name?.trim() || "Creator",
    avatarUrl: await signedMediaUrl("avatars", profile.avatar_path),
    status: profile.onboarded ? "Active" : "Invite sent",
    joined: profile.created_at,
    phone: profile.phone,
    posts: assignments.filter((a) => a.status === "posted").length,
    views: assignments.reduce((sum, a) => sum + a.views, 0),
    earnedCents,
    streak: streakRow
      ? { current: streakRow.current_streak, longest: streakRow.longest_streak }
      : null,
    wallet: walletRow
      ? {
          availableCents: walletRow.available_cents,
          pendingCents: walletRow.pending_cents,
        }
      : null,
    currentAssignments: assignments.filter((a) => a.status !== "posted"),
    recentPosts: assignments.filter((a) => a.status === "posted").slice(0, 12),
  };
}

/** Creator name and photo for the chat page header, scoped to the company. */
export async function getCreatorHeader(
  companyId: string,
  creatorId: string,
): Promise<{ name: string; avatarUrl: string | null } | null> {
  const supabase = createServiceClient();
  const { data } = await supabase
    .from("profiles")
    .select("full_name, avatar_path")
    .eq("company_id", companyId)
    .eq("id", creatorId)
    .maybeSingle();
  if (!data) return null;
  const row = data as { full_name: string | null; avatar_path: string | null };
  return {
    name: row.full_name?.trim() || "Creator",
    avatarUrl: await signedMediaUrl("avatars", row.avatar_path),
  };
}
