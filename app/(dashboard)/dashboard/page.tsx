import { AnomalyList } from "@/components/dashboard/AnomalyList";
import { ActionList } from "@/components/dashboard/ActionList";
import { Card } from "@/components/common/Card";
import { ReportInsightCharts } from "@/components/reports/ReportInsightCharts";
import { ReportInsightSummary } from "@/components/reports/ReportInsightSummary";
import { buildReportSchema } from "@/lib/analysis/report/reportBuilder";
import { buildReportFromDb } from "@/lib/analysis/report/dbReportBuilder";
import { getSessionUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";

function validDate(value?: string) {
  if (!value) return undefined;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : value;
}

function previousRange(start?: string, end?: string) {
  const currentStart = validDate(start);
  const currentEnd = validDate(end);
  if (!currentStart || !currentEnd) return {};

  const startDate = new Date(currentStart);
  const endDate = new Date(currentEnd);
  if (startDate > endDate) return {};

  const dayMs = 24 * 60 * 60 * 1000;
  const days = Math.max(1, Math.round((endDate.getTime() - startDate.getTime()) / dayMs) + 1);
  const previousEnd = new Date(startDate);
  previousEnd.setDate(previousEnd.getDate() - 1);
  const previousStart = new Date(previousEnd);
  previousStart.setDate(previousStart.getDate() - days + 1);

  return {
    previousStart: previousStart.toISOString().slice(0, 10),
    previousEnd: previousEnd.toISOString().slice(0, 10)
  };
}

export default async function DashboardPage({
  searchParams
}: {
  searchParams: Promise<{ shopId?: string; start?: string; end?: string; compareStart?: string; compareEnd?: string }>;
}) {
  const user = await getSessionUser();
  const params = await searchParams;
  const currentStart = validDate(params.start);
  const currentEnd = validDate(params.end);
  const inferredPrevious = previousRange(currentStart, currentEnd);
  const report = user
    ? await buildReportFromDb({
        userId: user.id,
        shopId: params.shopId || undefined,
        currentStart,
        currentEnd,
        previousStart: validDate(params.compareStart) || inferredPrevious.previousStart,
        previousEnd: validDate(params.compareEnd) || inferredPrevious.previousEnd
      })
    : buildReportSchema();

  if (user) {
    const shops = await prisma.shop.findMany({ where: { userId: user.id }, select: { id: true } });
    const storedActionItems = await prisma.actionItem.findMany({
      where: { shopId: { in: shops.map((shop) => shop.id) } },
      orderBy: [{ priority: "asc" }, { createdAt: "desc" }],
      take: 8
    });
    if (storedActionItems.length) {
      report.actionItems = storedActionItems.map((item) => ({
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
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-950">经营驾驶舱</h1>
          <p className="mt-1 text-sm text-slate-500">从结果、归因、异常到行动，形成本期经营复盘闭环。</p>
        </div>
        <div className="text-sm text-slate-500">
          {report.period.current.start} 至 {report.period.current.end}
        </div>
      </div>

      <ReportInsightSummary report={report} />
      <ReportInsightCharts report={report} />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <Card className="p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold text-slate-950">异常中心</h2>
            <span className="rounded-md bg-red-50 px-2 py-1 text-xs font-semibold text-red-600">
              {report.anomalies.length} 项待处理
            </span>
          </div>
          <AnomalyList items={report.anomalies.slice(0, 5)} />
        </Card>
        <Card className="p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold text-slate-950">行动清单</h2>
            <span className="rounded-md bg-brand-50 px-2 py-1 text-xs font-semibold text-brand-700">
              {report.actionItems.length} 项
            </span>
          </div>
          <ActionList items={report.actionItems.slice(0, 6)} />
        </Card>
      </div>
    </div>
  );
}
