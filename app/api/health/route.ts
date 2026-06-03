import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { uploadDir } from "@/lib/env";

export async function GET() {
  const startedAt = Date.now();
  try {
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json({
      ok: true,
      database: "ok",
      uploadDir: uploadDir(),
      latencyMs: Date.now() - startedAt,
      checkedAt: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        database: "error",
        uploadDir: uploadDir(),
        error: error instanceof Error ? error.message : "health check failed",
        checkedAt: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}
