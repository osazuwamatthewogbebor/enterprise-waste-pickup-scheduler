import Link from "next/link";
import { listRoutes } from "@/src/lib/actions/v1/routes";
import { listZonesSimple } from "@/src/lib/actions/v1/zones";
import { listDrivers } from "@/src/lib/actions/v1/zones";
import { RouteDialog } from "@/src/components/admin/route-form";

interface RouteRow {
  id: string;
  name: string;
  date: string;
  status: string;
  driver: { id: string; firstName: string | null; lastName: string | null } | null;
  zone: { id: string; name: string } | null;
  _count: { stops: number; completed: number };
}

export default async function AdminRoutesPage() {
  const result = await listRoutes();
  const routes = result.success ? (result.data as unknown as RouteRow[]) : [];

  const zonesResult = await listZonesSimple();
  const zones = zonesResult.success ? zonesResult.data ?? [] : [];

  const driversResult = await listDrivers();
  const drivers = driversResult.success ? driversResult.data ?? [] : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Routes</h1>
          <p className="mt-1 text-sm text-slate-600">Plan and dispatch pickup routes</p>
        </div>
        <RouteDialog zones={zones} drivers={drivers} />
      </div>

      {routes.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-8 text-center">
          <p className="text-sm text-slate-500">No routes yet. Create your first route to get started.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Route</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Driver</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Zone</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Date</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 uppercase">Stops</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Status</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-slate-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody>
              {routes.map((route) => (
                <tr key={route.id} className="border-b border-slate-200">
                  <td className="px-4 py-3">
                    <span className="font-medium text-slate-900">{route.name}</span>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-600">
                    {route.driver ? `${route.driver.firstName ?? ""} ${route.driver.lastName ?? ""}`.trim() : "&mdash;"}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-600">{route.zone?.name ?? "&mdash;"}</td>
                  <td className="px-4 py-3 text-sm text-slate-600">
                    {new Date(route.date).toLocaleDateString("en-NG")}
                  </td>
                  <td className="px-4 py-3 text-right text-sm text-slate-600">
                    {route._count?.completed ?? 0}/{route._count?.stops ?? 0}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block rounded-full px-2 py-1 text-xs font-medium ${
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
                  </td>
                  <td className="px-4 py-3 text-center">
                    <Link
                      href={`/dashboard/admin/routes/${route.id}`}
                      className="text-sm font-medium text-emerald-600 hover:underline"
                    >
                      Edit
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
