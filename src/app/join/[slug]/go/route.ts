import { NextResponse, type NextRequest } from "next/server";

/* Signed in with no creator profile yet: remember the join link, then the
   creator chat. /apply sends them back here once they are approved. */
export async function GET(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const code = (request.nextUrl.searchParams.get("c") ?? "").replace(/[^a-z0-9]/gi, "").slice(0, 16);
  const safeSlug = slug.replace(/[^a-z0-9-]/gi, "").slice(0, 80);
  const back = `/join/${safeSlug}${code ? `?c=${code}` : ""}`;
  const res = NextResponse.redirect(new URL("/apply?as=creator", request.url));
  res.cookies.set("noni_join", back, { path: "/", maxAge: 60 * 60 * 6, httpOnly: true, sameSite: "lax" });
  return res;
}
