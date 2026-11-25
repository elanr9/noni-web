/* Where Noni's own sign-in emails land (email-sign-in edge function). The
   one-time token is checked here on our domain, which sets the session
   cookies, then the browser goes on to `next`. */

import { type NextRequest, NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const url = request.nextUrl;
  const tokenHash = url.searchParams.get("token_hash");
  const rawNext = url.searchParams.get("next") ?? "/dash";
  const next = rawNext.startsWith("/") && !rawNext.startsWith("//") ? rawNext : "/dash";

  if (tokenHash) {
    const supabase = await createClient();
    const { error } = await supabase.auth.verifyOtp({ type: "magiclink", token_hash: tokenHash });
    if (!error) return NextResponse.redirect(new URL(next, request.url));
  }

  const back = new URL("/login", request.url);
  back.searchParams.set("error", "auth");
  back.searchParams.set("error_description", "That sign-in link has expired or was already used. Get a new one below.");
  if (next !== "/dash") back.searchParams.set("next", next);
  return NextResponse.redirect(back);
}
