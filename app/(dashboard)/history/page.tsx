import Link from "next/link";
import { revalidatePath } from "next/cache";
import { Card } from "@/components/common/Card";
import { getSessionUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";

async function deleteReport(formData: FormData) {
  "use server";

  const user = await getSessionUser();
  if (!user) return;
  const reportId = String(formData.get("reportId") || "");
  if (!reportId) return;
  await prisma.analysisReport.deleteMany({ where: { id: reportId, userId: user.id } });
  revalidatePath("/history");
}

export default async function HistoryPage() {
  const user = await getSessionUser();
  const reports = user
    ? await prisma.analysisReport.findMany({
        where: { userId: user.id },
        include: { shop: true },
        orderBy: { createdAt: "desc" },
        take: 50
      })
    : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-950">历史报告</h1>
        <p className="mt-1 text-sm text-slate-500">沉淀每次经营复盘结果，支持查看、下载和删除。</p>
      </div>
      <Card className="p-5">
        <div className="mb-4 flex gap-3">
          <select className="h-10 rounded-md border border-slate-200 px-3 text-sm"><option>全部店铺</option></select>
          <select className="h-10 rounded-md border border-slate-200 px-3 text-sm"><option>全部报告类型</option></select>
          <input type="month" className="h-10 rounded-md border border-slate-200 px-3 text-sm" />
        </div>
        <div className="space-y-3">
          {reports.length ? reports.map((report) => (
            <div key={report.id} className="rounded-md border border-slate-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-slate-950">{report.title}</div>
                  <div className="mt-1 text-sm text-slate-500">
                    {report.shop.name} · {report.currentStart.toISOString().slice(0, 10)} 至 {report.currentEnd.toISOString().slice(0, 10)} · {report.status}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Link href={`/reports/${report.id}`} className="rounded-md border border-slate-200 px-3 py-2 text-sm">查看</Link>
                  <button className="rounded-md border border-slate-200 px-3 py-2 text-sm">下载</button>
                  <form action={deleteReport}>
                    <input type="hidden" name="reportId" value={report.id} />
                    <button className="rounded-md border border-red-200 px-3 py-2 text-sm text-red-600">删除</button>
                  </form>
                </div>
              </div>
            </div>
          )) : (
            <div className="rounded-md border border-dashed border-slate-300 p-8 text-center">
              <div className="font-medium text-slate-900">暂无历史报告</div>
              <p className="mt-1 text-sm text-slate-500">上传并入库数据后，可以在报告中心生成第一份经营复盘报告。</p>
              <Link href="/reports" className="mt-4 inline-flex h-10 items-center rounded-md bg-brand-600 px-4 text-sm font-medium text-white">去生成报告</Link>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
