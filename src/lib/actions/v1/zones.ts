import prisma from "@/src/lib/prisma";
import { getSessionUser } from "@/src/lib/with-tenant";
import type { Zone, User } from "@/src/generated/prisma/client";

export async function listZones(): Promise<{ success: boolean; data?: any[]; error?: string }> {
  const user = await getSessionUser();
  if (!user || user.role !== "ADMIN") {
    return { success: false, error: "Unauthorized" };
  }

  const zones = await prisma.zone.findMany({
    where: { organizationId: user.organizationId },
    orderBy: { name: "asc" },
    include: { _count: { select: { residents: true, routes: true } } },
  });

  return { success: true, data: zones };
}

export async function listDrivers(): Promise<{ success: boolean; data?: User[]; error?: string }> {
  const user = await getSessionUser();
  if (!user || user.role !== "ADMIN") {
    return { success: false, error: "Unauthorized" };
  }

  const drivers = await prisma.user.findMany({
    where: { organizationId: user.organizationId, role: "DRIVER" },
    include: { zone: true },
    orderBy: { createdAt: "desc" },
  });

  return { success: true, data: drivers };
}

export async function listZonesSimple(): Promise<{ success: boolean; data?: Zone[]; error?: string }> {
  const user = await getSessionUser();
  if (!user) {
    return { success: false, error: "Unauthorized" };
  }

  const zones = await prisma.zone.findMany({
    where: { organizationId: user.organizationId },
    orderBy: { name: "asc" },
  });

  return { success: true, data: zones };
}
