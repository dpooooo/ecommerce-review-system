import { AnomalyList } from "@/components/dashboard/AnomalyList";
import { ActionList } from "@/components/dashboard/ActionList";
import { Card } from "@/components/common/Card";
import { ReportActions } from "@/components/reports/ReportActions";
import { ReportModule } from "@/components/reports/ReportModule";
import { buildReportSchema } from "@/lib/analysis/report/reportBuilder";
import type { ReportSchema } from "@/lib/analysis/types";
import { getSessionUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { formatMoney, formatNumber, formatPercent } from "@/lib/format";

const moneyMetricKeys = new Set(["gmv", "gsv", "aov", "refundAmount", "spend"]);
const percentMetricKeys = new Set(["conversionRate", "refundRate"]);

function metricValue(key: string, value: number) {
  if (percentMetricKeys.has(key)) return formatPercent(value);
  if (moneyMetricKeys.has(key)) return formatMoney(value);
  if (key === "roi") return value.toFixed(2);
  return formatNumber(value);
}

async function loadReport(id: string): Promise<ReportSchema> {
  const user = await getSessionUser();
  if (!user) return buildReportSchema({ reportId: id });
  const report = await prisma.analysisReport.findFirst({
    where: { id, userId: user.id },
    include: { actionItems: true }
  });
  const schema = (report?.reportJson as ReportSchema | undefined) || buildReportSchema({ reportId: id });
  if (report?.actionItems.length) {
    schema.actionItems = report.actionItems.map((item) => ({
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
  return schema;
}

export default async function ReportDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const report = await loadReport(id);
  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-950">{report.title}</h1>
          <p className="mt-1 text-sm text-slate-500">{report.shop.name} · {report.period.current.start} 至 {report.period.current.end}</p>
        </div>
        <ReportActions report={report} />
      </div>
      <Card className="p-5">
        <h2 className="font-semibold">1. 经营总览</h2>
        <p className="mt-2 text-slate-700">{report.executiveSummary.gmvSentence}{report.executiveSummary.gsvSentence}</p>
        <div className="mt-4 grid grid-cols-3 gap-3">
          {report.executiveSummary.topReasons.map((reason) => <div key={reason} className="rounded-md bg-brand-50 p-3 text-sm text-brand-700">{reason}</div>)}
        </div>
      </Card>
      <Card className="p-5">
        <h2 className="mb-4 font-semibold">2. 核心指标</h2>
        <div className="grid grid-cols-5 gap-3">
          {report.metrics.map((metric) => (
            <div key={metric.key} className="rounded-md bg-slate-50 p-3">
              <div className="text-sm text-slate-500">{metric.name}</div>
              <div className="mt-1 text-lg font-semibold text-slate-950">{metricValue(metric.key, metric.current)}</div>
              <div className="mt-1 text-xs text-slate-500">同期 {metricValue(metric.key, metric.previous)}</div>
              <div className={metric.trend === "down" ? "mt-2 text-xs font-medium text-red-600" : "mt-2 text-xs font-medium text-emerald-600"}>{metric.displayChange}</div>
            </div>
          ))}
        </div>
      </Card>
      {report.modules.map((module, index) => <ReportModule key={module.key} module={module} index={index + 3} />)}
      <Card className="p-5"><h2 className="mb-4 font-semibold">9. 异常中心</h2><AnomalyList items={report.anomalies} /></Card>
      <Card className="p-5"><h2 className="mb-4 font-semibold">10. 行动清单</h2><ActionList items={report.actionItems} /></Card>
      <Card className="p-5">
        <h2 className="font-semibold">11. 总结建议</h2>
        <div className="mt-3 space-y-2">
          {report.executiveSummary.topActions.map((action) => <p key={action} className="text-sm text-slate-600">· {action}</p>)}
        </div>
      </Card>
    </div>
  );
}
