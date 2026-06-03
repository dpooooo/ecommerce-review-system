import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";
import { Card } from "@/components/common/Card";
import { formatMoney, formatNumber, formatPercent } from "@/lib/format";

const moneyKeys = new Set(["gmv", "gsv", "aov", "refundAmount", "spend"]);
const percentKeys = new Set(["conversionRate", "refundRate"]);

function valueText(key: string, value: number) {
  if (percentKeys.has(key)) return formatPercent(value);
  if (moneyKeys.has(key)) return formatMoney(value);
  if (key === "roi") return value.toFixed(2);
  return formatNumber(value);
}

export function MetricCard({ metric }: { metric: { key: string; name: string; current: number; displayChange: string; trend: string } }) {
  const Icon = metric.trend === "up" ? ArrowUpRight : metric.trend === "down" ? ArrowDownRight : Minus;
  const tone = metric.trend === "up" ? "text-emerald-600 bg-emerald-50" : metric.trend === "down" ? "text-red-600 bg-red-50" : "text-slate-500 bg-slate-50";
  return (
    <Card className="p-4">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-sm text-slate-500">{metric.name}</div>
          <div className="mt-2 text-2xl font-semibold text-slate-950">{valueText(metric.key, metric.current)}</div>
        </div>
        <div className={`flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium ${tone}`}>
          <Icon size={14} />
          {metric.displayChange}
        </div>
      </div>
      <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-slate-100">
        <div className="h-full w-2/3 rounded-full bg-brand-600" />
      </div>
    </Card>
  );
}
