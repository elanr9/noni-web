/* Relays the apply conversation (edge function apply-chat) to the browser
   with the signed-in user's token, streaming the reply as it is written. */

import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function POST(req: Request): Promise<Response> {
  const body = await req.text();
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) return Response.json({ error: "Not signed in." }, { status: 401 });

  const upstream = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/apply-chat`, {
    method: "POST",
    headers: { Authorization: `Bearer ${session.access_token}`, "Content-Type": "application/json" },
    body,
  });
  return new Response(upstream.body, {
    status: upstream.status,
    headers: {
      "Content-Type": upstream.headers.get("Content-Type") ?? "application/json",
      "Cache-Control": "no-cache, no-transform",
      "X-Accel-Buffering": "no",
    },
  });
}
