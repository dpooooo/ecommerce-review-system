import Link from "next/link";
import { BarChart3 } from "lucide-react";

export default function RegisterPage() {
  return (
    <main className="data-grid-bg flex min-h-screen items-center justify-center bg-[#f5f8fc] p-6">
      <div className="w-full max-w-lg rounded-lg border border-slate-200 bg-white p-8 shadow-card">
        <div className="mb-8 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-brand-600 text-white">
            <BarChart3 />
          </div>
          <h1 className="mt-4 text-2xl font-semibold text-slate-950">创建团队账号</h1>
          <p className="mt-2 text-sm text-slate-500">注册后即可进入经营驾驶舱。</p>
        </div>
        <form action="/api/auth/register" method="post" className="grid grid-cols-2 gap-4">
          <label className="block">
            <span className="text-sm font-medium text-slate-700">用户名</span>
            <input name="name" required className="mt-1 h-11 w-full rounded-md border border-slate-200 px-3 outline-none focus:border-brand-500" />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-slate-700">公司名称</span>
            <input name="company" className="mt-1 h-11 w-full rounded-md border border-slate-200 px-3 outline-none focus:border-brand-500" />
          </label>
          <label className="col-span-2 block">
            <span className="text-sm font-medium text-slate-700">邮箱</span>
            <input name="email" type="email" required className="mt-1 h-11 w-full rounded-md border border-slate-200 px-3 outline-none focus:border-brand-500" />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-slate-700">密码</span>
            <input name="password" type="password" required className="mt-1 h-11 w-full rounded-md border border-slate-200 px-3 outline-none focus:border-brand-500" />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-slate-700">确认密码</span>
            <input name="confirmPassword" type="password" required className="mt-1 h-11 w-full rounded-md border border-slate-200 px-3 outline-none focus:border-brand-500" />
          </label>
          <button className="col-span-2 h-11 rounded-md bg-brand-600 font-medium text-white hover:bg-brand-700">注册</button>
        </form>
        <p className="mt-6 text-center text-sm text-slate-500">已有账号？<Link className="text-brand-600" href="/login">返回登录</Link></p>
      </div>
    </main>
  );
}
