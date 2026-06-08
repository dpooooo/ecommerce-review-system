import type { MetricComparison, ReportSchema } from "@/lib/analysis/types";
import { formatMoney, formatNumber, formatPercent } from "@/lib/format";

const moneyMetricKeys = new Set(["gmv", "gsv", "aov", "refundAmount", "spend"]);
const percentMetricKeys = new Set(["conversionRate", "refundRate"]);

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;" }[char] || char));
}

function asNumber(value: unknown) {
  const number = Number(value || 0);
  return Number.isFinite(number) ? number : 0;
}

function metricValue(metric: Pick<MetricComparison, "key">, value: number) {
  if (percentMetricKeys.has(metric.key)) return formatPercent(value);
  if (moneyMetricKeys.has(metric.key)) return formatMoney(value);
  if (metric.key === "roi") return value.toFixed(2);
  return formatNumber(value);
}

function table(rows: string) {
  return `<table><tbody>${rows}</tbody></table>`;
}

function list(items: string[]) {
  if (!items.length) return "<p class=\"muted\">暂无内容</p>";
  return `<ul>${items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`;
}

function metricCards(report: ReportSchema) {
  return report.metrics.map((item) => `
    <div class="metric">
      <div class="metric-name">${escapeHtml(item.name)}</div>
      <div class="metric-value">${escapeHtml(metricValue(item, item.current))}</div>
      <div class="metric-sub">对比期 ${escapeHtml(metricValue(item, item.previous))}</div>
      <div class="${item.trend === "down" ? "change down" : item.trend === "up" ? "change up" : "change"}">${escapeHtml(item.displayChange)}</div>
    </div>
  `).join("");
}

function moduleTable(module: ReportSchema["modules"][number]) {
  const firstTable = module.tables?.[0] || {};
  const rows = (firstTable.data || []) as Array<Record<string, unknown>>;
  if (!rows.length) return "";

  if (module.key === "gmv_attribution") {
    return table(rows.map((row) => `
      <tr>
        <td>${escapeHtml(String(row.name || "-"))}</td>
        <td>${formatNumber(asNumber(row.previous))}</td>
        <td>${formatNumber(asNumber(row.current))}</td>
        <td>${formatMoney(asNumber(row.contribution))}</td>
        <td>${escapeHtml(String(row.direction || "-"))}</td>
      </tr>
    `).join(""));
  }

  if (module.key === "gsv_attribution") {
    return table(rows.map((row) => `
      <tr>
        <td>${escapeHtml(String(row.name || "-"))}</td>
        <td>${formatMoney(asNumber(row.contribution))}</td>
        <td>${escapeHtml(String(row.direction || "-"))}</td>
      </tr>
    `).join(""));
  }

  if (module.key === "promotion_detail") {
    return table(rows.slice(0, 10).map((row) => `
      <tr>
        <td>${escapeHtml(String(row.planName || "-"))}</td>
        <td>${formatMoney(asNumber(row.spend))}</td>
        <td>${formatMoney(asNumber(row.revenue))}</td>
        <td>${asNumber(row.roi).toFixed(2)}</td>
      </tr>
    `).join(""));
  }

  return "";
}

function productSummary(module: ReportSchema["modules"][number]) {
  if (module.key !== "product_analysis") return "";
  const firstTable = module.tables?.[0] || {};
  const topProducts = ((firstTable.topProducts || []) as Array<Record<string, unknown>>).slice(0, 10);
  if (!topProducts.length) return "";

  return table(topProducts.map((row) => `
    <tr>
      <td>${escapeHtml(String(row.productName || row.productId || "-"))}</td>
      <td>${formatNumber(asNumber(row.traffic))}</td>
      <td>${formatMoney(asNumber(row.gmv))}</td>
      <td>${formatMoney(asNumber(row.gsv))}</td>
      <td>${formatPercent(asNumber(row.refundRate))}</td>
    </tr>
  `).join(""));
}

function modules(report: ReportSchema) {
  return report.modules.map((module, index) => `
    <section class="section">
      <div class="section-index">${String(index + 1).padStart(2, "0")}</div>
      <div>
        <h2>${escapeHtml(module.title)}</h2>
        <p>${escapeHtml(module.summary)}</p>
        ${moduleTable(module)}
        ${productSummary(module)}
      </div>
    </section>
  `).join("");
}

function anomalies(report: ReportSchema) {
  if (!report.anomalies.length) return "<p class=\"muted\">暂无异常项。</p>";
  return report.anomalies.map((item) => `
    <div class="issue">
      <strong>${escapeHtml(String(item.priority || "P2"))} · ${escapeHtml(String(item.title || "未命名异常"))}</strong>
      <p>${escapeHtml(String(item.impact || item.reason || ""))}</p>
      <p class="muted">${escapeHtml(String(item.suggestion || ""))}</p>
    </div>
  `).join("");
}

