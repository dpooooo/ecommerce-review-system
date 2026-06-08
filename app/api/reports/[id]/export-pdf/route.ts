import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/session";
import { reportToHtml } from "@/lib/analysis/report/reportExport";
import { loadFreshReport } from "@/lib/analysis/report/reportLoader";

async function exportReport(id: string) {
  const user = await getSessionUser();
  const report = await loadFreshReport(id, user?.id);
  return new NextResponse(reportToHtml(report), {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Content-Disposition": `attachment; filename="${encodeURIComponent(report.title)}.html"`
    }
  });
}

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return exportReport(id);
}

export async function POST(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return exportReport(id);
}
