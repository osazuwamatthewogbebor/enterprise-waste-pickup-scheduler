"use server";

import prisma from "@/src/lib/prisma";
import { getSessionUser, requireVerifiedOrg } from "@/src/lib/with-tenant";
import { ok, fail } from "@/src/lib/result";
import type { ActionResult } from "@/src/lib/result";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const transitionSchema = z.object({
  requestId: z.string().min(1, "Request ID is required"),
  status: z.enum(["APPROVED", "IN_PROGRESS", "COMPLETED", "CANCELLED"]),
  adminNotes: z.string().nullish(),
});

const validTransitions: Record<string, string[]> = {
  PENDING: ["APPROVED", "CANCELLED"],
  APPROVED: ["IN_PROGRESS", "CANCELLED"],
  IN_PROGRESS: ["COMPLETED", "CANCELLED"],
  COMPLETED: [],
  CANCELLED: [],
};

export async function transitionServiceRequest(_prevState: unknown, formData: FormData): Promise<ActionResult<any>> {
  const user = await getSessionUser();
  if (!user) return fail("Unauthorized");
  if (user.role !== "ADMIN") return fail("Forbidden");

  const verified = await requireVerifiedOrg(user);
  if (verified.status === "SUSPENDED") {
    return fail("Organization is suspended; service request processing is locked");
  }
  if (!verified.verified && process.env.NODE_ENV === "production") {
    return fail(
      `Organization is ${verified.status.replace("_", " ").toLowerCase()}; service request processing is locked pending verification`
    );
  }

  const raw = {
    requestId: formData.get("requestId"),
    status: formData.get("status"),
    adminNotes: formData.get("adminNotes") || undefined,
  };

  const parsed = transitionSchema.safeParse(raw);
  if (!parsed.success) {
    return fail("Invalid input", parsed.error.flatten().fieldErrors as Record<string, string>);
  }

  const request = await prisma.serviceRequest.findFirst({
    where: { id: parsed.data.requestId, organizationId: user.organizationId },
    select: { id: true, status: true, adminNotes: true, residentId: true },
  });

  if (!request) return fail("Service request not found");

  if (!validTransitions[request.status]?.includes(parsed.data.status)) {
    return fail(`Cannot transition from ${request.status} to ${parsed.data.status}`);
  }

  const updated = await prisma.serviceRequest.update({
    where: { id: request.id },
    data: {
      status: parsed.data.status,
      adminNotes: parsed.data.adminNotes ?? request.adminNotes ?? null,
    },
  });

  revalidatePath("/dashboard/admin/service-requests");
  revalidatePath("/dashboard/admin");

  return ok(updated);
}
