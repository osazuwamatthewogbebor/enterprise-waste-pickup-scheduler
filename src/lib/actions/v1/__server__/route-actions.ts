"use server";

import prisma from "@/src/lib/prisma";
import { getSessionUser, requireVerifiedOrg } from "@/src/lib/with-tenant";
import { ok, fail } from "@/src/lib/result";
import type { ActionResult } from "@/src/lib/result";
import { z } from "zod";
import { geocodeAddress } from "@/src/lib/geocode";

const createRouteSchema = z.object({
  name: z.string().min(1, "Route name is required"),
  zoneId: z.string(),
  driverId: z.string(),
  date: z.string(),
});

const updateRouteStatusSchema = z.object({
  routeId: z.string(),
  status: z.enum(["SCHEDULED", "IN_PROGRESS", "COMPLETED", "CANCELLED"]),
});

export async function createRoute(_prevState: unknown, formData: FormData): Promise<ActionResult<any>> {
  const user = await getSessionUser();
  if (!user) return fail("Unauthorized");
  if (user.role !== "ADMIN") return fail("Forbidden");

  const verified = await requireVerifiedOrg(user);
  if (!verified.verified) {
    return fail(
      `Organization is ${verified.status.replace("_", " ").toLowerCase()}; live route dispatches are locked pending verification`
    );
  }

  const raw = {
    name: formData.get("name"),
    zoneId: formData.get("zoneId"),
    driverId: formData.get("driverId"),
    date: formData.get("date"),
  };

  const parsed = createRouteSchema.safeParse(raw);
  if (!parsed.success) {
    return fail("Invalid input", parsed.error.flatten().fieldErrors as Record<string, string>);
  }

  const zone = await prisma.zone.findFirst({
    where: { id: parsed.data.zoneId, organizationId: user.organizationId },
    select: { id: true },
  });

  if (!zone) return fail("Zone not found");

  const driver = await prisma.user.findFirst({
    where: { id: parsed.data.driverId, organizationId: user.organizationId, role: "DRIVER" },
    select: { id: true },
  });

  if (!driver) return fail("Driver not found");

  const routeDate = new Date(parsed.data.date);

  const residents = await prisma.user.findMany({
    where: { zoneId: parsed.data.zoneId, organizationId: user.organizationId, role: "RESIDENT" },
    select: { id: true, streetAddress: true, landmark: true, latitude: true, longitude: true },
  });

  const enriched = await Promise.all(
    residents.map(async (resident) => {
      if (resident.latitude && resident.longitude) {
        return { residentId: resident.id, address: resident.streetAddress || resident.landmark || "Unknown address", latitude: resident.latitude, longitude: resident.longitude };
      }
      const address = resident.streetAddress || resident.landmark || "Unknown address";
      const coords = await geocodeAddress(address);
      return { residentId: resident.id, address, latitude: coords?.latitude ?? null, longitude: coords?.longitude ?? null };
    })
  );

  const route = await prisma.$transaction(async (tx) => {
    const newRoute = await tx.route.create({
      data: {
        organizationId: user.organizationId,
        name: parsed.data.name,
        zoneId: parsed.data.zoneId,
        driverId: parsed.data.driverId,
        date: routeDate,
      },
    });

    if (enriched.length > 0) {
      await tx.pickupStop.createMany({
        data: enriched.map((e) => ({
          routeId: newRoute.id,
          residentId: e.residentId,
          organizationId: user.organizationId,
          zoneId: parsed.data.zoneId,
          address: e.address,
          latitude: e.latitude,
          longitude: e.longitude,
          stopOrder: 0,
          status: "PENDING" as const,
          note: null,
          photoUrl: null,
          needsReview: false,
        })),
      });
    }

    await tx.eventLog.create({
      data: {
        organizationId: user.organizationId,
        type: "ROUTE_CREATED",
        payload: { routeId: newRoute.id, stopCount: residents.length },
      },
    });

    return newRoute;
  });

  return ok(route);
}

export async function updateRouteStatus(_prevState: unknown, formData: FormData): Promise<ActionResult<any>> {
  const user = await getSessionUser();
  if (!user) return fail("Unauthorized");
  if (user.role !== "ADMIN" && user.role !== "DRIVER") return fail("Forbidden");

  const raw = {
    routeId: formData.get("routeId"),
    status: formData.get("status"),
  };

  const parsed = updateRouteStatusSchema.safeParse(raw);
  if (!parsed.success) {
    return fail("Invalid input", parsed.error.flatten().fieldErrors as Record<string, string>);
  }

  const route = await prisma.route.findFirst({
    where: { id: parsed.data.routeId, organizationId: user.organizationId },
    select: { id: true, status: true, driverId: true },
  });

  if (!route) return fail("Route not found");

  if (user.role === "DRIVER" && route.driverId !== user.id) {
    return fail("Forbidden");
  }

  const validTransitions: Record<string, string[]> = {
    SCHEDULED: ["IN_PROGRESS", "CANCELLED"],
    IN_PROGRESS: ["COMPLETED", "CANCELLED"],
    COMPLETED: [],
    CANCELLED: [],
  };

  if (!validTransitions[route.status]?.includes(parsed.data.status)) {
    return fail(`Cannot transition from ${route.status} to ${parsed.data.status}`);
  }

  const updated = await prisma.route.update({
    where: { id: route.id },
    data: { status: parsed.data.status },
  });

  if (parsed.data.status === "IN_PROGRESS") {
    await prisma.eventLog.create({
      data: {
        organizationId: user.organizationId,
        type: "ROUTE_STARTED",
        payload: { routeId: route.id },
      },
    });
  } else if (parsed.data.status === "COMPLETED") {
    await prisma.eventLog.create({
      data: {
        organizationId: user.organizationId,
        type: "ROUTE_COMPLETED",
        payload: { routeId: route.id },
      },
    });
  }

  return ok(updated);
}

const reorderSchema = z.object({
  routeId: z.string(),
  stops: z.string().transform((s) => JSON.parse(s)),
});

export async function reorderStops(_prevState: unknown, formData: FormData): Promise<ActionResult<any>> {
  const user = await getSessionUser();
  if (!user) return fail("Unauthorized");
  if (user.role !== "ADMIN" && user.role !== "DRIVER") return fail("Forbidden");

  const raw = {
    routeId: formData.get("routeId"),
    stops: formData.get("stops"),
  };

  const parsed = reorderSchema.safeParse(raw);
  if (!parsed.success) {
    return fail("Invalid input", parsed.error.flatten().fieldErrors as Record<string, string>);
  }

  const route = await prisma.route.findFirst({
    where: { id: parsed.data.routeId, organizationId: user.organizationId },
    select: { id: true, driverId: true },
  });

  if (!route) return fail("Route not found");

  if (user.role === "DRIVER" && route.driverId !== user.id) {
    return fail("Forbidden");
  }

  const updates = parsed.data.stops.map((s: { id: string; stopOrder: number }) =>
    prisma.pickupStop.update({
      where: { id: s.id, routeId: route.id },
      data: { stopOrder: s.stopOrder },
    })
  );

  await prisma.$transaction(updates);

  return ok({ updated: updates.length });
}
