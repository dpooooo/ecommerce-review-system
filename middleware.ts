import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { appUrl } from "@/lib/url";

const protectedPrefixes = ["/dashboard", "/upload", "/data", "/reports", "/history", "/settings"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isProtected = protectedPrefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
  if (!isProtected) return NextResponse.next();

  const session = request.cookies.get("ers_session")?.value;
  if (session) return NextResponse.next();

  const loginUrl = appUrl("/login", request.url);
  loginUrl.searchParams.set("next", pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/dashboard/:path*", "/upload/:path*", "/data/:path*", "/reports/:path*", "/history/:path*", "/settings/:path*"]
};
