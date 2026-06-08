import { AnomalyList } from "@/components/dashboard/AnomalyList";
import { ActionList } from "@/components/dashboard/ActionList";
import { Card } from "@/components/common/Card";
import { AttributionInsightSection } from "@/components/reports/AttributionInsightSection";
import { ReportActions } from "@/components/reports/ReportActions";
import { ReportInsightCharts } from "@/components/reports/ReportInsightCharts";
import { ReportInsightSummary } from "@/components/reports/ReportInsightSummary";
import { ReportModule } from "@/components/reports/ReportModule";
import { buildReportSchema } from "@/lib/analysis/report/reportBuilder";
import type { ReportSchema } from "@/lib/analysis/types";
import { getSessionUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";

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
  const visibleModules = report.modules.filter((module) => module.key !== "gmv_attribution" && module.key !== "gsv_attribution");
  const moduleLinks = [
    { href: "#section-attribution-insight", label: "GMV / GSV归因分析", index: "01" },
    ...visibleModules.map((module, index) => ({
      href: `#section-${module.key}`,
      label: module.title,
      index: String(index + 2).padStart(2, "0")
    }))
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-950">{report.title}</h1>
          <p className="mt-1 text-sm text-slate-500">
            {report.shop.name} · {report.period.current.start} 至 {report.period.current.end}
          </p>
        </div>
        <ReportActions report={report} />
      </div>

      <ReportInsightSummary report={report} />
      <ReportInsightCharts report={report} showAttribution={false} />
      <AttributionInsightSection report={report} />

      <div className="space-y-4">
        <Card className="p-5">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-950">专题诊断</h2>
              <p className="mt-1 text-sm text-slate-500">按趋势、商品和推广拆解本期表现，保留可追溯的明细证据。</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {moduleLinks.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className="inline-flex items-center gap-2 rounded-md border border-slate-200 px-3 py-2 text-xs font-medium text-slate-600 hover:border-brand-200 hover:bg-brand-50 hover:text-brand-700"
                >
                  <span className="text-slate-400">{item.index}</span>
                  {item.label}
                </a>
              ))}
            </div>
          </div>
        </Card>
        {visibleModules.map((module, index) => (
          <ReportModule key={module.key} module={module} index={index + 2} />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <Card className="p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold text-slate-950">异常中心</h2>
            <span className="rounded-md bg-red-50 px-2 py-1 text-xs font-semibold text-red-600">
              {report.anomalies.length} 项
            </span>
          </div>
          <AnomalyList items={report.anomalies} />
        </Card>
        <Card className="p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold text-slate-950">行动清单</h2>
            <span className="rounded-md bg-brand-50 px-2 py-1 text-xs font-semibold text-brand-700">
              {report.actionItems.length} 项
            </span>
          </div>
          <ActionList items={report.actionItems} />
        </Card>
      </div>

      <Card className="p-5">
        <h2 className="font-semibold text-slate-950">总结建议</h2>
        <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-3">
          {report.executiveSummary.topActions.map((action) => (
            <div key={action} className="rounded-md border border-brand-100 bg-brand-50 p-3 text-sm leading-6 text-brand-700">
              {action}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
