import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json();
  const mapping = await prisma.fieldMapping.update({ where: { id }, data: body });
  return NextResponse.json({ mapping });
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await prisma.fieldMapping.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
