import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";
import { uploadDir } from "@/lib/env";
import { parseBuffer } from "@/lib/upload/parser";
import { guessFieldMapping } from "@/lib/analysis/standardize/fieldMapping";

export async function GET() {
  return NextResponse.json({
    uploads: [
      { id: "demo-upload-1", reportType: "shop", originalName: "shop-demo.csv", status: "imported", rowCount: 31 }
    ]
  });
}

export async function POST(request: Request) {
  const form = await request.formData();
  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "请选择上传文件" }, { status: 400 });
  }

  const bytes = Buffer.from(await file.arrayBuffer());
  const dir = uploadDir();
  await mkdir(dir, { recursive: true });
  const storedName = `${Date.now()}-${file.name}`;
  const storedPath = path.join(dir, storedName);
  await writeFile(storedPath, bytes);

  const parsed = parseBuffer(bytes, file.name);
  return NextResponse.json({
    batch: {
      id: crypto.randomUUID(),
      status: parsed.error ? "failed" : "parsed",
      reportType: String(form.get("reportType") || "shop")
    },
    file: {
      originalName: file.name,
      storedPath,
      fileType: file.type,
      fileSize: file.size,
      rowCount: parsed.rowCount,
      columnCount: parsed.columnCount,
      parseStatus: parsed.error ? "failed" : "parsed",
      parseError: parsed.error
    },
    rawColumns: parsed.rawColumns,
    preview: parsed.rawData.slice(0, 20),
    mapping: guessFieldMapping(parsed.rawColumns)
  });
}
