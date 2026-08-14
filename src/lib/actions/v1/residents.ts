import prisma from "@/src/lib/prisma";
import { getSessionUser } from "@/src/lib/with-tenant";

export async function listResidents(): Promise<{
  success: boolean;
  data?: any[];
  error?: string;
}> {
  const user = await getSessionUser();
  if (!user || user.role !== "ADMIN") {
    return { success: false, error: "Unauthorized" };
  }

  const residents = await prisma.user.findMany({
    where: { organizationId: user.organizationId, role: "RESIDENT" },
    include: { zone: true },
    orderBy: { createdAt: "desc" },
  });

  return { success: true, data: residents };
}
