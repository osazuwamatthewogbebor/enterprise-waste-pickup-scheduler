import { redirect } from "next/navigation";
import { getSessionUser } from "@/src/lib/with-tenant";
import prisma from "@/src/lib/prisma";
import ResidentPortalView from "@/src/components/resident/resident-portal-view";

export default async function ResidentPortalPage({ params }: { params: Promise<{ slug: string }> }) {
  const slug = (await params).slug;
  const user = await getSessionUser();

  if (!user || user.role !== "RESIDENT" || user.orgSlug !== slug) {
    redirect(`/${slug}/login`);
  }

  const stops = await prisma.pickupStop.findMany({
    where: { residentId: user.id, organizationId: user.organizationId },
    include: {
      route: {
        select: {
          id: true,
          name: true,
          date: true,
          status: true,
          driver: { select: { firstName: true, lastName: true } },
        },
      },
    },
    orderBy: { route: { date: "desc" } },
  });

  return <ResidentPortalView slug={slug} stops={stops} />;
}
