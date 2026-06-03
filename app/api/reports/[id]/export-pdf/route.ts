import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json({ message: "PDF 导出接口已预留，生产版可接入 Playwright 或服务端 PDF 渲染。" });
}
