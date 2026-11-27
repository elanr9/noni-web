import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";

/* A signed agreement with its signature record. Row level security decides
   who may read it: the creator who signed, a manager of the company, or the
   platform account. Names are read with the service client after that. */

export interface SignedAgreement {
  id: string;
  title: string;
  body: string;
  version: number | null;
  sha256: string | null;
  signedName: string;
  signedAt: string;
  signedIp: string | null;
  signedAgent: string | null;
  companyName: string;
  status: string;
  acceptedAt: string | null;
  acceptedBy: string | null;
}

export async function getSignedAgreement(id: string): Promise<SignedAgreement | null> {
  if (!/^[0-9a-f-]{36}$/i.test(id)) return null;
  const supabase = await createClient();
  const { data } = await supabase
    .from("marketplace_applications" as never)
    .select(
      "id, company_id, status, contract_title, contract_body, contract_version, contract_sha256, signed_name, signed_at, signed_ip, signed_user_agent, decided_by, decided_at",
    )
    .eq("id", id)
    .maybeSingle();
  const r = data as {
    id: string;
    company_id: string;
    status: string;
    contract_title: string | null;
    contract_body: string | null;
    contract_version: number | null;
    contract_sha256: string | null;
    signed_name: string | null;
    signed_at: string | null;
    signed_ip: string | null;
    signed_user_agent: string | null;
    decided_by: string | null;
    decided_at: string | null;
  } | null;
  if (!r || !r.signed_at || !r.contract_body) return null;

  const service = createServiceClient();
  const accepted = r.status === "accepted";
  const [{ data: company }, { data: decider }] = await Promise.all([
    service.from("companies").select("name").eq("id", r.company_id).maybeSingle(),
    accepted && r.decided_by
      ? service.from("profiles").select("full_name").eq("id", r.decided_by).maybeSingle()
      : Promise.resolve({ data: null }),
  ]);

  return {
    id: r.id,
    title: r.contract_title?.trim() || "Creator agreement",
    body: r.contract_body.trim(),
    version: r.contract_version,
    sha256: r.contract_sha256,
    signedName: r.signed_name ?? "",
    signedAt: r.signed_at,
    signedIp: r.signed_ip,
    signedAgent: r.signed_user_agent,
    companyName: (company?.name as string | undefined) ?? "Company",
    status: r.status,
    acceptedAt: accepted ? r.decided_at : null,
    acceptedBy: accepted ? ((decider?.full_name as string | undefined) ?? null) : null,
  };
}
