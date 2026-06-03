import { Card } from "@/components/common/Card";

export default function DataPage() {
  const rows = [
    ["天猫旗舰店", "TMALL", "店铺数据", "2024-05-01 至 2024-05-31", "已入库"],
    ["天猫旗舰店", "TMALL", "商品数据", "2024-05-01 至 2024-05-31", "已入库"],
    ["天猫旗舰店", "TMALL", "推广数据", "2024-05-01 至 2024-05-31", "已入库"]
  ];
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-slate-950">数据管理</h1>
      <Card className="p-5">
        <div className="mb-4 flex gap-3">
          <select className="h-10 rounded-md border border-slate-200 px-3 text-sm"><option>全部店铺</option></select>
          <select className="h-10 rounded-md border border-slate-200 px-3 text-sm"><option>全部报表</option></select>
          <button className="h-10 rounded-md border border-slate-200 px-4 text-sm">重新清洗</button>
          <button className="h-10 rounded-md bg-brand-600 px-4 text-sm font-medium text-white">重新生成报告</button>
        </div>
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-500"><tr><th className="p-3">店铺</th><th>平台</th><th>报表类型</th><th>周期</th><th>状态</th></tr></thead>
          <tbody className="divide-y divide-slate-200">{rows.map((row) => <tr key={row.join("")}>{row.map((cell) => <td key={cell} className="p-3">{cell}</td>)}</tr>)}</tbody>
        </table>
      </Card>
    </div>
  );
}
