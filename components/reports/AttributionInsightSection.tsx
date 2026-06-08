"use client";

import { useMemo } from "react";
import type { EChartsOption } from "echarts";
import { EChart } from "@/components/charts/EChart";
import { Card } from "@/components/common/Card";
import type { ReportSchema } from "@/lib/analysis/types";
import { formatMoney, formatPercent } from "@/lib/format";

type AttributionRow = Record<string, unknown>;

const factorLabels: Record<string, string> = {
  traffic: "流量",
  conversionRate: "转化率",
  aov: "客单价",
  refund: "退款/售后",
  gmv_growth: "成交增长",
  gsv_net: "GSV净变化"
};

const factorChangeText: Record<string, { up: string; down: string }> = {
  traffic: { up: "提升", down: "下降" },
  conversionRate: { up: "提升", down: "下降" },
  aov: { up: "提升", down: "下降" },
  refund: { up: "退款增加", down: "退款减少" },
  gmv_growth: { up: "成交增长", down: "成交下降" },
  gsv_net: { up: "净增长", down: "净下降" }
};

function number(value: unknown) {
  const result = Number(value || 0);
  return Number.isFinite(result) ? result : 0;
}

function rowsFor(report: ReportSchema, key: string) {
  return (report.modules.find((item) => item.key === key)?.tables?.[0]?.data || []) as AttributionRow[];
}

function factorKey(row: AttributionRow) {
  return String(row.factor || row.key || "");
}

function factorName(row: AttributionRow) {
  const key = factorKey(row);
  return factorLabels[key] || String(row.name || key || "因素");
}

function contribution(row: AttributionRow) {
  return number(row.contribution);
}

function normalizeGsvRows(rows: AttributionRow[]) {
  const gmvGrowth = rows.find((row) => factorKey(row) === "gmv_growth");
  const children = Array.isArray(gmvGrowth?.children) ? (gmvGrowth.children as AttributionRow[]) : [];
  const refund = rows.find((row) => factorKey(row) === "refund");
  return [...children, ...(refund ? [refund] : [])];
}

function netChange(rows: AttributionRow[], netFactor?: string) {
  const netRow = netFactor ? rows.find((row) => factorKey(row) === netFactor) : undefined;
  if (netRow) return contribution(netRow);
  return rows.reduce((sum, row) => sum + contribution(row), 0);
}

function splitRows(rows: AttributionRow[]) {
  const sorted = [...rows].sort((a, b) => Math.abs(contribution(b)) - Math.abs(contribution(a)));
  return {
    lifts: sorted.filter((row) => contribution(row) > 0),
    drags: sorted.filter((row) => contribution(row) < 0),
    biggestDrag: sorted.find((row) => contribution(row) < 0),
    biggestLift: sorted.find((row) => contribution(row) > 0)
  };
}

function formatAmount(value: number) {
  const prefix = value > 0 ? "+" : "";
  return `${prefix}${formatMoney(value)}`;
}

function influenceShare(row: AttributionRow, rows: AttributionRow[]) {
  const total = rows.reduce((sum, item) => sum + Math.abs(contribution(item)), 0);
  if (!total) return "0.0%";
  return formatPercent(Math.abs(contribution(row)) / total);
}

function changeSentence(row: AttributionRow) {
  const key = factorKey(row);
  const current = number(row.current);
  const previous = number(row.previous);
  const up = current >= previous;
  const text = factorChangeText[key]?.[up ? "up" : "down"] || (up ? "提升" : "下降");
  if (key === "conversionRate") return `${text}${formatPercent(Math.abs(current - previous))}`;
  if (key === "traffic") return `${text}${formatPercent(previous ? Math.abs(current - previous) / previous : 0)}`;
  if (key === "aov") return `${text}${formatPercent(previous ? Math.abs(current - previous) / previous : 0)}`;
  if (key === "refund") return contribution(row) < 0 ? "退款增加形成拖累" : "退款减少形成拉动";
  return text;
}

function chartOption(rows: AttributionRow[]): EChartsOption {
  const maxAbs = Math.max(...rows.map((row) => Math.abs(contribution(row))), 1);
  return {
    animationDuration: 500,
    tooltip: {
      trigger: "axis",
      axisPointer: { type: "shadow" },
      valueFormatter: (value) => `¥${Number(value || 0).toLocaleString("zh-CN")}`
    },
    grid: { left: 54, right: 28, top: 32, bottom: 36 },
    xAxis: {
      type: "category",
      data: rows.map(factorName),
      axisLabel: { color: "#475569", fontWeight: 600 },
      axisLine: { lineStyle: { color: "#cbd5e1" } },
      axisTick: { show: false }
    },
    yAxis: {
      type: "value",
      min: -maxAbs * 1.18,
      max: maxAbs * 1.18,
      axisLabel: {
        color: "#64748b",
        formatter: (value: number) => `${Math.round(value / 10000)}万`
      },
      splitLine: { lineStyle: { type: "dashed", color: "#dbe5ef" } }
    },
    series: [{
      type: "bar",
      barWidth: 44,
      data: rows.map((row) => ({
        value: contribution(row),
        label: {
          show: true,
          position: contribution(row) >= 0 ? "top" : "bottom",
          formatter: () => formatAmount(contribution(row)).replace("¥", ""),
          color: "#334155",
          fontWeight: 700
        },
        itemStyle: {
          color: contribution(row) >= 0 ? "#10b981" : "#ef4444",
          borderRadius: contribution(row) >= 0 ? [6, 6, 0, 0] : [0, 0, 6, 6]
        }
      })),
      markLine: {
        symbol: "none",
        silent: true,
        lineStyle: { color: "#94a3b8", type: "dashed" },
        data: [{ yAxis: 0 }]
      }
    }]
  };
}

