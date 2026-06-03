import Link from "next/link";
import { BarChart3 } from "lucide-react";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams;
  return (
    <main className="data-grid-bg flex min-h-screen items-center justify-center bg-[#f5f8fc] p-6">
      <div className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-8 shadow-card">
        <div className="mb-8 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-brand-600 text-white">
            <BarChart3 />
          </div>
          <h1 className="mt-4 text-2xl font-semibold text-slate-950">电商增长复盘系统</h1>
          <p className="mt-2 text-sm text-slate-500">上传数据，自动诊断经营问题，生成复盘报告</p>
        </div>
        <form action="/api/auth/login" method="post" className="space-y-4">
          <input type="hidden" name="next" value={next || "/dashboard"} />
          <label className="block">
            <span className="text-sm font-medium text-slate-700">账号 / 邮箱</span>
            <input name="email" type="email" required className="mt-1 h-11 w-full rounded-md border border-slate-200 px-3 outline-none focus:border-brand-500" />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-slate-700">密码</span>
            <input name="password" type="password" required className="mt-1 h-11 w-full rounded-md border border-slate-200 px-3 outline-none focus:border-brand-500" />
          </label>
          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2 text-slate-600"><input type="checkbox" name="remember" />记住登录</label>
            <a className="text-brand-600" href="#">忘记密码</a>
          </div>
          <button className="h-11 w-full rounded-md bg-brand-600 font-medium text-white hover:bg-brand-700">登录</button>
        </form>
        <p className="mt-6 text-center text-sm text-slate-500">还没有账号？<Link className="text-brand-600" href="/register">立即注册</Link></p>
      </div>
    </main>
  );
}
