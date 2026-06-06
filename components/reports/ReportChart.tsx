"use client";

import { useMemo } from "react";
import type { EChartsOption } from "echarts";
import { EChart } from "@/components/charts/EChart";

function number(value: unknown) {
  const result = Number(value || 0);
  return Number.isFinite(result) ? result : 0;
}

function label(value: unknown) {
  return String(value || "未命名");
}

export function ReportChart({
  moduleKey,
  chartData,
  tableData
}: {
  moduleKey: string;
  chartData: Array<Record<string, unknown>>;
  tableData: Array<Record<string, unknown>>;
}) {
  const option = useMemo<EChartsOption | null>(() => {
    if (moduleKey === "trend" && chartData.length) {
      return {
        color: ["#2563eb", "#16a34a"],
        tooltip: { trigger: "axis" },
        legend: { top: 0, right: 0 },
        grid: { left: 58, right: 24, top: 42, bottom: 32 },
        xAxis: { type: "category", boundaryGap: false, data: chartData.map((item) => label(item.date)) },
        yAxis: {
          type: "value",
          axisLabel: { formatter: (value: number) => `${(value / 10000).toFixed(0)}万` },
          splitLine: { lineStyle: { color: "#eef2f7" } }
        },
        series: [
          { name: "GMV", type: "line", smooth: true, data: chartData.map((item) => number(item.gmv)), areaStyle: { color: "rgba(37,99,235,.08)" } },
          { name: "GSV", type: "line", smooth: true, data: chartData.map((item) => number(item.gsv)) }
        ]
      };
    }

    if ((moduleKey === "gmv_attribution" || moduleKey === "gsv_attribution") && tableData.length) {
      return {
        tooltip: { trigger: "axis", axisPointer: { type: "shadow" } },
        grid: { left: 86, right: 24, top: 16, bottom: 28 },
        xAxis: {
          type: "value",
          axisLabel: { formatter: (value: number) => `${(value / 10000).toFixed(0)}万` },
          splitLine: { lineStyle: { color: "#eef2f7" } }
        },
        yAxis: { type: "category", data: tableData.map((item) => label(item.name)) },
        series: [{
          type: "bar",
          barWidth: 18,
          data: tableData.map((item) => ({
            value: number(item.contribution),
            itemStyle: { color: number(item.contribution) >= 0 ? "#10b981" : "#ef4444" }
          }))
        }]
      };
    }

    if (moduleKey === "promotion_detail" && tableData.length) {
      return {
        color: ["#2563eb", "#f59e0b"],
        tooltip: { trigger: "axis" },
        legend: { top: 0, right: 0 },
        grid: { left: 58, right: 58, top: 42, bottom: 52 },
        xAxis: {
          type: "category",
          data: tableData.slice(0, 10).map((item) => label(item.planName)),
          axisLabel: { rotate: 28, width: 90, overflow: "truncate" }
        },
        yAxis: [
          { type: "value", axisLabel: { formatter: (value: number) => `${(value / 10000).toFixed(0)}万` } },
          { type: "value", axisLabel: { formatter: (value: number) => value.toFixed(1) } }
        ],
        series: [
          { name: "成交金额", type: "bar", data: tableData.slice(0, 10).map((item) => number(item.revenue)), barMaxWidth: 26 },
          { name: "ROI", type: "line", yAxisIndex: 1, smooth: true, data: tableData.slice(0, 10).map((item) => number(item.roi)) }
        ]
      };
    }

    return null;
  }, [chartData, moduleKey, tableData]);

  if (!option) return null;
  return <EChart option={option} className="mt-4 h-80 w-full" />;
}
