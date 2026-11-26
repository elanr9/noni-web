/* Relays the apply conversation (edge function apply-chat) to the browser,
   streaming the reply as it is written. Signed in, it runs as the user.
   Signed out, a creator chats as a guest: the answers are saved under a
   guest id kept in an httpOnly cookie and move to their account when they
   sign in with Google at the end (/apply claims them). */

import { cookies } from "next/headers";

import { GUEST_COOKIE, isGuestId } from "@/lib/apply-guest";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const URL_ = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/apply-chat`;

function relay(upstream: Response): Response {
  return new Response(upstream.body, {
    status: upstream.status,
    headers: {
      "Content-Type": upstream.headers.get("Content-Type") ?? "application/json",
      "Cache-Control": "no-cache, no-transform",
      "X-Accel-Buffering": "no",
    },
  });
}

export async function POST(req: Request): Promise<Response> {
  const body = await req.text();
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (session) {
    return relay(
      await fetch(URL_, {
        method: "POST",
        headers: { Authorization: `Bearer ${session.access_token}`, "Content-Type": "application/json" },
        body,
      }),
    );
  }

  let parsed: { action?: string; kind?: string } & Record<string, unknown>;
  try {
    parsed = JSON.parse(body) as typeof parsed;
  } catch {
    return Response.json({ error: "Bad request." }, { status: 400 });
  }
  if (parsed.kind !== "creator" || (parsed.action !== "state" && parsed.action !== "turn")) {
    return Response.json({ error: "Not signed in." }, { status: 401 });
  }

  const jar = await cookies();
  let guest = jar.get(GUEST_COOKIE)?.value ?? "";
  if (!isGuestId(guest)) {
    guest = crypto.randomUUID();
    jar.set(GUEST_COOKIE, guest, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 60 * 60 * 24 * 14 });
  }
  const headers = {
    Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
    "x-noni-guest": guest,
    "Content-Type": "application/json",
  };
  /* Opening the chat makes the draft if there is none (start is a no-op otherwise). */
  if (parsed.action === "state") {
    const started = await fetch(URL_, { method: "POST", headers, body: JSON.stringify({ ...parsed, action: "start" }) });
    if (!started.ok) return relay(started);
  }
  return relay(await fetch(URL_, { method: "POST", headers, body }));
}
