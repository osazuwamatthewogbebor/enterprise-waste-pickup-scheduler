import prisma from "@/src/lib/prisma";
import { getSessionUser } from "@/src/lib/with-tenant";

export async function listInvoices(): Promise<{
  success: boolean;
  data?: any[];
  error?: string;
}> {
  const user = await getSessionUser();
  if (!user || user.role !== "ADMIN") {
    return { success: false, error: "Unauthorized" };
  }

  const invoices = await prisma.invoice.findMany({
    where: { organizationId: user.organizationId },
    include: { resident: true },
    orderBy: { createdAt: "desc" },
  });

  return { success: true, data: invoices };
}
