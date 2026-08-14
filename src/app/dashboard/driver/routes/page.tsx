import Link from "next/link";
import { listDriverRoutes } from "@/src/lib/actions/v1/routes";

interface DriverRoute {
  id: string;
  name: string;
  date: string;
  status: string;
  zone: { id: string; name: string } | null;
  driver: { id: string; firstName: string | null; lastName: string | null } | null;
  _count: { stops: number; completed: number };
}

export default async function DriverRoutesPage() {
  const result = await listDriverRoutes();
  const routes = result.success ? (result.data as unknown as DriverRoute[]) : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">My Routes</h1>
        <p className="mt-1 text-sm text-slate-600">View and manage your assigned routes</p>
      </div>

      {routes.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-8 text-center">
          <p className="text-sm text-slate-500">No routes assigned to you.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {routes.map((route) => {
            const completed = route._count?.completed ?? 0;
            const total = route._count?.stops ?? 0;
            const progress = total > 0 ? Math.round((completed / total) * 100) : 0;

            return (
              <Link
                key={route.id}
                href={`/dashboard/driver/routes/${route.id}`}
                className="block rounded-xl border border-slate-200 bg-white p-6 transition-shadow hover:shadow"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-slate-900">{route.name}</h3>
                    <p className="mt-1 text-sm text-slate-600">
                      {route.zone?.name} · {new Date(route.date).toLocaleDateString("en-NG")}
                    </p>
                  </div>
                  <div className="text-right">
                    <span
                      className={`inline-block rounded-full px-2.5 py-1 text-xs font-medium ${
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
                    <p className="mt-1 text-xs text-slate-500">
                      {completed}/{total} stops · {progress}%
                    </p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
