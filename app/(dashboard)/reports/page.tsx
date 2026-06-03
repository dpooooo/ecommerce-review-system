import Link from "next/link";
import { Card } from "@/components/common/Card";

const modules = ["店铺大盘", "GMV 归因", "GSV 归因", "商品分析", "推广分析", "流量分析", "用户分析", "异常中心", "行动清单"];

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-slate-950">报告中心</h1>
      <Card className="p-5">
        <div className="grid grid-cols-4 gap-4">
          <select className="h-10 rounded-md border border-slate-200 px-3 text-sm"><option>天猫旗舰店</option></select>
          <input type="date" defaultValue="2024-05-01" className="h-10 rounded-md border border-slate-200 px-3 text-sm" />
          <input type="date" defaultValue="2024-05-31" className="h-10 rounded-md border border-slate-200 px-3 text-sm" />
          <Link href="/reports/demo-report" className="flex h-10 items-center justify-center rounded-md bg-brand-600 text-sm font-medium text-white">生成报告</Link>
        </div>
        <div className="mt-5 grid grid-cols-3 gap-3">
          {modules.map((item) => <label key={item} className="flex items-center gap-2 rounded-md border border-slate-200 p-3 text-sm"><input type="checkbox" defaultChecked />{item}</label>)}
        </div>
      </Card>
    </div>
  );
}
