import { NextResponse } from "next/server";
import { userProfiles } from "@/lib/demo-data";

export async function GET() {
  return NextResponse.json({ data: userProfiles });
}
