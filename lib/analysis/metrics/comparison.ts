import { formatPercent } from "@/lib/format";
import type { MetricComparison, MetricSnapshot } from "@/lib/analysis/types";

const labels: Record<keyof MetricSnapshot, string> = {
  traffic: "访客数",
  gmv: "GMV",
  gsv: "GSV",
  orders: "订单数",
  conversionRate: "转化率",
  aov: "客单价",
  refundAmount: "退款金额",
  refundRate: "退款率",
  spend: "推广花费",
  roi: "推广 ROI"
};

export function compareMetrics(current: MetricSnapshot, previous: MetricSnapshot): MetricComparison[] {
  return (Object.keys(labels) as Array<keyof MetricSnapshot>)
    .filter((key) => current[key] !== undefined)
    .map((key) => {
      const currentValue = Number(current[key] || 0);
      const previousValue = Number(previous[key] || 0);
      const delta = currentValue - previousValue;
      const changeRate = previousValue === 0 ? (currentValue === 0 ? 0 : null) : delta / previousValue;
      return {
        key,
        name: labels[key],
        current: currentValue,
        previous: previousValue,
        delta,
        changeRate,
        displayChange: changeRate === null ? "无同期基数" : formatPercent(changeRate),
        trend: delta > 0 ? "up" : delta < 0 ? "down" : "flat"
      };
    });
}
