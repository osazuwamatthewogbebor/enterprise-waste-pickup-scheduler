import { NextResponse } from "next/server";
import { getOrganizationBySlug, normalizeOrgStatus } from "@/src/lib/with-tenant";
import { normalizeNigerianPhone, isValidNigerianPhone } from "@/src/lib/phone";
import { phoneRateLimiter, ipRateLimiter } from "@/src/lib/rate-limit";
import prisma from "@/src/lib/prisma";
import { fail, ok } from "@/src/lib/result";

export async function POST(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const slug = (await params).slug;
    const body = await request.json();
    const { phone, address, type, preferredDate, notes, website } = body;

    if (website) {
      return NextResponse.json(fail("Bot detected"), { status: 400 });
    }

    const submittedAt = body.submittedAt || Date.now();
    if (Date.now() - submittedAt < 3000) {
      return NextResponse.json(fail("Please wait a moment before submitting"), { status: 429 });
    }

    const ip = request.headers.get("x-forwarded-for") || "unknown";

    const phoneCheck = phoneRateLimiter.check(phone);
    if (!phoneCheck.allowed) {
      return NextResponse.json(fail("Too many requests from this phone"), { status: 429 });
    }

    const ipCheck = ipRateLimiter.check(ip);
    if (!ipCheck.allowed) {
      return NextResponse.json(fail("Too many requests from this IP"), { status: 429 });
    }

    const org = await getOrganizationBySlug(slug);
    if (!org) {
      return NextResponse.json(fail("Organization not found"), { status: 404 });
    }

    const orgStatus = normalizeOrgStatus(org.verificationStatus);
    if (orgStatus !== "VERIFIED") {
      return NextResponse.json(
        fail(
          `Organization is ${orgStatus.replace("_", " ").toLowerCase()}; service requests are locked pending verification`
        ),
        { status: 403 }
      );
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

    let resident = await prisma.user.findFirst({
      where: { phone: normalizedPhone, organizationId: org.id },
    });

    if (!resident) {
      resident = await prisma.user.create({
        data: {
          organizationId: org.id,
          phone: normalizedPhone,
          accountStatus: "UNCLAIMED",
          streetAddress: address,
          role: "RESIDENT",
        },
      });
    }

    const serviceRequest = await prisma.serviceRequest.create({
      data: {
        organizationId: org.id,
        residentId: resident.id,
        type,
        address,
        preferredDate: preferredDate ? new Date(preferredDate) : undefined,
        notes,
      },
    });

    await prisma.eventLog.create({
      data: {
        organizationId: org.id,
        type: "SERVICE_REQUEST_CREATED",
        payload: { requestId: serviceRequest.id, type },
      },
    });

    return NextResponse.json(ok({ confirmationNumber: serviceRequest.id }));
  } catch (e) {
    console.error("Public request error", e);
    return NextResponse.json(fail("Internal server error"), { status: 500 });
  }
}
