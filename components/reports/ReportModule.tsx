import { Card } from "@/components/common/Card";
import { ProductQuadrantChart, TopProductChart } from "@/components/dashboard/ProductCharts";
import { ReportChart } from "@/components/reports/ReportChart";
import { formatMoney, formatNumber, formatPercent } from "@/lib/format";

type ReportModuleData = {
  key: string;
  title: string;
  summary: string;
  cards?: Array<Record<string, unknown>>;
  charts?: Array<Record<string, unknown>>;
  tables?: Array<Record<string, unknown>>;
  actions?: string[];
};

function asNumber(value: unknown) {
  const number = Number(value || 0);
  return Number.isFinite(number) ? number : 0;
}

function text(value: unknown) {
  return String(value ?? "-");
}

function SimpleTable({ rows, columns }: { rows: Array<Record<string, unknown>>; columns: Array<{ key: string; label: string; format?: "money" | "number" | "percent" }> }) {
  return (
    <div className="mt-4 overflow-hidden rounded-md border border-slate-200">
      <table className="w-full text-left text-sm">
        <thead className="bg-slate-50 text-slate-500">
          <tr>
            {columns.map((column) => <th key={column.key} className="px-3 py-2">{column.label}</th>)}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200">
          {rows.map((row, index) => (
            <tr key={index}>
              {columns.map((column) => {
                const value = row[column.key];
                const content = column.format === "money" ? formatMoney(asNumber(value)) : column.format === "number" ? formatNumber(asNumber(value)) : column.format === "percent" ? formatPercent(asNumber(value)) : text(value);
                return <td key={column.key} className="px-3 py-2 text-slate-700">{content}</td>;
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function AttributionTable({ rows }: { rows: Array<Record<string, unknown>> }) {
  return (
    <SimpleTable
      rows={rows}
      columns={[
        { key: "name", label: "因素" },
        { key: "previous", label: "同期值", format: "number" },
        { key: "current", label: "当前值", format: "number" },
        { key: "contribution", label: "贡献金额", format: "money" },
        { key: "direction", label: "方向" }
      ]}
    />
  );
}

function ProductAnalysis({ table }: { table: Record<string, unknown> }) {
  const topProducts = (table.topProducts || []) as Array<Record<string, unknown>>;
  const quadrants = (table.quadrants || []) as Array<Record<string, unknown>>;
  return (
    <div className="mt-4 space-y-4">
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <div className="rounded-md border border-slate-200 p-3">
          <div className="text-sm font-medium text-slate-700">GMV Top 商品</div>
          <TopProductChart items={topProducts} />
        </div>
        <div className="rounded-md border border-slate-200 p-3">
          <div className="text-sm font-medium text-slate-700">商品四象限结构</div>
          <ProductQuadrantChart items={quadrants} />
        </div>
      </div>
      <div>
        <SimpleTable
          rows={topProducts.slice(0, 8)}
          columns={[
            { key: "productName", label: "商品" },
            { key: "traffic", label: "访客数", format: "number" },
            { key: "gmv", label: "GMV", format: "money" },
            { key: "refundRate", label: "退款率", format: "percent" }
          ]}
        />
      </div>
    </div>
  );
}

export function ReportModule({ module, index }: { module: ReportModuleData; index: number }) {
  const firstTable = module.tables?.[0] || {};
  const tableData = (firstTable.data || []) as Array<Record<string, unknown>>;
  const chartData = (module.charts?.[0]?.data || []) as Array<Record<string, unknown>>;

  return (
    <Card className="p-5">
      <h2 className="font-semibold">{index}. {module.title}</h2>
      <p className="mt-2 text-sm text-slate-600">{module.summary}</p>

      <ReportChart moduleKey={module.key} chartData={chartData} tableData={tableData} />
      {module.key === "gmv_attribution" ? <AttributionTable rows={tableData} /> : null}
      {module.key === "gsv_attribution" ? (
        <SimpleTable rows={tableData} columns={[{ key: "name", label: "因素" }, { key: "contribution", label: "贡献", format: "money" }, { key: "direction", label: "方向" }]} />
      ) : null}
      {module.key === "product_analysis" ? <ProductAnalysis table={firstTable} /> : null}
      {module.key === "promotion_detail" ? (
        <SimpleTable rows={tableData} columns={[{ key: "planName", label: "计划" }, { key: "spend", label: "花费", format: "money" }, { key: "revenue", label: "成交", format: "money" }, { key: "roi", label: "ROI", format: "number" }, { key: "cpc", label: "CPC", format: "money" }]} />
      ) : null}

      {module.actions?.length ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {module.actions.map((action) => <span key={action} className="rounded bg-slate-100 px-2 py-1 text-xs text-slate-600">{action}</span>)}
        </div>
      ) : null}
    </Card>
  );
}
