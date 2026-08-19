import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import prisma from "@/src/lib/prisma";
import { env } from "@/src/lib/env";
import { SignJWT } from "jose";
import { normalizeNigerianPhone, isValidNigerianPhone } from "@/src/lib/phone";
import { getOrganizationBySlug, normalizeOrgStatus } from "@/src/lib/with-tenant";
import { ok, fail } from "@/src/lib/result";

export async function POST(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const slug = (await params).slug;
    const body = await request.json();
    const { phone, password } = body;

    if (!phone || !password) {
      return NextResponse.json(fail("Phone and password required"), { status: 400 });
    }

    const org = await getOrganizationBySlug(slug);
    if (!org) {
      return NextResponse.json(fail("Organization not found"), { status: 404 });
    }

    const orgStatus = normalizeOrgStatus(org.verificationStatus);
    if (orgStatus === "SUSPENDED") {
      return NextResponse.json(fail("Your organization is suspended"), { status: 403 });
    }

    let normalizedPhone: string;
    try {
      normalizedPhone = normalizeNigerianPhone(phone);
    } catch {
      return NextResponse.json(fail("Invalid phone number"), { status: 400 });
    }
    if (!isValidNigerianPhone(normalizedPhone)) {
      return NextResponse.json(fail("Invalid Nigerian phone number"), { status: 400 });
    }

    const user = await prisma.user.findFirst({
      where: {
        phone: normalizedPhone,
        organizationId: org.id,
        role: "RESIDENT",
      },
      include: { organization: { select: { slug: true } } },
    });

    if (!user || !user.passwordHash) {
      return NextResponse.json(fail("Invalid credentials"), { status: 401 });
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return NextResponse.json(fail("Invalid credentials"), { status: 401 });
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

    const response = NextResponse.json(
      ok({
        user: {
          id: user.id,
          role: user.role,
          orgSlug: user.organization.slug,
        },
      })
    );

    response.cookies.set("auth-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 7 * 24 * 60 * 60,
      path: "/",
    });

    return response;
  } catch (e) {
    console.error("Resident login error", e);
    return NextResponse.json(fail("Internal server error"), { status: 500 });
  }
}
