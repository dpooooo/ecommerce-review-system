import Link from "next/link";
import { Card } from "@/components/common/Card";
import { getSessionUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { guessFieldMapping } from "@/lib/analysis/standardize/fieldMapping";

export default async function DataBatchDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser();
  const { id } = await params;
  const batch = user
    ? await prisma.uploadBatch.findFirst({
        where: { id, userId: user.id },
        include: { shop: true, files: true }
      })
    : null;

  if (!batch) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold text-slate-950">上传批次不存在</h1>
        <Link href="/data" className="text-sm text-brand-700">返回数据管理</Link>
      </div>
    );
  }

  const file = batch.files[0];
  const rawColumns = Array.isArray(file?.rawColumns) ? file.rawColumns as string[] : [];
  const preview = Array.isArray(file?.rawPreview) ? file.rawPreview as Array<Record<string, unknown>> : [];
  const savedMappings = file
    ? await prisma.fieldMapping.findMany({
        where: {
          platform: batch.platform,
          reportType: file.reportType,
          originalField: { in: rawColumns }
        }
      })
    : [];
  const savedMap = new Map(savedMappings.map((item) => [item.originalField, item.standardField]));
  const mapping = guessFieldMapping(rawColumns).map((item) => ({
    ...item,
    standardField: savedMap.get(item.originalField) || item.standardField
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-950">上传批次详情</h1>
          <p className="mt-1 text-sm text-slate-500">{batch.shop.name} · {batch.periodStart.toISOString().slice(0, 10)} 至 {batch.periodEnd.toISOString().slice(0, 10)}</p>
        </div>
        <Link href="/data" className="rounded-md border border-slate-200 px-3 py-2 text-sm">返回列表</Link>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {[
          ["平台", batch.platform],
          ["报表类型", file?.reportType || "-"],
          ["状态", batch.status],
          ["行列数", `${file?.rowCount || 0} 行 / ${file?.columnCount || 0} 列`]
        ].map(([label, value]) => (
          <Card key={label} className="p-4">
            <div className="text-sm text-slate-500">{label}</div>
            <div className="mt-2 font-semibold text-slate-950">{value}</div>
          </Card>
        ))}
      </div>

      <Card className="p-5">
        <h2 className="font-semibold text-slate-950">字段映射</h2>
        <div className="mt-4 grid grid-cols-4 gap-3">
          {mapping.map((item) => (
            <div key={item.originalField} className="rounded-md border border-slate-200 p-3 text-sm">
              <div className="font-medium text-slate-900">{item.originalField}</div>
              <div className="mt-1 text-brand-700">{item.standardField || "未映射"}</div>
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-5">
        <h2 className="mb-4 font-semibold text-slate-950">原始数据预览</h2>
        <div className="overflow-x-auto rounded-md border border-slate-200">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>{rawColumns.slice(0, 12).map((column) => <th key={column} className="whitespace-nowrap px-3 py-2">{column}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {preview.slice(0, 20).map((row, index) => (
                <tr key={index}>
                  {rawColumns.slice(0, 12).map((column) => <td key={column} className="max-w-48 truncate whitespace-nowrap px-3 py-2 text-slate-700">{String(row[column] ?? "")}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
