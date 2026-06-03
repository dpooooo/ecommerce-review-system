import { NextResponse } from "next/server";
import { buildReportSchema } from "@/lib/analysis/report/reportBuilder";
import { getSessionUser } from "@/lib/auth/session";
import { buildReportFromDb } from "@/lib/analysis/report/dbReportBuilder";

export async function POST(request: Request) {
  const user = await getSessionUser();
  if (user) {
    const body = await request.json().catch(() => ({}));
    return NextResponse.json(
      await buildReportFromDb({
        userId: user.id,
        shopId: body.shopId,
        currentStart: body.currentStart,
        currentEnd: body.currentEnd,
        previousStart: body.previousStart,
        previousEnd: body.previousEnd,
        persist: true
      })
    );
  }
  return NextResponse.json(buildReportSchema({ reportId: crypto.randomUUID() }));
}
