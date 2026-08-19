import { listDrivers } from "@/src/lib/actions/v1/zones";
import { listZonesSimple } from "@/src/lib/actions/v1/zones";
import { DriverDialog } from "@/src/components/admin/driver-form";
import { DriversTable } from "@/src/components/admin/drivers-table";
import { BulkDriverUpload } from "@/src/components/admin/bulk-driver-upload";
import type { Zone } from "@/src/generated/prisma/client";

interface Driver {
  id: string;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  accountStatus: "CLAIMED" | "UNCLAIMED";
  zone: { id: string; name: string } | null;
}

export default async function AdminDriversPage() {
  const result = await listDrivers();
  const drivers: Driver[] = result.success ? (result.data as unknown as Driver[]) : [];

  const zonesResult = await listZonesSimple();
  const zones: Zone[] = zonesResult.success ? (zonesResult.data as Zone[]) : [];

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

      <DriversTable drivers={drivers} zones={zones} />
    </div>
  );
}
