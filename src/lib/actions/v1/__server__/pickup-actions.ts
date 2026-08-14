"use server";

import prisma from "@/src/lib/prisma";
import { getSessionUser } from "@/src/lib/with-tenant";
import { ok, fail } from "@/src/lib/result";
import type { ActionResult } from "@/src/lib/result";
import { put } from "@vercel/blob";
import { z } from "zod";

const updatePickupSchema = z.object({
  stopId: z.string(),
  status: z.enum(["COMPLETED", "MISSED"]),
  note: z.string().optional(),
});

export async function updatePickup(_prevState: unknown, formData: FormData): Promise<ActionResult<any>> {
  const user = await getSessionUser();
  if (!user) return fail("Unauthorized");
  if (user.role !== "ADMIN" && user.role !== "DRIVER") return fail("Forbidden");

  const raw = {
    stopId: formData.get("stopId"),
    status: formData.get("status"),
    note: formData.get("note"),
  };

  const parsed = updatePickupSchema.safeParse(raw);
  if (!parsed.success) {
    return fail("Invalid input", parsed.error.flatten().fieldErrors as Record<string, string>);
  }

  const stop = await prisma.pickupStop.findFirst({
    where: { id: parsed.data.stopId },
    include: { route: { select: { id: true, organizationId: true, driverId: true } } },
  });

  if (!stop) return fail("Stop not found");
  if (stop.route.organizationId !== user.organizationId) return fail("Unauthorized");
  if (user.role === "DRIVER" && stop.route.driverId !== user.id) return fail("Forbidden");

  const updated = await prisma.pickupStop.update({
    where: { id: stop.id },
    data: {
      status: parsed.data.status,
      note: parsed.data.note ?? stop.note,
      completedAt: parsed.data.status === "COMPLETED" ? new Date() : stop.completedAt,
    },
  });

  await prisma.eventLog.create({
    data: {
      organizationId: user.organizationId,
      type: parsed.data.status === "COMPLETED" ? "PICKUP_COMPLETED" : "PICKUP_MISSED",
      payload: { stopId: stop.id, routeId: stop.routeId, residentId: stop.residentId },
    },
  });

  return ok(updated);
}

export async function uploadPickupPhoto(_prevState: unknown, formData: FormData): Promise<ActionResult<any>> {
  const user = await getSessionUser();
  if (!user) return fail("Unauthorized");
  if (user.role !== "ADMIN" && user.role !== "DRIVER") return fail("Forbidden");

  const stopId = formData.get("stopId") as string;
  const photo = formData.get("photo") as File;

  if (!stopId || !photo) return fail("Missing stopId or photo");

  const stop = await prisma.pickupStop.findFirst({
    where: { id: stopId },
    include: { route: { select: { id: true, organizationId: true, driverId: true } } },
  });

  if (!stop) return fail("Stop not found");
  if (stop.route.organizationId !== user.organizationId) return fail("Unauthorized");
  if (user.role === "DRIVER" && stop.route.driverId !== user.id) return fail("Forbidden");

  const blob = await put(
    `pickup-photos/${stop.routeId}/${stop.id}-${Date.now()}.jpg`,
    photo,
    { access: "public" }
  );

  await prisma.pickupStop.update({
    where: { id: stop.id },
    data: { photoUrl: blob.url, needsReview: true },
  });

  return ok({ url: blob.url });
}
