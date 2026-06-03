export function ActionList({ items }: { items: Array<Record<string, unknown>> }) {
  return (
    <div className="overflow-hidden rounded-md border border-slate-200">
      <table className="w-full text-left text-sm">
        <thead className="bg-slate-50 text-slate-500">
          <tr>
            <th className="px-3 py-2">优先级</th>
            <th className="px-3 py-2">行动标题</th>
            <th className="px-3 py-2">目标指标</th>
            <th className="px-3 py-2">预估影响</th>
            <th className="px-3 py-2">状态</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200">
          {items.map((item, index) => (
            <tr key={index}>
              <td className="px-3 py-2 font-medium text-brand-700">{String(item.priority)}</td>
              <td className="px-3 py-2 text-slate-900">{String(item.title)}</td>
              <td className="px-3 py-2 text-slate-600">{String(item.targetMetric)}</td>
              <td className="px-3 py-2 text-slate-600">{String(item.estimatedImpact)}</td>
              <td className="px-3 py-2 text-slate-600">{String(item.status)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
