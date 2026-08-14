import { listResidents } from "@/src/lib/actions/v1/residents";
import { CsvImportForm } from "@/src/components/admin/csv-import-form";

export default async function AdminResidentsPage() {
  const result = await listResidents();
  const residents = result.success ? result.data! : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Residents</h1>
        <p className="mt-1 text-sm text-slate-600">Manage resident records and billing</p>
      </div>

      <CsvImportForm />

      <div className="rounded-xl border border-slate-200 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Name</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Phone</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Address</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Zone</th>
              </tr>
            </thead>
            <tbody>
              {residents.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-sm text-slate-500">
                    No residents found. Import residents via CSV to get started.
                  </td>
                </tr>
              ) : (
                residents.map((resident) => (
                  <tr key={resident.id} className="border-b border-slate-200">
                    <td className="px-4 py-3 text-sm font-medium text-slate-900">
                      {resident.firstName} {resident.lastName}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600">{resident.phone}</td>
                    <td className="px-4 py-3 text-sm text-slate-600">{resident.streetAddress || "—"}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                          resident.accountStatus === "CLAIMED"
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {resident.accountStatus}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600">{resident.zoneId || "—"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
