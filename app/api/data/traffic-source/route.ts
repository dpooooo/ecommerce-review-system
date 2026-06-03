import { NextResponse } from "next/server";
import { trafficSources } from "@/lib/demo-data";
import { getSessionUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";

export async function GET(request: Request) {
  const user = await getSessionUser();
  if (user) {
    const searchParams = new URL(request.url).searchParams;
    const shops = await prisma.shop.findMany({ where: { userId: user.id }, select: { id: true } });
    const shopId = searchParams.get("shopId");
    const data = await prisma.trafficSourceMetric.findMany({
      where: { shopId: shopId || { in: shops.map((shop) => shop.id) } },
      orderBy: { revenue: "desc" },
      take: 200
    });
    return NextResponse.json({ data });
  }
  return NextResponse.json({ data: trafficSources });
}
