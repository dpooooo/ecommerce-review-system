import { Card } from "@/components/common/Card";
import { uploadDir } from "@/lib/env";

const checklist = [
  "服务器已安装 Node.js 20+、Nginx、PostgreSQL、PM2",
  "已创建 PostgreSQL 数据库和独立数据库用户",
  "已配置 DATABASE_URL、JWT_SECRET、NEXT_PUBLIC_APP_URL、UPLOAD_DIR",
  "已执行 npm install、prisma generate、prisma migrate deploy",
  "已执行 npm run predeploy:check",
  "已执行 npm run build",
  "已使用 pm2 start ecosystem.config.js 启动",
  "宝塔反向代理指向 http://127.0.0.1:3001",
  "已访问 /api/health 并返回 ok: true"
];

export default function DeploymentPage() {
  const envRows = [
    ["NODE_ENV", process.env.NODE_ENV || "未设置"],
    ["NEXT_PUBLIC_APP_URL", process.env.NEXT_PUBLIC_APP_URL || "未设置"],
    ["UPLOAD_DIR", uploadDir()],
    ["DATABASE_URL", process.env.DATABASE_URL ? "已设置" : "未设置"],
    ["JWT_SECRET", process.env.JWT_SECRET ? "已设置" : "未设置"],
    ["PORT", process.env.PORT || "3001"]
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-950">部署检查</h1>
        <p className="mt-1 text-sm text-slate-500">用于部署前后快速核对生产环境配置。</p>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <Card className="col-span-2 p-5">
          <h2 className="font-semibold text-slate-950">环境变量状态</h2>
          <div className="mt-4 overflow-hidden rounded-md border border-slate-200">
            <table className="w-full text-left text-sm">
              <tbody className="divide-y divide-slate-200">
                {envRows.map(([key, value]) => (
                  <tr key={key}>
                    <td className="w-56 bg-slate-50 px-3 py-2 font-medium text-slate-700">{key}</td>
                    <td className="px-3 py-2 text-slate-700">{value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card className="p-5">
          <h2 className="font-semibold text-slate-950">健康检查</h2>
          <p className="mt-2 text-sm text-slate-500">启动后访问健康检查接口确认数据库和上传目录状态。</p>
          <a href="/api/health" target="_blank" className="mt-4 inline-flex h-10 items-center rounded-md bg-brand-600 px-4 text-sm font-medium text-white">
            打开 /api/health
          </a>
        </Card>
      </div>

      <Card className="p-5">
        <h2 className="font-semibold text-slate-950">部署测试清单</h2>
        <div className="mt-4 grid grid-cols-3 gap-3">
          {checklist.map((item) => (
            <label key={item} className="flex items-start gap-2 rounded-md border border-slate-200 p-3 text-sm text-slate-700">
              <input type="checkbox" className="mt-1" />
              <span>{item}</span>
            </label>
          ))}
        </div>
      </Card>
    </div>
  );
}
