import { Card } from "@/components/common/Card";
import { prisma } from "@/lib/db/prisma";
import { getSessionUser } from "@/lib/auth/session";
import { revalidatePath } from "next/cache";
import { importUploadedFile } from "@/lib/upload/importer";

async function deleteBatch(formData: FormData) {
  "use server";

  const user = await getSessionUser();
  if (!user) return;
  const batchId = String(formData.get("batchId") || "");
  if (!batchId) return;
  await prisma.uploadBatch.deleteMany({ where: { id: batchId, userId: user.id } });
  revalidatePath("/data");
}

async function recleanBatch(formData: FormData) {
  "use server";

  const user = await getSessionUser();
  if (!user) return;
  const batchId = String(formData.get("batchId") || "");
  if (!batchId) return;
  const batch = await prisma.uploadBatch.findFirst({
    where: { id: batchId, userId: user.id },
    include: { files: true }
  });
  const file = batch?.files[0];
  if (!batch || !file) return;
  await Promise.all([
    prisma.shopMetric.deleteMany({ where: { batchId } }),
    prisma.promotionMetric.deleteMany({ where: { batchId } }),
    prisma.productMetric.deleteMany({ where: { batchId } }),
    prisma.trafficSourceMetric.deleteMany({ where: { batchId } }),
    prisma.userProfileMetric.deleteMany({ where: { batchId } }),
    prisma.promotionPlanMetric.deleteMany({ where: { batchId } }),
    prisma.promotionAudienceMetric.deleteMany({ where: { batchId } })
  ]);
  await importUploadedFile({ prisma, batch, file });
  await prisma.uploadBatch.update({ where: { id: batchId }, data: { status: "imported" } });
  await prisma.uploadedFile.update({ where: { id: file.id }, data: { parseStatus: "imported" } });
  revalidatePath("/data");
  revalidatePath("/dashboard");
}

export default async function DataPage() {
  const user = await getSessionUser();
  const uploads = user
    ? await prisma.uploadBatch.findMany({
        where: { userId: user.id },
        include: { shop: true, files: true },
        orderBy: { createdAt: "desc" },
        take: 50
      })
    : [];

  const rows = uploads.length
    ? uploads.map((batch) => ({
        id: batch.id,
        shop: batch.shop.name,
        platform: batch.platform,
        reportType: batch.files[0]?.reportType || "-",
        fileName: batch.files[0]?.originalName || "-",
        period: `${batch.periodStart.toISOString().slice(0, 10)} 至 ${batch.periodEnd.toISOString().slice(0, 10)}`,
        status: batch.status,
        rowCount: batch.files[0]?.rowCount || 0
      }))
    : [
        { id: "demo-1", shop: "天猫旗舰店", platform: "TMALL", reportType: "shop", fileName: "shop-demo.csv", period: "2024-05-01 至 2024-05-31", status: "imported", rowCount: 31 },
        { id: "demo-2", shop: "天猫旗舰店", platform: "TMALL", reportType: "product", fileName: "product-demo.xlsx", period: "2024-05-01 至 2024-05-31", status: "imported", rowCount: 128 }
      ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-950">数据管理</h1>
        <p className="mt-1 text-sm text-slate-500">查看上传批次、原始文件、清洗状态，并重新生成分析报告。</p>
      </div>
      <Card className="p-5">
        <div className="mb-4 flex gap-3">
          <select className="h-10 rounded-md border border-slate-200 px-3 text-sm"><option>全部店铺</option></select>
          <select className="h-10 rounded-md border border-slate-200 px-3 text-sm"><option>全部报表</option></select>
          <button className="h-10 rounded-md border border-slate-200 px-4 text-sm">重新清洗</button>
          <button className="h-10 rounded-md bg-brand-600 px-4 text-sm font-medium text-white">重新生成报告</button>
        </div>
        <div className="overflow-hidden rounded-md border border-slate-200">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="p-3">店铺</th>
                <th>平台</th>
                <th>报表类型</th>
                <th>原始文件</th>
                <th>周期</th>
                <th>行数</th>
                <th>状态</th>
                <th className="text-right">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {rows.map((row) => (
                <tr key={row.id}>
                  <td className="p-3 text-slate-900">{row.shop}</td>
                  <td className="text-slate-600">{row.platform}</td>
                  <td className="text-slate-600">{row.reportType}</td>
                  <td className="text-slate-600">{row.fileName}</td>
                  <td className="text-slate-600">{row.period}</td>
                  <td className="text-slate-600">{row.rowCount}</td>
                  <td><span className="rounded bg-brand-50 px-2 py-1 text-xs font-medium text-brand-700">{row.status}</span></td>
                  <td className="p-3">
                    <div className="flex justify-end gap-2">
                      {"id" in row && !String(row.id).startsWith("demo") ? (
                        <>
                          <form action={recleanBatch}>
                            <input type="hidden" name="batchId" value={row.id} />
                            <button className="rounded-md border border-slate-200 px-3 py-1.5 text-xs text-slate-700">重新清洗</button>
                          </form>
                          <form action={deleteBatch}>
                            <input type="hidden" name="batchId" value={row.id} />
                            <button className="rounded-md border border-red-200 px-3 py-1.5 text-xs text-red-600">删除</button>
                          </form>
                        </>
                      ) : <span className="text-xs text-slate-400">演示数据</span>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
