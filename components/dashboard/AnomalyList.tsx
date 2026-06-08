import { AlertTriangle, CheckCircle2 } from "lucide-react";

function priorityTone(priority: string) {
  if (priority === "P0") return "bg-red-50 text-red-700 border-red-100";
  if (priority === "P1") return "bg-amber-50 text-amber-700 border-amber-100";
  return "bg-slate-50 text-slate-600 border-slate-200";
}

export function AnomalyList({ items }: { items: Array<Record<string, unknown>> }) {
  if (!items.length) {
    return (
      <div className="rounded-md border border-emerald-100 bg-emerald-50 p-4 text-sm text-emerald-700">
        <div className="flex items-center gap-2 font-semibold">
          <CheckCircle2 size={16} />
          暂无异常项
        </div>
        <p className="mt-2 text-emerald-700/80">当前周期没有识别到高优先级风险，可继续观察转化、退款和投放效率。</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {items.map((item, index) => {
        const priority = String(item.priority || "P2");
        return (
          <div key={index} className="rounded-md border border-slate-200 bg-white p-4">
            <div className="flex items-start gap-3">
              <span className={`shrink-0 rounded-md border px-2 py-1 text-xs font-semibold ${priorityTone(priority)}`}>{priority}</span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 font-semibold text-slate-950">
                  <AlertTriangle size={16} className={priority === "P0" ? "text-red-600" : "text-amber-600"} />
                  {String(item.title || "未命名异常")}
                </div>
                <p className="mt-2 text-sm leading-6 text-slate-600">{String(item.impact || item.reason || "暂无影响说明")}</p>
                <p className="mt-1 text-sm leading-6 text-slate-500">{String(item.suggestion || "建议结合明细数据进一步确认原因。")}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
