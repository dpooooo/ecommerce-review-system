import Link from "next/link";
import { Card } from "@/components/common/Card";

export default function HistoryPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-slate-950">历史报告</h1>
      <Card className="p-5">
        <div className="rounded-md border border-slate-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-slate-950">2024 年 5 月电商增长复盘报告</div>
              <div className="mt-1 text-sm text-slate-500">天猫旗舰店 · 2024-05-01 至 2024-05-31 · 已生成</div>
            </div>
            <div className="flex gap-2">
              <Link href="/reports/demo-report" className="rounded-md border border-slate-200 px-3 py-2 text-sm">查看</Link>
              <button className="rounded-md border border-slate-200 px-3 py-2 text-sm">下载</button>
              <button className="rounded-md border border-red-200 px-3 py-2 text-sm text-red-600">删除</button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
