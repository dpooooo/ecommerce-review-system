import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "未登录" }, { status: 401 });
  const { id } = await params;
  const body = await request.json();
  const shops = await prisma.shop.findMany({ where: { userId: user.id }, select: { id: true } });
  const result = await prisma.actionItem.updateMany({
    where: { id, shopId: { in: shops.map((shop) => shop.id) } },
    data: {
      title: body.title,
      action: body.action,
      targetMetric: body.targetMetric,
      estimatedImpact: body.estimatedImpact,
      owner: body.owner,
      dueDate: body.dueDate ? new Date(body.dueDate) : undefined,
      status: body.status
    }
  });
  if (result.count === 0) return NextResponse.json({ error: "行动项不存在" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
