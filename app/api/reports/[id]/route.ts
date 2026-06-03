import { NextResponse } from "next/server";
import { buildReportSchema } from "@/lib/analysis/report/reportBuilder";
import { getSessionUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser();
  const { id } = await params;
  if (user) {
    const report = await prisma.analysisReport.findFirst({ where: { id, userId: user.id } });
    if (report) return NextResponse.json(report.reportJson);
  }
  return NextResponse.json(buildReportSchema({ reportId: id }));
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "未登录" }, { status: 401 });
  const { id } = await params;
  await prisma.analysisReport.deleteMany({ where: { id, userId: user.id } });
  return NextResponse.json({ ok: true });
}
