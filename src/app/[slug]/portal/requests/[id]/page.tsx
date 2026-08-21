import Link from "next/link";
import { getResidentServiceRequest } from "@/src/lib/actions/v1/service-requests";

interface ServiceRequestDetail {
  id: string;
  type: string;
  status: string;
  address: string;
  preferredDate: string | null;
  notes: string | null;
  adminNotes: string | null;
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

export default async function ResidentRequestDetailPage({
  params,
}: {
  params: Promise<{ slug: string; id: string }>;
}) {
  const { slug, id } = await params;

  const result = await getResidentServiceRequest(id);

  if (!result.success) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-8 text-center">
        <p className="text-sm text-slate-500">{result.error}</p>
      </div>
    );
  }

  const sr = result.data!.serviceRequest as ServiceRequestDetail;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link
            href={`/${slug}/portal/requests`}
            className="text-sm font-medium text-blue-600 hover:text-blue-800"
          >
            &larr; Back to requests
          </Link>
          <h1 className="mt-2 text-2xl font-semibold text-slate-900">Request #{sr.id.slice(-6)}</h1>
          <p className="mt-1 text-sm text-slate-600">
            {TYPE_LABEL[sr.type] ?? sr.type} · Submitted on {formatDate(sr.createdAt)}
          </p>
        </div>
        {statusBadge(sr.status)}
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-sm font-medium uppercase text-slate-500">Pickup address</h2>
          <p className="mt-2 text-slate-900">{sr.address || "—"}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-sm font-medium uppercase text-slate-500">Preferred date</h2>
          <p className="mt-2 text-slate-900">
            {sr.preferredDate ? formatDate(sr.preferredDate) : "Not specified"}
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm md:col-span-2">
          <h2 className="text-sm font-medium uppercase text-slate-500">Your notes</h2>
          <p className="mt-2 text-slate-900 whitespace-pre-wrap">
            {sr.notes || "No notes provided."}
          </p>
        </div>
        {sr.adminNotes ? (
          <div className="rounded-xl border border-slate-200 bg-amber-50 p-6 shadow-sm md:col-span-2">
            <h2 className="text-sm font-medium uppercase text-amber-800">Staff notes</h2>
            <p className="mt-2 text-slate-900 whitespace-pre-wrap">{sr.adminNotes}</p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
