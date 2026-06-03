import { NextResponse } from "next/server";
import { promotionPlans } from "@/lib/demo-data";

export async function GET() {
  return NextResponse.json({ data: promotionPlans });
}
