import { NextResponse } from "next/server";
import { getSessionUser, requireVerifiedOrg } from "@/src/lib/with-tenant";
import prisma from "@/src/lib/prisma";
import { ok, fail } from "@/src/lib/result";

const ALLOWED_TYPES = ["BULK_SKIP", "ON_DEMAND", "MISSED_PICKUP"] as const;

export async function POST(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const slug = (await params).slug;
    const user = await getSessionUser();

    if (!user) {
      return NextResponse.json(fail("Unauthorized"), { status: 401 });
    }
    if (user.role !== "RESIDENT") {
      return NextResponse.json(fail("Forbidden"), { status: 403 });
    }
    if (user.orgSlug !== slug) {
      return NextResponse.json(fail("Forbidden"), { status: 403 });
    }

    const verified = await requireVerifiedOrg(user);
    if (!verified.verified) {
      return NextResponse.json(
        fail(
          `Organization is ${verified.status.replace("_", " ").toLowerCase()}; service requests are locked pending verification`
        ),
        { status: 403 }
      );
    }

    const body = await request.json();
    const { type, address, preferredDate, notes } = body;

    if (!address) {
      return NextResponse.json(fail("Address is required"), { status: 400 });
    }
    if (!ALLOWED_TYPES.includes(type as (typeof ALLOWED_TYPES)[number])) {
      return NextResponse.json(fail("Invalid request type"), { status: 400 });
    }

    const serviceRequest = await prisma.serviceRequest.create({
      data: {
        organizationId: user.organizationId,
        residentId: user.id,
        type: type as (typeof ALLOWED_TYPES)[number],
        address,
        preferredDate: preferredDate ? new Date(preferredDate) : undefined,
        notes: notes || undefined,
      },
    });

    return NextResponse.json(ok({ confirmationNumber: serviceRequest.id }));
  } catch (e) {
    console.error("Resident request error", e);
    return NextResponse.json(fail("Internal server error"), { status: 500 });
  }
}
