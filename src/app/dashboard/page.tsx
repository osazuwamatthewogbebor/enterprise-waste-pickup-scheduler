import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/src/lib/with-tenant";
import { getAnalyticsSummary } from "@/src/lib/actions/v1/analytics";

const adminCards = [
  { href: "/dashboard/admin/zones", label: "Zones", desc: "Manage service areas" },
  { href: "/dashboard/admin/drivers", label: "Drivers", desc: "Manage driver accounts" },
  { href: "/dashboard/admin/routes", label: "Routes", desc: "Create and dispatch routes" },
  { href: "/dashboard/admin/residents", label: "Residents", desc: "Import and manage residents" },
  { href: "/dashboard/admin/service-requests", label: "Service Requests", desc: "Review public requests" },
  { href: "/dashboard/admin/invoices", label: "Invoices", desc: "Billing and payments" },
];

export default async function DashboardHome() {
  const user = await getSessionUser();

  if (!user) {
    redirect("/login");
  }

  if (user.role === "DRIVER") {
    redirect("/dashboard/driver");
  }

  if (user.role === "RESIDENT") {
    redirect("/dashboard/resident");
  }

  const analyticsResult = await getAnalyticsSummary();
  const analytics = analyticsResult.success ? analyticsResult.data! : null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Dashboard</h1>
        <p className="mt-1 text-sm text-slate-600">Overview of your waste pickup operations</p>
      </div>

      {analytics && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl border border-slate-200 bg-white p-6">
              <p className="text-sm text-slate-500">Total Zones</p>
              <p className="mt-2 text-3xl font-semibold text-slate-900">{analytics.zones}</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-6">
              <p className="text-sm text-slate-500">Total Residents</p>
              <p className="mt-2 text-3xl font-semibold text-slate-900">{analytics.residents}</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-6">
              <p className="text-sm text-slate-500">Total Drivers</p>
              <p className="mt-2 text-3xl font-semibold text-slate-900">{analytics.drivers}</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-6">
              <p className="text-sm text-slate-500">Total Routes</p>
              <p className="mt-2 text-3xl font-semibold text-slate-900">{analytics.routes}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-slate-200 bg-white p-6">
              <p className="text-sm text-slate-500">Pickups Pending</p>
              <p className="mt-2 text-2xl font-semibold text-amber-600">{analytics.pickupsPending}</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-6">
              <p className="text-sm text-slate-500">Pickups Completed</p>
              <p className="mt-2 text-2xl font-semibold text-emerald-600">{analytics.pickupsCompleted}</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-6">
              <p className="text-sm text-slate-500">Pickups Missed</p>
              <p className="mt-2 text-2xl font-semibold text-red-600">{analytics.pickupsMissed}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-slate-200 bg-white p-6">
              <p className="text-sm text-slate-500">Total Revenue</p>
              <p className="mt-2 text-2xl font-semibold text-slate-900">₦{analytics.totalRevenue.toLocaleString()}</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-6">
              <p className="text-sm text-slate-500">Paid Revenue</p>
              <p className="mt-2 text-2xl font-semibold text-emerald-600">₦{analytics.paidRevenue.toLocaleString()}</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-6">
              <p className="text-sm text-slate-500">Pending Revenue</p>
              <p className="mt-2 text-2xl font-semibold text-amber-600">₦{analytics.pendingRevenue.toLocaleString()}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="rounded-xl border border-slate-200 bg-white p-6">
              <h3 className="mb-3 text-sm font-medium text-slate-700">Recent Routes</h3>
              <div className="space-y-3">
                {analytics.recentRoutes.length === 0 ? (
                  <p className="text-sm text-slate-500">No routes yet.</p>
                ) : (
                  analytics.recentRoutes.map((route: any) => (
                    <Link
                      key={route.id}
                      href={`/dashboard/admin/routes/${route.id}`}
                      className="block rounded-lg border border-slate-200 p-3 transition-colors hover:bg-slate-50"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-sm font-medium text-slate-900">{route.name}</span>
                          <p className="text-xs text-slate-500">
                            {route.zone?.name} · {route.driver?.firstName} {route.driver?.lastName}
                          </p>
                        </div>
                        <div className="text-right">
                          <span
                            className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                              route.status === "SCHEDULED"
                                ? "bg-slate-100 text-slate-700"
                                : route.status === "IN_PROGRESS"
                                ? "bg-blue-100 text-blue-700"
                                : route.status === "COMPLETED"
                                ? "bg-emerald-100 text-emerald-700"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            {route.status}
                          </span>
                          <p className="mt-1 text-xs text-slate-500">{route._count.stops} stops</p>
                        </div>
                      </div>
                    </Link>
                  ))
                )}
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-6">
              <h3 className="mb-3 text-sm font-medium text-slate-700">Quick Links</h3>
              <div className="grid grid-cols-1 gap-2">
                {adminCards.map((card) => (
                  <Link
                    key={card.href}
                    href={card.href}
                    className="rounded-lg border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 hover:text-slate-900"
                  >
                    {card.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {!analytics && (
        <div className="rounded-xl border border-slate-200 bg-white p-8 text-center">
          <p className="text-sm text-slate-500">Unable to load analytics data.</p>
        </div>
      )}
    </div>
  );
}
