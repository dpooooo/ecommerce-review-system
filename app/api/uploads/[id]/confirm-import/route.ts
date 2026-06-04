import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { importUploadedFile } from "@/lib/upload/importer";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "未登录" }, { status: 401 });

  const { id } = await params;
  const body = await request.json().catch(() => ({}));
  const batch = await prisma.uploadBatch.findFirst({
    where: { id, userId: user.id },
    include: { files: true }
  });
  if (!batch) return NextResponse.json({ error: "上传批次不存在" }, { status: 404 });
  const file = batch.files[0];
  if (!file) return NextResponse.json({ error: "上传批次没有文件" }, { status: 400 });
  const mapping = Array.isArray(body.mapping)
    ? body.mapping.filter((item: { originalField?: string; standardField?: string }) => item.originalField && item.standardField)
    : [];

  const previousBatches = await prisma.uploadBatch.findMany({
    where: {
      id: { not: batch.id },
      shopId: batch.shopId,
      periodStart: batch.periodStart,
      periodEnd: batch.periodEnd,
      files: { some: { reportType: file.reportType } }
    },
    select: { id: true }
  });
  if (previousBatches.length) {
    await prisma.uploadBatch.deleteMany({
      where: { id: { in: previousBatches.map((item) => item.id) } }
    });
  }

  const result = await importUploadedFile({
    prisma,
    batch,
    file,
    mapping
  });
  if (mapping.length) {
    await Promise.all(
      mapping.map((item: { originalField: string; standardField: string }) =>
        prisma.fieldMapping.upsert({
          where: {
            platform_reportType_originalField: {
              platform: batch.platform,
              reportType: file.reportType,
              originalField: item.originalField
            }
          },
          create: {
            platform: batch.platform,
            reportType: file.reportType,
            originalField: item.originalField,
            standardField: item.standardField
          },
          update: { standardField: item.standardField }
        })
      )
    );
  }
  await prisma.uploadedFile.update({ where: { id: file.id }, data: { parseStatus: "imported" } });
  await prisma.uploadBatch.update({ where: { id: batch.id }, data: { status: "imported" } });

  return NextResponse.json({
    status: "imported",
    savedMappings: mapping.length,
    replacedBatches: previousBatches.length,
    ...result
  });
}
