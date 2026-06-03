import { NextResponse } from "next/server";
import { mkdir, unlink, writeFile } from "fs/promises";
import path from "path";
import { prisma } from "@/lib/db/prisma";
import { uploadDir } from "@/lib/env";

export async function GET() {
  const startedAt = Date.now();
  const resolvedUploadDir = uploadDir();
  try {
    await Promise.all([
      prisma.$queryRaw`SELECT 1`,
      mkdir(resolvedUploadDir, { recursive: true })
    ]);
    const testFile = path.join(resolvedUploadDir, `.health-${Date.now()}`);
    await writeFile(testFile, "ok");
    await unlink(testFile).catch(() => undefined);
    return NextResponse.json({
      ok: true,
      database: "ok",
      uploadDir: resolvedUploadDir,
      uploadWritable: true,
      nodeEnv: process.env.NODE_ENV || "unknown",
      appUrl: process.env.NEXT_PUBLIC_APP_URL || "",
      latencyMs: Date.now() - startedAt,
      checkedAt: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        database: "error",
        uploadDir: resolvedUploadDir,
        uploadWritable: false,
        nodeEnv: process.env.NODE_ENV || "unknown",
        appUrl: process.env.NEXT_PUBLIC_APP_URL || "",
        error: error instanceof Error ? error.message : "health check failed",
        checkedAt: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}
