import { getMemberPermissions, getSessionProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import {
  FeaturesManager,
  type ProductFeatureRow,
} from "@/components/admin/FeaturesManager";

export default async function FeaturesPage() {
  const { profile } = await getSessionProfile();
  const permissions = await getMemberPermissions(profile);
  const supabase = await createClient();

  // Without manage_features, RLS only returns approved rows.
  const { data } = await supabase
    .from("product_features")
    .select("id, name, what_it_does, claim, approved, rejected")
    .eq("company_id", profile?.company_id ?? "")
    .order("created_at", { ascending: true })
    .returns<ProductFeatureRow[]>();

  return (
    <div>
      <h1 className="display text-3xl font-semibold text-ink md:text-4xl">
        Features
      </h1>
      <p className="mt-1 text-[15px] text-muted">
        Approved claims are the only product points the plug can trace to. The
        model phrases them; it does not invent capability.
      </p>

      <FeaturesManager rows={data ?? []} canEdit={permissions.manage_features} />
    </div>
  );
}
