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
