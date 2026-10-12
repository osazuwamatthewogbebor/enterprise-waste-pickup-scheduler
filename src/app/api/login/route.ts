import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import prisma from "@/src/lib/prisma";
import { env } from "@/src/lib/env";
import { SignJWT } from "jose";

export async function POST(request: Request) {
  const body = await request.json();
  const { email, phone, password } = body;

  if ((!email && !phone) || !password) {
    return NextResponse.json({ error: "Email/Phone and password required" }, { status: 400 });
  }

  const input = email || phone;

  let user = await prisma.user.findFirst({
    where: { email: input },
    include: { organization: true },
  });

  if (!user && /^\+?\d+$/.test(input)) {
    const normalized = input.startsWith("+") ? input : `+234${input.replace(/^0+/, "")}`;
    user = await prisma.user.findFirst({
      where: { phone: normalized },
      include: { organization: true },
    });
  }

  if (!user || !user.passwordHash) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const token = await new SignJWT({
    sub: user.id,
    email: user.email,
    role: user.role,
    organizationId: user.organizationId,
    orgSlug: user.organization.slug,
    name: `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() || user.phone,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(new TextEncoder().encode(env.AUTH_SECRET));

  const response = NextResponse.json({
    user: {
      id: user.id,
      email: user.email,
      name: `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() || user.phone,
      role: user.role,
      organizationId: user.organizationId,
      orgSlug: user.organization.slug,
    },
  });

  response.cookies.set("auth-token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 7 * 24 * 60 * 60,
    path: "/",
  });

  return response;
}
