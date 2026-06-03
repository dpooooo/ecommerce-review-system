import { NextResponse } from "next/server";
import { buildReportSchema } from "@/lib/analysis/report/reportBuilder";
import { getSessionUser } from "@/lib/auth/session";
import { buildReportFromDb } from "@/lib/analysis/report/dbReportBuilder";

export async function GET(request: Request) {
  const user = await getSessionUser();
  if (user) {
    const searchParams = new URL(request.url).searchParams;
    return NextResponse.json(
      await buildReportFromDb({
        userId: user.id,
        shopId: searchParams.get("shopId") || undefined,
        currentStart: searchParams.get("start") || undefined,
        currentEnd: searchParams.get("end") || undefined,
        previousStart: searchParams.get("compareStart") || undefined,
        previousEnd: searchParams.get("compareEnd") || undefined
      })
    );
  }
  return NextResponse.json(buildReportSchema());
}
