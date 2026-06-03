import { currentShopMetrics, demoShop, previousShopMetrics, productMetrics, promotionPlans, trafficSources, trendData, userProfiles } from "@/lib/demo-data";
import { gmvAttribution } from "@/lib/analysis/attribution/gmvAttribution";
import { gsvAttribution } from "@/lib/analysis/attribution/gsvAttribution";
import { compareMetrics } from "@/lib/analysis/metrics/comparison";
import { productAnalysis } from "@/lib/analysis/diagnosis/productDiagnosis";
import { buildAnomalyCenter } from "@/lib/analysis/diagnosis/anomalyCenter";
import { buildActionItems } from "@/lib/analysis/diagnosis/actionItems";
import type { MetricSnapshot, ReportSchema } from "@/lib/analysis/types";

export function buildReportSchema(options?: {
  shop?: { id: string; name: string; platform: string };
  current?: MetricSnapshot;
  previous?: MetricSnapshot;
  reportId?: string;
}): ReportSchema {
  const shop = options?.shop || demoShop;
  const current = options?.current || currentShopMetrics;
  const previous = options?.previous || previousShopMetrics;
  const products = productAnalysis(productMetrics);
  const anomalies = buildAnomalyCenter(current, previous, products.anomalies);
  const actionItems = buildActionItems(anomalies);

  return {
    reportId: options?.reportId || "demo-report",
    title: "电商增长复盘报告",
    shop,
    period: {
      current: { start: "2024-05-01", end: "2024-05-31" },
      previous: { start: "2024-04-01", end: "2024-04-30" }
    },
    executiveSummary: {
      status: anomalies.some((item) => item.priority === "P0") ? "warning" : "normal",
      gmvSentence: "本期 GMV 增长，主要由客单价提升与流量增长共同拉动。",
      gsvSentence: "退款金额上升，对 GSV 形成一定侵蚀，需要优先处理高退款商品。",
      topReasons: ["客单价提升拉动 GMV", "流量增长带来增量成交", "退款金额上升侵蚀 GSV"],
      topActions: ["处理高退款商品", "优化低 ROI 推广计划", "加码高 UV 价值流量入口"]
    },
    metrics: compareMetrics(current, previous),
    modules: [
      { key: "trend", title: "GMV / GSV 趋势", summary: "GMV 和 GSV 均呈增长趋势，但 GSV 增长斜率受到退款影响。", charts: [{ type: "line", data: trendData }] },
      { key: "gmv_attribution", title: "GMV 归因分析", summary: "GMV 增长主要由客单价提升和流量增长贡献。", tables: [{ data: gmvAttribution(current, previous) }] },
      { key: "gsv_attribution", title: "GSV 影响分析", summary: "成交增长贡献为正，退款增长对 GSV 形成负向影响。", tables: [{ data: gsvAttribution(current, previous) }] },
      { key: "product_analysis", title: "商品分析", summary: "高退款与高流量低转化商品需要优先处理。", tables: [{ topProducts: products.topProducts, quadrants: products.quadrants }] },
      { key: "traffic_source", title: "流量来源分析", summary: "直播与搜索渠道 UV 价值更高，推荐流量承接效率偏低。", tables: [{ data: trafficSources }] },
      { key: "user_profile", title: "用户经营分析", summary: "PLUS 与老客客单价更高，新客成交占比较高但复购仍需补强。", tables: [{ data: userProfiles }] },
      { key: "promotion_detail", title: "推广计划与人群分析", summary: "品牌词和精华礼盒计划 ROI 较优，洁面低价计划需要收缩或重建。", tables: [{ data: promotionPlans }] }
    ],
    anomalies,
    actionItems
  };
}
