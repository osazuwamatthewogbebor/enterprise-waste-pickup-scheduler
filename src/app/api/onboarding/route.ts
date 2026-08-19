import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import prisma from "@/src/lib/prisma";
import { fail, ok } from "@/src/lib/result";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { companyName, slug, fullName, email, password, cacNumber } = body;

    if (!companyName || !slug || !fullName || !email || !password || !cacNumber) {
      return NextResponse.json(fail("All fields including CAC number are required"), { status: 400 });
    }

    const existing = await prisma.organization.findUnique({
      where: { slug },
    });

    if (existing) {
      return NextResponse.json(fail("Organization slug already taken"), { status: 409 });
    }

    const org = await prisma.organization.create({
      data: {
        name: companyName,
        slug,
        cacNumber,
        verificationStatus: "PENDING_VERIFICATION",
      },
    });

    const passwordHash = await bcrypt.hash(password, 10);
    const nameParts = fullName.trim().split(" ");

    const user = await prisma.user.create({
      data: {
        organizationId: org.id,
        email,
        phone: null,
        passwordHash,
        role: "ADMIN",
        accountStatus: "CLAIMED",
        firstName: nameParts[0] ?? null,
        lastName: nameParts.slice(1).join(" ") || null,
      },
    });

    return NextResponse.json(ok({ organizationId: org.id, userId: user.id }));
  } catch (e) {
    console.error("Onboarding error", e);
    return NextResponse.json(fail("Internal server error"), { status: 500 });
  }
}
