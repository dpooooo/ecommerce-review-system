export function AnomalyList({ items }: { items: Array<Record<string, unknown>> }) {
  return (
    <div className="space-y-3">
      {items.map((item, index) => (
        <div key={index} className="rounded-md border border-slate-200 p-3">
          <div className="flex items-center gap-2">
            <span className="rounded bg-red-50 px-2 py-0.5 text-xs font-semibold text-red-600">{String(item.priority)}</span>
            <span className="font-medium text-slate-900">{String(item.title)}</span>
          </div>
          <p className="mt-2 text-sm text-slate-600">{String(item.impact || item.reason || "")}</p>
          <p className="mt-1 text-sm text-slate-500">{String(item.suggestion || "")}</p>
        </div>
      ))}
    </div>
  );
}
