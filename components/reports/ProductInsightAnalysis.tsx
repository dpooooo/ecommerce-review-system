import { AlertTriangle, Boxes, CircleDollarSign } from "lucide-react";
import { ProductQuadrantChart } from "@/components/dashboard/ProductCharts";
import { formatMoney, formatNumber, formatPercent } from "@/lib/format";

function asNumber(value: unknown) {
  const number = Number(value || 0);
  return Number.isFinite(number) ? number : 0;
}

function text(value: unknown) {
  return String(value ?? "-");
}

function toneForTag(tag: string) {
  if (tag === "明星商品") return "border-emerald-500 bg-emerald-50 text-emerald-700";
  if (tag === "现金牛商品") return "border-brand-500 bg-brand-50 text-brand-700";
  if (tag === "潜力商品") return "border-amber-500 bg-amber-50 text-amber-700";
  return "border-red-500 bg-red-50 text-red-700";
}

function tagBadgeClass(tag: string) {
  if (tag === "优秀商品" || tag === "明星商品") return "bg-emerald-50 text-emerald-700";
  if (tag === "流量/成交下滑" || tag === "转化偏弱") return "bg-amber-50 text-amber-700";
  if (tag === "退款风险" || tag === "问题商品") return "bg-red-50 text-red-700";
  return "bg-slate-100 text-slate-600";
}

function formatDelta(value: unknown) {
  const amount = asNumber(value);
  const sign = amount > 0 ? "+" : "";
  return `${sign}${formatMoney(amount)}`;
}

function ProductStructureCard({ row }: { row: Record<string, unknown> }) {
  const tag = text(row.name);
  return (
    <div className={`rounded-md border-t-4 bg-white p-4 shadow-sm ${toneForTag(tag)}`}>
      <div className="text-sm text-slate-500">{text(row.advice)}</div>
      <div className="mt-2 text-xl font-semibold text-slate-950">{tag}</div>
      <div className="mt-3 text-2xl font-semibold text-slate-950">{formatNumber(asNumber(row.count))} 个商品</div>
      <div className="mt-4 divide-y divide-slate-200 border-y border-slate-200 text-sm">
        <div className="flex justify-between py-2">
          <span className="text-slate-500">当前GMV</span>
          <span className="font-semibold text-slate-950">{formatMoney(asNumber(row.gmv))}</span>
        </div>
        <div className="flex justify-between py-2">
          <span className="text-slate-500">GMV变化</span>
          <span className={asNumber(row.gmvChange) >= 0 ? "font-semibold text-emerald-600" : "font-semibold text-red-600"}>{formatDelta(row.gmvChange)}</span>
        </div>
      </div>
      <div className="mt-3 text-xs leading-5 text-slate-500">
        代表商品：{Array.isArray(row.samples) && row.samples.length ? row.samples.join("、") : "-"}
      </div>
    </div>
  );
}

