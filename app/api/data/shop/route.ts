import { NextResponse } from "next/server";
import { currentShopMetrics } from "@/lib/demo-data";

export async function GET() {
  return NextResponse.json({ data: [currentShopMetrics] });
}
