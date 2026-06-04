"use client";

import { useMemo } from "react";
import type { EChartsOption } from "echarts";
import { EChart } from "@/components/charts/EChart";

export function ProductQuadrantChart({ items }: { items: Array<Record<string, unknown>> }) {
  const option = useMemo<EChartsOption>(() => ({
    color: ["#2563eb", "#10b981", "#f59e0b", "#ef4444"],
    tooltip: { trigger: "item" },
    legend: {
      bottom: 0,
      textStyle: { color: "#64748b" }
    },
    series: [{
      type: "pie",
      radius: ["48%", "70%"],
      center: ["50%", "42%"],
      label: {
        formatter: "{b}\n{c}",
        color: "#475569"
      },
      data: items.map((item) => ({
        name: String(item.name || item.key || "未命名"),
        value: Number(item.count || 0)
      }))
    }]
  }), [items]);

  return <EChart option={option} className="h-72 w-full" />;
}

export function TopProductChart({ items }: { items: Array<Record<string, unknown>> }) {
  const data = items.slice(0, 6).reverse();
  const option = useMemo<EChartsOption>(() => ({
    tooltip: {
      trigger: "axis",
      axisPointer: { type: "shadow" },
      valueFormatter: (value) => `¥${Number(value || 0).toLocaleString("zh-CN")}`
    },
    grid: { left: 86, right: 18, top: 12, bottom: 22 },
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
      data: data.map((item) => String(item.productName || item.productId || "未命名")),
      axisLabel: { color: "#475569", width: 78, overflow: "truncate" },
      axisLine: { show: false },
      axisTick: { show: false }
    },
    series: [{
      type: "bar",
      barWidth: 16,
      data: data.map((item) => Number(item.gmv || 0)),
      itemStyle: { color: "#2563eb", borderRadius: [0, 4, 4, 0] }
    }]
  }), [data]);

  return <EChart option={option} className="h-72 w-full" />;
}
