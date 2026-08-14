"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

type TransitionAction = (prevState: unknown, formData: FormData) => Promise<any>;

const STATUS_LABELS: Record<string, string> = {
  PENDING: "Pending",
  APPROVED: "Approved",
  IN_PROGRESS: "In Progress",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

const TYPE_LABELS: Record<string, string> = {
  BULK_SKIP: "Bulk skip",
  ON_DEMAND: "On-demand pickup",
  MISSED_PICKUP: "Missed pickup",
};

export function ServiceRequestTable({
  requests,
  transitionAction,
}: {
  requests: any[];
  transitionAction: TransitionAction;
}) {
  const [state, action, pending] = useActionState(transitionAction, null);
  const router = useRouter();

  useEffect(() => {
    if (state?.success) {
      toast.success("Service request updated");
      router.refresh();
    }
    if (state?.success === false) {
      toast.error(state.error || "Something went wrong");
    }
  }, [state, router]);

  function handleTransition(requestId: string, status: string, notes?: string) {
    const fd = new FormData();
    fd.set("requestId", requestId);
    fd.set("status", status);
    if (notes) fd.set("adminNotes", notes);
    action(fd);
  }

  function getNextActions(currentStatus: string): Array<{ value: string; label: string; variant: string }> {
    switch (currentStatus) {
      case "PENDING":
        return [
          { value: "APPROVED", label: "Approve", variant: "emerald" },
          { value: "CANCELLED", label: "Cancel", variant: "red" },
        ];
      case "APPROVED":
        return [
          { value: "IN_PROGRESS", label: "Start", variant: "blue" },
          { value: "CANCELLED", label: "Cancel", variant: "red" },
        ];
      case "IN_PROGRESS":
        return [
          { value: "COMPLETED", label: "Complete", variant: "emerald" },
          { value: "CANCELLED", label: "Cancel", variant: "red" },
        ];
      default:
        return [];
    }
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Type</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Resident</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Address</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Status</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Created</th>
              <th className="px-4 py-3 text-center text-xs font-medium text-slate-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody>
            {requests.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-sm text-slate-500">
                  No service requests found.
                </td>
              </tr>
            ) : (
              requests.map((req) => (
                <tr key={req.id} className="border-b border-slate-200">
                  <td className="px-4 py-3">
                    <span className="text-sm font-medium text-slate-900">{TYPE_LABELS[req.type] || req.type}</span>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-600">
                    {req.resident ? `${req.resident.firstName ?? ""} ${req.resident.lastName ?? ""}`.trim() : "—"}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-600">{req.address}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                        req.status === "PENDING"
                          ? "bg-amber-100 text-amber-700"
                          : req.status === "APPROVED"
                          ? "bg-blue-100 text-blue-700"
                          : req.status === "IN_PROGRESS"
                          ? "bg-purple-100 text-purple-700"
                          : req.status === "COMPLETED"
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {STATUS_LABELS[req.status] || req.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-600">
                    {new Date(req.createdAt).toLocaleDateString("en-NG")}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {getNextActions(req.status).length === 0 ? (
                      <span className="text-xs text-slate-500">No actions</span>
                    ) : (
                      <div className="flex flex-wrap justify-center gap-1">
                        {getNextActions(req.status).map((a) => (
                          <button
                            key={a.value}
                            onClick={() => handleTransition(req.id, a.value)}
                            disabled={pending}
                            className={`rounded px-2 py-1 text-xs font-medium text-white ${
                              a.variant === "emerald"
                                ? "bg-emerald-600 hover:bg-emerald-700"
                                : a.variant === "blue"
                                ? "bg-blue-600 hover:bg-blue-700"
                                : "bg-red-600 hover:bg-red-700"
                            } disabled:opacity-50`}
                          >
                            {a.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
