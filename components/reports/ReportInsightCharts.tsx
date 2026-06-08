"use client";

import { useMemo } from "react";
import type { EChartsOption } from "echarts";
import { EChart } from "@/components/charts/EChart";
import { Card } from "@/components/common/Card";
import type { ReportSchema } from "@/lib/analysis/types";

function number(value: unknown) {
  const result = Number(value || 0);
  return Number.isFinite(result) ? result : 0;
}

function label(value: unknown) {
  return String(value || "未命名");
}

function moneyAxis(value: number) {
  return `${(value / 10000).toFixed(0)}万`;
}

function firstChartData(report: ReportSchema, key: string) {
  return (report.modules.find((item) => item.key === key)?.charts?.[0]?.data || []) as Array<Record<string, unknown>>;
}

function firstTableData(report: ReportSchema, key: string) {
  return (report.modules.find((item) => item.key === key)?.tables?.[0]?.data || []) as Array<Record<string, unknown>>;
}

function firstTable(report: ReportSchema, key: string) {
  return (report.modules.find((item) => item.key === key)?.tables?.[0] || {}) as Record<string, unknown>;
}

export function ReportInsightCharts({ report, showAttribution = true }: { report: ReportSchema; showAttribution?: boolean }) {
  const trendData = firstChartData(report, "trend");
  const attributionData = firstTableData(report, "gmv_attribution");
  const productTable = firstTable(report, "product_analysis");
  const productRows = ((productTable.topProducts || []) as Array<Record<string, unknown>>).slice(0, 8);
  const quadrantRows = ((productTable.quadrants || []) as Array<Record<string, unknown>>);

  const trendOption = useMemo<EChartsOption>(() => ({
    animationDuration: 500,
    color: ["#2563eb", "#10b981"],
    tooltip: {
      trigger: "axis",
      valueFormatter: (value) => `¥${Number(value || 0).toLocaleString("zh-CN")}`
    },
    legend: { top: 0, right: 0, textStyle: { color: "#64748b" } },
    grid: { left: 56, right: 24, top: 42, bottom: 32 },
    xAxis: {
      type: "category",
      boundaryGap: false,
      data: trendData.map((item) => label(item.date)),
      axisLabel: { color: "#64748b" },
      axisLine: { lineStyle: { color: "#cbd5e1" } }
    },
    yAxis: {
      type: "value",
      axisLabel: { color: "#64748b", formatter: moneyAxis },
      splitLine: { lineStyle: { color: "#eef2f7" } }
    },
    series: [
      {
        name: "GMV",
        type: "line",
        smooth: true,
        symbolSize: 6,
        data: trendData.map((item) => number(item.gmv)),
        areaStyle: { color: "rgba(37,99,235,.08)" },
        lineStyle: { width: 3 }
      },
      {
        name: "GSV",
        type: "line",
        smooth: true,
        symbolSize: 6,
        data: trendData.map((item) => number(item.gsv)),
        lineStyle: { width: 3 }
      }
    ]
  }), [trendData]);

  const attributionOption = useMemo<EChartsOption>(() => ({
    tooltip: {
      trigger: "axis",
      axisPointer: { type: "shadow" },
      valueFormatter: (value) => `¥${Number(value || 0).toLocaleString("zh-CN")}`
    },
    grid: { left: 78, right: 24, top: 12, bottom: 28 },
    xAxis: {
      type: "value",
      axisLabel: { color: "#64748b", formatter: moneyAxis },
      splitLine: { lineStyle: { color: "#eef2f7" } }
    },
    yAxis: {
      type: "category",
      data: attributionData.map((item) => label(item.name)),
      axisLabel: { color: "#475569" },
      axisLine: { show: false },
      axisTick: { show: false }
    },
    series: [{
      type: "bar",
      barWidth: 18,
      data: attributionData.map((item) => ({
        value: number(item.contribution),
        itemStyle: {
          color: number(item.contribution) >= 0 ? "#10b981" : "#ef4444",
          borderRadius: number(item.contribution) >= 0 ? [0, 4, 4, 0] : [4, 0, 0, 4]
        }
      }))
    }]
  }), [attributionData]);

  const productOption = useMemo<EChartsOption>(() => {
    const data = [...productRows].reverse();
    return {
      tooltip: {
        trigger: "axis",
        axisPointer: { type: "shadow" },
        valueFormatter: (value) => `¥${Number(value || 0).toLocaleString("zh-CN")}`
      },
      grid: { left: 92, right: 20, top: 12, bottom: 26 },
      xAxis: {
        type: "value",
        axisLabel: { color: "#64748b", formatter: moneyAxis },
        splitLine: { lineStyle: { color: "#eef2f7" } }
      },
      yAxis: {
        type: "category",
        data: data.map((item) => label(item.productName || item.productId)),
        axisLabel: { color: "#475569", width: 86, overflow: "truncate" },
        axisLine: { show: false },
        axisTick: { show: false }
      },
      series: [{
        type: "bar",
        barWidth: 16,
        data: data.map((item) => number(item.gmv)),
        itemStyle: { color: "#2563eb", borderRadius: [0, 4, 4, 0] }
      }]
    };
  }, [productRows]);

  const quadrantOption = useMemo<EChartsOption>(() => ({
    color: ["#2563eb", "#10b981", "#f59e0b", "#ef4444"],
    tooltip: { trigger: "item" },
    legend: { bottom: 0, textStyle: { color: "#64748b" } },
    series: [{
      type: "pie",
      radius: ["48%", "70%"],
      center: ["50%", "42%"],
      label: { formatter: "{b}\n{c}", color: "#475569" },
      data: quadrantRows.map((item) => ({ name: label(item.name || item.key), value: number(item.count) }))
    }]
  }), [quadrantRows]);

  return (
    <section className="grid grid-cols-1 gap-6 xl:grid-cols-6">
      <Card className={`p-5 ${showAttribution ? "xl:col-span-4" : "xl:col-span-6"}`}>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-slate-950">GMV / GSV 趋势</h2>
            <p className="mt-1 text-sm text-slate-500">先看经营结果走势，再进入归因和明细。</p>
          </div>
          <span className="rounded-md border border-slate-200 px-2 py-1 text-xs text-slate-500">趋势</span>
        </div>
        <EChart option={trendOption} className="h-80 w-full" />
      </Card>
      {showAttribution ? (
        <Card className="p-5 xl:col-span-2">
          <h2 className="mb-4 font-semibold text-slate-950">GMV 归因</h2>
          <EChart option={attributionOption} className="h-80 w-full" />
        </Card>
      ) : null}
      <Card className="p-5 xl:col-span-3">
        <h2 className="mb-4 font-semibold text-slate-950">商品 GMV Top</h2>
        <EChart option={productOption} className="h-72 w-full" />
      </Card>
      <Card className="p-5 xl:col-span-3">
        <h2 className="mb-4 font-semibold text-slate-950">商品结构象限</h2>
        <EChart option={quadrantOption} className="h-72 w-full" />
      </Card>
    </section>
  );
}
