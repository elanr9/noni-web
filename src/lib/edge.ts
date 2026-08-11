import { createClient } from "@/lib/supabase/server";

export type CompanyInvite = {
  id: string;
  company_id: string;
  email: string;
  token: string;
  expires_at: string;
  created_at: string;
  accepted_at: string | null;
};

export type InviteResponse = { invite: CompanyInvite };

export type AcceptInviteResponse = { ok: true; company_id: string };

export type CreateCompanyResponse = {
  company: {
    id: string;
    name: string;
    slug: string;
    website: string | null;
    created_at: string;
  };
};

export type EdgeResult<T> =
  | { data: T; error: null }
  | { data: null; error: string };

// Calls a Supabase edge function with the current user's access token.
export async function callEdgeFunction<T>(
  name: string,
  body: Record<string, unknown>,
): Promise<EdgeResult<T>> {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) return { data: null, error: "Not signed in." };

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/${name}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${session.access_token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    },
  );

  const json: unknown = await res.json().catch(() => null);
  if (!res.ok) {
    const message =
      json !== null &&
      typeof json === "object" &&
      "error" in json &&
      typeof (json as { error: unknown }).error === "string"
        ? (json as { error: string }).error
        : `Request failed with status ${res.status}.`;
    return { data: null, error: message };
  }
  return { data: json as T, error: null };
}
