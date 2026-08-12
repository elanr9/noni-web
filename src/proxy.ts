import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({
    request: { headers: request.headers },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          response = NextResponse.next({
            request: { headers: request.headers },
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  /* TEMPORARY QA BYPASS — mirrors the /admin layout envs so /admin and
     /onboarding can be QA'd without a session. Remove before finishing. */
  const adminQaBypass =
    process.env.NODE_ENV === "development" &&
    process.env.ADMIN_QA_BYPASS === "1";

  if (request.nextUrl.pathname.startsWith("/admin") && !user && !adminQaBypass) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", "/admin");
    return NextResponse.redirect(url);
  }

  /* TEMPORARY QA BYPASS — mirrors the /ops layout envs. Remove before finishing. */
  const opsQaBypass =
    process.env.NODE_ENV === "development" &&
    process.env.OPS_QA_BYPASS === "1";

  if (request.nextUrl.pathname.startsWith("/ops") && !user && !opsQaBypass) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", "/ops");
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
