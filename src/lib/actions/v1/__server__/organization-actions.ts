"use server";

import prisma from "@/src/lib/prisma";
import { ok, fail } from "@/src/lib/result";
import type { ActionResult } from "@/src/lib/result";
import { isSuperAdmin, normalizeOrgStatus } from "@/src/lib/with-tenant";
import type { OrganizationVerificationStatus } from "@/src/generated/prisma/client";
import { z } from "zod";

const toggleSchema = z.object({
  orgId: z.string(),
  status: z.enum(["PENDING_VERIFICATION", "VERIFIED", "SUSPENDED"]),
});

export async function listOrganizations(): Promise<{
  success: boolean;
  data?: any[];
  error?: string;
}> {
  if (!(await isSuperAdmin())) {
    return { success: false, error: "Forbidden" };
  }

  const orgs = await prisma.organization.findMany({
    select: {
      id: true,
      name: true,
      slug: true,
      cacNumber: true,
      verificationStatus: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
  });

  const data = await Promise.all(
    orgs.map(async (org) => ({
      id: org.id,
      name: org.name,
      slug: org.slug,
      cacNumber: org.cacNumber,
      verificationStatus: normalizeOrgStatus(org.verificationStatus),
      residentCount: await prisma.user.count({
        where: { organizationId: org.id, role: "RESIDENT" },
      }),
      createdAt: org.createdAt,
    }))
  );

  return { success: true, data };
}

export async function verifyOrganizationAction(
  _prevState: unknown,
  formData: FormData
): Promise<ActionResult<any>> {
  if (!(await isSuperAdmin())) {
    return fail("Forbidden");
  }

  const parsed = toggleSchema.safeParse({
    orgId: formData.get("orgId"),
    status: formData.get("status"),
  });
  if (!parsed.success) return fail("Invalid input");

  const updated = await prisma.organization.update({
    where: { id: parsed.data.orgId },
    data: {
      verificationStatus: parsed.data.status as OrganizationVerificationStatus,
    },
  });

  return ok({ id: updated.id, verificationStatus: updated.verificationStatus });
}
