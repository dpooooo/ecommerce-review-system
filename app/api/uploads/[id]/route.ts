import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { guessFieldMapping } from "@/lib/analysis/standardize/fieldMapping";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "未登录" }, { status: 401 });
  const { id } = await params;
  const batch = await prisma.uploadBatch.findFirst({
    where: { id, userId: user.id },
    include: { files: true, shop: true }
  });
  if (!batch) return NextResponse.json({ error: "上传批次不存在" }, { status: 404 });
  const file = batch.files[0];
  const rawColumns = Array.isArray(file?.rawColumns) ? file.rawColumns as string[] : [];
  const savedMappings = file
    ? await prisma.fieldMapping.findMany({
        where: {
          platform: batch.platform,
          reportType: file.reportType,
          originalField: { in: rawColumns }
        },
        select: { originalField: true, standardField: true }
      })
    : [];
  const savedMap = new Map(savedMappings.map((item) => [item.originalField, item.standardField]));
  const mapping = guessFieldMapping(rawColumns).map((item) => ({
    ...item,
    standardField: savedMap.get(item.originalField) || item.standardField
  }));
  return NextResponse.json({
    batch,
    rawColumns,
    preview: file?.rawPreview || [],
    mapping
  });
}
