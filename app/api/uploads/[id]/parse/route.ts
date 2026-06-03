import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";

export async function POST(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "未登录" }, { status: 401 });
  const { id } = await params;
  const result = await prisma.uploadBatch.updateMany({
    where: { id, userId: user.id },
    data: { status: "parsed" }
  });
  if (result.count === 0) return NextResponse.json({ error: "上传批次不存在" }, { status: 404 });
  return NextResponse.json({ status: "parsed" });
}
