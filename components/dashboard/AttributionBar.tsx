import { formatMoney, formatPercent } from "@/lib/format";

export function AttributionBar({ items }: { items: Array<{ name: string; contribution: number; impactShare?: number; direction?: string }> }) {
  return (
    <div className="space-y-4">
      {items.map((item) => (
        <div key={item.name}>
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="font-medium text-slate-700">{item.name}</span>
            <span className={item.contribution >= 0 ? "text-emerald-600" : "text-red-600"}>
              {item.direction} {formatMoney(item.contribution)}
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-slate-100">
            <div
              className={item.contribution >= 0 ? "h-full rounded-full bg-emerald-500" : "h-full rounded-full bg-red-500"}
              style={{ width: formatPercent(item.impactShare || 0) }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
