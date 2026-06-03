"use client";

import { useState } from "react";
import type { ReportSchema } from "@/lib/analysis/types";

export function ReportActions({ report }: { report: ReportSchema }) {
  const [copied, setCopied] = useState(false);

  async function copySummary() {
    const text = [
      report.title,
      `${report.shop.name}：${report.period.current.start} 至 ${report.period.current.end}`,
      report.executiveSummary.gmvSentence,
      report.executiveSummary.gsvSentence,
      "重点行动：",
      ...report.executiveSummary.topActions.map((item) => `- ${item}`)
    ].join("\n");
    await navigator.clipboard.writeText(text);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  async function exportPdfHtml() {
    const response = await fetch(`/api/reports/${report.reportId}/export-pdf`, { method: "POST" });
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${report.title}.html`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="flex gap-2">
      <button onClick={copySummary} className="h-10 rounded-md border border-slate-200 px-4 text-sm">
        {copied ? "已复制" : "复制摘要"}
      </button>
      <button className="h-10 rounded-md border border-slate-200 px-4 text-sm">导出图片</button>
      <button onClick={exportPdfHtml} className="h-10 rounded-md bg-brand-600 px-4 text-sm font-medium text-white">导出 PDF</button>
    </div>
  );
}
