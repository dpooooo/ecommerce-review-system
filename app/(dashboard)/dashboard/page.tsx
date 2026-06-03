import { AlertTriangle, CheckCircle2 } from "lucide-react";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { TrendChart } from "@/components/dashboard/TrendChart";
import { AttributionBar } from "@/components/dashboard/AttributionBar";
import { AnomalyList } from "@/components/dashboard/AnomalyList";
import { ActionList } from "@/components/dashboard/ActionList";
import { Card } from "@/components/common/Card";
import { buildReportSchema } from "@/lib/analysis/report/reportBuilder";
import { getSessionUser } from "@/lib/auth/session";
import { buildReportFromDb } from "@/lib/analysis/report/dbReportBuilder";

export default async function DashboardPage() {
  const user = await getSessionUser();
  const report = user ? await buildReportFromDb({ userId: user.id }) : buildReportSchema();
  const trend = report.modules.find((item) => item.key === "trend")?.charts?.[0].data as Array<{ date: string; gmv: number; gsv: number }>;
  const gmv = report.modules.find((item) => item.key === "gmv_attribution")?.tables?.[0].data as Array<{ name: string; contribution: number; impactShare?: number; direction?: string }>;
  const product = report.modules.find((item) => item.key === "product_analysis")?.tables?.[0] as { topProducts: Array<Record<string, unknown>>; quadrants: Array<Record<string, unknown>> };

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-950">经营驾驶舱</h1>
          <p className="mt-1 text-sm text-slate-500">从结果、归因、异常到行动，形成本期经营复盘闭环。</p>
        </div>
        <div className="flex items-center gap-2 rounded-md bg-amber-50 px-3 py-2 text-sm font-medium text-amber-700">
          <AlertTriangle size={16} />
          {report.anomalies.length} 个异常待处理
        </div>
      </div>

      <div className="grid grid-cols-5 gap-4">
        {report.metrics.map((metric) => <MetricCard key={metric.key} metric={metric} />)}
      </div>

      <Card className="p-5">
        <div className="flex items-start gap-3">
          <div className="mt-1 rounded-md bg-brand-50 p-2 text-brand-700"><CheckCircle2 size={20} /></div>
          <div>
            <div className="text-sm font-semibold text-slate-950">经营总览</div>
            <p className="mt-1 text-base text-slate-700">{report.executiveSummary.gmvSentence}{report.executiveSummary.gsvSentence}</p>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-3 gap-6">
        <Card className="col-span-2 p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold text-slate-950">GMV / GSV 趋势</h2>
            <div className="rounded-md border border-slate-200 px-2 py-1 text-xs text-slate-500">按日</div>
          </div>
          <TrendChart data={trend} />
        </Card>
        <Card className="p-5">
          <h2 className="mb-4 font-semibold text-slate-950">GMV 归因分析</h2>
          <AttributionBar items={gmv} />
        </Card>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <Card className="p-5">
          <h2 className="mb-4 font-semibold text-slate-950">商品四象限</h2>
          <div className="grid grid-cols-2 gap-3">
            {product.quadrants.map((item) => (
              <div key={String(item.key)} className="rounded-md border border-slate-200 p-3">
                <div className="text-sm font-medium text-slate-900">{String(item.name)}</div>
                <div className="mt-1 text-2xl font-semibold text-brand-700">{String(item.count)}</div>
                <div className="mt-1 text-xs text-slate-500">{String(item.advice)}</div>
              </div>
            ))}
          </div>
        </Card>
        <Card className="p-5">
          <h2 className="mb-4 font-semibold text-slate-950">异常中心</h2>
          <AnomalyList items={report.anomalies} />
        </Card>
        <Card className="p-5">
          <h2 className="mb-4 font-semibold text-slate-950">GMV Top 商品</h2>
          <div className="space-y-3">
            {product.topProducts.slice(0, 5).map((item, index) => (
              <div key={String(item.productId)} className="flex items-center justify-between text-sm">
                <span className="text-slate-700">{index + 1}. {String(item.productName)}</span>
                <span className="font-medium text-slate-950">{(Number(item.gmv) / 10000).toFixed(1)}万</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card className="p-5">
        <h2 className="mb-4 font-semibold text-slate-950">行动清单</h2>
        <ActionList items={report.actionItems} />
      </Card>
    </div>
  );
}
