import { buildReportFromDb } from "@/lib/analysis/report/dbReportBuilder";
import { buildReportSchema } from "@/lib/analysis/report/reportBuilder";
import type { ReportSchema } from "@/lib/analysis/types";
import { prisma } from "@/lib/db/prisma";

function isoDate(value: Date | null | undefined) {
  return value ? value.toISOString().slice(0, 10) : undefined;
}

function mapActionItems(items: Array<{
  id: string;
  priority: string;
  title: string;
  action: string;
  targetMetric: string;
  estimatedImpact: string;
  owner: string | null;
  dueDate: Date | null;
  status: string;
  sourceEvidence: unknown;
}>) {
  return items.map((item) => ({
    id: item.id,
    priority: item.priority,
    title: item.title,
    action: item.action,
    targetMetric: item.targetMetric,
    estimatedImpact: item.estimatedImpact,
    owner: item.owner,
    dueDate: item.dueDate?.toISOString(),
    status: item.status,
    sourceEvidence: item.sourceEvidence
  }));
}

export async function loadFreshReport(id: string, userId?: string): Promise<ReportSchema> {
  if (!userId) return buildReportSchema({ reportId: id });

  const savedReport = await prisma.analysisReport.findFirst({
    where: { id, userId },
    include: { actionItems: true }
  });

  if (!savedReport) return buildReportSchema({ reportId: id });

  const report = await buildReportFromDb({
    userId,
    shopId: savedReport.shopId,
    currentStart: isoDate(savedReport.currentStart),
    currentEnd: isoDate(savedReport.currentEnd),
    previousStart: isoDate(savedReport.previousStart),
    previousEnd: isoDate(savedReport.previousEnd)
  });

  report.reportId = savedReport.id;
  report.title = savedReport.title;
  if (savedReport.actionItems.length) {
    report.actionItems = mapActionItems(savedReport.actionItems);
  }

  return report;
}

export async function loadSharedReport(shareToken: string): Promise<ReportSchema | null> {
  const rows = await prisma.$queryRaw<Array<{
    id: string;
    userId: string;
    shopId: string;
    title: string;
    currentStart: Date;
    currentEnd: Date;
    previousStart: Date | null;
    previousEnd: Date | null;
  }>>`
    SELECT "id", "userId", "shopId", "title", "currentStart", "currentEnd", "previousStart", "previousEnd"
    FROM "AnalysisReport"
    WHERE "shareToken" = ${shareToken} AND "sharedAt" IS NOT NULL
    LIMIT 1
  `;
  const savedReport = rows[0];

  if (!savedReport) return null;

  const report = await buildReportFromDb({
    userId: savedReport.userId,
    shopId: savedReport.shopId,
    currentStart: isoDate(savedReport.currentStart),
    currentEnd: isoDate(savedReport.currentEnd),
    previousStart: isoDate(savedReport.previousStart),
    previousEnd: isoDate(savedReport.previousEnd)
  });

  report.reportId = savedReport.id;
  report.title = savedReport.title;
  const actionItems = await prisma.actionItem.findMany({ where: { reportId: savedReport.id } });
  if (actionItems.length) {
    report.actionItems = mapActionItems(actionItems);
  }
  return report;
}
