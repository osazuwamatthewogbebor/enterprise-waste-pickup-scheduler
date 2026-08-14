import prisma from "@/src/lib/prisma";
import { getSessionUser } from "@/src/lib/with-tenant";

export async function listRouteStops(routeId: string): Promise<{
  success: boolean;
  data?: any[];
  error?: string;
}> {
  const user = await getSessionUser();
  if (!user) {
    return { success: false, error: "Unauthorized" };
  }

  const stops = await prisma.pickupStop.findMany({
    where: { routeId, organizationId: user.organizationId },
    include: { resident: true, route: { include: { driver: true, zone: true } } },
    orderBy: { stopOrder: "asc" },
  });

  return { success: true, data: stops as any[] };
}
