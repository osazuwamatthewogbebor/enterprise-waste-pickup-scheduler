import { redirect } from "next/navigation";
import { getSessionUser } from "@/src/lib/with-tenant";
import prisma from "@/src/lib/prisma";

export default async function ResidentPortalPickupsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const user = await getSessionUser();
  if (!user || user.role !== "RESIDENT") redirect("/login");

  const { slug } = await params;
  if (user.orgSlug !== slug) redirect(`/${slug}/login`);

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

  const upcoming = [...stops].sort(
    (a, b) =>
      (a.route ? new Date(a.route.date).getTime() : 0) -
      (b.route ? new Date(b.route.date).getTime() : 0)
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Upcoming pickups</h1>
        <p className="mt-1 text-sm text-slate-600">Your scheduled pickup stops.</p>
      </div>

      {upcoming.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-8 text-center">
          <p className="text-sm text-slate-500">No scheduled pickups yet.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {upcoming.map((stop) => (
            <div
              key={stop.id}
              className="rounded-xl border border-slate-200 bg-white p-4"
            >
              <p className="text-sm font-medium text-slate-900">{stop.address}</p>
              <p className="mt-1 text-xs text-slate-500">
                {stop.route ? (
                  <>
                    Route: {stop.route.name} ·{" "}
                    {new Date(stop.route.date).toLocaleDateString("en-NG")} · Status:{" "}
                    {stop.route.status} · Driver:{" "}
                    {stop.route.driver
                      ? `${stop.route.driver.firstName ?? ""} ${stop.route.driver.lastName ?? ""}`.trim()
                      : "—"}
                  </>
                ) : (
                  "Unassigned route"
                )}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
