import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export async function GET() {
  const mappings = await prisma.fieldMapping.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json({ mappings });
}

export async function POST(request: Request) {
  const body = await request.json();
  const mapping = await prisma.fieldMapping.upsert({
    where: {
      platform_reportType_originalField: {
        platform: body.platform,
        reportType: body.reportType,
        originalField: body.originalField
      }
    },
    create: body,
    update: { standardField: body.standardField }
  });
  return NextResponse.json({ mapping });
}
