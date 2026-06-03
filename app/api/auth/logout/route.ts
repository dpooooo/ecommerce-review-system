import { NextResponse } from "next/server";
import { clearSession } from "@/lib/auth/session";
import { appUrl } from "@/lib/url";

export async function POST(request: Request) {
  await clearSession();
  return NextResponse.redirect(appUrl("/login", request.url));
}
