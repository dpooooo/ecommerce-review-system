"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, Expand, Minimize, Presentation, X } from "lucide-react";
import type { MetricComparison, ReportSchema } from "@/lib/analysis/types";
import { formatMoney, formatNumber, formatPercent } from "@/lib/format";

type Row = Record<string, unknown>;

function number(value: unknown) {
  const parsed = Number(value || 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

function valueOf(metric: MetricComparison) {
  if (["gmv", "gsv", "aov", "refundAmount", "spend"].includes(metric.key)) return formatMoney(metric.current);
  if (["conversionRate", "refundRate"].includes(metric.key)) return formatPercent(metric.current);
  if (metric.key === "roi") return metric.current.toFixed(2);
  return formatNumber(metric.current);
}

function toneOf(metric: MetricComparison) {
  const reverse = metric.key === "refundAmount" || metric.key === "refundRate";
  const positive = reverse ? metric.trend === "down" : metric.trend === "up";
  if (metric.trend === "flat") return "text-slate-500";
  return positive ? "text-emerald-600" : "text-red-600";
}

function moduleOf(report: ReportSchema, key: string) {
  return report.modules.find((module) => module.key === key);
}

function SlideShell({ eyebrow, title, children }: { eyebrow: string; title: string; children: React.ReactNode }) {
  return (
    <section className="flex h-full min-h-0 flex-col overflow-hidden bg-[#f4f7fb] p-[clamp(24px,4vw,64px)]">
      <div className="shrink-0">
        <div className="text-sm font-semibold text-emerald-700">{eyebrow}</div>
        <h2 className="mt-2 text-[clamp(26px,3vw,48px)] font-semibold leading-tight text-slate-950">{title}</h2>
      </div>
      <div className="mt-6 min-h-0 flex-1">{children}</div>
    </section>
  );
}

function CoverSlide({ report }: { report: ReportSchema }) {
  return (
    <section className="relative flex h-full flex-col justify-between overflow-hidden bg-slate-950 p-[clamp(32px,6vw,88px)] text-white">
      <div className="absolute inset-y-0 right-0 w-2/5 bg-emerald-500" />
      <div className="relative flex items-center gap-3 text-sm font-semibold text-emerald-300">
        <Presentation size={20} /> 电商增长复盘系统
      </div>
      <div className="relative max-w-4xl">
        <div className="mb-5 h-1 w-20 bg-emerald-400" />
        <h1 className="text-[clamp(38px,6vw,84px)] font-semibold leading-[1.08]">{report.title}</h1>
        <p className="mt-6 text-[clamp(18px,2vw,28px)] text-slate-300">{report.shop.name} · {report.period.current.start} 至 {report.period.current.end}</p>
      </div>
      <div className="relative text-sm text-slate-400">经营结果 · 归因诊断 · 行动方案</div>
    </section>
  );
}

function OverviewSlide({ report }: { report: ReportSchema }) {
  return (
    <SlideShell eyebrow="01 / 经营总览" title="先看结果，再判断增长质量">
      <div className="grid h-full min-h-0 grid-cols-1 gap-5 lg:grid-cols-[1.35fr_1fr]">
        <div className="grid min-h-0 grid-cols-2 gap-4 xl:grid-cols-3">
          {report.metrics.slice(0, 9).map((metric) => (
            <div key={metric.key} className="flex min-h-0 flex-col justify-between rounded-md border border-slate-200 bg-white p-5">
              <div className="text-sm font-medium text-slate-500">{metric.name}</div>
              <div className="my-2 text-[clamp(24px,2.4vw,40px)] font-semibold text-slate-950">{valueOf(metric)}</div>
              <div className={`text-sm font-semibold ${toneOf(metric)}`}>{metric.displayChange}</div>
            </div>
          ))}
        </div>
        <div className="flex min-h-0 flex-col rounded-md border border-slate-200 bg-white p-6">
          <div className="text-sm font-semibold text-emerald-700">经营结论</div>
          <p className="mt-4 text-[clamp(17px,1.5vw,24px)] font-semibold leading-relaxed text-slate-900">
            {report.executiveSummary.gmvSentence}{report.executiveSummary.gsvSentence}
          </p>
          <div className="mt-auto grid grid-cols-2 gap-4 pt-6">
            <div className="rounded-md bg-red-50 p-4"><div className="text-3xl font-semibold text-red-600">{report.anomalies.length}</div><div className="mt-1 text-sm text-red-700">异常待处理</div></div>
            <div className="rounded-md bg-emerald-50 p-4"><div className="text-3xl font-semibold text-emerald-600">{report.actionItems.length}</div><div className="mt-1 text-sm text-emerald-700">行动项</div></div>
          </div>
        </div>
      </div>
    </SlideShell>
  );
}

function AttributionSlide({ report }: { report: ReportSchema }) {
  const gmv = (moduleOf(report, "gmv_attribution")?.tables?.[0]?.data || []) as Row[];
  const gsv = (moduleOf(report, "gsv_attribution")?.tables?.[0]?.data || []) as Row[];
  const groups = [{ title: "GMV 归因", rows: gmv }, { title: "GSV 影响", rows: gsv }];
  const max = Math.max(1, ...groups.flatMap((group) => group.rows.map((row) => Math.abs(number(row.contribution)))));
  return (
    <SlideShell eyebrow="02 / 增长归因" title="谁在拉升，谁在拖累">
      <div className="grid h-full min-h-0 grid-cols-1 gap-5 lg:grid-cols-2">
        {groups.map((group) => (
          <div key={group.title} className="min-h-0 rounded-md border border-slate-200 bg-white p-6">
            <h3 className="text-xl font-semibold text-slate-950">{group.title}</h3>
            <div className="mt-6 space-y-5">
              {group.rows.slice(0, 5).map((row, index) => {
                const contribution = number(row.contribution);
                return <div key={index}>
                  <div className="flex items-center justify-between gap-4 text-sm"><span className="font-medium text-slate-700">{String(row.name || `因素 ${index + 1}`)}</span><span className={contribution >= 0 ? "font-semibold text-emerald-600" : "font-semibold text-red-600"}>{contribution >= 0 ? "+" : ""}{formatMoney(contribution)}</span></div>
                  <div className="mt-2 h-3 overflow-hidden rounded-full bg-slate-100"><div className={contribution >= 0 ? "h-full rounded-full bg-emerald-500" : "h-full rounded-full bg-red-500"} style={{ width: `${Math.max(3, Math.abs(contribution) / max * 100)}%` }} /></div>
                </div>;
              })}
            </div>
          </div>
        ))}
      </div>
    </SlideShell>
  );
}

function ProductSlide({ report }: { report: ReportSchema }) {
  const table = (moduleOf(report, "product_analysis")?.tables?.[0] || {}) as Row;
  const products = (table.topProducts || []) as Row[];
  const quadrants = (table.quadrants || []) as Row[];
  const maxGmv = Math.max(1, ...products.map((item) => number(item.gmv)));
  return (
    <SlideShell eyebrow="03 / 商品经营" title="主力商品守盘，潜力商品加码">
      <div className="grid h-full min-h-0 grid-cols-1 gap-5 lg:grid-cols-[1.35fr_1fr]">
        <div className="min-h-0 rounded-md border border-slate-200 bg-white p-6">
          <h3 className="text-lg font-semibold text-slate-950">商品 GMV Top</h3>
          <div className="mt-5 space-y-3">
            {products.slice(0, 7).map((item, index) => <div key={index} className="grid grid-cols-[minmax(100px,180px)_1fr_90px] items-center gap-3 text-sm"><span className="truncate font-medium text-slate-700">{String(item.productName || item.productId || "未命名商品")}</span><div className="h-4 overflow-hidden rounded-sm bg-slate-100"><div className="h-full bg-blue-600" style={{ width: `${Math.max(3, number(item.gmv) / maxGmv * 100)}%` }} /></div><span className="text-right font-semibold text-slate-950">{formatMoney(number(item.gmv))}</span></div>)}
          </div>
        </div>
        <div className="grid min-h-0 grid-cols-2 gap-4">
          {quadrants.slice(0, 4).map((item, index) => <div key={index} className="flex flex-col rounded-md border border-slate-200 bg-white p-5"><div className="text-sm text-slate-500">{String(item.name || "商品分组")}</div><div className="mt-2 text-3xl font-semibold text-slate-950">{formatNumber(number(item.count))}</div><div className="mt-1 text-sm font-medium text-emerald-600">{formatMoney(number(item.gmv))}</div><p className="mt-auto pt-4 text-sm leading-6 text-slate-600">{String(item.advice || "持续观察商品表现。")}</p></div>)}
        </div>
      </div>
    </SlideShell>
  );
}

function PromotionSlide({ report }: { report: ReportSchema }) {
  const module = moduleOf(report, "promotion_detail");
  const plans = (module?.tables?.[0]?.data || []) as Row[];
  const summary = (module?.tables?.find((table) => table.summary)?.summary || {}) as Row;
  const spend = number(summary.spend) || plans.reduce((sum, row) => sum + number(row.spend), 0);
  const revenue = number(summary.promoGmv || summary.revenue) || plans.reduce((sum, row) => sum + number(row.revenue), 0);
  const roi = number(summary.roi) || (spend ? revenue / spend : 0);
  const sorted = [...plans].sort((a, b) => number(b.revenue) - number(a.revenue)).slice(0, 5);
  return (
    <SlideShell eyebrow="04 / 推广决策" title="先判断投放是否赚钱，再调整预算">
      <div className="grid h-full min-h-0 grid-cols-1 gap-5 lg:grid-cols-[0.8fr_1.2fr]">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 lg:grid-cols-1">
          {[{ label: "推广花费", value: formatMoney(spend) }, { label: "推广成交", value: formatMoney(revenue) }, { label: "推广 ROI", value: roi.toFixed(2) }].map((item) => <div key={item.label} className="flex flex-col justify-center rounded-md border border-slate-200 bg-white p-6"><div className="text-sm font-medium text-slate-500">{item.label}</div><div className="mt-3 text-[clamp(28px,3vw,48px)] font-semibold text-slate-950">{item.value}</div></div>)}
        </div>
        <div className="min-h-0 rounded-md border border-slate-200 bg-white p-6">
          <div className="flex items-center justify-between"><h3 className="text-lg font-semibold text-slate-950">计划表现</h3><span className="text-sm text-slate-500">按成交金额排序</span></div>
          <div className="mt-5 divide-y divide-slate-200">
            {sorted.map((row, index) => <div key={index} className="grid grid-cols-[32px_1fr_100px_80px] items-center gap-3 py-4 text-sm"><span className="font-semibold text-slate-400">{String(index + 1).padStart(2, "0")}</span><span className="truncate font-semibold text-slate-900">{String(row.planName || row.planId || "未命名计划")}</span><span className="text-right text-slate-600">{formatMoney(number(row.spend))}</span><span className="text-right font-semibold text-emerald-600">{number(row.roi).toFixed(2)}</span></div>)}
          </div>
        </div>
      </div>
    </SlideShell>
  );
}

function ActionSlide({ report }: { report: ReportSchema }) {
  return (
    <SlideShell eyebrow="05 / 行动闭环" title="把异常变成可执行的下一步">
      <div className="grid h-full min-h-0 grid-cols-1 gap-5 lg:grid-cols-2">
        <div className="min-h-0 rounded-md border border-slate-200 bg-white p-6"><h3 className="text-lg font-semibold text-slate-950">关键异常</h3><div className="mt-4 space-y-3">{report.anomalies.slice(0, 4).map((item, index) => <div key={index} className="rounded-md border border-red-100 bg-red-50 p-4"><div className="flex items-center gap-3"><span className="rounded-md bg-red-600 px-2 py-1 text-xs font-semibold text-white">{String(item.priority || "P1")}</span><span className="font-semibold text-slate-950">{String(item.title || "经营异常")}</span></div><p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-600">{String(item.reason || item.impact || "需要进一步排查。")}</p></div>)}</div></div>
        <div className="min-h-0 rounded-md border border-slate-200 bg-white p-6"><h3 className="text-lg font-semibold text-slate-950">行动清单</h3><div className="mt-4 space-y-3">{report.actionItems.slice(0, 4).map((item, index) => <div key={index} className="rounded-md border border-emerald-100 bg-emerald-50 p-4"><div className="font-semibold text-slate-950">{String(item.title || `行动 ${index + 1}`)}</div><p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-600">{String(item.action || "确认负责人并推进执行。")}</p><div className="mt-2 text-xs font-medium text-emerald-700">{String(item.estimatedImpact || item.targetMetric || "持续跟进")}</div></div>)}</div></div>
      </div>
    </SlideShell>
  );
}

export function WebPresentation({ report, closeHref }: { report: ReportSchema; closeHref?: string }) {
  const slides = useMemo(() => [
    <CoverSlide key="cover" report={report} />,
    <OverviewSlide key="overview" report={report} />,
    <AttributionSlide key="attribution" report={report} />,
    <ProductSlide key="product" report={report} />,
    <PromotionSlide key="promotion" report={report} />,
    <ActionSlide key="action" report={report} />
  ], [report]);
  const [index, setIndex] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);
  const previous = useCallback(() => setIndex((value) => Math.max(0, value - 1)), []);
  const next = useCallback(() => setIndex((value) => Math.min(slides.length - 1, value + 1)), [slides.length]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (["ArrowRight", "PageDown", " "].includes(event.key)) { event.preventDefault(); next(); }
      if (["ArrowLeft", "PageUp"].includes(event.key)) { event.preventDefault(); previous(); }
      if (event.key === "Home") setIndex(0);
      if (event.key === "End") setIndex(slides.length - 1);
      if (event.key.toLowerCase() === "f") document.documentElement.requestFullscreen?.();
    };
    const onFullscreen = () => setFullscreen(Boolean(document.fullscreenElement));
    window.addEventListener("keydown", onKeyDown);
    document.addEventListener("fullscreenchange", onFullscreen);
    return () => { window.removeEventListener("keydown", onKeyDown); document.removeEventListener("fullscreenchange", onFullscreen); };
  }, [next, previous, slides.length]);

  async function toggleFullscreen() {
    if (document.fullscreenElement) await document.exitFullscreen();
    else await document.documentElement.requestFullscreen?.();
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 p-0 sm:p-4">
      <div className="relative aspect-video w-full max-w-[1600px] overflow-hidden bg-white shadow-2xl">{slides[index]}</div>
      <div className="fixed inset-x-0 bottom-0 z-20 flex items-center justify-between gap-3 bg-slate-950/90 px-3 py-2 text-white backdrop-blur sm:inset-x-auto sm:bottom-5 sm:rounded-md sm:px-4">
        {closeHref ? <a href={closeHref} title="退出演示" className="grid h-9 w-9 place-items-center rounded-md hover:bg-white/10"><X size={18} /></a> : null}
        <button onClick={previous} disabled={index === 0} title="上一页" className="grid h-9 w-9 place-items-center rounded-md hover:bg-white/10 disabled:opacity-30"><ArrowLeft size={18} /></button>
        <div className="min-w-20 text-center text-sm font-medium">{index + 1} / {slides.length}</div>
        <button onClick={next} disabled={index === slides.length - 1} title="下一页" className="grid h-9 w-9 place-items-center rounded-md hover:bg-white/10 disabled:opacity-30"><ArrowRight size={18} /></button>
        <button onClick={toggleFullscreen} title={fullscreen ? "退出全屏" : "全屏"} className="grid h-9 w-9 place-items-center rounded-md hover:bg-white/10">{fullscreen ? <Minimize size={18} /> : <Expand size={18} />}</button>
      </div>
      <div className="fixed left-0 right-0 top-0 z-10 h-1 bg-slate-800"><div className="h-full bg-emerald-400 transition-all" style={{ width: `${((index + 1) / slides.length) * 100}%` }} /></div>
    </main>
  );
}
