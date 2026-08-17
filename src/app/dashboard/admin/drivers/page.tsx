import { listDrivers } from "@/src/lib/actions/v1/zones";
import { listZonesSimple } from "@/src/lib/actions/v1/zones";
import { DriverDialog, DeleteDriverButton } from "@/src/components/admin/driver-form";
import { BulkDriverUpload } from "@/src/components/admin/bulk-driver-upload";
import type { Zone } from "@/src/generated/prisma/client";

export default async function AdminDriversPage() {
  const result = await listDrivers();
  const drivers = result.success ? (result.data as any[]) : [];

  const zonesResult = await listZonesSimple();
  const zones = zonesResult.success ? (zonesResult.data as Zone[]) : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Drivers</h1>
          <p className="mt-1 text-sm text-slate-600">Manage driver accounts and assignments</p>
        </div>
        <DriverDialog zones={zones} />
      </div>

      <BulkDriverUpload />

      {drivers.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-8 text-center">
          <p className="text-sm text-slate-500">No drivers yet. Create your first driver to get started.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Name</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Phone</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Zone</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-slate-500 uppercase">Status</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-slate-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody>
              {drivers.map((driver) => (
                <tr key={driver.id} className="border-b border-slate-200">
                  <td className="px-4 py-3">
                    <span className="font-medium text-slate-900">
                      {driver.firstName} {driver.lastName}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-600">{driver.phone}</td>
                  <td className="px-4 py-3 text-sm text-slate-600">{driver.zone?.name ?? "&mdash;"}</td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className={`inline-block rounded-full px-2 py-1 text-xs font-medium ${
                        driver.accountStatus === "CLAIMED"
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-slate-100 text-slate-700"
                      }`}
                    >
                      {driver.accountStatus === "CLAIMED" ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center space-x-2">
                    <DriverDialog
                      zones={zones}
                      driver={{
                        id: driver.id,
                        firstName: driver.firstName,
                        lastName: driver.lastName,
                        phone: driver.phone,
                        zone: driver.zone ? { id: driver.zone.id, name: driver.zone.name } : null,
                      }}
                    />
                    <DeleteDriverButton
                      driver={{
                        id: driver.id,
                        firstName: driver.firstName,
                        lastName: driver.lastName,
                        phone: driver.phone,
                        zone: driver.zone ? { id: driver.zone.id, name: driver.zone.name } : null,
                      }}
                    />
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
