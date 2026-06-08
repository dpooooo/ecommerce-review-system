import { AlertTriangle, BarChart3, Boxes, Megaphone, TrendingUp } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Card } from "@/components/common/Card";
import { ProductInsightAnalysis } from "@/components/reports/ProductInsightAnalysis";
import { PromotionInsightAnalysis } from "@/components/reports/PromotionInsightAnalysis";
import { ReportChart } from "@/components/reports/ReportChart";
import { formatMoney, formatNumber } from "@/lib/format";

type ReportModuleData = {
  key: string;
  title: string;
  summary: string;
  cards?: Array<Record<string, unknown>>;
  charts?: Array<Record<string, unknown>>;
  tables?: Array<Record<string, unknown>>;
  actions?: string[];
};

type TableColumn = {
  key: string;
  label: string;
  format?: "money" | "number";
  align?: "left" | "right";
};

const moduleMeta: Record<string, { label: string; icon: LucideIcon; tone: string }> = {
  trend: { label: "趋势", icon: TrendingUp, tone: "bg-brand-50 text-brand-700" },
  gmv_attribution: { label: "归因", icon: BarChart3, tone: "bg-emerald-50 text-emerald-700" },
  gsv_attribution: { label: "影响", icon: AlertTriangle, tone: "bg-amber-50 text-amber-700" },
  product_analysis: { label: "商品", icon: Boxes, tone: "bg-sky-50 text-sky-700" },
  promotion_detail: { label: "推广", icon: Megaphone, tone: "bg-violet-50 text-violet-700" }
};

function asNumber(value: unknown) {
  const number = Number(value || 0);
  return Number.isFinite(number) ? number : 0;
}

function text(value: unknown) {
  return String(value ?? "-");
}

function formatCell(value: unknown, format?: TableColumn["format"]) {
  if (format === "money") return formatMoney(asNumber(value));
  if (format === "number") return formatNumber(asNumber(value));
  return text(value);
}

function SimpleTable({
  rows,
  columns,
  maxRows = 10
}: {
  rows: Array<Record<string, unknown>>;
  columns: TableColumn[];
  maxRows?: number;
}) {
  const visibleRows = rows.slice(0, maxRows);
  if (!visibleRows.length) {
    return (
      <div className="mt-4 rounded-md border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
        暂无可展示的明细数据。
      </div>
    );
  }

  return (
    <div className="mt-4 overflow-hidden rounded-md border border-slate-200">
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-500">
            <tr>
              {columns.map((column) => (
                <th key={column.key} className={`whitespace-nowrap px-3 py-2 font-medium ${column.align === "right" ? "text-right" : ""}`}>
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 bg-white">
            {visibleRows.map((row, index) => (
              <tr key={index} className="hover:bg-slate-50/80">
                {columns.map((column) => {
                  const value = row[column.key];
                  const colored = column.key === "contribution";
                  const colorClass = colored
                    ? asNumber(value) < 0
                      ? "text-red-600"
                      : "text-emerald-600"
                    : "text-slate-700";
                  return (
                    <td key={column.key} className={`whitespace-nowrap px-3 py-2 ${column.align === "right" ? "text-right" : ""} ${colorClass}`}>
                      {formatCell(value, column.format)}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {rows.length > maxRows ? (
        <div className="border-t border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-500">
          已展示前 {maxRows} 条，共 {rows.length} 条。
        </div>
      ) : null}
    </div>
  );
}

function AttributionTable({ rows }: { rows: Array<Record<string, unknown>> }) {
  return (
    <SimpleTable
      rows={rows}
      columns={[
        { key: "name", label: "因素" },
        { key: "previous", label: "对比期", format: "number", align: "right" },
        { key: "current", label: "当前期", format: "number", align: "right" },
        { key: "contribution", label: "贡献金额", format: "money", align: "right" },
        { key: "direction", label: "方向" }
      ]}
    />
  );
}

export function ReportModule({ module, index }: { module: ReportModuleData; index: number }) {
  const firstTable = module.tables?.[0] || {};
  const tableData = (firstTable.data || []) as Array<Record<string, unknown>>;
  const chartData = (module.charts?.[0]?.data || []) as Array<Record<string, unknown>>;
  const meta = moduleMeta[module.key] || { label: "专题", icon: BarChart3, tone: "bg-slate-50 text-slate-700" };
  const Icon = meta.icon;

  return (
    <Card id={`section-${module.key}`} className="scroll-mt-24 p-5">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-slate-900 px-2 py-1 text-xs font-semibold text-white">{String(index).padStart(2, "0")}</span>
            <span className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-semibold ${meta.tone}`}>
              <Icon size={14} />
              {meta.label}
            </span>
          </div>
          <h2 className="mt-3 text-lg font-semibold text-slate-950">{module.title}</h2>
          <p className="mt-2 max-w-4xl text-sm leading-6 text-slate-600">{module.summary}</p>
        </div>
        {module.actions?.length ? (
          <div className="flex max-w-md flex-wrap gap-2">
            {module.actions.slice(0, 3).map((action) => (
              <span key={action} className="rounded-md bg-slate-100 px-2 py-1 text-xs text-slate-600">{action}</span>
            ))}
          </div>
        ) : null}
      </div>

      <ReportChart moduleKey={module.key} chartData={chartData} tableData={tableData} />
      {module.key === "gmv_attribution" ? <AttributionTable rows={tableData} /> : null}
      {module.key === "gsv_attribution" ? (
        <SimpleTable
          rows={tableData}
          columns={[
            { key: "name", label: "因素" },
            { key: "contribution", label: "贡献", format: "money", align: "right" },
            { key: "direction", label: "方向" }
          ]}
        />
      ) : null}
      {module.key === "product_analysis" ? <ProductInsightAnalysis table={firstTable} /> : null}
      {module.key === "promotion_detail" ? <PromotionInsightAnalysis tables={module.tables || []} /> : null}
    </Card>
  );
}
