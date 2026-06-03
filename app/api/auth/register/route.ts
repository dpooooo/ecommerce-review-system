import { NextResponse } from "next/server";
import { z } from "zod";
import { createSession } from "@/lib/auth/session";
import { hashPassword } from "@/lib/auth/password";
import { prisma } from "@/lib/db/prisma";
import { appUrl } from "@/lib/url";

const schema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6),
  confirmPassword: z.string().min(6)
});

export async function POST(request: Request) {
  const form = await request.formData();
  const input = schema.parse(Object.fromEntries(form));
  if (input.password !== input.confirmPassword) {
    return NextResponse.json({ error: "两次密码输入不一致" }, { status: 400 });
  }
  const user = await prisma.user.create({
    data: {
      name: input.name,
      email: input.email,
      passwordHash: await hashPassword(input.password),
      role: "admin"
    }
  });
  await createSession(user.id);
  return NextResponse.redirect(appUrl("/dashboard", request.url));
}
