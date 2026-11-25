import { notFound, redirect } from "next/navigation";

import { JoinCard, JoinDone } from "@/components/join/JoinCard";
import { companyLogoUrl } from "@/lib/company-logo";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";

export const dynamic = "force-dynamic";

type JoinCompany = { id: string; name: string; slug: string; logo_path: string | null; color: string | null };

/* A company's join link (/join/<slug>), sent in Scout messages with the
   creator's code (?c=). Signed out: sign up with Google, back here. Signed in
   with a creator profile: joined (with a code) or applied (without). Signed
   in with no creator profile yet: the creator chat first, then back here
   (the noni_join cookie, read on /apply). */
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { data } = await createServiceClient().rpc("scout_join_page", { p_slug: slug });
  const c = data as JoinCompany | null;
  return { title: c ? `Post for ${c.name}` : "Noni" };
}

export default async function JoinPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { slug } = await params;
  const sp = await searchParams;
  const code = typeof sp.c === "string" ? sp.c.replace(/[^a-z0-9]/gi, "").slice(0, 16) : "";
  const { data } = await createServiceClient().rpc("scout_join_page", { p_slug: slug });
  const company = data as JoinCompany | null;
  if (!company) notFound();

  const here = `/join/${company.slug}${code ? `?c=${code}` : ""}`;
  const brand = { name: company.name, logo: companyLogoUrl(company.logo_path), color: company.color ?? "#1BA6EE" };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return <JoinCard brand={brand} next={here} />;

  const { data: creator } = await createServiceClient()
    .from("creator_profiles")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();
  if (!creator) {
    redirect(`/join/${company.slug}/go${code ? `?c=${code}` : ""}`);
  }

  const { data: claimed, error } = await supabase.rpc("scout_claim", { p_slug: company.slug, p_code: code || null });
  if (error) return <JoinCard brand={brand} next={here} error="That link did not work. Try again." />;
  const status = (claimed as { status: "joined" | "applied" }).status;
  return <JoinDone brand={brand} joined={status === "joined"} email={user.email ?? ""} />;
}
