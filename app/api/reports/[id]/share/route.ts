import { randomBytes } from "crypto";
import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";

export async function POST(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "请先登录。" }, { status: 401 });

  const { id } = await params;
  const report = await prisma.analysisReport.findFirst({ where: { id, userId: user.id } });
  if (!report) return NextResponse.json({ error: "报告不存在。" }, { status: 404 });

  const existing = await prisma.$queryRaw<Array<{ shareToken: string | null }>>`
    SELECT "shareToken" FROM "AnalysisReport"
    WHERE "id" = ${report.id} AND "userId" = ${user.id}
    LIMIT 1
  `;
  const shareToken = existing[0]?.shareToken || randomBytes(24).toString("base64url");
  await prisma.$executeRaw`
    UPDATE "AnalysisReport"
    SET "shareToken" = ${shareToken}, "sharedAt" = NOW()
    WHERE "id" = ${report.id} AND "userId" = ${user.id}
  `;

  return NextResponse.json({ sharePath: `/share/reports/${shareToken}` });
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "请先登录。" }, { status: 401 });

  const { id } = await params;
  const count = await prisma.$executeRaw`
    UPDATE "AnalysisReport"
    SET "shareToken" = NULL, "sharedAt" = NULL
    WHERE "id" = ${id} AND "userId" = ${user.id}
  `;
  if (!count) return NextResponse.json({ error: "报告不存在。" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
