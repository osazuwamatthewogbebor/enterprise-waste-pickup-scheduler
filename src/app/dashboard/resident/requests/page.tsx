import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/src/lib/with-tenant";
import { listResidentServiceRequests } from "@/src/lib/actions/v1/service-requests";

interface ResidentServiceRequest {
  id: string;
  type: string;
  status: string;
  address: string;
  createdAt: string;
}

const STATUS_LABEL: Record<string, string> = {
  PENDING: "Pending",
  APPROVED: "Approved",
  IN_PROGRESS: "In progress",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

const TYPE_LABEL: Record<string, string> = {
  ON_DEMAND: "On-demand pickup",
  BULK_SKIP: "Bulk / skip",
  MISSED_PICKUP: "Missed pickup",
};

function formatDate(v: string | Date): string {
  return new Date(v).toLocaleDateString("en-NG", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function statusBadge(status: string) {
  const label = STATUS_LABEL[status] ?? status;
  const base = "inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ";
  const style =
    status === "COMPLETED"
      ? "bg-emerald-100 text-emerald-700"
      : status === "IN_PROGRESS"
      ? "bg-blue-100 text-blue-700"
      : status === "CANCELLED"
      ? "bg-red-100 text-red-700"
      : status === "APPROVED"
      ? "bg-amber-100 text-amber-700"
      : "bg-slate-100 text-slate-700";
  return <span className={base + style}>{label}</span>;
}

export default async function ResidentRequestsPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (user.role !== "RESIDENT") redirect("/dashboard");

  const result = await listResidentServiceRequests();
  const requests = result.success
    ? (result.data as unknown as ResidentServiceRequest[])
    : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">My service requests</h1>
        <p className="mt-1 text-sm text-slate-600">Requests you have submitted for pickup collection.</p>
      </div>

      {requests.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-8 text-center">
          <p className="text-sm text-slate-500">You have no service requests yet.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left font-medium uppercase text-slate-500">Type</th>
                <th className="px-4 py-3 text-left font-medium uppercase text-slate-500">Status</th>
                <th className="px-4 py-3 text-left font-medium uppercase text-slate-500">Submitted</th>
                <th className="px-4 py-3 text-left font-medium uppercase text-slate-500">Address</th>
                <th className="px-4 py-3 text-right font-medium uppercase text-slate-500">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {requests.map((r) => (
                <tr key={r.id}>
                  <td className="px-4 py-3">{TYPE_LABEL[r.type] ?? r.type}</td>
                  <td className="px-4 py-3">{statusBadge(r.status)}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{formatDate(r.createdAt)}</td>
                  <td className="px-4 py-3">{r.address}</td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/dashboard/resident/requests/${r.id}`}
                      className="text-sm font-medium text-blue-600 hover:text-blue-800"
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
