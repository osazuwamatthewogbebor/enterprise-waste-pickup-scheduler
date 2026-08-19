"use client";

import { useState, useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { bulkResidentAction } from "@/src/lib/actions/v1/__server__/resident-actions";
import {
  ResidentDialog,
  SuspendResidentButton,
  DeleteResidentButton,
} from "@/src/components/admin/resident-form";
import { ResetPasswordButton } from "@/src/components/admin/reset-password-button";
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

export function ResidentsTable({ residents, zones }: { residents: Resident[]; zones: Zone[] }) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkZone, setBulkZone] = useState("");
  const [state, formAction, pending] = useActionState(bulkResidentAction, null);
  const router = useRouter();

  useEffect(() => {
    if (state?.success) {
      const d = state.data;
      if (d?.deleted) toast.success(`${d.deleted} resident(s) deleted`);
      else if (d?.updated) toast.success(`${d.updated} resident(s) updated`);
      setSelected(new Set());
      router.refresh();
    }
    if (state?.success === false) {
      toast.error((state as any).error || "Something went wrong");
    }
  }, [state, router]);

  const toggle = (id: string) =>
    setSelected((s) => {
      const next = new Set(s);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const selectAll = () => {
    if (selected.size === residents.length) setSelected(new Set());
    else setSelected(new Set(residents.map((r) => r.id)));
  };

  const runBulk = (action: string, zoneId = "") => {
    if (selected.size === 0) return;
    const formData = new FormData();
    formData.set("ids", JSON.stringify(Array.from(selected)));
    formData.set("action", action);
    if (zoneId) formData.set("zoneId", zoneId);
    formAction(formData);
  };

  const anySelected = selected.size > 0;

  return (
    <div className="rounded-xl border border-slate-200 bg-white">
      <div className="border-b border-slate-200 p-4">
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <span className="text-slate-600">{selected.size} selected</span>

          <select
            value={bulkZone}
            onChange={(e) => setBulkZone(e.target.value)}
            disabled={pending || !anySelected}
            className="rounded-lg border border-slate-300 px-2 py-1 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500"
          >
            <option value="">Assign to zone…</option>
            {zones.map((z) => (
              <option key={z.id} value={z.id}>
                {z.name}
              </option>
            ))}
          </select>
          <button
            onClick={() => {
              if (bulkZone) runBulk("assignZone", bulkZone);
            }}
            disabled={pending || !anySelected}
            className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Apply zone
          </button>

          <button
            onClick={() => runBulk("suspend")}
            disabled={pending || !anySelected}
            className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-orange-700 hover:bg-orange-50"
          >
            Suspend
          </button>
          <button
            onClick={() => runBulk("unsuspend")}
            disabled={pending || !anySelected}
            className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-amber-700 hover:bg-amber-50"
          >
            Unsuspend
          </button>
          <button
            onClick={() => {
              if (confirm(`Delete ${selected.size} resident(s)? This cannot be undone.`))
                runBulk("delete");
            }}
            disabled={pending || !anySelected}
            className="rounded-lg border border-red-300 bg-white px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-50"
          >
            Delete
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              <th className="px-4 py-2 text-center">
                <input
                  type="checkbox"
                  checked={residents.length > 0 && selected.size === residents.length}
                  onChange={selectAll}
                  disabled={pending}
                  aria-label="Select all residents"
                />
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Name</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Phone</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Address</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Status</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Zone</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody>
            {residents.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-sm text-slate-500">
                  No residents found. Import residents via CSV to get started.
                </td>
              </tr>
            ) : (
              residents.map((resident) => (
                <tr key={resident.id} className="border-b border-slate-200">
                  <td className="px-4 py-2 text-center">
                    <input
                      type="checkbox"
                      checked={selected.has(resident.id)}
                      onChange={() => toggle(resident.id)}
                      disabled={pending}
                      aria-label={`Select ${resident.firstName} ${resident.lastName}`}
                    />
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-slate-900">
                    {resident.firstName} {resident.lastName}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-600">{resident.phone}</td>
                  <td className="px-4 py-3 text-sm text-slate-600">
                    {resident.streetAddress || resident.landmark || "&mdash;"}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                        resident.accountStatus === "CLAIMED"
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-slate-100 text-slate-700"
                      }`}
                    >
                      {resident.accountStatus === "CLAIMED" ? "Active" : "Suspended"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-600">
                    {resident.zone?.name ?? "&mdash;"}
                  </td>
                  <td className="px-4 py-3 text-right space-x-1">
                    <ResidentDialog zones={zones} resident={resident} onResidentSaved={() => setSelected(new Set())} />
                    <SuspendResidentButton resident={resident} />
                    <DeleteResidentButton resident={resident} />
                    <ResetPasswordButton userId={resident.id} role="resident" />
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
