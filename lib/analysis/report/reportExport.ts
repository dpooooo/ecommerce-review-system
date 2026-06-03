import type { ReportSchema } from "@/lib/analysis/types";

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;" }[char] || char));
}

export function reportToHtml(report: ReportSchema) {
  const metrics = report.metrics.map((item) => `<tr><td>${escapeHtml(item.name)}</td><td>${item.current}</td><td>${escapeHtml(item.displayChange)}</td></tr>`).join("");
  const anomalies = report.anomalies.map((item) => `<li><strong>${escapeHtml(String(item.priority || ""))}</strong> ${escapeHtml(String(item.title || ""))}：${escapeHtml(String(item.suggestion || ""))}</li>`).join("");
  const actions = report.actionItems.map((item) => `<li>${escapeHtml(String(item.title || ""))} - ${escapeHtml(String(item.estimatedImpact || ""))}</li>`).join("");
  const modules = report.modules.map((module) => `<h2>${escapeHtml(module.title)}</h2><p>${escapeHtml(module.summary)}</p>`).join("");
  return `<!doctype html>
<html lang="zh-CN">
<head>
<meta charset="utf-8" />
<title>${escapeHtml(report.title)}</title>
<style>
body{font-family:Arial,"Microsoft YaHei",sans-serif;color:#0f172a;padding:32px;line-height:1.6}
h1{font-size:28px;margin:0 0 8px}
h2{font-size:18px;margin-top:28px;border-bottom:1px solid #e2e8f0;padding-bottom:8px}
table{border-collapse:collapse;width:100%;margin-top:12px}td,th{border:1px solid #e2e8f0;padding:8px;text-align:left}
.muted{color:#64748b}.summary{background:#eff6ff;padding:16px;border-radius:8px}
</style>
</head>
<body>
<h1>${escapeHtml(report.title)}</h1>
<div class="muted">${escapeHtml(report.shop.name)} · ${escapeHtml(report.period.current.start)} 至 ${escapeHtml(report.period.current.end)}</div>
<h2>经营总览</h2>
<div class="summary">${escapeHtml(report.executiveSummary.gmvSentence)}${escapeHtml(report.executiveSummary.gsvSentence)}</div>
<h2>核心指标</h2>
<table><tbody>${metrics}</tbody></table>
${modules}
<h2>异常中心</h2>
<ul>${anomalies}</ul>
<h2>行动清单</h2>
<ul>${actions}</ul>
</body>
</html>`;
}
