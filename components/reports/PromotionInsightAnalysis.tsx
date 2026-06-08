import { AlertTriangle, ArrowRight, BadgeDollarSign, Target, Users } from "lucide-react";
import { formatMoney, formatNumber, formatPercent } from "@/lib/format";

type Row = Record<string, unknown>;

function asNumber(value: unknown) {
  const number = Number(value || 0);
  return Number.isFinite(number) ? number : 0;
}

function text(value: unknown) {
  return String(value ?? "-");
}

function safeRate(numerator: number, denominator: number) {
  return denominator ? numerator / denominator : 0;
}

function sum(rows: Row[], key: string) {
  return rows.reduce((total, row) => total + asNumber(row[key]), 0);
}

function revenueFromBreakdown(row: Row) {
  return asNumber(row.directRevenue) + asNumber(row.indirectRevenue);
}

function revenueFromRoi(row: Row) {
  const spend = asNumber(row.spend);
  const roi = asNumber(row.roi);
  return spend > 0 && roi > 0 ? spend * roi : 0;
}

function looksLikeOrderCount(value: number, row: Row) {
  const orders = asNumber(row.orders);
  return orders > 0 && Math.abs(value - orders) < 0.0001;
}

function normalizedRevenue(row: Row) {
  const rawRevenue = asNumber(row.revenue);
  const breakdownRevenue = revenueFromBreakdown(row);
  const impliedRevenue = revenueFromRoi(row);

  if (breakdownRevenue > 0 && (rawRevenue <= 0 || looksLikeOrderCount(rawRevenue, row) || rawRevenue < breakdownRevenue * 0.2)) {
    return breakdownRevenue;
  }

  if (impliedRevenue > 0 && (rawRevenue <= 0 || looksLikeOrderCount(rawRevenue, row) || rawRevenue < impliedRevenue * 0.2)) {
    return impliedRevenue;
  }

  return rawRevenue;
}

function normalizedRoi(row: Row) {
  const spend = asNumber(row.spend);
  const roi = asNumber(row.roi);
  return roi || safeRate(normalizedRevenue(row), spend);
}

function normalizedOrderCost(row: Row) {
  return asNumber(row.orderCost) || safeRate(asNumber(row.spend), asNumber(row.orders));
}

function sumNormalizedRevenue(rows: Row[]) {
  return rows.reduce((total, row) => total + normalizedRevenue(row), 0);
}

function suspiciousRevenueRows(rows: Row[]) {
  return rows.filter((row) => {
    const rawRevenue = asNumber(row.revenue);
    return rawRevenue > 0 && looksLikeOrderCount(rawRevenue, row) && (revenueFromBreakdown(row) > 0 || revenueFromRoi(row) > 0);
  });
}

function planName(row: Row) {
  return text(row.planName || row.planId || "未命名计划");
}

function audienceName(row: Row) {
  return text(row.audienceName || row.unitName || row.planName || "未命名人群");
}

function MetricCard({
  label,
  value,
  sub,
  tone = "slate"
}: {
  label: string;
  value: string;
  sub?: string;
  tone?: "slate" | "green" | "red";
}) {
  const toneClass = tone === "green" ? "border-emerald-100 bg-emerald-50" : tone === "red" ? "border-red-100 bg-red-50" : "border-slate-200 bg-white";
  const subClass = tone === "green" ? "text-emerald-600" : tone === "red" ? "text-red-600" : "text-slate-500";
  return (
    <div className={`rounded-md border p-4 ${toneClass}`}>
      <div className="text-sm font-semibold text-slate-500">{label}</div>
      <div className="mt-3 text-2xl font-semibold text-slate-950">{value}</div>
      {sub ? <div className={`mt-2 text-sm font-semibold ${subClass}`}>{sub}</div> : null}
    </div>
  );
}

function FunnelRow({ label, value, max }: { label: string; value: number; max: number }) {
  const width = Math.max(4, Math.min(100, safeRate(value, max) * 100));
  return (
    <div className="grid grid-cols-[72px_1fr_96px] items-center gap-3">
      <div className="font-semibold text-slate-900">{label}</div>
      <div className="h-3 overflow-hidden rounded-full bg-slate-100">
        <div className="h-full rounded-full bg-emerald-500" style={{ width: `${width}%` }} />
      </div>
      <div className="text-right font-semibold text-slate-950">{formatNumber(value)}</div>
    </div>
  );
}

