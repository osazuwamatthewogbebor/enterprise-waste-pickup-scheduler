import { redirect } from "next/navigation";
import Link from "next/link";
import { getSessionUser } from "@/src/lib/with-tenant";
import { listResidentServiceRequests } from "@/src/lib/actions/v1/service-requests";

interface ResidentServiceRequest {
  id: string;
  type: string;
  status: string;
  preferredDate: Date | string | null;
  address: string;
  createdAt: Date | string;
}

const TYPE_LABELS: Record<string, string> = {
  BULK_SKIP: "Bulk skip",
  ON_DEMAND: "On-demand pickup",
  MISSED_PICKUP: "Missed pickup",
};

const STATUS_LABELS: Record<string, string> = {
  PENDING: "Pending",
  APPROVED: "Approved",
  IN_PROGRESS: "In progress",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

const STATUS_CLASSES: Record<string, string> = {
  PENDING: "bg-slate-100 text-slate-700",
  APPROVED: "bg-blue-100 text-blue-700",
  IN_PROGRESS: "bg-amber-100 text-amber-700",
  COMPLETED: "bg-emerald-100 text-emerald-700",
  CANCELLED: "bg-red-100 text-red-700",
};

export default async function ResidentRequestsPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (user.role !== "RESIDENT") redirect("/dashboard");

  const result = await listResidentServiceRequests();
  const requests = (result.success ? (result.data as unknown as ResidentServiceRequest[]) : []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">My service requests</h1>
        <p className="mt-1 text-sm text-slate-600">Requests you have submitted</p>
      </div>

      {requests.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-8 text-center">
          <p className="text-sm text-slate-500">You have no service requests yet.</p>
          <Link
            href={`/request/${user.orgSlug}`}
            className="mt-2 inline-block text-sm font-medium text-emerald-700 hover:text-emerald-800"
          >
            Submit a new request
          </Link>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-2.5 text-xs font-medium uppercase text-slate-500">Type</th>
                <th className="px-4 py-2.5 text-xs font-medium uppercase text-slate-500">Status</th>
                <th className="px-4 py-2.5 text-xs font-medium uppercase text-slate-500">Date</th>
                <th className="px-4 py-2.5 text-xs font-medium uppercase text-slate-500">Address</th>
                <th className="px-4 py-2.5 text-xs font-medium uppercase text-slate-500 text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {requests.map((r) => (
                <tr key={r.id} className="border-t border-slate-100">
                  <td className="px-4 py-3">{TYPE_LABELS[r.type] ?? r.type}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block rounded-full px-2.5 py-1 text-xs font-medium ${
                        STATUS_CLASSES[r.status] ?? "bg-slate-100 text-slate-700"
                      }`}
                    >
                      {STATUS_LABELS[r.status] ?? r.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {r.preferredDate ? new Date(r.preferredDate).toLocaleDateString("en-NG") : "—"}
                  </td>
                  <td className="px-4 py-3 text-slate-600">{r.address}</td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/dashboard/resident/requests/${r.id}`}
                      className="font-medium text-blue-600 hover:text-blue-800"
                    >
                      View
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
