import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getSessionProfile, isCompanyAdmin, isPlatformAdmin } from "@/lib/auth";
import { PublishForm } from "./PublishForm";

export const metadata = { title: "Publish time · Noni" };

export default async function PublishPage() {
  const { userId, profile } = await getSessionProfile();
  if (!userId) redirect("/login?next=/admin/publish");
  if (!isCompanyAdmin(profile) && !isPlatformAdmin(profile)) redirect("/admin");

  const supabase = await createClient();
  const { data: company } = await supabase
    .from("companies")
    .select("settings")
    .eq("id", profile!.company_id!)
    .maybeSingle();

  const publish = (company?.settings as { publish?: { day?: string; time?: string } } | null)
    ?.publish;

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="display text-3xl font-semibold text-ink">Publish time</h1>
      <p className="mt-1 text-[15px] text-muted">
        The weekly moment your approved posts go live and creators get notified.
        Default is Sunday 8PM Eastern.
      </p>
      <div className="mt-6">
        <PublishForm
          initialDay={publish?.day ?? "sunday"}
          initialTime={publish?.time ?? "20:00"}
        />
      </div>
    </div>
  );
}