function PromotionFunnel({ totals }: { totals: Record<string, number> }) {
  const max = Math.max(totals.impressions, totals.clicks, totals.adVisitors, totals.orders, totals.revenue, 1);
  return (
    <div className="rounded-md border border-slate-200 bg-white p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-950">推广漏斗</h3>
        <span className="text-sm font-semibold text-slate-500">展现到成交</span>
      </div>
      <div className="space-y-4">
        <FunnelRow label="展现" value={totals.impressions} max={max} />
        <FunnelRow label="点击" value={totals.clicks} max={max} />
        <FunnelRow label="访客" value={totals.adVisitors} max={max} />
        <FunnelRow label="订单" value={totals.orders} max={max} />
        <FunnelRow label="成交" value={totals.revenue} max={max} />
      </div>
    </div>
  );
}

function ProblemList({ problems }: { problems: Row[] }) {
  if (!problems.length) {
    return (
      <div className="rounded-md border border-emerald-100 bg-emerald-50 p-4 text-sm text-emerald-700">
        暂未识别到高优先级推广问题，继续观察 ROI、点击率和订单成本。
      </div>
    );
  }
  return (
    <div className="rounded-md border border-slate-200 bg-white p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-950">推广问题诊断</h3>
        <span className="text-sm font-semibold text-slate-500">按优先级处理</span>
      </div>
      <div className="space-y-3">
        {problems.slice(0, 4).map((item, index) => (
          <div key={index} className="rounded-md border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-start gap-3">
              <span className={index === 0 ? "rounded-md bg-red-600 px-2 py-1 text-xs font-semibold text-white" : "rounded-md bg-amber-600 px-2 py-1 text-xs font-semibold text-white"}>
                {index === 0 ? "P0" : "P1"}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-3">
                  <h4 className="font-semibold text-slate-950">{text(item.title)}</h4>
                  <div className="font-semibold text-emerald-600">{formatMoney(asNumber(item.impact))}</div>
                </div>
                <p className="mt-2 text-sm leading-6 text-slate-600">{text(item.reason)}</p>
                <p className="mt-1 text-sm leading-6 text-slate-500">{text(item.action)}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ActionSuggestions({ actions }: { actions: Row[] }) {
  return (
    <div className="rounded-md border border-slate-200 bg-white p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-950">推广行动建议</h3>
        <span className="text-sm font-semibold text-slate-500">目标 + 预计影响</span>
      </div>
      <div className="space-y-4">
        {actions.map((item, index) => (
          <div key={index} className={index < 2 ? "rounded-md border border-red-100 bg-red-50 p-4" : "rounded-md border border-slate-200 bg-slate-50 p-4"}>
            <div className="flex items-start gap-3">
              <span className={index < 2 ? "rounded-md bg-red-600 px-2 py-1 text-xs font-semibold text-white" : "rounded-md bg-amber-600 px-2 py-1 text-xs font-semibold text-white"}>
                {index < 2 ? "P0" : "P1"}
              </span>
              <div className="flex-1">
                <div className="flex items-center justify-between gap-4">
                  <h4 className="font-semibold text-slate-950">{text(item.title)}</h4>
                  <span className="font-semibold text-emerald-600">{text(item.impact)}</span>
                </div>
                <p className="mt-2 text-sm leading-6 text-slate-600">{text(item.action)}</p>
                <p className="mt-2 text-xs text-slate-500">{text(item.target)}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function PlanCard({ row, badge }: { row: Row; badge: string }) {
  const revenue = normalizedRevenue(row);
  const roi = normalizedRoi(row);
  const orderCost = normalizedOrderCost(row);
  return (
    <div className="rounded-md border border-slate-200 bg-slate-50 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <span className={badge === "TOP" ? "rounded-md bg-amber-600 px-2 py-1 text-xs font-semibold text-white" : "rounded-md bg-red-600 px-2 py-1 text-xs font-semibold text-white"}>{badge}</span>
          <div>
            <h4 className="font-semibold text-slate-950">{planName(row)}</h4>
            <p className="mt-2 text-sm text-slate-600">
              订单 {formatNumber(asNumber(row.orders))} | ROI {roi.toFixed(2)} | 花费 {formatMoney(asNumber(row.spend))}
            </p>
            <p className="mt-1 text-sm text-slate-500">
              转化率 {formatPercent(asNumber(row.conversionRate))} | 订单成本 {formatMoney(orderCost)}
            </p>
          </div>
        </div>
        <div className="font-semibold text-emerald-600">{formatMoney(revenue)}</div>
      </div>
    </div>
  );
}

function AudienceCard({ row, badge }: { row: Row; badge: string }) {
  const revenue = normalizedRevenue(row);
  const roi = normalizedRoi(row);
  return (
    <div className="rounded-md border border-slate-200 bg-slate-50 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <span className={badge === "优" ? "rounded-md bg-amber-600 px-2 py-1 text-xs font-semibold text-white" : "rounded-md bg-red-600 px-2 py-1 text-xs font-semibold text-white"}>{badge}</span>
          <div>
            <h4 className="font-semibold text-slate-950">{audienceName(row)}</h4>
            <p className="mt-2 text-sm text-slate-600">
              订单 {formatNumber(asNumber(row.orders))} | ROI {roi.toFixed(2)} | 花费 {formatMoney(asNumber(row.spend))}
            </p>
            <p className="mt-1 text-sm text-slate-500">{planName(row)}</p>
          </div>
        </div>
        <div className="font-semibold text-emerald-600">{formatMoney(revenue)}</div>
      </div>
    </div>
  );
}

function PlanAnalysis({ rows }: { rows: Row[] }) {
  const topPlans = [...rows].sort((a, b) => normalizedRevenue(b) - normalizedRevenue(a)).slice(0, 5);
  const lowPlans = [...rows]
    .filter((row) => asNumber(row.spend) > 0 && (normalizedRoi(row) < 1 || asNumber(row.orders) <= 0))
    .sort((a, b) => asNumber(b.spend) - asNumber(a.spend))
    .slice(0, 5);
  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
      <div className="rounded-md border border-slate-200 bg-white p-5">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-950">计划层表现</h3>
          <span className="text-sm font-semibold text-slate-500">{formatNumber(rows.length)} 个计划</span>
        </div>
        <div className="mb-4 text-sm font-semibold text-slate-950">成交 Top 计划</div>
        <div className="space-y-3">
          {topPlans.map((row, index) => <PlanCard key={`${planName(row)}-${index}`} row={row} badge="TOP" />)}
        </div>
        {lowPlans.length ? (
          <>
            <div className="my-5 border-t border-slate-200" />
            <div className="mb-4 flex items-center justify-between">
              <div className="text-sm font-semibold text-slate-950">低效计划</div>
              <span className="text-sm text-slate-500">优先迁移预算</span>
            </div>
            <div className="space-y-3">
              {lowPlans.map((row, index) => <PlanCard key={`${planName(row)}-low-${index}`} row={row} badge={index === 0 ? "P0" : "P1"} />)}
            </div>
          </>
        ) : null}
      </div>
      <PlanTable rows={rows} />
    </div>
  );
}

function AudienceAnalysis({ rows }: { rows: Row[] }) {
  const highValue = [...rows].filter((row) => normalizedRevenue(row) > 0).sort((a, b) => normalizedRevenue(b) - normalizedRevenue(a)).slice(0, 5);
  const waste = [...rows]
    .filter((row) => asNumber(row.spend) > 0 && (normalizedRevenue(row) <= 0 || normalizedRoi(row) < 1))
    .sort((a, b) => asNumber(b.spend) - asNumber(a.spend))
    .slice(0, 5);
  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
      <div className="rounded-md border border-slate-200 bg-white p-5">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-950">人群层表现</h3>
          <span className="text-sm font-semibold text-slate-500">{formatNumber(rows.length)} 个人群</span>
        </div>
        <div className="mb-4 text-sm font-semibold text-slate-950">高价值人群</div>
        <div className="space-y-3">
          {highValue.map((row, index) => <AudienceCard key={`${audienceName(row)}-${index}`} row={row} badge="优" />)}
        </div>
      </div>
      <div className="rounded-md border border-slate-200 bg-white p-5">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-950">预算浪费人群</h3>
          <span className="text-sm font-semibold text-slate-500">高花费低产出</span>
        </div>
        <div className="space-y-3">
          {waste.length ? waste.map((row, index) => <AudienceCard key={`${audienceName(row)}-waste-${index}`} row={row} badge="P0" />) : (
            <div className="rounded-md border border-emerald-100 bg-emerald-50 p-4 text-sm text-emerald-700">暂无明显预算浪费人群。</div>
          )}
        </div>
      </div>
    </div>
  );
}

function PlanTable({ rows }: { rows: Row[] }) {
  return (
    <div className="rounded-md border border-slate-200 bg-white p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-950">计划明细</h3>
        <span className="text-sm font-semibold text-slate-500">按成交金额排序</span>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-500">
            <tr>
              <th className="px-3 py-2 font-medium">计划</th>
              <th className="px-3 py-2 text-right font-medium">花费</th>
              <th className="px-3 py-2 text-right font-medium">成交</th>
              <th className="px-3 py-2 text-right font-medium">ROI</th>
              <th className="px-3 py-2 text-right font-medium">订单</th>
              <th className="px-3 py-2 text-right font-medium">点击率</th>
              <th className="px-3 py-2 text-right font-medium">CPC</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {[...rows].sort((a, b) => normalizedRevenue(b) - normalizedRevenue(a)).slice(0, 12).map((row, index) => (
              <tr key={`${planName(row)}-table-${index}`} className="hover:bg-slate-50">
                <td className="min-w-44 px-3 py-2 font-medium text-slate-900">{planName(row)}</td>
                <td className="px-3 py-2 text-right">{formatMoney(asNumber(row.spend))}</td>
                <td className="px-3 py-2 text-right">{formatMoney(normalizedRevenue(row))}</td>
                <td className="px-3 py-2 text-right">{normalizedRoi(row).toFixed(2)}</td>
                <td className="px-3 py-2 text-right">{formatNumber(asNumber(row.orders))}</td>
                <td className="px-3 py-2 text-right">{formatPercent(asNumber(row.ctr))}</td>
                <td className="px-3 py-2 text-right">{formatMoney(asNumber(row.cpc))}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function PromotionInsightAnalysis({ tables }: { tables: Row[] }) {
  const planRows = (tables[0]?.data || []) as Row[];
  const audienceRows = (tables[1]?.data || []) as Row[];
  const suspiciousRows = suspiciousRevenueRows(planRows);
  const totals = {
    spend: sum(planRows, "spend"),
    revenue: sumNormalizedRevenue(planRows),
    orders: sum(planRows, "orders"),
    impressions: sum(planRows, "impressions"),
    clicks: sum(planRows, "clicks"),
    adVisitors: sum(planRows, "adVisitors")
  };
  const roi = safeRate(totals.revenue, totals.spend);
  const ctr = safeRate(totals.clicks, totals.impressions);
  const cpc = safeRate(totals.spend, totals.clicks);
  const lowRoiPlans = planRows.filter((row) => asNumber(row.spend) > 0 && normalizedRoi(row) < 1);
  const wasteAudiences = audienceRows.filter((row) => asNumber(row.spend) > 0 && (normalizedRevenue(row) <= 0 || normalizedRoi(row) < 1));
  const problems = [
    ...(roi < 1 ? [{ title: "ROI偏低", impact: totals.spend, reason: "推广花费带回的成交不足，投放边际效率偏弱。", action: "优先压缩低ROI计划和低效人群预算，把预算迁移到高转化商品、收割计划和有效关键词。" }] : []),
    ...(ctr < 0.02 && totals.impressions > 0 ? [{ title: "点击率偏低", impact: totals.clicks, reason: "素材、标题或人群匹配吸引力不足，曝光没有有效转成点击。", action: "更新素材卖点，拆分人群测试，优先修复点击链路。" }] : []),
    ...(lowRoiPlans.length ? [{ title: "低效计划占用预算", impact: sum(lowRoiPlans, "spend"), reason: `${lowRoiPlans.length} 个计划 ROI 低于 1，预算效率需要复核。`, action: "暂停或降权低效计划，把预算迁移到高ROI计划和高成交商品承接链路。" }] : []),
    ...(wasteAudiences.length ? [{ title: "人群预算浪费", impact: sum(wasteAudiences, "spend"), reason: `${wasteAudiences.length} 个人群有花费但成交弱。`, action: "先停投或降权低效人群，保留已验证成交的人群包继续加码。" }] : [])
  ];
  const actions = [
    { title: "先停投/降权低效人群", impact: `可回收 ${formatMoney(sum(wasteAudiences, "spend"))}`, action: "对高花费零成交或低ROI人群先降权，避免无效点击继续消耗预算。", target: "人群花费下降50%，或ROI回到1以上" },
    { title: "先压缩低效计划", impact: `可迁移 ${formatMoney(sum(lowRoiPlans, "spend"))}`, action: "下调低ROI计划预算，把花费转向高成交或高ROI计划。", target: "低效计划ROI提升至1以上，或预算压降30%" },
    { title: "继续加码高价值人群", impact: "提升成交贡献", action: "把更多预算分配给已经验证有效的人群包，优先用于收割和高意向再营销。", target: "高价值人群成交提升10%" }
  ];

  if (!planRows.length && !audienceRows.length) {
    return (
      <div className="mt-5 rounded-md border border-dashed border-slate-300 bg-slate-50 p-5">
        <div className="text-sm font-semibold text-slate-950">暂无推广明细数据</div>
        <p className="mt-2 text-sm leading-6 text-slate-500">当前周期没有推广计划或推广人群数据。请先上传对应周期的推广计划和推广人群报表。</p>
      </div>
    );
  }

  return (
    <div className="mt-5 space-y-6">
      <div>
        <div className="text-sm font-semibold text-emerald-700">推广决策模块</div>
        <h3 className="mt-2 text-2xl font-semibold text-slate-950">先判断投放是否赚钱，再决定预算怎么调</h3>
      </div>

      <div className={roi < 1 ? "rounded-md border border-red-200 bg-red-50 p-4" : "rounded-md border border-emerald-200 bg-emerald-50 p-4"}>
        <div className={roi < 1 ? "flex gap-3 text-lg font-semibold leading-8 text-red-700" : "flex gap-3 text-lg font-semibold leading-8 text-emerald-700"}>
          <AlertTriangle className="mt-1 shrink-0" size={20} />
          当前推广{roi < 1 ? "效率承压" : "效率可接受"}：花费 {formatMoney(totals.spend)}，推广成交 {formatMoney(totals.revenue)}，ROI {roi.toFixed(2)}。
          {roi < 1 ? "建议优先压缩低ROI预算，再检查点击成本和商品承接效率。" : "可继续围绕高ROI计划和高价值人群做结构性加码。"}
        </div>
      </div>

      {suspiciousRows.length ? (
        <div className="rounded-md border border-amber-200 bg-amber-50 p-4 text-sm font-semibold leading-6 text-amber-700">
          检测到 {formatNumber(suspiciousRows.length)} 条推广计划的“成交金额”疑似被映射成订单数。页面已优先使用直接/间接成交金额或 ROI×花费进行展示，建议回到上传映射中检查 revenue / 总订单金额字段。
        </div>
      ) : null}

      <div className="rounded-md border border-slate-200 bg-slate-50 p-4">
        <div className="flex gap-3">
          <div className="mt-1 h-auto w-1 rounded-full bg-slate-500" />
          <p className="text-base font-semibold leading-8 text-slate-900">
            计划层面先看预算是否带来有效成交，人群层面再判断哪些人群已被验证、哪些只消耗预算。
            当前推广重点不是继续平均铺量，而是把预算从低效计划和低效人群迁移到已验证有效的收割链路。
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.2fr_1fr]">
        <PromotionFunnel totals={totals} />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <MetricCard label="推广花费" value={formatMoney(totals.spend)} tone={roi < 1 ? "red" : "slate"} />
          <MetricCard label="推广成交" value={formatMoney(totals.revenue)} tone={totals.revenue > 0 ? "green" : "red"} />
          <MetricCard label="推广 ROI" value={roi.toFixed(2)} tone={roi >= 1 ? "green" : "red"} />
          <MetricCard label="点击率" value={formatPercent(ctr)} tone={ctr >= 0.02 ? "green" : "red"} />
          <MetricCard label="平均点击成本" value={formatMoney(cpc)} />
          <MetricCard label="推广订单" value={formatNumber(totals.orders)} tone={totals.orders > 0 ? "green" : "red"} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <ProblemList problems={problems} />
        <ActionSuggestions actions={actions} />
      </div>

      <PlanAnalysis rows={planRows} />
      <AudienceAnalysis rows={audienceRows} />

      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <div className="rounded-md border border-slate-200 bg-white p-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-950"><BadgeDollarSign size={16} />计划数</div>
          <div className="mt-3 text-2xl font-semibold">{formatNumber(planRows.length)} 个</div>
        </div>
        <div className="rounded-md border border-slate-200 bg-white p-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-950"><Users size={16} />人群数</div>
          <div className="mt-3 text-2xl font-semibold">{formatNumber(audienceRows.length)} 个</div>
        </div>
        <div className="rounded-md border border-slate-200 bg-white p-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-950"><Target size={16} />低效对象</div>
          <div className="mt-3 flex items-center gap-2 text-2xl font-semibold">
            {formatNumber(lowRoiPlans.length + wasteAudiences.length)}
            <ArrowRight size={18} className="text-slate-400" />
            <span className="text-base text-slate-500">优先处理</span>
          </div>
        </div>
      </div>
    </div>
  );
}
