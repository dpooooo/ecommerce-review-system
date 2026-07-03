"use client";

import { useState } from "react";
import { Check, Clipboard, Code2, Download, Loader2, Presentation, Share2 } from "lucide-react";
import type { ReportSchema } from "@/lib/analysis/types";

export function ReportActions({ report }: { report: ReportSchema }) {
  const [copied, setCopied] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);
  const [shareError, setShareError] = useState(false);
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

  async function sharePresentation() {
    setSharing(true);
    setShareError(false);
    try {
      const response = await fetch(`/api/reports/${report.reportId}/share`, { method: "POST" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "生成分享链接失败。");
      const url = new URL(data.sharePath, window.location.origin).toString();
      await navigator.clipboard.writeText(url);
      setShareCopied(true);
      window.setTimeout(() => setShareCopied(false), 2000);
    } catch {
      setShareError(true);
      window.setTimeout(() => setShareError(false), 2500);
    } finally {
      setSharing(false);
    }
  }

  return (
    <div className="flex flex-wrap gap-2">
      <a
        href={`/present/reports/${report.reportId}`}
        target="_blank"
        rel="noreferrer"
        className="inline-flex h-10 items-center gap-2 rounded-md border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
      >
        <Presentation size={16} />
        演示模式
      </a>
      <button
        onClick={sharePresentation}
        disabled={sharing}
        className="inline-flex h-10 items-center gap-2 rounded-md border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60"
      >
        {sharing ? <Loader2 size={16} className="animate-spin" /> : shareCopied ? <Check size={16} /> : <Share2 size={16} />}
        {shareCopied ? "链接已复制" : shareError ? "分享失败" : "分享演示"}
      </button>
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
