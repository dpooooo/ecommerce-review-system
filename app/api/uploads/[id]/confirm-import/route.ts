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

  const result = await importUploadedFile({
    prisma,
    batch,
    file,
    mapping: body.mapping
  });
  await prisma.uploadedFile.update({ where: { id: file.id }, data: { parseStatus: "imported" } });
  await prisma.uploadBatch.update({ where: { id: batch.id }, data: { status: "imported" } });

  return NextResponse.json({ status: "imported", ...result });
}
