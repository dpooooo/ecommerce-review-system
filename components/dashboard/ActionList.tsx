"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";

export function ActionList({ items }: { items: Array<Record<string, unknown>> }) {
  const router = useRouter();
  const [loadingId, setLoadingId] = useState<string | null>(null);

  async function completeAction(id: string) {
    setLoadingId(id);
    const response = await fetch(`/api/action-items/${id}/complete`, { method: "POST" });
    setLoadingId(null);
    if (response.ok) router.refresh();
  }

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
            <th className="px-3 py-2 text-right">操作</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200">
          {items.map((item, index) => {
            const id = typeof item.id === "string" ? item.id : "";
            const status = String(item.status || "未开始");
            const done = status === "已完成";
            return (
              <tr key={id || index}>
                <td className="px-3 py-2 font-medium text-brand-700">{String(item.priority)}</td>
                <td className="px-3 py-2 text-slate-900">{String(item.title)}</td>
                <td className="px-3 py-2 text-slate-600">{String(item.targetMetric)}</td>
                <td className="px-3 py-2 text-slate-600">{String(item.estimatedImpact)}</td>
                <td className="px-3 py-2 text-slate-600">{status}</td>
                <td className="px-3 py-2 text-right">
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
  );
}
