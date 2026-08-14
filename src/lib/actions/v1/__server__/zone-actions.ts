"use server";

import prisma from "@/src/lib/prisma";
import { getSessionUser } from "@/src/lib/with-tenant";
import { ok, fail } from "@/src/lib/result";
import type { ActionResult } from "@/src/lib/result";
import type { Zone } from "@/src/generated/prisma/client";
import { z } from "zod";

const createZoneSchema = z.object({
  name: z.string().min(1, "Zone name is required"),
  description: z.string().optional(),
  color: z.string().optional(),
});

export async function createZone(_prevState: unknown, formData: FormData): Promise<ActionResult<Zone>> {
  const user = await getSessionUser();
  if (!user) return fail("Unauthorized");

  const raw = {
    name: formData.get("name"),
    description: formData.get("description"),
    color: formData.get("color"),
  };

  const parsed = createZoneSchema.safeParse(raw);
  if (!parsed.success) {
    return fail("Invalid input", parsed.error.flatten().fieldErrors as Record<string, string>);
  }

  const zone = await prisma.zone.create({
    data: {
      organizationId: user.organizationId,
      name: parsed.data.name,
      description: parsed.data.description ?? null,
      color: parsed.data.color ?? "#d4622b",
    },
  });

  return ok(zone);
}
