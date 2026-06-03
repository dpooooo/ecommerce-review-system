import { NextResponse } from "next/server";
import { buildReportSchema } from "@/lib/analysis/report/reportBuilder";

export async function POST() {
  return NextResponse.json(buildReportSchema({ reportId: crypto.randomUUID() }));
}
