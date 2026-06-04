"use client";

import { useMemo } from "react";
import type { EChartsOption } from "echarts";
import { EChart } from "@/components/charts/EChart";

type AttributionItem = {
  name: string;
  contribution: number;
};

export function AttributionChart({ items }: { items: AttributionItem[] }) {
  const option = useMemo<EChartsOption>(() => ({
    animationDuration: 500,
    tooltip: {
      trigger: "axis",
      axisPointer: { type: "shadow" },
      valueFormatter: (value) => `¥${Number(value || 0).toLocaleString("zh-CN")}`
    },
    grid: { left: 68, right: 24, top: 12, bottom: 26 },
    xAxis: {
      type: "value",
      axisLabel: {
        color: "#64748b",
        formatter: (value: number) => `${(value / 10000).toFixed(0)}万`
      },
      splitLine: { lineStyle: { color: "#eef2f7" } }
    },
    yAxis: {
      type: "category",
      data: items.map((item) => item.name),
      axisLabel: { color: "#475569" },
      axisLine: { show: false },
      axisTick: { show: false }
    },
    series: [{
      type: "bar",
      barWidth: 18,
      data: items.map((item) => ({
        value: item.contribution,
        itemStyle: {
          color: item.contribution >= 0 ? "#10b981" : "#ef4444",
          borderRadius: item.contribution >= 0 ? [0, 4, 4, 0] : [4, 0, 0, 4]
        }
      }))
    }]
  }), [items]);

  return <EChart option={option} className="h-80 w-full" />;
}
