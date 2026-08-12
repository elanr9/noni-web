import { getMemberPermissions, getSessionProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import {
  BrandBrain,
  type BrandDocData,
  type BrandProfileData,
} from "@/components/admin/BrandBrain";
import type { BrandDocKind } from "./actions";

type BrandProfileRow = {
  tone: string | null;
  audience: string | null;
  hashtag_bank: string[] | null;
  banned_phrases: string[] | null;
};

type BrandDocRow = {
  kind: BrandDocKind;
  content: string;
  updated_at: string | null;
};

export default async function BrandPage() {
  const { profile } = await getSessionProfile();
  const permissions = await getMemberPermissions(profile);
  const supabase = await createClient();

  const [{ data: brandRow }, { data: docRows }] = await Promise.all([
    supabase
      .from("brand_profiles")
      .select("tone, audience, hashtag_bank, banned_phrases")
      .eq("company_id", profile?.company_id ?? "")
      .maybeSingle<BrandProfileRow>(),
    supabase
      .from("brand_docs")
      .select("kind, content, updated_at")
      .eq("company_id", profile?.company_id ?? "")
      .returns<BrandDocRow[]>(),
  ]);

  const brand: BrandProfileData = {
    tone: brandRow?.tone ?? "",
    audience: brandRow?.audience ?? "",
    hashtagBank: brandRow?.hashtag_bank ?? [],
    bannedPhrases: brandRow?.banned_phrases ?? [],
  };
  const docs: BrandDocData[] = docRows ?? [];

  return (
    <div>
      <h1 className="display text-3xl font-semibold text-ink md:text-4xl">
        Brand Brain
      </h1>
      <p className="mt-1 text-[15px] text-muted">
        The brand knowledge every scrape, gate, and draft reads.
      </p>

      <BrandBrain
        profile={brand}
        docs={docs}
        canEdit={permissions.manage_brand}
      />
    </div>
  );
}
