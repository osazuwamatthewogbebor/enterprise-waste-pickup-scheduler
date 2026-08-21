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

export async function listResidentInvoices(): Promise<{
  success: boolean;
  data?: any[];
  error?: string;
}> {
  const user = await getSessionUser();
  if (!user || user.role !== "RESIDENT") {
    return { success: false, error: "Unauthorized" };
  }

  const invoices = await prisma.invoice.findMany({
    where: { organizationId: user.organizationId, residentId: user.id },
    include: { payments: true },
    orderBy: { createdAt: "desc" },
  });

  return { success: true, data: invoices as any[] };
}

export async function getResidentInvoice(id: string): Promise<{
  success: boolean;
  data?: { invoice: any };
  error?: string;
}> {
  const user = await getSessionUser();
  if (!user || user.role !== "RESIDENT") {
    return { success: false, error: "Unauthorized" };
  }

  const invoice = await prisma.invoice.findFirst({
    where: { id, organizationId: user.organizationId, residentId: user.id },
    include: { payments: true },
  });

  if (!invoice) {
    return { success: false, error: "Invoice not found" };
  }

  return { success: true, data: { invoice } };
}
