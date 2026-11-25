/* Server reads for /manager/library, mirroring the mobile app's
   lib/library-api.ts and lib/post-fill.ts. Ideas and references read from
   library_items with the service client scoped by company_id; Our posts
   read live through the library_our_posts RPC, which scopes itself through
   auth.uid(), so that one call uses the signed in manager's session. */

import { cache } from "react";

import type { Database, Tables } from "@/lib/supabase/database.types";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";

export type LibraryItem = Tables<"library_items">;
export type LibrarySource = "idea" | "reference";
export type LibraryUsedFilter = "new" | "made";

export type OurPost =
  Database["public"]["Functions"]["library_our_posts"]["Returns"][number];
export type OurPostsSort = "top" | "recent";

export const LIBRARY_PAGE_SIZE = 50;

export interface LibraryCounts {
  unused: number;
  used: number;
}

export interface CreatorOption {
  id: string;
  full_name: string | null;
}

/** Unused and used counts for one source, for the sub tab pills. */
export async function countLibraryItems(
  companyId: string,
  source: LibrarySource,
): Promise<LibraryCounts> {
  const supabase = createServiceClient();
  const base = () =>
    supabase
      .from("library_items")
      .select("id", { count: "exact", head: true })
      .eq("company_id", companyId)
      .eq("source", source);
  const [unused, used] = await Promise.all([
    base().eq("used_count", 0),
    base().gt("used_count", 0),
  ]);
  if (unused.error) throw unused.error;
  if (used.error) throw used.error;
  return { unused: unused.count ?? 0, used: used.count ?? 0 };
}

export async function listLibraryItems(params: {
  companyId: string;
  source: LibrarySource;
  search?: string;
  used?: LibraryUsedFilter;
  limit?: number;
  offset?: number;
}): Promise<LibraryItem[]> {
  const supabase = createServiceClient();
  const offset = params.offset ?? 0;
  let query = supabase
    .from("library_items")
    .select("*")
    .eq("company_id", params.companyId)
    .eq("source", params.source)
    .order("created_at", { ascending: false })
    .range(offset, offset + (params.limit ?? LIBRARY_PAGE_SIZE) - 1);
  const search = params.search?.trim();
  if (search) query = query.or(`text.ilike.%${search}%,url.ilike.%${search}%`);
  if (params.used === "new") query = query.eq("used_count", 0);
  if (params.used === "made") query = query.gt("used_count", 0);
  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

/** library_our_posts with the manager's session: the RPC scopes by auth.uid(). */
export async function listOurPosts(params: {
  days?: number | null;
  creatorId?: string;
  postTypeId?: string;
  search?: string;
  sort?: OurPostsSort;
  limit?: number;
  offset?: number;
}): Promise<OurPost[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("library_our_posts", {
    p_days: params.days === null ? undefined : (params.days ?? 60),
    p_creator_id: params.creatorId,
    p_post_type_id: params.postTypeId,
    p_search: params.search?.trim() || undefined,
    p_sort: params.sort ?? "top",
    p_limit: params.limit ?? LIBRARY_PAGE_SIZE,
    p_offset: params.offset ?? 0,
  });
  if (error) throw error;
  return data ?? [];
}

/** Creator filter options for the Our posts filter, same population as mobile. */
export const listCreatorOptions = cache(
  async (companyId: string): Promise<CreatorOption[]> => {
    const supabase = createServiceClient();
    const { data, error } = await supabase
      .from("company_roster")
      .select("id, full_name")
      .eq("company_id", companyId)
      .or("member_role.eq.creator,can_create.eq.true")
      .order("full_name");
    if (error) throw error;
    return data ?? [];
  },
);

