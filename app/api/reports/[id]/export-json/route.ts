import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { buildReportSchema } from "@/lib/analysis/report/reportBuilder";
import type { ReportSchema } from "@/lib/analysis/types";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getSessionUser();
  const savedReport = user ? await prisma.analysisReport.findFirst({ where: { id, userId: user.id } }) : null;
  const report = (savedReport?.reportJson as ReportSchema | undefined) || buildReportSchema({ reportId: id });
  return NextResponse.json(report, {
    headers: {
      "Content-Disposition": `attachment; filename="${encodeURIComponent(report.title)}.json"`
    }
  });
}
