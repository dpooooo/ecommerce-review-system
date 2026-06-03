import { NextResponse } from "next/server";
import { z } from "zod";
import { createSession } from "@/lib/auth/session";
import { verifyPassword } from "@/lib/auth/password";
import { prisma } from "@/lib/db/prisma";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

export async function POST(request: Request) {
  const form = await request.formData();
  const input = schema.parse(Object.fromEntries(form));
  const user = await prisma.user.findUnique({ where: { email: input.email } });
  if (!user || !(await verifyPassword(input.password, user.passwordHash))) {
    return NextResponse.json({ error: "账号或密码错误" }, { status: 401 });
  }
  await createSession(user.id);
  return NextResponse.redirect(new URL("/dashboard", request.url));
}
