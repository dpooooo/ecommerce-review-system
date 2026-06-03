import { NextResponse } from "next/server";
import { buildReportSchema } from "@/lib/analysis/report/reportBuilder";
import { getSessionUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser();
  const { id } = await params;
  if (user) {
    const report = await prisma.analysisReport.findFirst({
      where: { id, userId: user.id }
    });
    if (report) return NextResponse.json(report.reportJson);
  }
  return NextResponse.json(buildReportSchema({ reportId: id }));
}
