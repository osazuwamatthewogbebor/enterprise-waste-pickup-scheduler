"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface ResidentServiceRequest {
  id: string;
  type: string;
  status: string;
  address: string;
  createdAt: string;
}

interface ResidentRequestsTableProps {
  requests: ResidentServiceRequest[];
  slug: string;
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

const TYPE_OPTIONS = [
  { value: "ALL", label: "All types" },
  { value: "BULK_SKIP", label: "Bulk / skip" },
  { value: "ON_DEMAND", label: "On-demand pickup" },
  { value: "MISSED_PICKUP", label: "Missed pickup" },
];

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

function canDelete(status: string): boolean {
  return status === "APPROVED" || status === "COMPLETED" || status === "CANCELLED";
}

export function ResidentRequestsTable({ requests, slug }: ResidentRequestsTableProps) {
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());
  const [typeFilter, setTypeFilter] = useState("ALL");
  const router = useRouter();

  const filtered = typeFilter === "ALL"
    ? requests
    : requests.filter((r) => r.type === typeFilter);

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this request? This action cannot be undone.")) {
      return;
    }

    setDeletingIds((prev) => new Set(prev).add(id));
    try {
      const res = await fetch(`/api/${slug}/resident/request/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Failed to delete request");
        return;
      }
      toast.success("Request deleted successfully");
      router.refresh();
    } catch {
      toast.error("Something went wrong");
    } finally {
      setDeletingIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  }

  if (requests.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-8 text-center">
        <p className="text-sm text-slate-500">You have no service requests yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-600">
          {filtered.length} {filtered.length === 1 ? "request" : "requests"}
          {typeFilter !== "ALL" ? ` (${TYPE_LABEL[typeFilter] ?? typeFilter})` : ""}
        </p>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500"
        >
          {TYPE_OPTIONS.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-left font-medium uppercase text-slate-500">Type</th>
              <th className="px-4 py-3 text-left font-medium uppercase text-slate-500">Status</th>
              <th className="px-4 py-3 text-left font-medium uppercase text-slate-500">Submitted</th>
              <th className="px-4 py-3 text-left font-medium uppercase text-slate-500">Address</th>
              <th className="px-4 py-3 text-right font-medium uppercase text-slate-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {filtered.map((r) => (
              <tr key={r.id}>
                <td className="px-4 py-3">{TYPE_LABEL[r.type] ?? r.type}</td>
                <td className="px-4 py-3">{statusBadge(r.status)}</td>
                <td className="px-4 py-3 whitespace-nowrap">{formatDate(r.createdAt)}</td>
                <td className="px-4 py-3">{r.address}</td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <a
                      href={`/${slug}/portal/requests/${r.id}`}
                      className="text-sm font-medium text-blue-600 hover:text-blue-800"
                    >
                      View
                    </a>
                    {canDelete(r.status) && (
                      <button
                        disabled={deletingIds.has(r.id)}
                        onClick={() => handleDelete(r.id)}
                        className="text-sm font-medium text-red-600 hover:text-red-800 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {deletingIds.has(r.id) ? "Deleting..." : "Delete"}
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
