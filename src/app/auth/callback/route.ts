import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Web login uses ?code= for the site session.
 * The Expo app uses ?app=1&code= — do NOT exchange that code here; the
 * in-app browser finishes on this URL and the mobile client exchanges it.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/admin";
  const forApp = searchParams.get("app") === "1";

  if (forApp && code) {
    const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Returning to Noni</title>
    <style>
      body { margin: 0; min-height: 100vh; display: grid; place-items: center;
        font-family: ui-sans-serif, system-ui, sans-serif; color: #0f1720;
        background: #fff; }
      p { font-size: 15px; opacity: 0.7; }
    </style>
  </head>
  <body>
    <p>Returning to Noni…</p>
  </body>
</html>`;
    return new NextResponse(html, {
      status: 200,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "no-store",
      },
    });
  }

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth`);
}
