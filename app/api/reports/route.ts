import { NextResponse } from "next/server";
import { buildReportSchema } from "@/lib/analysis/report/reportBuilder";

export async function GET() {
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
