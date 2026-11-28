/* Upload brief, from the browser: the files go to the brief-imports bucket,
   then the brief-import edge function names the posts one by one as it finds
   them (a stream) and writes each one on its own request, so every post of a
   brief is written at the same time. Same calls as the app's lib/brief-import. */

import { BRIEF_TYPES, uid, type BriefType, type FillResponse, type PlannedPost } from "@/lib/manager/brief-library";
import { createClient } from "@/lib/supabase/client";

export const MAX_SOURCES = 8;
export const MAX_FILE_BYTES = 24 * 1024 * 1024;
/** Posts written at once. Each is its own request. */
export const WRITE_PARALLEL = 10;
/** The first write reads the documents and leaves them cached; the rest start this long after it. */
export const WARM_MS = 2500;
const PLAN_TIMEOUT_MS = 150_000;
const WRITE_TIMEOUT_MS = 150_000;

export type PlanHandlers = {
  /** What could not be read, each with a sentence the manager can act on. */
  onSkipped?: (reasons: string[]) => void;
  /** A post was found. They arrive in order. */
  onPost?: (post: PlannedPost) => void;
  /** Posts can be written from now on. */
  onReady?: (importId: string) => void;
  signal?: AbortSignal;
};

/** The server calls, swappable so the dev preview can run the flow without a session. */
export type UploadApi = {
  plan: (companyId: string, files: File[], link: string, handlers: PlanHandlers) => Promise<{ importId: string; count: number }>;
  write: (importId: string, post: PlannedPost) => Promise<FillResponse>;
  finish: (importId: string) => void;
};

const FAILED = "That brief did not read. Try again.";
const text = (v: unknown): string => (typeof v === "string" ? v : "");

async function auth(): Promise<{ url: string; headers: Record<string, string> }> {
  const supabase = createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) throw new Error("Sign in again.");
  return {
    url: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/brief-import`,
    headers: { "Content-Type": "application/json", apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, Authorization: `Bearer ${session.access_token}` },
  };
}

function postOf(data: Record<string, unknown>): PlannedPost | null {
  const index = Number(data.index);
  const title = text(data.title).trim();
  if (!Number.isInteger(index) || index < 0 || !title) return null;
  const type = BRIEF_TYPES.includes(data.type as BriefType) ? (data.type as BriefType) : "Talking Head";
  return { index, title, type, origin: data.origin === "new" ? "new" : "document", angle: text(data.angle), hook: text(data.hook), source: text(data.source), direction: text(data.direction), link: text(data.link) };
}

/** One `event:` block of a text/event-stream body, or null when it carries no data. */
export function parseSseBlock(block: string): { event: string; data: Record<string, unknown> } | null {
  let event = "message";
  const data: string[] = [];
  for (const line of block.split("\n")) {
    if (line.startsWith(":")) continue;
    if (line.startsWith("event:")) event = line.slice(6).trim();
    else if (line.startsWith("data:")) data.push(line.slice(5).trimStart());
  }
  if (!data.length) return null;
  try {
    const parsed: unknown = JSON.parse(data.join("\n"));
    return parsed && typeof parsed === "object" ? { event, data: parsed as Record<string, unknown> } : null;
  } catch {
    return null;
  }
}

async function plan(companyId: string, files: File[], link: string, handlers: PlanHandlers): Promise<{ importId: string; count: number }> {
  const supabase = createClient();
  const uploaded = await Promise.all(
    files.map(async (file) => {
      const safe = file.name.replace(/[^A-Za-z0-9._-]+/g, "-").slice(-80) || "file";
      const path = `${companyId}/${uid()}-${safe}`;
      const { error } = await supabase.storage.from("brief-imports").upload(path, file, { contentType: file.type || "application/octet-stream" });
      if (error) throw new Error(`${file.name} did not upload.`);
      return { path, name: file.name, mime: file.type };
    }),
  );
  const { url, headers } = await auth();
  const stop = new AbortController();
  const timer = window.setTimeout(() => stop.abort(), PLAN_TIMEOUT_MS);
  const onAbort = () => stop.abort();
  handlers.signal?.addEventListener("abort", onAbort);
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { ...headers, Accept: "text/event-stream" },
      body: JSON.stringify({ action: "plan", files: uploaded, links: link ? [link] : [] }),
      signal: stop.signal,
    });
    if (!res.ok || !res.body) {
      const json = (await res.json().catch(() => null)) as { error?: unknown } | null;
      throw new Error(typeof json?.error === "string" && res.status < 500 ? json.error : FAILED);
    }
    let result: { importId: string; count: number } | null = null;
    let failure: string | null = null;
    const read = (block: string) => {
      const e = parseSseBlock(block);
      if (!e) return;
      if (e.event === "sources") {
        const skipped = Array.isArray(e.data.skipped) ? (e.data.skipped as { reason?: unknown }[]) : [];
        handlers.onSkipped?.(skipped.map((s) => text(s?.reason)).filter(Boolean));
      } else if (e.event === "post") {
        const post = postOf(e.data);
        if (post) handlers.onPost?.(post);
      } else if (e.event === "ready") handlers.onReady?.(text(e.data.import_id));
      else if (e.event === "result") result = { importId: text(e.data.import_id), count: Number(e.data.count) || 0 };
      else if (e.event === "error") failure = text(e.data.message) || FAILED;
    };
    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    for (;;) {
      const { value, done } = await reader.read();
      if (done) break;
      buffer = (buffer + decoder.decode(value, { stream: true })).replace(/\r\n/g, "\n");
      let cut = buffer.indexOf("\n\n");
      while (cut >= 0) {
        read(buffer.slice(0, cut));
        buffer = buffer.slice(cut + 2);
        cut = buffer.indexOf("\n\n");
      }
    }
    if (buffer.trim()) read(buffer);
    if (failure) throw new Error(failure);
    const done = result as { importId: string; count: number } | null;
    if (!done?.importId || !done.count) throw new Error("No posts came back from that brief. Try a different file.");
    return done;
  } catch (e) {
    if (stop.signal.aborted && !handlers.signal?.aborted) throw new Error("That took too long. Try again.");
    throw e;
  } finally {
    window.clearTimeout(timer);
    handlers.signal?.removeEventListener("abort", onAbort);
  }
}

async function write(importId: string, post: PlannedPost): Promise<FillResponse> {
  const { url, headers } = await auth();
  const res = await fetch(url, { method: "POST", headers, body: JSON.stringify({ action: "write", import_id: importId, post }), signal: AbortSignal.timeout(WRITE_TIMEOUT_MS) });
  const json = (await res.json().catch(() => null)) as FillResponse | null;
  if (!res.ok || !json || json.error || !json.clips?.length) throw new Error(json?.error || "That post came back empty.");
  return json;
}

function finish(importId: string): void {
  void auth()
    .then(({ url, headers }) => fetch(url, { method: "POST", headers, body: JSON.stringify({ action: "done", import_id: importId }), keepalive: true }))
    .catch(() => undefined);
}

export const UPLOAD_API: UploadApi = { plan, write, finish };
