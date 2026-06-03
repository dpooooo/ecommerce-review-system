import type { MetricSnapshot } from "@/lib/analysis/types";

export function gmvAttribution(current: MetricSnapshot, previous: MetricSnapshot) {
  const trafficContribution = (current.traffic - previous.traffic) * previous.conversionRate * previous.aov;
  const conversionContribution = current.traffic * (current.conversionRate - previous.conversionRate) * previous.aov;
  const aovContribution = current.traffic * current.conversionRate * (current.aov - previous.aov);
  const factors = [
    { factor: "traffic", name: "流量", current: current.traffic, previous: previous.traffic, contribution: trafficContribution },
    { factor: "conversionRate", name: "转化率", current: current.conversionRate, previous: previous.conversionRate, contribution: conversionContribution },
    { factor: "aov", name: "客单价", current: current.aov, previous: previous.aov, contribution: aovContribution }
  ];
  const totalImpact = factors.reduce((sum, item) => sum + Math.abs(item.contribution), 0) || 1;
  return factors.map((item) => ({
    ...item,
    share: item.contribution / (current.gmv - previous.gmv || 1),
    impactShare: Math.abs(item.contribution) / totalImpact,
    direction: item.contribution >= 0 ? "拉动" : "拖累"
  }));
}
