import { NextResponse } from "next/server";
import { z } from "zod";
import { getSessionUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";

const schema = z.object({
  name: z.string().min(1),
  platform: z.string().min(1),
  shopCode: z.string().optional()
});

export async function GET() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "未登录" }, { status: 401 });
  const shops = await prisma.shop.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" } });
  return NextResponse.json({ shops });
}

export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "未登录" }, { status: 401 });
  const input = schema.parse(await request.json());
  const shop = await prisma.shop.create({ data: { ...input, userId: user.id } });
  return NextResponse.json({ shop });
}
