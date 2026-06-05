import { NextResponse } from "next/server";
import { getDefaultTimeGrain, getStandardTemplate, isTimeGrain } from "@/lib/upload/standardTemplates";

function csvCell(value: string | number) {
  const text = String(value);
  return `"${text.replaceAll('"', '""')}"`;
}

export async function GET(request: Request, { params }: { params: Promise<{ reportType: string }> }) {
  const { reportType } = await params;
  const url = new URL(request.url);
  const requestedTimeGrain = url.searchParams.get("timeGrain");
  const timeGrain = isTimeGrain(requestedTimeGrain) ? requestedTimeGrain : getDefaultTimeGrain(reportType);
  const template = getStandardTemplate(reportType, timeGrain);
  if (!template) {
    return NextResponse.json({ error: "标准模板不存在。" }, { status: 404 });
  }

  const header = template.columns.map((column) => csvCell(column.label)).join(",");
  const example = template.columns.map((column) => csvCell(column.example)).join(",");
  const csv = `\uFEFF${header}\r\n${example}\r\n`;
  const fileName = encodeURIComponent(`${template.name}.csv`);

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename*=UTF-8''${fileName}`
    }
  });
}
