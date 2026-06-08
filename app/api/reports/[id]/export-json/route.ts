import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/session";
import { loadFreshReport } from "@/lib/analysis/report/reportLoader";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getSessionUser();
  const report = await loadFreshReport(id, user?.id);
  return NextResponse.json(report, {
    headers: {
      "Content-Disposition": `attachment; filename="${encodeURIComponent(report.title)}.json"`
    }
  });
}
