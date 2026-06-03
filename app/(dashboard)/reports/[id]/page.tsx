import { AnomalyList } from "@/components/dashboard/AnomalyList";
import { ActionList } from "@/components/dashboard/ActionList";
import { Card } from "@/components/common/Card";
import { buildReportSchema } from "@/lib/analysis/report/reportBuilder";

export default function ReportDetailPage() {
  const report = buildReportSchema();
  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-950">{report.title}</h1>
          <p className="mt-1 text-sm text-slate-500">{report.shop.name} · {report.period.current.start} 至 {report.period.current.end}</p>
        </div>
        <div className="flex gap-2">
          <button className="h-10 rounded-md border border-slate-200 px-4 text-sm">复制摘要</button>
          <button className="h-10 rounded-md border border-slate-200 px-4 text-sm">导出图片</button>
          <button className="h-10 rounded-md bg-brand-600 px-4 text-sm font-medium text-white">导出 PDF</button>
        </div>
      </div>
      <Card className="p-5">
        <h2 className="font-semibold">1. 经营总览</h2>
        <p className="mt-2 text-slate-700">{report.executiveSummary.gmvSentence}{report.executiveSummary.gsvSentence}</p>
      </Card>
      <Card className="p-5">
        <h2 className="mb-4 font-semibold">2. 核心指标</h2>
        <div className="grid grid-cols-5 gap-3">{report.metrics.map((m) => <div key={m.key} className="rounded-md bg-slate-50 p-3"><div className="text-sm text-slate-500">{m.name}</div><div className="mt-1 font-semibold">{m.displayChange}</div></div>)}</div>
      </Card>
      {report.modules.map((module, index) => (
        <Card key={module.key} className="p-5">
          <h2 className="font-semibold">{index + 3}. {module.title}</h2>
          <p className="mt-2 text-sm text-slate-600">{module.summary}</p>
        </Card>
      ))}
      <Card className="p-5"><h2 className="mb-4 font-semibold">9. 异常中心</h2><AnomalyList items={report.anomalies} /></Card>
      <Card className="p-5"><h2 className="mb-4 font-semibold">10. 行动清单</h2><ActionList items={report.actionItems} /></Card>
      <Card className="p-5"><h2 className="font-semibold">11. 总结建议</h2><p className="mt-2 text-sm text-slate-600">建议优先处理高退款商品，并将预算从低 ROI 计划迁移到高 ROI 计划，同时加码高 UV 价值入口。</p></Card>
    </div>
  );
}
