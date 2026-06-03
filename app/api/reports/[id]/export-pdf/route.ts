import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { buildReportSchema } from "@/lib/analysis/report/reportBuilder";
import type { ReportSchema } from "@/lib/analysis/types";
import { reportToHtml } from "@/lib/analysis/report/reportExport";

async function exportReport(id: string) {
  const user = await getSessionUser();
  const savedReport = user ? await prisma.analysisReport.findFirst({ where: { id, userId: user.id } }) : null;
  const report = (savedReport?.reportJson as ReportSchema | undefined) || buildReportSchema({ reportId: id });
  return new NextResponse(reportToHtml(report), {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Content-Disposition": `attachment; filename="${encodeURIComponent(report.title)}.html"`
    }
  });
}

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return exportReport(id);
}

export async function POST(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return exportReport(id);
}