function FactorList({
  title,
  rows,
  tone,
  allRows
}: {
  title: string;
  rows: AttributionRow[];
  tone: "lift" | "drag";
  allRows: AttributionRow[];
}) {
  if (!rows.length) {
    return (
      <div>
        <h4 className="font-semibold text-slate-950">{title}</h4>
        <div className="mt-3 rounded-md border border-dashed border-slate-200 p-3 text-sm text-slate-500">暂无{title}</div>
      </div>
    );
  }
  return (
    <div>
      <h4 className="font-semibold text-slate-950">{title}</h4>
      <div className="mt-3 divide-y divide-slate-200">
        {rows.slice(0, 3).map((row, index) => (
          <div key={`${factorKey(row)}-${index}`} className="flex items-center justify-between gap-4 py-3">
            <div>
              <div className="text-sm text-slate-900">{factorName(row)}</div>
              <div className="mt-1 text-xs text-slate-500">
                {changeSentence(row)}，影响强度 {influenceShare(row, allRows)}
              </div>
            </div>
            <div className={tone === "lift" ? "text-right font-semibold text-emerald-600" : "text-right font-semibold text-red-600"}>
              {formatAmount(contribution(row))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AttributionCard({
  title,
  rows,
  net
}: {
  title: string;
  rows: AttributionRow[];
  net: number;
}) {
  const { lifts, drags, biggestDrag, biggestLift } = splitRows(rows);
  const biggest = biggestDrag || biggestLift;
  const option = useMemo(() => chartOption(rows), [rows]);
  const liftTotal = lifts.reduce((sum, row) => sum + contribution(row), 0);
  const dragTotal = Math.abs(drags.reduce((sum, row) => sum + contribution(row), 0));
  const dragName = biggestDrag ? factorName(biggestDrag) : "暂无拖累项";
  const liftName = biggestLift ? factorName(biggestLift) : "暂无拉升项";
  const netText = net >= 0 ? "净增长" : "净下降";

  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-sm text-slate-500">{title}</div>
          <h3 className="mt-1 text-xl font-semibold text-slate-950">{title}{netText} {formatAmount(net)}</h3>
        </div>
        <div className={net >= 0 ? "text-2xl font-semibold text-emerald-600" : "text-2xl font-semibold text-red-600"}>
          {formatAmount(net)}
        </div>
      </div>

      <div className="mt-5 rounded-md bg-emerald-50/70 p-4 text-base font-semibold leading-8 text-slate-900">
        {title}最终{netText}{formatAmount(Math.abs(net)).replace("+", "")}。拉升项合计贡献{formatAmount(liftTotal)}，主要来自{liftName}；
        拖累项合计影响{formatAmount(-dragTotal)}，主要来自{dragName}。这意味着当前不是单一指标决定结果，而是增长项和风险项同时存在。
      </div>

      {biggest ? (
        <div className="mt-4 rounded-md border border-red-100 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          最大影响因素：{factorName(biggest)}，影响 {formatAmount(contribution(biggest))}
        </div>
      ) : null}

      <div className="mt-4 rounded-md border border-slate-200 bg-white p-3">
        <EChart option={option} className="h-72 w-full" />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
        <FactorList title="拉升项" rows={lifts} tone="lift" allRows={rows} />
        <FactorList title="拖累项" rows={drags} tone="drag" allRows={rows} />
      </div>
    </Card>
  );
}

export function AttributionInsightSection({ report }: { report: ReportSchema }) {
  const gmvRows = rowsFor(report, "gmv_attribution");
  const gsvRows = normalizeGsvRows(rowsFor(report, "gsv_attribution"));
  const gmvNet = netChange(gmvRows);
  const gsvNet = netChange(rowsFor(report, "gsv_attribution"), "gsv_net");

  if (!gmvRows.length && !gsvRows.length) return null;

  return (
    <section id="section-attribution-insight" className="scroll-mt-24 space-y-5">
      <div>
        <div className="text-sm font-semibold text-emerald-700">GMV / GSV归因分析</div>
        <h2 className="mt-2 text-2xl font-semibold text-slate-950">用经营语言解释：谁在拉升，谁在拖累</h2>
      </div>
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        {gmvRows.length ? <AttributionCard title="GMV归因" rows={gmvRows} net={gmvNet} /> : null}
        {gsvRows.length ? <AttributionCard title="GSV归因" rows={gsvRows} net={gsvNet} /> : null}
      </div>
    </section>
  );
}
