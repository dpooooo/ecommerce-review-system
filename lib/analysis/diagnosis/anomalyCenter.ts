import type { MetricSnapshot } from "@/lib/analysis/types";

export function buildAnomalyCenter(current: MetricSnapshot, previous: MetricSnapshot, productAnomalies: Array<Record<string, unknown>>) {
  const anomalies: Array<Record<string, unknown>> = [];
  if (current.refundAmount > previous.refundAmount * 1.2) {
    anomalies.push({
      priority: "P0",
      category: "GSV / 退款异常",
      title: "退款金额上升",
      impact: `退款金额增加 ${(current.refundAmount - previous.refundAmount).toFixed(0)} 元，侵蚀 GSV`,
      reason: "退款增长快于成交增长，实际销售质量承压",
      suggestion: "排查高退款商品、售后原因、质量问题和物流问题",
      sourceModule: "gsv_attribution",
      sourceObject: "shop",
      relatedMetric: "refundAmount"
    });
  }
  if (current.roi && previous.roi && current.roi < previous.roi) {
    anomalies.push({
      priority: "P1",
      category: "推广效率异常",
      title: "推广 ROI 下降",
      impact: "推广投入产出效率低于同期",
      reason: "部分计划花费增加但成交承接不足",
      suggestion: "将预算从低 ROI 计划迁移到高 ROI 计划",
      sourceModule: "promotion_detail",
      sourceObject: "promotion_plan",
      relatedMetric: "roi"
    });
  }
  return [...anomalies, ...productAnomalies.slice(0, 3)];
}
