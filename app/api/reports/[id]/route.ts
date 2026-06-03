import { NextResponse } from "next/server";
import { buildReportSchema } from "@/lib/analysis/report/reportBuilder";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return NextResponse.json(buildReportSchema({ reportId: id }));
}

export async function DELETE() {
  return NextResponse.json({ ok: true });
}
