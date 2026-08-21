import { NextResponse } from "next/server";
import { getSessionUser, requireVerifiedOrg } from "@/src/lib/with-tenant";
import prisma from "@/src/lib/prisma";
import { ok, fail } from "@/src/lib/result";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ slug: string; id: string }> }
) {
  try {
    const { slug, id } = await params;
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

    const serviceRequest = await prisma.serviceRequest.findFirst({
      where: { id, organizationId: user.organizationId, residentId: user.id },
    });

    if (!serviceRequest) {
      return NextResponse.json(fail("Service request not found"), { status: 404 });
    }

    // Only allow deletion of ended requests (approved, completed, or cancelled)
    if (serviceRequest.status !== "APPROVED" && serviceRequest.status !== "COMPLETED" && serviceRequest.status !== "CANCELLED") {
      return NextResponse.json(
        fail("Only approved, completed, or cancelled requests can be deleted"),
        { status: 400 }
      );
    }

    await prisma.serviceRequest.delete({
      where: { id },
    });

    return NextResponse.json(ok({ success: true }));
  } catch (e) {
    console.error("Delete resident service request error", e);
    return NextResponse.json(fail("Internal server error"), { status: 500 });
  }
}