import Link from "next/link";
import { Bell, CalendarDays, LogOut, Plus, UploadCloud } from "lucide-react";
import { getSessionUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";

export async function Topbar() {
  const user = await getSessionUser();
  const shops = user
    ? await prisma.shop.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: "asc" },
        select: { id: true, name: true }
      })
    : [];

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-slate-200 bg-white/95 px-6 backdrop-blur">
      <div className="flex items-center gap-3">
        <select className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm">
          {shops.length ? shops.map((shop) => <option key={shop.id}>{shop.name}</option>) : <option>默认店铺</option>}
        </select>
        <button className="inline-flex h-10 items-center gap-2 rounded-md border border-slate-200 px-3 text-sm text-slate-700">
          <CalendarDays size={16} />
          2024-05-01 至 2024-05-31
        </button>
      </div>
      <div className="flex items-center gap-2">
        <Link href="/upload" className="inline-flex h-10 items-center gap-2 rounded-md border border-slate-200 px-3 text-sm text-slate-700">
          <UploadCloud size={16} />
          上传数据
        </Link>
        <Link href="/reports" className="inline-flex h-10 items-center gap-2 rounded-md bg-brand-600 px-3 text-sm font-medium text-white">
          <Plus size={16} />
          生成复盘报告
        </Link>
        <button className="flex h-10 w-10 items-center justify-center rounded-md border border-slate-200 text-slate-600" title="通知">
          <Bell size={18} />
        </button>
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-900 text-sm font-semibold text-white">{user?.name?.slice(0, 1).toUpperCase() || "A"}</div>
        <form action="/api/auth/logout" method="post">
          <button className="flex h-10 w-10 items-center justify-center rounded-md border border-slate-200 text-slate-600" title="退出登录">
            <LogOut size={18} />
          </button>
        </form>
      </div>
    </header>
  );
}
