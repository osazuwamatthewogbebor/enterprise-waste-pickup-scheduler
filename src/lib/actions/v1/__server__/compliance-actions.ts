"use server";

import prisma from "@/src/lib/prisma";
import { getSessionUser } from "@/src/lib/with-tenant";
import { ok, fail } from "@/src/lib/result";
import type { ActionResult } from "@/src/lib/result";

export interface MonthlyMunicipalAuditReport {
  month: string;
  organizationName: string;
  totalSubscribedResidents: number;
  totalCompliantHouseholds: number;
  complianceRatePercent: number;
  totalPickupsScheduled: number;
  totalPickupsCompleted: number;
  pickupCompletionRatePercent: number;
  totalBilledNaira: number;
  totalCollectedNaira: number;
  collectionRatePercent: number;
}

/**
 * Compiles a monthly regulatory and municipal compliance report for LAWMA / State Waste Management Boards.
 */
export async function getMunicipalComplianceSummary(
  monthDate = new Date()
): Promise<ActionResult<MonthlyMunicipalAuditReport>> {
  const user = await getSessionUser();
  if (!user) return fail("Unauthorized");
  if (user.role !== "ADMIN") return fail("Forbidden: Admin access required");

  const org = await prisma.organization.findUnique({
    where: { id: user.organizationId },
    select: { name: true },
  });

  if (!org) return fail("Organization not found");

  const residentsCount = await prisma.user.count({
    where: {
      organizationId: user.organizationId,
      role: "RESIDENT",
    },
  });

  const activeInvoices = await prisma.invoice.findMany({
    where: {
      organizationId: user.organizationId,
    },
    select: {
      amount: true,
      status: true,
      residentId: true,
    },
  });

  const compliantResidentIds = new Set(
    activeInvoices.filter((inv) => inv.status === "PAID").map((inv) => inv.residentId)
  );

  const totalBilled = activeInvoices.reduce((sum, inv) => sum + Number(inv.amount), 0);
  const totalCollected = activeInvoices
    .filter((inv) => inv.status === "PAID")
    .reduce((sum, inv) => sum + Number(inv.amount), 0);

  const stops = await prisma.pickupStop.findMany({
    where: {
      route: {
        organizationId: user.organizationId,
      },
    },
    select: {
      status: true,
    },
  });

  const totalStops = stops.length;
  const completedStops = stops.filter((s) => s.status === "COMPLETED").length;

  const complianceRatePercent =
    residentsCount > 0 ? Math.round((compliantResidentIds.size / residentsCount) * 100) : 0;
  const pickupCompletionRatePercent =
    totalStops > 0 ? Math.round((completedStops / totalStops) * 100) : 0;
  const collectionRatePercent =
    totalBilled > 0 ? Math.round((totalCollected / totalBilled) * 100) : 0;

  const report: MonthlyMunicipalAuditReport = {
    month: monthDate.toLocaleDateString("en-NG", { month: "long", year: "numeric" }),
    organizationName: org.name,
    totalSubscribedResidents: residentsCount,
    totalCompliantHouseholds: compliantResidentIds.size,
    complianceRatePercent,
    totalPickupsScheduled: totalStops,
    totalPickupsCompleted: completedStops,
    pickupCompletionRatePercent,
    totalBilledNaira: totalBilled,
    totalCollectedNaira: totalCollected,
    collectionRatePercent,
  };

  return ok(report);
}

