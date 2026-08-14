import prisma from "@/src/lib/prisma";
import { getSessionUser } from "@/src/lib/with-tenant";

export async function listRoutes(): Promise<{
  success: boolean;
  data?: any[];
  error?: string;
}> {
  const user = await getSessionUser();
  if (!user || user.role !== "ADMIN") {
    return { success: false, error: "Unauthorized" };
  }

  const routes = await prisma.route.findMany({
    where: { organizationId: user.organizationId },
    include: {
      driver: { select: { id: true, firstName: true, lastName: true } },
      zone: { select: { id: true, name: true } },
      _count: { select: { stops: true } },
    },
    orderBy: { date: "desc" },
  });

  const routesWithCounts = await Promise.all(
    routes.map(async (r) => {
      const completed = await prisma.pickupStop.count({
        where: { routeId: r.id, status: "COMPLETED" },
      });
      const pending = await prisma.pickupStop.count({
        where: { routeId: r.id, status: "PENDING" },
      });
      return { ...r, _count: { stops: r._count.stops, completed, pending } };
    })
  );

  return { success: true, data: routesWithCounts as any[] };
}

export async function getRouteDetail(routeId: string): Promise<{
  success: boolean;
  data?: { route: any; stops: any[] };
  error?: string;
}> {
  const user = await getSessionUser();
  if (!user) {
    return { success: false, error: "Unauthorized" };
  }

  const where: any = { id: routeId, organizationId: user.organizationId };
  if (user.role === "DRIVER") {
    where.driverId = user.id;
  }

  const route = await prisma.route.findFirst({
    where,
    include: { driver: true, zone: true },
  });

  if (!route) {
    return { success: false, error: "Route not found" };
  }

  const stops = await prisma.pickupStop.findMany({
    where: { routeId: route.id, organizationId: user.organizationId },
    include: { resident: true },
    orderBy: { stopOrder: "asc" },
  });

  return { success: true, data: { route: route as any, stops: stops as any[] } };
}

export async function listDriverRoutes(): Promise<{
  success: boolean;
  data?: any[];
  error?: string;
}> {
  const user = await getSessionUser();
  if (!user) {
    return { success: false, error: "Unauthorized" };
  }

  const routes = await prisma.route.findMany({
    where: {
      organizationId: user.organizationId,
      ...(user.role === "DRIVER" ? { driverId: user.id } : {}),
    },
    include: {
      driver: true,
      zone: true,
      _count: { select: { stops: true } },
    },
    orderBy: { date: "desc" },
  });

  return { success: true, data: routes as any[] };
}

export async function listAllZonesForSelect(): Promise<{
  success: boolean;
  data?: { id: string; name: string }[];
  error?: string;
}> {
  const user = await getSessionUser();
  if (!user || user.role !== "ADMIN") {
    return { success: false, error: "Unauthorized" };
  }

  const zones = await prisma.zone.findMany({
    where: { organizationId: user.organizationId },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  return { success: true, data: zones };
}
