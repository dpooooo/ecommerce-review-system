"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, Database, FileClock, FileText, LayoutDashboard, Settings, UploadCloud } from "lucide-react";
import { clsx } from "clsx";

const items = [
  { href: "/dashboard", label: "驾驶舱", icon: LayoutDashboard },
  { href: "/upload", label: "数据上传", icon: UploadCloud },
  { href: "/data", label: "数据管理", icon: Database },
  { href: "/reports", label: "报告中心", icon: FileText },
  { href: "/history", label: "历史报告", icon: FileClock },
  { href: "/settings", label: "系统设置", icon: Settings }
];

export function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="fixed left-0 top-0 flex h-screen w-64 flex-col border-r border-slate-200 bg-white">
      <div className="flex h-16 items-center gap-3 border-b border-slate-200 px-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-600 text-white">
          <BarChart3 size={22} />
        </div>
        <div>
          <div className="text-sm font-semibold text-slate-950">电商增长复盘系统</div>
          <div className="text-xs text-slate-500">Growth Review</div>
        </div>
      </div>
      <nav className="space-y-1 px-3 py-4">
        {items.map((item) => {
          const active = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition",
                active ? "bg-brand-50 text-brand-700" : "text-slate-600 hover:bg-slate-50 hover:text-slate-950"
              )}
            >
              <Icon size={18} />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
