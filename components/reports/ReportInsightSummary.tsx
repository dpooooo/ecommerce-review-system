import { AlertTriangle, ArrowDownRight, ArrowUpRight, CheckCircle2, Lightbulb, Target } from "lucide-react";
import type { ReactNode } from "react";
import { Card } from "@/components/common/Card";
import type { MetricComparison, ReportSchema } from "@/lib/analysis/types";
import { formatMoney, formatNumber, formatPercent } from "@/lib/format";

const moneyMetricKeys = new Set(["gmv", "gsv", "aov", "refundAmount", "spend"]);
const percentMetricKeys = new Set(["conversionRate", "refundRate"]);

function metricValue(key: string, value: number) {
  if (percentMetricKeys.has(key)) return formatPercent(value);
  if (moneyMetricKeys.has(key)) return formatMoney(value);
  if (key === "roi") return value.toFixed(2);
  return formatNumber(value);
}

function metricTone(metric: MetricComparison) {
  const refundMetric = metric.key === "refundAmount" || metric.key === "refundRate";
  if (refundMetric) {
    if (metric.trend === "up") return "text-red-600 bg-red-50";
    if (metric.trend === "down") return "text-emerald-600 bg-emerald-50";
    return "text-slate-500 bg-slate-50";
  }
  if (metric.trend === "up") return "text-emerald-600 bg-emerald-50";
  if (metric.trend === "down") return "text-red-600 bg-red-50";
  return "text-slate-500 bg-slate-50";
}

function isRiskMetric(metric: MetricComparison) {
  if (metric.key === "refundAmount" || metric.key === "refundRate") return metric.trend === "up";
  return metric.trend === "down";
}

function statusMeta(status: ReportSchema["executiveSummary"]["status"]) {
  if (status === "risk") return { text: "高风险", className: "bg-red-50 text-red-700" };
  if (status === "warning") return { text: "需关注", className: "bg-amber-50 text-amber-700" };
  return { text: "经营正常", className: "bg-emerald-50 text-emerald-700" };
}

function SectionList({
  title,
  icon,
  items,
  tone
}: {
  title: string;
  icon: ReactNode;
  items: string[];
  tone: "brand" | "amber" | "emerald";
}) {
  const toneClass = tone === "amber" ? "bg-amber-50 text-amber-700" : tone === "emerald" ? "bg-emerald-50 text-emerald-700" : "bg-brand-50 text-brand-700";
  return (
    <div className="rounded-md border border-slate-200 bg-white p-4">
      <div className="flex items-center gap-2 text-sm font-semibold text-slate-950">
        <span className={`rounded-md p-1.5 ${toneClass}`}>{icon}</span>
        {title}
      </div>
      <div className="mt-3 space-y-2">
        {items.slice(0, 3).map((item) => (
          <div key={item} className="text-sm leading-6 text-slate-600">
            {item}
          </div>
        ))}
      </div>
    </div>
  );
}

export function ReportInsightSummary({ report }: { report: ReportSchema }) {
  const riskMetrics = report.metrics.filter(isRiskMetric).slice(0, 3);
  const status = statusMeta(report.executiveSummary.status);
  const riskItems = riskMetrics.length
    ? riskMetrics.map((metric) => `${metric.name} ${metric.displayChange}`)
    : ["暂无高优先级指标风险，继续观察转化、退款和投放效率。"];

  return (
    <section className="space-y-5">
      <Card className="overflow-hidden">
        <div className="border-b border-slate-200 bg-white p-5">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
            <div className="max-w-4xl">
              <div className="flex flex-wrap items-center gap-2">
                <span className={`inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-semibold ${status.className}`}>
                  <CheckCircle2 size={14} />
                  {status.text}
                </span>
                <span className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                  {report.shop.name} · {report.period.current.start} 至 {report.period.current.end}
                </span>
              </div>
              <h2 className="mt-4 text-2xl font-semibold leading-tight text-slate-950">经营结论总览</h2>
              <p className="mt-3 max-w-5xl text-base leading-7 text-slate-700">
                {report.executiveSummary.gmvSentence}{report.executiveSummary.gsvSentence}
              </p>
            </div>
            <div className="grid min-w-64 grid-cols-2 gap-3 text-center">
              <div className="rounded-md bg-slate-50 p-3">
                <div className="text-2xl font-semibold text-slate-950">{report.anomalies.length}</div>
                <div className="mt-1 text-xs text-slate-500">异常项</div>
              </div>
              <div className="rounded-md bg-slate-50 p-3">
                <div className="text-2xl font-semibold text-slate-950">{report.actionItems.length}</div>
                <div className="mt-1 text-xs text-slate-500">行动项</div>
              </div>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4 bg-slate-50/70 p-5 xl:grid-cols-3">
          <SectionList title="增长拉动" icon={<Lightbulb size={16} />} items={report.executiveSummary.topReasons} tone="emerald" />
          <SectionList title="风险提醒" icon={<AlertTriangle size={16} />} items={riskItems} tone="amber" />
          <SectionList title="下一步动作" icon={<Target size={16} />} items={report.executiveSummary.topActions} tone="brand" />
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {report.metrics.map((metric) => {
          const Icon = metric.trend === "up" ? ArrowUpRight : metric.trend === "down" ? ArrowDownRight : CheckCircle2;
          return (
            <div key={metric.key} className="rounded-md border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="truncate text-sm text-slate-500">{metric.name}</div>
                  <div className="mt-2 text-2xl font-semibold text-slate-950">{metricValue(metric.key, metric.current)}</div>
                </div>
                <div className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-semibold ${metricTone(metric)}`}>
                  <Icon size={14} />
                  {metric.displayChange}
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
                <span>对比期</span>
                <span>{metricValue(metric.key, metric.previous)}</span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
