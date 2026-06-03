import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json({ status: "imported", message: "数据已完成标准化入库流程预留。" });
}
