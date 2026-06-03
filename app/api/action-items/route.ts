import { NextResponse } from "next/server";
import { buildReportSchema } from "@/lib/analysis/report/reportBuilder";
import { getSessionUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";

export async function GET() {
  const user = await getSessionUser();
  if (user) {
    const shops = await prisma.shop.findMany({ where: { userId: user.id }, select: { id: true } });
    const actionItems = await prisma.actionItem.findMany({
      where: { shopId: { in: shops.map((shop) => shop.id) } },
      orderBy: [{ priority: "asc" }, { createdAt: "desc" }],
      take: 100
    });
    return NextResponse.json({ actionItems });
  }
  return NextResponse.json({ actionItems: buildReportSchema().actionItems });
}
