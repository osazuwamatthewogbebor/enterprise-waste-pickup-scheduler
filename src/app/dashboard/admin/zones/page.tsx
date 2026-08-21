import { redirect } from "next/navigation";
import { getSessionUser } from "@/src/lib/with-tenant";
import { listZones } from "@/src/lib/actions/v1/zones";
import { ZoneDialog } from "@/src/components/admin/zone-form";

interface ZoneWithCount {
  id: string;
  name: string;
  description: string | null;
  color: string | null;
  _count: { residents: number; routes: number };
}

export default async function AdminZonesPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (user.role !== "ADMIN") redirect("/dashboard");

  const result = await listZones();
  const zones: ZoneWithCount[] = result.success ? (result.data as ZoneWithCount[]) : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Zones</h1>
          <p className="mt-1 text-sm text-slate-600">Manage service areas and residents</p>
        </div>
        <ZoneDialog />
      </div>

      {zones.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-8 text-center">
          <p className="text-sm text-slate-500">No zones yet. Create your first zone to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {zones.map((zone) => (
            <div
              key={zone.id}
              className="rounded-xl border border-slate-200 bg-white p-6"
            >
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-slate-900">{zone.name}</h3>
                {zone.color && (
                  <span
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: zone.color }}
                  />
                )}
              </div>
              {zone.description && (
                <p className="mt-2 text-sm text-slate-600">{zone.description}</p>
              )}
              <div className="mt-4 flex gap-4 text-xs text-slate-500">
                <span>{zone._count?.residents ?? 0} residents</span>
                <span>{zone._count?.routes ?? 0} routes</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
