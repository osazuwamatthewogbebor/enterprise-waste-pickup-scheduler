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

  return { success: true, data: requests };
}

export async function getResidentServiceRequest(id: string): Promise<{
  success: boolean;
  data?: { serviceRequest: any } | undefined;
  error?: string;
}> {
  const user = await getSessionUser();
  if (!user || user.role !== "RESIDENT") {
    return { success: false, error: "Unauthorized" };
  }

  const serviceRequest = await prisma.serviceRequest.findFirst({
    where: { id, organizationId: user.organizationId, residentId: user.id },
    include: { resident: true },
  });

  if (!serviceRequest) {
    return { success: false, error: "Service request not found" };
  }

  return { success: true, data: { serviceRequest } };
}
