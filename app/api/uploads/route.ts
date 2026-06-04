import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { uploadDir } from "@/lib/env";
import { parseBuffer } from "@/lib/upload/parser";
import { detectReportTypeWithConfidence } from "@/lib/upload/reportType";
import { guessFieldMapping } from "@/lib/analysis/standardize/fieldMapping";
import {
  detectStandardTemplate,
  standardTemplateMapping,
  validateStandardTemplateRows
} from "@/lib/upload/standardTemplates";
import { getSessionUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";

function mergeSavedMappings(
  guessed: Array<{ originalField: string; standardField: string }>,
  saved: Array<{ originalField: string; standardField: string }>
) {
  const savedMap = new Map(saved.map((item) => [item.originalField, item.standardField]));
  return guessed.map((item) => ({
    ...item,
    standardField: savedMap.get(item.originalField) || item.standardField
  }));
}

export async function GET() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "未登录" }, { status: 401 });
  const uploads = await prisma.uploadBatch.findMany({
    where: { userId: user.id },
    include: { shop: true, files: true },
    orderBy: { createdAt: "desc" },
    take: 50
  });
  return NextResponse.json({ uploads });
}

export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "未登录" }, { status: 401 });

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
  const requestedShopId = String(form.get("shopId") || "");
  const platform = String(form.get("platform") || "TMALL");
  const requestedReportType = String(form.get("reportType") || "auto");
  const periodType = String(form.get("periodType") || "current");
  let periodStart = new Date(String(form.get("periodStart") || "2024-05-01"));
  let periodEnd = new Date(String(form.get("periodEnd") || "2024-05-31"));
  const standardTemplate = detectStandardTemplate(parsed.rawColumns);
  const standardValidation = standardTemplate
    ? validateStandardTemplateRows(standardTemplate, parsed.rawData)
    : null;
  if (standardValidation?.errors.length) {
    return NextResponse.json(
      {
        error: "标准模板校验失败。",
        validationErrors: standardValidation.errors
      },
      { status: 400 }
    );
  }
  if (standardValidation) {
    periodStart = new Date(standardValidation.periodStart);
    periodEnd = new Date(standardValidation.periodEnd);
  }
  const detection = detectReportTypeWithConfidence(parsed.rawColumns);
  const reportType = standardTemplate?.reportType || (requestedReportType === "auto" ? detection.reportType : requestedReportType);
  const shop =
    (requestedShopId && (await prisma.shop.findFirst({ where: { id: requestedShopId, userId: user.id } }))) ||
    (await prisma.shop.findFirst({ where: { userId: user.id }, orderBy: { createdAt: "asc" } })) ||
    (await prisma.shop.create({
      data: {
        userId: user.id,
        name: "默认店铺",
        platform,
        shopCode: "default-shop"
      }
    }));

  const batch = await prisma.uploadBatch.create({
    data: {
      userId: user.id,
      shopId: shop.id,
      platform,
      periodType,
      periodStart,
      periodEnd,
      status: parsed.error ? "failed" : "parsed"
    }
  });
  const uploadedFile = await prisma.uploadedFile.create({
    data: {
      batchId: batch.id,
      shopId: shop.id,
      reportType,
      originalName: file.name,
      storedPath,
      fileType: file.name.split(".").pop()?.toLowerCase() || file.type || "unknown",
      fileSize: file.size,
      rowCount: parsed.rowCount,
      columnCount: parsed.columnCount,
      parseStatus: parsed.error ? "failed" : "parsed",
      parseError: parsed.error,
      rawColumns: parsed.rawColumns as Prisma.InputJsonValue,
      rawPreview: parsed.rawData.slice(0, 20) as Prisma.InputJsonValue
    }
  });
  const guessedMapping = standardTemplate
    ? standardTemplateMapping(standardTemplate.reportType)
    : guessFieldMapping(parsed.rawColumns);
  const savedMappings = await prisma.fieldMapping.findMany({
    where: {
      platform,
      reportType,
      originalField: { in: parsed.rawColumns }
    },
    select: { originalField: true, standardField: true }
  });

  return NextResponse.json({
    batch,
    file: {
      id: uploadedFile.id,
      originalName: file.name,
      reportType,
      storedPath,
      fileType: file.type,
      fileSize: file.size,
      rowCount: parsed.rowCount,
      columnCount: parsed.columnCount,
      parseStatus: parsed.error ? "failed" : "parsed",
      parseError: parsed.error
    },
    detectedReportType: reportType,
    standardTemplate: standardTemplate
      ? {
          reportType: standardTemplate.reportType,
          name: standardTemplate.name,
          directImport: true
        }
      : null,
    detection: {
      reportType,
      confidence: standardTemplate ? 1 : requestedReportType === "auto" ? detection.confidence : 1,
      matchedFields: standardTemplate
        ? guessedMapping.length
        : requestedReportType === "auto"
          ? detection.matchedFields
          : parsed.rawColumns.length
    },
    rawColumns: parsed.rawColumns,
    preview: parsed.rawData.slice(0, 20),
    mapping: mergeSavedMappings(guessedMapping, savedMappings)
  });
}
