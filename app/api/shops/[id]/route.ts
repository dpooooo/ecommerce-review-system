import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "未登录" }, { status: 401 });
  const { id } = await params;
  const body = await request.json();
  const result = await prisma.shop.updateMany({ where: { id, userId: user.id }, data: body });
  if (result.count === 0) return NextResponse.json({ error: "店铺不存在" }, { status: 404 });
  const shop = await prisma.shop.findUnique({ where: { id } });
  return NextResponse.json({ shop });
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "未登录" }, { status: 401 });
  const { id } = await params;
  await prisma.shop.deleteMany({ where: { id, userId: user.id } });
  return NextResponse.json({ ok: true });
}
