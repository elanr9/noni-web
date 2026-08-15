import { cache } from "react";

import {
  DEFAULT_MANAGER_ACCESS,
  parseManagerAccess,
  type ManagerAccess,
} from "@/lib/admin/types";
import { createServiceClient } from "@/lib/supabase/service";

/* Shared context for every /manager page: which company the signed-in
   campaign manager works for and which extras the company admin has
   unlocked (companies.settings.manager_access). The role gate itself runs
   in src/app/manager/layout.tsx before any of this. */

export interface ManagerContext {
  companyId: string;
  companyName: string;
  access: ManagerAccess;
}

/* Creators in this company, for the shell's command search. */
export interface ManagerPerson {
  id: string;
  name: string;
  status: string;
}

export const listCompanyCreators = cache(
  async (companyId: string): Promise<ManagerPerson[]> => {
    const supabase = createServiceClient();
    /* Same population as the roster (and mobile's leaderboard): creators
       plus anyone who can record, e.g. a manager with can_create. */
    const { data } = await supabase
      .from("profiles")
      .select("id, full_name, onboarded")
      .eq("company_id", companyId)
      .or("role.eq.creator,can_create.eq.true")
      .order("created_at", { ascending: true });
    return (data ?? []).map((row) => ({
      id: row.id as string,
      name: (row.full_name as string | null) ?? "Creator",
      status: row.onboarded ? "Active" : "Invite sent",
    }));
  },
);

/* Everything waiting on the campaign manager, mirroring the app's Review
   tab: submitted posts, songs marked ready, and pending account links. */
export const countReviewQueue = cache(
  async (companyId: string): Promise<number> => {
    const supabase = createServiceClient();
    const [posts, music, accounts] = await Promise.all([
      supabase
        .from("assignments")
        .select("id", { count: "exact", head: true })
        .eq("company_id", companyId)
        .eq("status", "submitted"),
      supabase
        .from("assignments")
        .select("id", { count: "exact", head: true })
        .eq("company_id", companyId)
        .not("music_marked_by_creator_at", "is", null)
        .is("music_approved_at", null),
      supabase
        .from("creator_accounts")
        .select("id", { count: "exact", head: true })
        .eq("company_id", companyId)
        .eq("status", "pending"),
    ]);
    return (posts.count ?? 0) + (music.count ?? 0) + (accounts.count ?? 0);
  },
);

export const getManagerContext = cache(
  async (companyId: string): Promise<ManagerContext> => {
    const supabase = createServiceClient();
    const { data } = await supabase
      .from("companies")
      .select("id, name, settings")
      .eq("id", companyId)
      .maybeSingle();

    return {
      companyId,
      companyName: (data?.name as string | null) ?? "Your company",
      access: data
        ? parseManagerAccess(data.settings)
        : DEFAULT_MANAGER_ACCESS,
    };
  },
);
