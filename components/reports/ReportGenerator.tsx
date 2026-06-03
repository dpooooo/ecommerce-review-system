"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FileText, Loader2 } from "lucide-react";
import { Card } from "@/components/common/Card";

type Shop = {
  id: string;
  name: string;
  platform: string;
};

const modules = ["店铺大盘", "GMV 归因", "GSV 归因", "商品分析", "推广分析", "流量分析", "用户分析", "异常中心", "行动清单"];

export function ReportGenerator({
  shops,
  defaultPeriod,
  recentReports
}: {
  shops: Shop[];
  defaultPeriod?: {
    currentStart?: string;
    currentEnd?: string;
    previousStart?: string;
    previousEnd?: string;
  };
  recentReports?: Array<{
    id: string;
    title: string;
    shopName: string;
    period: string;
    createdAt: string;
  }>;
}) {
  const router = useRouter();
  const [shopId, setShopId] = useState(shops[0]?.id || "");
  const [currentStart, setCurrentStart] = useState(defaultPeriod?.currentStart || "2024-05-01");
  const [currentEnd, setCurrentEnd] = useState(defaultPeriod?.currentEnd || "2024-05-31");
  const [previousStart, setPreviousStart] = useState(defaultPeriod?.previousStart || "2024-04-01");
  const [previousEnd, setPreviousEnd] = useState(defaultPeriod?.previousEnd || "2024-04-30");
  const [status, setStatus] = useState<"idle" | "generating" | "error">("idle");
  const [message, setMessage] = useState("");

  async function generateReport(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("generating");
    setMessage("正在从数据库聚合指标并生成复盘报告...");

    const response = await fetch("/api/analysis/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ shopId, currentStart, currentEnd, previousStart, previousEnd })
    });
    const data = await response.json();
    if (!response.ok) {
      setStatus("error");
      setMessage(data.error || "报告生成失败，请检查数据周期。");
      return;
    }
    router.push(`/reports/${data.reportId}`);
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-950">报告中心</h1>
        <p className="mt-1 text-sm text-slate-500">选择店铺和对比周期，系统会从标准指标表生成页面级 ReportSchema。</p>
      </div>
      <Card className="p-5">
        <form onSubmit={generateReport} className="space-y-5">
          <div className="grid grid-cols-5 gap-4">
            <label className="block">
              <span className="text-sm font-medium text-slate-700">店铺</span>
              <select value={shopId} onChange={(event) => setShopId(event.target.value)} className="mt-1 h-10 w-full rounded-md border border-slate-200 px-3 text-sm">
                {shops.length ? shops.map((shop) => <option key={shop.id} value={shop.id}>{shop.name}</option>) : <option value="">默认演示店铺</option>}
              </select>
            </label>
            <label className="block">
              <span className="text-sm font-medium text-slate-700">本期开始</span>
              <input type="date" value={currentStart} onChange={(event) => setCurrentStart(event.target.value)} className="mt-1 h-10 w-full rounded-md border border-slate-200 px-3 text-sm" />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-slate-700">本期结束</span>
              <input type="date" value={currentEnd} onChange={(event) => setCurrentEnd(event.target.value)} className="mt-1 h-10 w-full rounded-md border border-slate-200 px-3 text-sm" />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-slate-700">同期开始</span>
              <input type="date" value={previousStart} onChange={(event) => setPreviousStart(event.target.value)} className="mt-1 h-10 w-full rounded-md border border-slate-200 px-3 text-sm" />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-slate-700">同期结束</span>
              <input type="date" value={previousEnd} onChange={(event) => setPreviousEnd(event.target.value)} className="mt-1 h-10 w-full rounded-md border border-slate-200 px-3 text-sm" />
            </label>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {modules.map((item) => (
              <label key={item} className="flex items-center gap-2 rounded-md border border-slate-200 p-3 text-sm">
                <input type="checkbox" defaultChecked />
                {item}
              </label>
            ))}
          </div>
          {message ? <div className={status === "error" ? "rounded-md bg-red-50 px-4 py-3 text-sm text-red-700" : "rounded-md bg-brand-50 px-4 py-3 text-sm text-brand-700"}>{message}</div> : null}
          <button disabled={status === "generating"} className="inline-flex h-10 items-center gap-2 rounded-md bg-brand-600 px-4 text-sm font-medium text-white disabled:opacity-60">
            {status === "generating" ? <Loader2 className="animate-spin" size={16} /> : <FileText size={16} />}
            生成复盘报告
          </button>
        </form>
      </Card>
      <Card className="p-5">
        <h2 className="font-semibold text-slate-950">最近报告</h2>
        <div className="mt-4 space-y-3">
          {recentReports?.length ? recentReports.map((report) => (
            <div key={report.id} className="flex items-center justify-between rounded-md border border-slate-200 p-3">
              <div>
                <div className="text-sm font-medium text-slate-900">{report.title}</div>
                <div className="mt-1 text-xs text-slate-500">{report.shopName} · {report.period}</div>
              </div>
              <Link href={`/reports/${report.id}`} className="rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-700">查看</Link>
            </div>
          )) : <p className="text-sm text-slate-500">暂无历史报告，生成后会出现在这里。</p>}
        </div>
      </Card>
    </div>
  );
}
