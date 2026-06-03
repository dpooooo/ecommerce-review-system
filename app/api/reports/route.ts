import { NextResponse } from "next/server";
import { buildReportSchema } from "@/lib/analysis/report/reportBuilder";
import { getSessionUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";

export async function GET() {
  const user = await getSessionUser();
  if (user) {
    const reports = await prisma.analysisReport.findMany({
      where: { userId: user.id },
      include: { shop: true },
      orderBy: { createdAt: "desc" },
      take: 50
    });
    return NextResponse.json({
      reports: reports.map((report) => ({
        id: report.id,
        title: report.title,
        shop: { id: report.shop.id, name: report.shop.name, platform: report.shop.platform },
        period: {
          current: { start: report.currentStart.toISOString().slice(0, 10), end: report.currentEnd.toISOString().slice(0, 10) },
          previous: {
            start: report.previousStart?.toISOString().slice(0, 10),
            end: report.previousEnd?.toISOString().slice(0, 10)
          }
        },
        createdAt: report.createdAt.toISOString()
      }))
    });
  }
  const report = buildReportSchema();
  return NextResponse.json({
    reports: [
      {
        id: report.reportId,
        title: report.title,
        shop: report.shop,
        period: report.period,
        createdAt: new Date().toISOString()
      }
    ]
  });
}
