"use server";

import { createClient } from "@/lib/supabase/server";

/* One thread per marketplace application (migration 164). The database
   functions check the caller is the creator or a manager of the company, so
   every call runs as the signed-in user. */

export type ThreadMessage = { id: string; from_company: boolean; mine: boolean; body: string; created_at: string; read_at: string | null };

type Result<T> = { ok: true; data: T } | { ok: false; error: string };

const plain = (m: string) => m.replace(/^.*?ERROR:\s*/i, "") || "Something went wrong";

export async function loadMessages(applicationId: string): Promise<Result<ThreadMessage[]>> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("application_messages" as never, { p_application: applicationId } as never);
  if (error) return { ok: false, error: plain(error.message) };
  return { ok: true, data: (data ?? []) as unknown as ThreadMessage[] };
}

export async function sendMessage(applicationId: string, body: string): Promise<Result<ThreadMessage>> {
  const text = body.trim().slice(0, 1000);
  if (!text) return { ok: false, error: "Write a message first" };
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("send_application_message" as never, { p_application: applicationId, p_body: text } as never);
  if (error) return { ok: false, error: plain(error.message) };
  const r = data as unknown as { id: string; from_company: boolean; body: string; created_at: string };
  return { ok: true, data: { id: r.id, from_company: r.from_company, mine: true, body: r.body, created_at: r.created_at, read_at: null } };
}

/** Unread messages from the other side, by application id. */
export async function loadUnread(applicationIds: string[]): Promise<Record<string, number>> {
  if (applicationIds.length === 0) return {};
  const supabase = await createClient();
  const { data } = await supabase.rpc("application_unread" as never, { p_applications: applicationIds } as never);
  const out: Record<string, number> = {};
  for (const r of (data ?? []) as unknown as { application_id: string; unread: number }[]) out[r.application_id] = r.unread;
  return out;
}