function ProductTable({ rows }: { rows: Array<Record<string, unknown>> }) {
  return (
    <div className="overflow-hidden rounded-md border border-slate-200">
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="px-3 py-2 font-medium">标签</th>
              <th className="px-3 py-2 font-medium">商品</th>
              <th className="px-3 py-2 text-right font-medium">GMV</th>
              <th className="px-3 py-2 text-right font-medium">GSV</th>
              <th className="px-3 py-2 text-right font-medium">流量</th>
              <th className="px-3 py-2 text-right font-medium">转化率</th>
              <th className="px-3 py-2 text-right font-medium">客单价</th>
              <th className="px-3 py-2 text-right font-medium">GMV变化</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 bg-white">
            {rows.slice(0, 12).map((row, index) => (
              <tr key={`${text(row.productId)}-${index}`} className="hover:bg-slate-50/80">
                <td className="whitespace-nowrap px-3 py-2">
                  <span className={`rounded-md px-2 py-1 text-xs font-semibold ${tagBadgeClass(text(row.issueType || row.tag))}`}>{text(row.issueType || row.tag)}</span>
                </td>
                <td className="min-w-44 px-3 py-2 font-medium text-slate-900">{text(row.productName || row.productId)}</td>
                <td className="whitespace-nowrap px-3 py-2 text-right">{formatMoney(asNumber(row.gmv))}</td>
                <td className="whitespace-nowrap px-3 py-2 text-right">{formatMoney(asNumber(row.gsv))}</td>
                <td className="whitespace-nowrap px-3 py-2 text-right">{formatNumber(asNumber(row.traffic))}</td>
                <td className="whitespace-nowrap px-3 py-2 text-right">{formatPercent(asNumber(row.conversionRate))}</td>
                <td className="whitespace-nowrap px-3 py-2 text-right">{formatMoney(asNumber(row.aov))}</td>
                <td className={asNumber(row.gmvChange) >= 0 ? "whitespace-nowrap px-3 py-2 text-right font-semibold text-emerald-600" : "whitespace-nowrap px-3 py-2 text-right font-semibold text-red-600"}>{formatDelta(row.gmvChange)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function RiskProductCards({ rows }: { rows: Array<Record<string, unknown>> }) {
  if (!rows.length) return null;
  return (
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-4">
      {rows.slice(0, 4).map((row, index) => (
        <div key={`${text(row.productId)}-${index}`} className="rounded-md border border-slate-200 bg-white p-4">
          <div className="flex items-center justify-between">
            <span className={index < 2 ? "rounded-md bg-red-600 px-2 py-1 text-xs font-semibold text-white" : "rounded-md bg-amber-600 px-2 py-1 text-xs font-semibold text-white"}>
              {index < 2 ? "P0" : "P1"}
            </span>
            <span className={`rounded-md px-2 py-1 text-xs font-semibold ${tagBadgeClass(text(row.issueType))}`}>{text(row.issueType)}</span>
          </div>
          <div className="mt-4 text-lg font-semibold text-slate-950">{text(row.productName || row.productId)}</div>
          <div className="mt-4 divide-y divide-slate-200 border-y border-slate-200 text-sm">
            <div className="flex justify-between py-2">
              <span className="text-slate-500">影响金额</span>
              <span className="font-semibold text-red-600">{formatDelta(row.gmvChange)}</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-slate-500">退款率</span>
              <span className="font-semibold text-slate-950">{formatPercent(asNumber(row.refundRate))}</span>
            </div>
          </div>
          <p className="mt-3 text-sm leading-6 text-slate-600">{text(row.reason)}</p>
          <p className="mt-3 text-sm font-semibold leading-6 text-slate-950">建议动作：{text(row.action)}</p>
        </div>
      ))}
    </div>
  );
}

export function ProductInsightAnalysis({ table }: { table: Record<string, unknown> }) {
  const summary = (table.summary || {}) as Record<string, unknown>;
  const quadrants = (table.quadrants || []) as Array<Record<string, unknown>>;
  const productRows = ((table.productRows || table.topProducts || []) as Array<Record<string, unknown>>);
  const riskProducts = ((table.riskProducts || []) as Array<Record<string, unknown>>);
  const top5Share = asNumber(summary.top5Share);

  if (!productRows.length && !quadrants.some((item) => asNumber(item.count) > 0)) {
    return (
      <div className="mt-5 rounded-md border border-dashed border-slate-300 bg-slate-50 p-5">
        <div className="text-sm font-semibold text-slate-950">暂无商品明细数据</div>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          当前报告周期内没有可用于商品结构分析的商品数据。请确认已上传对应店铺和周期的商品数据，或切换到有商品明细的周期后重新查看报告。
        </p>
      </div>
    );
  }

  return (
    <div className="mt-5 space-y-6">
      <div>
        <div className="text-sm font-semibold text-emerald-700">商品结构分析</div>
        <h3 className="mt-2 text-2xl font-semibold text-slate-950">用四象限判断哪些商品该加码，哪些商品该治理</h3>
      </div>

      <div className="rounded-md border border-slate-200 bg-slate-50 p-4">
        <div className="flex gap-3">
          <div className="mt-1 h-auto w-1 rounded-full bg-slate-500" />
          <p className="text-base font-semibold leading-8 text-slate-900">
            当前商品成交主要集中在 GMV Top5，贡献占比 {formatPercent(top5Share)}。
            货盘集中度{top5Share >= 0.7 ? "偏高" : "相对分散"}，建议同时关注主推款是否流量见顶、转化走弱，以及高退款商品对 GSV 的侵蚀。
            本期识别 {formatNumber(asNumber(summary.riskCount))} 个重点风险商品，建议按 GMV 损失和退款影响优先处理。
          </p>
        </div>
      </div>

      <div className="rounded-md border border-slate-200 bg-white p-5">
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          <div className="flex flex-col justify-center">
            <div className="text-sm font-semibold text-brand-700">商品四象限分布</div>
            <h4 className="mt-2 text-xl font-semibold text-slate-950">按主力商品与 GMV 增长状态分组</h4>
            <p className="mt-3 text-sm leading-6 text-slate-500">环形图展示各类商品数量，卡片展示每类 GMV 和运营动作。</p>
          </div>
          <ProductQuadrantChart items={quadrants} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-4">
        {quadrants.map((row) => <ProductStructureCard key={text(row.key)} row={row} />)}
      </div>

      <div>
        <div className="text-sm font-semibold text-emerald-700">商品经营分析</div>
        <h3 className="mt-2 text-2xl font-semibold text-slate-950">先看 GMV 贡献 Top 商品，再看谁在拖累结果</h3>
        <div className="mt-4">
          <ProductTable rows={productRows} />
        </div>
      </div>

      <div>
        <div className="text-sm font-semibold text-emerald-700">商品问题诊断</div>
        <h3 className="mt-2 text-2xl font-semibold text-slate-950">把影响经营结果的风险商品做成待处理问题</h3>
        <div className="mt-4">
          <RiskProductCards rows={riskProducts} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <div className="rounded-md border border-slate-200 bg-white p-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-950"><Boxes size={16} />商品样本</div>
          <div className="mt-3 text-2xl font-semibold">{formatNumber(asNumber(summary.totalProducts))} 个</div>
        </div>
        <div className="rounded-md border border-slate-200 bg-white p-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-950"><CircleDollarSign size={16} />主力阈值</div>
          <div className="mt-3 text-2xl font-semibold">{formatMoney(asNumber(summary.mainThreshold))}</div>
        </div>
        <div className="rounded-md border border-slate-200 bg-white p-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-950"><AlertTriangle size={16} />风险商品</div>
          <div className="mt-3 text-2xl font-semibold">{formatNumber(asNumber(summary.riskCount))} 个</div>
        </div>
      </div>
    </div>
  );
}
