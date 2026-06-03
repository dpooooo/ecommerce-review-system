import { NextResponse } from "next/server";
import { productMetrics } from "@/lib/demo-data";

export async function GET() {
  return NextResponse.json({ data: productMetrics });
}
