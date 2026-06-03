import { revalidatePath } from "next/cache";
import { Card } from "@/components/common/Card";
import { getSessionUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";

async function createShop(formData: FormData) {
  "use server";

  const user = await getSessionUser();
  if (!user) return;
  const name = String(formData.get("name") || "").trim();
  const platform = String(formData.get("platform") || "OTHER");
  const shopCode = String(formData.get("shopCode") || "").trim();
  if (!name) return;
  await prisma.shop.create({
    data: {
      userId: user.id,
      name,
      platform,
      shopCode: shopCode || null
    }
  });
  revalidatePath("/settings");
  revalidatePath("/upload");
  revalidatePath("/reports");
}

async function saveFieldMapping(formData: FormData) {
  "use server";

  const platform = String(formData.get("platform") || "TMALL");
  const reportType = String(formData.get("reportType") || "shop");
  const originalField = String(formData.get("originalField") || "").trim();
  const standardField = String(formData.get("standardField") || "").trim();
  if (!originalField || !standardField) return;
  await prisma.fieldMapping.upsert({
    where: {
      platform_reportType_originalField: {
        platform,
        reportType,
        originalField
      }
    },
    create: {
      platform,
      reportType,
      originalField,
      standardField
    },
    update: { standardField }
  });
  revalidatePath("/settings");
}

export default async function SettingsPage() {
  const user = await getSessionUser();
  const [shops, mappings] = user
    ? await Promise.all([
        prisma.shop.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" } }),
        prisma.fieldMapping.findMany({ orderBy: { createdAt: "desc" }, take: 20 })
      ])
    : [[], []];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-950">系统设置</h1>
        <p className="mt-1 text-sm text-slate-500">管理店铺、字段映射、指标口径和团队权限。</p>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <Card className="col-span-2 p-5">
          <h2 className="font-semibold text-slate-950">店铺管理</h2>
          <form action={createShop} className="mt-4 grid grid-cols-4 gap-3">
            <input name="name" required placeholder="店铺名称" className="h-10 rounded-md border border-slate-200 px-3 text-sm" />
            <select name="platform" className="h-10 rounded-md border border-slate-200 px-3 text-sm">
              <option value="TMALL">TMALL</option>
              <option value="JD">JD</option>
              <option value="DOUYIN">DOUYIN</option>
              <option value="PDD">PDD</option>
              <option value="OTHER">OTHER</option>
            </select>
            <input name="shopCode" placeholder="店铺编码，可选" className="h-10 rounded-md border border-slate-200 px-3 text-sm" />
            <button className="h-10 rounded-md bg-brand-600 text-sm font-medium text-white">新增店铺</button>
          </form>
          <div className="mt-5 overflow-hidden rounded-md border border-slate-200">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500">
                <tr><th className="p-3">店铺</th><th>平台</th><th>编码</th><th>创建时间</th></tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {shops.length ? shops.map((shop) => (
                  <tr key={shop.id}>
                    <td className="p-3 text-slate-900">{shop.name}</td>
                    <td className="text-slate-600">{shop.platform}</td>
                    <td className="text-slate-600">{shop.shopCode || "-"}</td>
                    <td className="text-slate-600">{shop.createdAt.toISOString().slice(0, 10)}</td>
                  </tr>
                )) : (
                  <tr><td className="p-3 text-slate-500" colSpan={4}>暂无店铺，新增后即可上传数据。</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>

        <Card className="p-5">
          <h2 className="font-semibold text-slate-950">用户信息</h2>
          <div className="mt-4 space-y-3 text-sm">
            <div><span className="text-slate-500">姓名：</span>{user?.name || "未登录"}</div>
            <div><span className="text-slate-500">邮箱：</span>{user?.email || "-"}</div>
            <div><span className="text-slate-500">角色：</span>{user?.role || "-"}</div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <Card className="col-span-2 p-5">
          <h2 className="font-semibold text-slate-950">字段映射配置</h2>
          <form action={saveFieldMapping} className="mt-4 grid grid-cols-5 gap-3">
            <select name="platform" className="h-10 rounded-md border border-slate-200 px-3 text-sm">
              <option value="TMALL">TMALL</option>
              <option value="JD">JD</option>
              <option value="DOUYIN">DOUYIN</option>
              <option value="PDD">PDD</option>
              <option value="OTHER">OTHER</option>
            </select>
            <select name="reportType" className="h-10 rounded-md border border-slate-200 px-3 text-sm">
              <option value="shop">店铺数据</option>
              <option value="product">商品数据</option>
              <option value="promotion">推广数据</option>
              <option value="traffic_source">流量来源</option>
              <option value="user_profile">用户画像</option>
              <option value="promotion_plan">推广计划</option>
              <option value="promotion_audience">推广人群</option>
            </select>
            <input name="originalField" required placeholder="原始字段" className="h-10 rounded-md border border-slate-200 px-3 text-sm" />
            <input name="standardField" required placeholder="标准字段" className="h-10 rounded-md border border-slate-200 px-3 text-sm" />
            <button className="h-10 rounded-md bg-brand-600 text-sm font-medium text-white">保存映射</button>
          </form>
          <div className="mt-4 space-y-2">
            {mappings.length ? mappings.slice(0, 6).map((mapping) => (
              <div key={mapping.id} className="rounded-md bg-slate-50 p-3 text-sm">
                <div className="font-medium text-slate-800">{mapping.originalField} → {mapping.standardField}</div>
                <div className="mt-1 text-xs text-slate-500">{mapping.platform} · {mapping.reportType}</div>
              </div>
            )) : <p className="text-sm text-slate-500">上传并确认字段后，可沉淀字段映射。</p>}
          </div>
        </Card>
        <Card className="p-5">
          <h2 className="font-semibold text-slate-950">指标口径配置</h2>
          <p className="mt-2 text-sm text-slate-500">GMV、GSV、退款率、ROI 等指标采用统一计算口径，后续可扩展为团队自定义配置。</p>
        </Card>
        <Card className="p-5">
          <h2 className="font-semibold text-slate-950">四象限阈值配置</h2>
          <p className="mt-2 text-sm text-slate-500">第一版使用流量均值和转化率均值自动划分商品四象限。</p>
        </Card>
      </div>
    </div>
  );
}
