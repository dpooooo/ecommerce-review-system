import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";

export async function GET(request: Request) {
  const user = await getSessionUser();
  if (user) {
    const searchParams = new URL(request.url).searchParams;
    const shops = await prisma.shop.findMany({ where: { userId: user.id }, select: { id: true } });
    const shopId = searchParams.get("shopId");
    const data = await prisma.promotionAudienceMetric.findMany({
      where: { shopId: shopId || { in: shops.map((shop) => shop.id) } },
      orderBy: { roi: "desc" },
      take: 200
    });
    return NextResponse.json({ data });
  }
  return NextResponse.json({
    data: [
      { planId: "AD02", unitId: "U01", audienceId: "A01", audienceName: "高客单老客", spend: 88000, revenue: 610000, roi: 6.93 },
      { planId: "AD03", unitId: "U02", audienceId: "A02", audienceName: "低价敏感新客", spend: 126000, revenue: 280000, roi: 2.22 }
    ]
  });
}
