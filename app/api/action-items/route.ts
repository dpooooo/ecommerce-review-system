import { NextResponse } from "next/server";
import { buildReportSchema } from "@/lib/analysis/report/reportBuilder";

export async function GET() {
  return NextResponse.json({ actionItems: buildReportSchema().actionItems });
}
