import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    data: [
      { planId: "AD02", unitId: "U01", audienceId: "A01", audienceName: "高客单老客", spend: 88000, revenue: 610000, roi: 6.93 },
      { planId: "AD03", unitId: "U02", audienceId: "A02", audienceName: "低价敏感新客", spend: 126000, revenue: 280000, roi: 2.22 }
    ]
  });
}