function actions(report: ReportSchema) {
  if (!report.actionItems.length) return "<p class=\"muted\">暂无行动项。</p>";
  return report.actionItems.map((item) => `
    <tr>
      <td>${escapeHtml(String(item.priority || "P2"))}</td>
      <td>${escapeHtml(String(item.title || "-"))}</td>
      <td>${escapeHtml(String(item.targetMetric || "-"))}</td>
      <td>${escapeHtml(String(item.estimatedImpact || "-"))}</td>
      <td>${escapeHtml(String(item.status || "未开始"))}</td>
    </tr>
  `).join("");
}

export function reportToHtml(report: ReportSchema) {
  return `<!doctype html>
<html lang="zh-CN">
<head>
<meta charset="utf-8" />
<title>${escapeHtml(report.title)}</title>
<style>
*{box-sizing:border-box}
body{margin:0;background:#eef3f8;color:#0f172a;font-family:Arial,"Microsoft YaHei",sans-serif;line-height:1.6}
.page{width:1120px;max-width:100%;margin:0 auto;padding:32px}
.hero,.card,.section{background:#fff;border:1px solid #e2e8f0;border-radius:10px;box-shadow:0 8px 24px rgba(15,23,42,.04)}
.hero{padding:28px;margin-bottom:18px}
.eyebrow{display:inline-block;background:#eff6ff;color:#1d4ed8;border-radius:6px;padding:4px 8px;font-size:12px;font-weight:700}
h1{font-size:30px;margin:14px 0 4px}
h2{font-size:18px;margin:0 0 8px}
p{margin:0;color:#475569}
.muted{color:#64748b}
.summary{margin-top:18px;background:#f8fafc;border-left:4px solid #2563eb;padding:14px 16px;border-radius:8px}
.grid{display:grid;grid-template-columns:repeat(5,1fr);gap:12px;margin:18px 0}
.metric{background:#fff;border:1px solid #e2e8f0;border-radius:8px;padding:14px}
.metric-name{font-size:13px;color:#64748b}
.metric-value{font-size:24px;font-weight:800;margin-top:6px}
.metric-sub{font-size:12px;color:#94a3b8;margin-top:8px}
.change{font-size:12px;font-weight:700;margin-top:4px;color:#64748b}.up{color:#059669}.down{color:#dc2626}
.card{padding:20px;margin-top:18px}
.columns{display:grid;grid-template-columns:repeat(3,1fr);gap:12px}
.note{background:#f8fafc;border-radius:8px;padding:12px;font-size:14px;color:#475569}
.section{display:grid;grid-template-columns:52px 1fr;gap:14px;padding:20px;margin-top:18px}
.section-index{height:34px;width:34px;border-radius:8px;background:#0f172a;color:#fff;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:800}
table{border-collapse:collapse;width:100%;margin-top:14px;font-size:13px}
td,th{border:1px solid #e2e8f0;padding:8px;text-align:left}
tbody tr:nth-child(even){background:#f8fafc}
.issue{border:1px solid #fecaca;background:#fff7f7;border-radius:8px;padding:12px;margin-top:10px}
@media(max-width:900px){.grid{grid-template-columns:repeat(2,1fr)}.columns{grid-template-columns:1fr}.page{padding:16px}}
</style>
</head>
<body>
<main class="page">
  <section class="hero">
    <span class="eyebrow">经营复盘报告</span>
    <h1>${escapeHtml(report.title)}</h1>
    <p>${escapeHtml(report.shop.name)} · ${escapeHtml(report.period.current.start)} 至 ${escapeHtml(report.period.current.end)}</p>
    <div class="summary">${escapeHtml(report.executiveSummary.gmvSentence)}${escapeHtml(report.executiveSummary.gsvSentence)}</div>
  </section>

  <div class="grid">${metricCards(report)}</div>

  <section class="card">
    <h2>核心洞察</h2>
    <div class="columns">
      <div class="note"><strong>增长拉动</strong>${list(report.executiveSummary.topReasons)}</div>
      <div class="note"><strong>下一步动作</strong>${list(report.executiveSummary.topActions)}</div>
      <div class="note"><strong>报告概况</strong><p>异常项 ${report.anomalies.length} 个，行动项 ${report.actionItems.length} 个。</p></div>
    </div>
  </section>

  ${modules(report)}

  <section class="card">
    <h2>异常中心</h2>
    ${anomalies(report)}
  </section>

  <section class="card">
    <h2>行动清单</h2>
    <table><tbody>${actions(report)}</tbody></table>
  </section>
</main>
</body>
</html>`;
}
