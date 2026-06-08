"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { CalendarDays } from "lucide-react";

type ShopOption = {
  id: string;
  name: string;
};

function updateSearchParams(
  current: URLSearchParams,
  updates: Record<string, string | undefined>
) {
  const next = new URLSearchParams(current.toString());
  for (const [key, value] of Object.entries(updates)) {
    if (value) next.set(key, value);
    else next.delete(key);
  }
  return next;
}

export function TopbarFilters({ shops }: { shops: ShopOption[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const selectedShopId = searchParams.get("shopId") || shops[0]?.id || "";
  const selectedStart = searchParams.get("start") || "";
  const selectedEnd = searchParams.get("end") || "";
  const [start, setStart] = useState(selectedStart);
  const [end, setEnd] = useState(selectedEnd);

  useEffect(() => {
    setStart(selectedStart);
    setEnd(selectedEnd);
  }, [selectedEnd, selectedStart]);

  const targetPath = pathname === "/dashboard" ? pathname : "/dashboard";
  const dateLabel = useMemo(() => {
    if (selectedStart && selectedEnd) return `${selectedStart} 至 ${selectedEnd}`;
    return "使用最近上传周期";
  }, [selectedEnd, selectedStart]);

  function navigate(nextParams: URLSearchParams) {
    const query = nextParams.toString();
    router.push(query ? `${targetPath}?${query}` : targetPath);
  }

  function changeShop(shopId: string) {
    navigate(updateSearchParams(searchParams, { shopId }));
  }

  function applyDates() {
    navigate(updateSearchParams(searchParams, { start, end }));
  }

  function resetDates() {
    setStart("");
    setEnd("");
    navigate(updateSearchParams(searchParams, { start: undefined, end: undefined, compareStart: undefined, compareEnd: undefined }));
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <select
        value={selectedShopId}
        onChange={(event) => changeShop(event.target.value)}
        className="h-10 min-w-40 rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-700"
      >
        {shops.length ? shops.map((shop) => <option key={shop.id} value={shop.id}>{shop.name}</option>) : <option value="">默认店铺</option>}
      </select>
      <div className="flex h-10 items-center gap-2 rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-700">
        <CalendarDays size={16} className="text-slate-500" />
        <input
          type="date"
          value={start}
          onChange={(event) => setStart(event.target.value)}
          className="w-32 bg-transparent text-sm outline-none"
          aria-label="当前周期开始日期"
        />
        <span className="text-slate-400">至</span>
        <input
          type="date"
          value={end}
          onChange={(event) => setEnd(event.target.value)}
          className="w-32 bg-transparent text-sm outline-none"
          aria-label="当前周期结束日期"
        />
        <button type="button" onClick={applyDates} className="rounded bg-brand-600 px-2 py-1 text-xs font-medium text-white">
          应用
        </button>
        <button type="button" onClick={resetDates} className="rounded px-1.5 py-1 text-xs text-slate-500 hover:bg-slate-100">
          重置
        </button>
      </div>
      <div className="hidden text-xs text-slate-400 xl:block">{dateLabel}</div>
    </div>
  );
}
