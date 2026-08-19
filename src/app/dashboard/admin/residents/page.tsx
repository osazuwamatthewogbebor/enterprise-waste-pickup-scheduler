import { listResidents } from "@/src/lib/actions/v1/residents";
import { listZonesSimple } from "@/src/lib/actions/v1/zones";
import { CsvImportForm } from "@/src/components/admin/csv-import-form";
import { AddResidentDialog } from "@/src/components/admin/add-resident-form";
import { ResidentsTable } from "@/src/components/admin/residents-table";
import type { Zone } from "@/src/generated/prisma/client";

interface Resident {
  id: string;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  streetAddress: string | null;
  landmark: string | null;
  accountStatus: "CLAIMED" | "UNCLAIMED";
  zone: { id: string; name: string } | null;
}

export default async function AdminResidentsPage() {
  const result = await listResidents();
  const residents: Resident[] = result.success ? (result.data as unknown as Resident[]) : [];

  const zonesResult = await listZonesSimple();
  const zones: Zone[] = zonesResult.success ? (zonesResult.data as Zone[]) : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Residents</h1>
          <p className="mt-1 text-sm text-slate-600">Manage resident records and billing</p>
        </div>
        <AddResidentDialog zones={zones} />
      </div>

      <CsvImportForm />

      <ResidentsTable residents={residents} zones={zones} />
    </div>
  );
}
