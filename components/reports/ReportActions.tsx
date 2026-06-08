"use client";

import { useState } from "react";
import { Check, Clipboard, Code2, Download } from "lucide-react";
import type { ReportSchema } from "@/lib/analysis/types";

export function ReportActions({ report }: { report: ReportSchema }) {
  const [copied, setCopied] = useState(false);
  const reportPeriod = `${report.shop.name}，${report.period.current.start} 至 ${report.period.current.end}`;

  async function copySummary() {
    const text = [
      report.title,
      reportPeriod,
      "",
      report.executiveSummary.gmvSentence,
      report.executiveSummary.gsvSentence,
      "",
      "重点行动：",
      ...report.executiveSummary.topActions.map((item) => `- ${item}`)
    ].join("\n");
    await navigator.clipboard.writeText(text);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  async function exportReportHtml() {
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
    <div className="flex flex-wrap gap-2">
      <button
        onClick={copySummary}
        className="inline-flex h-10 items-center gap-2 rounded-md border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
      >
        {copied ? <Check size={16} /> : <Clipboard size={16} />}
        {copied ? "已复制" : "复制摘要"}
      </button>
      <a
        href={`/api/reports/${report.reportId}/export-json`}
        className="inline-flex h-10 items-center gap-2 rounded-md border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
      >
        <Code2 size={16} />
        导出 JSON
      </a>
      <button
        onClick={exportReportHtml}
        className="inline-flex h-10 items-center gap-2 rounded-md bg-brand-600 px-3 text-sm font-medium text-white hover:bg-brand-700"
      >
        <Download size={16} />
        导出 HTML
      </button>
    </div>
  );
}
