import { NextResponse } from "next/server";
import { trafficSources } from "@/lib/demo-data";

export async function GET() {
  return NextResponse.json({ data: trafficSources });
}
