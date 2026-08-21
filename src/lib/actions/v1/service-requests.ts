import prisma from "@/src/lib/prisma";
import { getSessionUser } from "@/src/lib/with-tenant";

export async function listServiceRequests(): Promise<{
  success: boolean;
  data?: any[];
  error?: string;
}> {
  const user = await getSessionUser();
  if (!user || user.role !== "ADMIN") {
    return { success: false, error: "Unauthorized" };
  }

  const requests = await prisma.serviceRequest.findMany({
    where: { organizationId: user.organizationId },
    include: { resident: true },
    orderBy: { createdAt: "desc" },
  });

  return { success: true, data: requests };
}

export async function listResidentServiceRequests(): Promise<{
  success: boolean;
  data?: any[];
  error?: string;
}> {
  const user = await getSessionUser();
  if (!user || user.role !== "RESIDENT") {
    return { success: false, error: "Unauthorized" };
  }

  const requests = await prisma.serviceRequest.findMany({
    where: { organizationId: user.organizationId, residentId: user.id },
    orderBy: { createdAt: "desc" },
    include: { resident: true },
  });

  return { success: true, data: requests as any[] };
}

export async function getResidentServiceRequest(id: string): Promise<{
  success: boolean;
  data?: { serviceRequest: any };
  error?: string;
}> {
  const user = await getSessionUser();
  if (!user || user.role !== "RESIDENT") {
    return { success: false, error: "Unauthorized" };
  }

  const serviceRequest = await prisma.serviceRequest.findFirst({
    where: { id, organizationId: user.organizationId, residentId: user.id },
  });

  if (!serviceRequest) {
    return { success: false, error: "Service request not found" };
  }

  return { success: true, data: { serviceRequest } };
}

export async function deleteResidentServiceRequest(id: string): Promise<{
  success: boolean;
  error?: string;
}> {
  const user = await getSessionUser();
  if (!user || user.role !== "RESIDENT") {
    return { success: false, error: "Unauthorized" };
  }

  const serviceRequest = await prisma.serviceRequest.findFirst({
    where: { id, organizationId: user.organizationId, residentId: user.id },
  });

  if (!serviceRequest) {
    return { success: false, error: "Service request not found" };
  }

  // Only allow deletion of ended requests (approved, completed, or cancelled)
  if (serviceRequest.status !== "APPROVED" && serviceRequest.status !== "COMPLETED" && serviceRequest.status !== "CANCELLED") {
    return { success: false, error: "Only approved, completed, or cancelled requests can be deleted" };
  }

  await prisma.serviceRequest.delete({
    where: { id },
  });

  return { success: true };
}
