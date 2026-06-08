"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";

function isDoneStatus(status: string) {
  return ["已完成", "done", "completed"].includes(status.toLowerCase()) || status === "已完成";
}

function priorityTone(priority: string) {
  if (priority === "P0") return "bg-red-50 text-red-700";
  if (priority === "P1") return "bg-amber-50 text-amber-700";
  return "bg-brand-50 text-brand-700";
}

export function ActionList({ items }: { items: Array<Record<string, unknown>> }) {
  const router = useRouter();
  const [loadingId, setLoadingId] = useState<string | null>(null);

  async function completeAction(id: string) {
    setLoadingId(id);
    const response = await fetch(`/api/action-items/${id}/complete`, { method: "POST" });
    setLoadingId(null);
    if (response.ok) router.refresh();
  }

  if (!items.length) {
    return (
      <div className="rounded-md border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
        暂无行动项。生成报告后，系统会根据异常和机会自动沉淀待办。
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-md border border-slate-200">
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-500">
            <tr>
              <th className="whitespace-nowrap px-3 py-2 font-medium">优先级</th>
              <th className="whitespace-nowrap px-3 py-2 font-medium">行动标题</th>
              <th className="whitespace-nowrap px-3 py-2 font-medium">目标指标</th>
              <th className="whitespace-nowrap px-3 py-2 font-medium">预估影响</th>
              <th className="whitespace-nowrap px-3 py-2 font-medium">负责人</th>
              <th className="whitespace-nowrap px-3 py-2 font-medium">状态</th>
              <th className="whitespace-nowrap px-3 py-2 text-right font-medium">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 bg-white">
            {items.map((item, index) => {
              const id = typeof item.id === "string" ? item.id : "";
              const priority = String(item.priority || "P2");
              const status = String(item.status || "未开始");
              const done = isDoneStatus(status);
              return (
                <tr key={id || index} className="hover:bg-slate-50/80">
                  <td className="px-3 py-2">
                    <span className={`rounded-md px-2 py-1 text-xs font-semibold ${priorityTone(priority)}`}>{priority}</span>
                  </td>
                  <td className="min-w-52 px-3 py-2 font-medium text-slate-900">{String(item.title || "-")}</td>
                  <td className="whitespace-nowrap px-3 py-2 text-slate-600">{String(item.targetMetric || "-")}</td>
                  <td className="whitespace-nowrap px-3 py-2 text-slate-600">{String(item.estimatedImpact || "-")}</td>
                  <td className="whitespace-nowrap px-3 py-2 text-slate-600">{String(item.owner || "-")}</td>
                  <td className="whitespace-nowrap px-3 py-2 text-slate-600">{done ? "已完成" : status}</td>
                  <td className="whitespace-nowrap px-3 py-2 text-right">
                    {id && !done ? (
                      <button
                        onClick={() => completeAction(id)}
                        disabled={loadingId === id}
                        className="inline-flex items-center gap-1 rounded-md border border-emerald-200 px-2 py-1 text-xs font-medium text-emerald-700 disabled:opacity-60"
                      >
                        {loadingId === id ? <Loader2 className="animate-spin" size={13} /> : <CheckCircle2 size={13} />}
                        完成
                      </button>
                    ) : (
                      <span className="text-xs text-slate-400">{done ? "已完成" : "只读"}</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
