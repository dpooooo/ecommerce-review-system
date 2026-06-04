"use client";

import { useMemo } from "react";
import type { EChartsOption } from "echarts";
import { EChart } from "@/components/charts/EChart";

export function TrendChart({ data }: { data: Array<{ date: string; gmv: number; gsv: number }> }) {
  const option = useMemo<EChartsOption>(() => ({
    animationDuration: 500,
    color: ["#2563eb", "#16a34a"],
    tooltip: {
      trigger: "axis",
      valueFormatter: (value) => `¥${Number(value || 0).toLocaleString("zh-CN")}`
    },
    legend: {
      top: 0,
      right: 0,
      textStyle: { color: "#64748b" }
    },
    grid: { left: 52, right: 20, top: 42, bottom: 34 },
    xAxis: {
      type: "category",
      boundaryGap: false,
      data: data.map((item) => item.date),
      axisLine: { lineStyle: { color: "#cbd5e1" } },
      axisLabel: { color: "#64748b" }
    },
    yAxis: {
      type: "value",
      axisLabel: {
        color: "#64748b",
        formatter: (value: number) => `${(value / 10000).toFixed(0)}万`
      },
      splitLine: { lineStyle: { color: "#eef2f7" } }
    },
    series: [
      {
        name: "GMV",
        type: "line",
        smooth: true,
        symbol: "circle",
        symbolSize: 7,
        data: data.map((item) => item.gmv),
        lineStyle: { width: 3 },
        areaStyle: { color: "rgba(37, 99, 235, 0.08)" }
      },
      {
        name: "GSV",
        type: "line",
        smooth: true,
        symbol: "circle",
        symbolSize: 7,
        data: data.map((item) => item.gsv),
        lineStyle: { width: 3 }
      }
    ]
  }), [data]);

  return <EChart option={option} className="h-80 w-full" />;
}
