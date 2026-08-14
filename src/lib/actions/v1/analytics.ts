import prisma from "@/src/lib/prisma";
import { getSessionUser } from "@/src/lib/with-tenant";

export async function getAnalyticsSummary(): Promise<{
  success: boolean;
  data?: {
    zones: number;
    residents: number;
    drivers: number;
    routes: number;
    routesByStatus: Record<string, number>;
    pickupsPending: number;
    pickupsCompleted: number;
    pickupsMissed: number;
    totalRevenue: number;
    paidRevenue: number;
    pendingRevenue: number;
    recentInvoices: any[];
    recentRoutes: any[];
  };
  error?: string;
}> {
  const user = await getSessionUser();
  if (!user || user.role !== "ADMIN") {
    return { success: false, error: "Unauthorized" };
  }

  const _now = new Date();

  const [zones, residents, drivers, routes, routesByStatus, pickups, invoices, recentRoutes] = await Promise.all([
    prisma.zone.count({ where: { organizationId: user.organizationId } }),
    prisma.user.count({ where: { organizationId: user.organizationId, role: "RESIDENT" } }),
    prisma.user.count({ where: { organizationId: user.organizationId, role: "DRIVER" } }),
    prisma.route.count({ where: { organizationId: user.organizationId } }),
    prisma.route.groupBy({
      by: ["status"],
      where: { organizationId: user.organizationId },
      _count: { _all: true },
    }),
    prisma.pickupStop.groupBy({
      by: ["status"],
      where: { organizationId: user.organizationId },
      _count: { _all: true },
    }),
    prisma.invoice.findMany({
      where: { organizationId: user.organizationId },
      select: { status: true, amount: true },
    }),
    prisma.route.findMany({
      where: { organizationId: user.organizationId },
      orderBy: { date: "desc" },
      take: 5,
      select: {
        id: true,
        name: true,
        date: true,
        status: true,
        driver: { select: { firstName: true, lastName: true } },
        zone: { select: { name: true } },
        _count: { select: { stops: true } },
      },
    }),
  ]);

  const statusCounts: Record<string, number> = {};
  routesByStatus.forEach((r: { status: string; _count: { _all: number } }) => {
    statusCounts[r.status] = r._count._all;
  });

  const pickupCounts: Record<string, number> = { PENDING: 0, COMPLETED: 0, MISSED: 0 };
  pickups.forEach((p: { status: string; _count: { _all: number } }) => {
    pickupCounts[p.status] = p._count._all;
  });

  const recentInvoices = invoices.map((i: { status: string; amount: number }) => i);
  const totalRevenue = invoices.reduce((sum: number, inv: { amount: number }) => sum + Number(inv.amount), 0);
  const paidRevenue = invoices
    .filter((i: { status: string }) => i.status === "PAID")
    .reduce((sum: number, inv: { amount: number }) => sum + Number(inv.amount), 0);
  const pendingRevenue = invoices
    .filter((i: { status: string }) => i.status === "PENDING" || i.status === "OVERDUE")
    .reduce((sum: number, inv: { amount: number }) => sum + Number(inv.amount), 0);

  return {
    success: true,
    data: {
      zones,
      residents,
      drivers,
      routes,
      routesByStatus: statusCounts,
      pickupsPending: pickupCounts.PENDING ?? 0,
      pickupsCompleted: pickupCounts.COMPLETED ?? 0,
      pickupsMissed: pickupCounts.MISSED ?? 0,
      totalRevenue,
      paidRevenue,
      pendingRevenue,
      recentInvoices,
      recentRoutes,
    },
  };
}
